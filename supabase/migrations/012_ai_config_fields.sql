-- Nuevos campos configurables por tenant en ai_configs
ALTER TABLE ai_configs
  ADD COLUMN IF NOT EXISTS alert_numbers    text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS greeting_message text,
  ADD COLUMN IF NOT EXISTS handover_template text;
