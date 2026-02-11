'use client'

import { useState } from 'react'
import { TMDBMovie } from '@/lib/tmdb/types'
import { SignalTag } from '@/types/models'
import MovieSearch from './MovieSearch'
import TagSelector from './TagSelector'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Send } from 'lucide-react'

interface SignalFormData {
  movie: TMDBMovie | null
  tag: SignalTag | null
  theaterName: string
  showtime: string
  note: string
}

interface SignalFormProps {
  onSubmit: (data: SignalFormData) => Promise<void>
  loading?: boolean
}

export default function SignalForm({ onSubmit, loading }: SignalFormProps) {
  const [formData, setFormData] = useState<SignalFormData>({
    movie: null,
    tag: null,
    theaterName: '',
    showtime: '',
    note: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.movie) newErrors.movie = '請選擇電影'
    if (!formData.tag)   newErrors.tag = '請選擇意圖標籤'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await onSubmit(formData)

    setFormData({ movie: null, tag: null, theaterName: '', showtime: '', note: '' })
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 步驟 1：選擇電影 */}
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-2 tracking-wider uppercase">
          電影 <span className="text-neon-red">*</span>
        </label>
        <MovieSearch
          onSelectMovie={(movie) => {
            setFormData({ ...formData, movie })
            setErrors({ ...errors, movie: '' })
          }}
          selectedMovie={formData.movie}
        />
        {errors.movie && (
          <p className="mt-1.5 text-xs text-neon-red">{errors.movie}</p>
        )}
      </div>

      {/* 分隔 */}
      <div className="border-t border-dark-50/40" />

      {/* 步驟 2：意圖標籤 */}
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-2 tracking-wider uppercase">
          意圖 <span className="text-neon-red">*</span>
        </label>
        <TagSelector
          selectedTag={formData.tag}
          onSelectTag={(tag) => {
            setFormData({ ...formData, tag })
            setErrors({ ...errors, tag: '' })
          }}
        />
        {errors.tag && (
          <p className="mt-1.5 text-xs text-neon-red">{errors.tag}</p>
        )}
      </div>

      {/* 分隔 */}
      <div className="border-t border-dark-50/40" />

      {/* 步驟 3：影城名稱 */}
      <Input
        label="影城名稱（選填）"
        type="text"
        placeholder="例如：信義威秀、美麗華大直"
        value={formData.theaterName}
        onChange={(e) => setFormData({ ...formData, theaterName: e.target.value })}
      />

      {/* 步驟 4：場次時間 */}
      <Input
        label="場次時間（選填）"
        type="datetime-local"
        value={formData.showtime}
        onChange={(e) => setFormData({ ...formData, showtime: e.target.value })}
      />

      {/* 步驟 5：備註 */}
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-2 tracking-wider uppercase">
          備註（選填）
        </label>
        <textarea
          placeholder="想說的話..."
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3 bg-dark-200 border border-dark-50/60 rounded-lg text-foreground placeholder-stone-500 focus:outline-none focus:border-neon-red/60 focus:ring-1 focus:ring-neon-red/30 transition-all duration-200 resize-none text-sm"
        />
        <div className="flex justify-between mt-1">
          <p className="text-[11px] text-stone-500">簡短描述您的需求</p>
          <p className="text-[11px] text-stone-500">{formData.note.length} / 200</p>
        </div>
      </div>

      {/* 送出 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={loading}
      >
        <Send size={16} className="mr-2" />
        發布訊號
      </Button>

      <p className="text-[11px] text-stone-500 text-center">
        訊號將在 24 小時後自動銷毀
      </p>
    </form>
  )
}
