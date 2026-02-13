// @ts-nocheck
'use client'

import { logger } from '@/lib/utils/logger'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/models'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 取得當前用戶
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUser(user)
          // 取得用戶 Profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          setProfile(profile)
        }
      } catch (error) {
        logger.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)

          // 取得用戶 Profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setProfile(profile)
        } else {
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 匿名登入
  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) throw error

      return { user: data.user, error: null }
    } catch (error) {
      logger.error('Error signing in anonymously:', error)
      return { user: null, error }
    }
  }

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setUser(null)
      setProfile(null)

      return { error: null }
    } catch (error) {
      logger.error('Error signing out:', error)
      return { error }
    }
  }

  // 更新 Profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)

      return { data, error: null }
    } catch (error) {
      logger.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  return {
    user,
    profile,
    loading,
    signInAnonymously,
    signOut,
    updateProfile,
  }
}
