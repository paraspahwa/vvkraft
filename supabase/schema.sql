-- VideoForge Supabase Database Schema
-- This file defines the full PostgreSQL schema for Supabase.
-- Run this in the Supabase SQL editor or via migrations.

-- ── Better Auth tables (managed by Better Auth) ──────────────────────────────
-- Better Auth auto-creates: user, session, account, verification tables.
-- See: https://www.better-auth.com/docs/concepts/database

-- ── Application tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 0,
  credits_used_this_month INTEGER NOT NULL DEFAULT 0,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  admin_downgraded BOOLEAN DEFAULT FALSE,
  admin_downgrade_reason TEXT,
  admin_downgraded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model TEXT NOT NULL,
  resolution TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  seed INTEGER,
  motion_strength REAL,
  reference_image_url TEXT,
  character_id TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  r2_key TEXT,
  fal_request_id TEXT,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  actual_cost_usd REAL,
  error_message TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_status ON generations(status);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  reference_image_url TEXT NOT NULL,
  r2_key TEXT NOT NULL DEFAULT '',
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_characters_user_id ON characters(user_id);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  generation_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);

CREATE TABLE IF NOT EXISTS video_upscale_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  input_video_url TEXT NOT NULL,
  input_duration_seconds INTEGER NOT NULL,
  input_r2_key TEXT,
  quality_mode TEXT NOT NULL DEFAULT 'standard',
  output_video_url TEXT,
  output_r2_key TEXT,
  fal_request_id TEXT,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_video_upscale_jobs_user_id ON video_upscale_jobs(user_id);

CREATE TABLE IF NOT EXISTS video_editor_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  clips JSONB NOT NULL DEFAULT '[]',
  text_overlays JSONB NOT NULL DEFAULT '[]',
  background_audio_url TEXT,
  background_audio_volume REAL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'draft',
  exported_video_url TEXT,
  exported_r2_key TEXT,
  error_message TEXT,
  total_duration_seconds REAL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_video_editor_projects_user_id ON video_editor_projects(user_id);

CREATE TABLE IF NOT EXISTS community_videos (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  display_name TEXT DEFAULT 'Anonymous',
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_community_videos_likes ON community_videos(likes DESC);

CREATE TABLE IF NOT EXISTS community_likes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  community_video_id TEXT NOT NULL REFERENCES community_videos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  user_intent TEXT NOT NULL,
  style TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  scenes JSONB NOT NULL DEFAULT '[]',
  title TEXT NOT NULL,
  total_duration_seconds INTEGER NOT NULL,
  recommended_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_generated_scripts_user_id ON generated_scripts(user_id);

CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  generation_id TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  download_url TEXT,
  platform_url TEXT,
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id);

-- ── PostgreSQL functions for atomic credit operations ─────────────────────────

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id TEXT,
  p_amount INTEGER,
  p_generation_id TEXT,
  p_description TEXT
) RETURNS VOID AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
BEGIN
  SELECT credits INTO v_current_credits FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  v_balance_after := v_current_credits - p_amount;

  UPDATE users
  SET credits = credits - p_amount,
      credits_used_this_month = credits_used_this_month + p_amount,
      updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, balance_after, type, description, generation_id)
  VALUES (p_user_id, -p_amount, v_balance_after, 'generation', p_description, p_generation_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id TEXT,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_razorpay_payment_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
BEGIN
  SELECT credits INTO v_current_credits FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  v_balance_after := v_current_credits + p_amount;

  UPDATE users
  SET credits = credits + p_amount,
      updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, balance_after, type, description, razorpay_payment_id)
  VALUES (p_user_id, p_amount, v_balance_after, p_type, p_description, p_razorpay_payment_id);
END;
$$ LANGUAGE plpgsql;
