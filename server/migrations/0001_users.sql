CREATE TABLE users (
  telegram_id INTEGER PRIMARY KEY,
  display_name TEXT NOT NULL,
  username TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'agent')),
  phone TEXT,
  phone_visible INTEGER NOT NULL DEFAULT 0 CHECK (phone_visible IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
