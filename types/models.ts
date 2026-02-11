import { Database } from './database'

// 資料庫表格類型
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Signal = Database['public']['Tables']['signals']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// 訊號標籤類型
export type SignalTag = 'has_ticket' | 'seek_companion' | 'pure_watch' | 'want_discuss'

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
