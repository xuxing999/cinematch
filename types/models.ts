import { Database } from './database'

// 資料庫表格類型
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Signal = Database['public']['Tables']['signals']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// 訊號標籤類型
export type SignalTag = 'has_ticket' | 'seek_companion' | 'pure_watch' | 'want_discuss'

// ── 地區（縣市）清單 ──────────────────────────────────────────────
export const TW_CITIES = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市',
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣',
  '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣',
  '澎湖縣', '金門縣', '連江縣',
] as const

export type TwCity = typeof TW_CITIES[number]

// ── 社交意圖類型 ──────────────────────────────────────────────────
export type SignalIntent = 'aa_split' | 'i_treat' | 'just_watch'

export interface SignalIntentInfo {
  value: SignalIntent
  label: string
  emoji: string
  description: string
}

export const SIGNAL_INTENTS: Record<SignalIntent, SignalIntentInfo> = {
  aa_split: {
    value: 'aa_split',
    label: 'AA 制',
    emoji: '🤝',
    description: '各付各的，輕鬆沒壓力',
  },
  i_treat: {
    value: 'i_treat',
    label: '我請客',
    emoji: '🎁',
    description: '我有多餘票券或優惠',
  },
  just_watch: {
    value: 'just_watch',
    label: '看完各走各的',
    emoji: '💨',
    description: '純快閃，看完立即解散',
  },
}

// ── 性別/年齡標籤（自由文字選項）────────────────────────────────
export const GENDER_AGE_PRESETS = [
  '男 / 20s', '男 / 30s', '男 / 40s+',
  '女 / 20s', '女 / 30s', '女 / 40s+',
  '不透露',
] as const

// 訊號標籤資訊
export interface SignalTagInfo {
  value: SignalTag
  label: string
  emoji: string
  description: string
  color: string
}

// 訊號標籤對應表
export const SIGNAL_TAGS: Record<SignalTag, SignalTagInfo> = {
  has_ticket: {
    value: 'has_ticket',
    label: '我有票',
    emoji: '🎟️',
    description: '我有 6 折/買一送一，徵人平分',
    color: 'text-neon-pink',
  },
  seek_companion: {
    value: 'seek_companion',
    label: '求壯膽',
    emoji: '👻',
    description: '恐怖片求陪伴',
    color: 'text-neon-purple',
  },
  pure_watch: {
    value: 'pure_watch',
    label: '純看片',
    emoji: '🎭',
    description: '不聊天、純湊票、看完即散',
    color: 'text-neon-cyan',
  },
  want_discuss: {
    value: 'want_discuss',
    label: '想討論',
    emoji: '🧠',
    description: '燒腦片映後交流',
    color: 'text-neon-blue',
  },
}

// 訊號擴展類型（包含用戶資訊）
export interface SignalWithProfile extends Signal {
  profiles: Profile
}

// 訊息擴展類型（包含發送者資訊）
export interface MessageWithSender extends Message {
  sender: Profile
}

// 對話類型（用於聊天列表）
export interface Conversation {
  userId: string
  profile: Profile
  lastMessage: Message
  unreadCount: number
}
