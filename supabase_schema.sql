-- ============================================
-- CineMatch Database Schema for Supabase
-- ============================================

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (匿名用戶資訊)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- 啟用 Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS 政策：所有人可讀取
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- RLS 政策：用戶可更新自己的資料
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS 政策：用戶可插入自己的資料
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SIGNALS TABLE (揪團訊號)
-- ============================================
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL, -- TMDB 電影 ID
  movie_title TEXT NOT NULL,
  movie_poster TEXT, -- TMDB 海報路徑
  theater_name TEXT, -- 影城名稱（選填）
  showtime TIMESTAMPTZ, -- 場次時間（選填）
  tag TEXT NOT NULL CHECK (tag IN ('has_ticket', 'seek_companion', 'pure_watch', 'want_discuss')),
  note TEXT, -- 備註訊息
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_signals_movie_id ON public.signals(movie_id);
CREATE INDEX idx_signals_user_id ON public.signals(user_id);
CREATE INDEX idx_signals_tag ON public.signals(tag);
CREATE INDEX idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX idx_signals_active ON public.signals(is_active) WHERE is_active = true;

-- 啟用 Row Level Security
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- RLS 政策：所有人可讀取 24 小時內的訊號
CREATE POLICY "Signals are viewable by everyone (24h)"
  ON public.signals FOR SELECT
  USING (created_at > NOW() - INTERVAL '24 hours');

-- RLS 政策：已登入用戶可建立訊號
CREATE POLICY "Authenticated users can create signals"
  ON public.signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 政策：用戶可更新自己的訊號
CREATE POLICY "Users can update own signals"
  ON public.signals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 政策：用戶可刪除自己的訊號
CREATE POLICY "Users can delete own signals"
  ON public.signals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. MESSAGES TABLE (快閃對話)
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);

-- 啟用 Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶可讀取與自己相關的 24 小時內訊息
CREATE POLICY "Users can view own messages (24h)"
  ON public.messages FOR SELECT
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND created_at > NOW() - INTERVAL '24 hours'
  );

-- RLS 政策：已登入用戶可發送訊息
CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- RLS 政策：接收者可標記訊息為已讀
CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================
-- 4. 自動清理函數 (24小時過期資料)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- 刪除 24 小時前的訊號
  DELETE FROM public.signals
  WHERE created_at < NOW() - INTERVAL '24 hours';

  -- 刪除 24 小時前的訊息
  DELETE FROM public.messages
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. 自動更新 updated_at 的觸發器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. 匿名用戶自動建立 Profile 的觸發器
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '影伴 ' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 當有新用戶註冊時自動建立 Profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. Realtime 啟用設定
-- ============================================
-- 為訊息表啟用 Realtime（在 Supabase Dashboard > Database > Replication 中手動啟用）
-- 或執行以下 SQL（需要 Supabase CLI 或直接在 Dashboard 操作）
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;

-- ============================================
-- 8. 初始化測試數據（可選）
-- ============================================
-- 註：實際使用時會透過匿名登入自動建立用戶

-- ============================================
-- 完成！請在 Supabase Dashboard 確認以下設定：
-- 1. Authentication > Providers > Anonymous Sign-in 已啟用
-- 2. Database > Replication > messages & signals 已啟用
-- 3. Database > Cron Jobs > 每小時執行 cleanup_expired_data()
-- ============================================
