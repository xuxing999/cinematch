'use client'

import { useState } from 'react'
import { TMDBMovie } from '@/lib/tmdb/types'
import {
  SignalTag, SignalIntent,
  TW_CITIES, SIGNAL_INTENTS, GENDER_AGE_PRESETS,
} from '@/types/models'
import MovieSearch from './MovieSearch'
import TagSelector from './TagSelector'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Send, MapPin, Users, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SignalFormData {
  movie: TMDBMovie | null
  tag: SignalTag | null
  theaterName: string
  showtime: string
  note: string
  location: string
  intent: SignalIntent | null
  genderAgeLabel: string
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
    location: '',
    intent: null,
    genderAgeLabel: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.movie) newErrors.movie = '請選擇電影'
    if (!formData.tag)   newErrors.tag   = '請選擇意圖標籤'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(formData)
    setFormData({
      movie: null, tag: null, theaterName: '', showtime: '',
      note: '', location: '', intent: null, genderAgeLabel: '',
    })
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

      <div className="border-t border-dark-50/40" />

      {/* ── 地區 & 社交意圖（Trust Package）────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-neon-cyan" />
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
            地區與安排（選填）
          </span>
        </div>

        {/* 縣市下拉 */}
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">所在縣市</label>
          <div className="relative">
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 pr-10 bg-dark-200 border border-dark-50/60 rounded-lg text-sm text-foreground appearance-none focus:outline-none focus:border-neon-red/60 focus:ring-1 focus:ring-neon-red/30 transition-all duration-200"
            >
              <option value="">不指定地區</option>
              {TW_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none"
            />
          </div>
        </div>

        {/* 社交意圖標籤 */}
        <div>
          <label className="block text-xs text-stone-500 mb-2">社交安排</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(SIGNAL_INTENTS).map((item) => {
              const selected = formData.intent === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      intent: selected ? null : item.value,
                    })
                  }
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-all duration-150 min-h-[44px]',
                    selected
                      ? 'bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan'
                      : 'bg-transparent border-dark-50/60 text-stone-400 hover:border-stone-500 hover:text-stone-300'
                  )}
                  title={item.description}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-stone-600 mt-1.5">
            {formData.intent
              ? SIGNAL_INTENTS[formData.intent].description
              : '選填，讓對方更了解你的期望'}
          </p>
        </div>

        {/* 性別 / 年齡標籤 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={12} className="text-stone-500" />
            <label className="text-xs text-stone-500">性別 / 年齡（選填，不強制）</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENDER_AGE_PRESETS.map((preset) => {
              const selected = formData.genderAgeLabel === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      genderAgeLabel: selected ? '' : preset,
                    })
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-md border text-xs transition-all duration-150',
                    selected
                      ? 'bg-neon-pink/15 border-neon-pink/50 text-neon-pink'
                      : 'bg-transparent border-dark-50/50 text-stone-500 hover:border-stone-500 hover:text-stone-400'
                  )}
                >
                  {preset}
                </button>
              )
            })}
          </div>
        </div>
      </div>

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
