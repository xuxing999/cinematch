// @ts-nocheck
'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/models'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signInAnonymously: () => Promise<{ user: User | null; error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // 使用 useMemo 確保 Supabase 客戶端實例穩定
  const supabase = useMemo(() => createClient(), [])

  // 匿名登入
  const signInAnonymously = async () => {
    try {
      console.log('🚀 開始執行匿名登入...')
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) {
        console.error('❌ 匿名登入錯誤:', error)
        throw error
      }

      console.log('✅ 匿名登入成功:', data.user?.id)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ 匿名登入失敗 (catch):', error)
      return { user: null, error }
    }
  }

  useEffect(() => {
    let isMounted = true
    let authSubscription: any = null

    const initAuth = async () => {
      try {
        console.log('🔐 AuthProvider: 初始化認證...')

        // 先設定監聽器（避免錯過事件）
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return

            console.log('🔄 AuthProvider: 認證狀態變化', event, session?.user?.id)

            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user)

              // 取得用戶 Profile
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()

                if (isMounted) {
                  setProfile(profile)
                  console.log('✅ AuthProvider: Profile 已載入', profile?.display_name)
                }
              } catch (error) {
                console.error('❌ AuthProvider: 載入 Profile 失敗', error)
              }
            } else if (event === 'SIGNED_OUT') {
              if (isMounted) {
                setUser(null)
                setProfile(null)
                console.log('⚠️ AuthProvider: Session 已清除')
              }
            }

            if (isMounted) {
              setLoading(false)
            }
          }
        )

        authSubscription = subscription

        // 然後檢查當前 session（使用 getSession 而非 getUser）
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          console.log('✅ AuthProvider: 用戶已登入', session.user.id)
          setUser(session.user)

          // 取得用戶 Profile
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (isMounted) {
              setProfile(profile)
              console.log('✅ AuthProvider: Profile 已載入', profile?.display_name)
            }
          } catch (error) {
            console.error('❌ AuthProvider: 載入 Profile 失敗', error)
          }
        } else {
          // 如果沒有用戶，自動進行匿名登入
          console.log('⚠️ AuthProvider: 無用戶，開始匿名登入...')
          const result = await signInAnonymously()
          if (result.user) {
            console.log('✅ AuthProvider: 匿名登入成功', result.user.id)
          } else {
            console.error('❌ AuthProvider: 匿名登入失敗', result.error)
          }
        }

        if (isMounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ AuthProvider: 初始化錯誤', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])  // 移除 supabase 依賴

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setUser(null)
      setProfile(null)

      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  // 更新 Profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error('No user logged in') }

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
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signInAnonymously,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
