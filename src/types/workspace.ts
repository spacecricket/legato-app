export type Workspace = {
  id: string
  slug: string
  name: string
  logo_url: string
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

export type User = {
  id: string
  handle: string
  first_name: string
  last_name: string
  avatar_url: string
  is_guest: boolean
  is_deleted: boolean
}

export type Thread = {
  id: string
  name: string
  is_private: boolean
  message_count: number
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

export type ThreadMember = {
  id: string
  thread_id: string
  user_id: string
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

export type ThreadMessage = {
  id: string
  version: number
  thread_id: string
  user_id: string
  contents: string
  contents_format_version: number
  sequence_number: number
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

export type Zap = {
  id: string
  from_user_id: string
  to_user_id: string
  thread_id: string
  message_id: string
  is_deleted: boolean
  is_acked: boolean
  created_at: Date
  updated_at: Date
}

export type LastMessageSeen = {
  id: string
  threadId: string
  userId: string
  messageSequenceNumber: number
  updatedAt: Date
}

export type ThreadSummary = {
  thread: Thread
  threadMembers: ThreadMember[]
  latestMessage: ThreadMessage
  zaps: Zap[]
  lastMessageSeen: LastMessageSeen
}
