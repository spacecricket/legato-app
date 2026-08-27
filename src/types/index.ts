type Message = {
  id: string
  from: string
  contents: string
  sequenceNumber: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type Zap = {
  id: string
  from: string
  to: string
  threadId: string
  messageId: string
  isAcknowledged: boolean
  createdAt: string
  updatedAt: string
}

type ThreadSummary = {
  id: string
  name: string
  participants: string[]
  isPrivate: boolean
  messageCount: number
  latestMessage: Message
  zaps: Zap[]
  createdAt: string
  updatedAt: string
}

type LastMessageSeen = {
  id: string
  threadId: string
  participants: string[]
  messageId: string
  updatedAt: string
}
