export type Workspace = {
  id: string
  slug: string
  name: string
  logoUrl: string
  isDeleted: boolean
  updatedAt: Date
}

export type User = {
  id: string
  handle: string
  firstName: string
  lastName: string
  avatarUrl: string
  isGuest: boolean
  isDeleted: boolean
  updatedAt: Date
}

export type Thread = {
  id: string
  name: string
  isPrivate: boolean
  messageCount: number
  isDeleted: boolean
  insertedAt: Date
  updatedAt: Date
}

export type ThreadMember = {
  id: string
  threadId: string
  userId: string
  isDeleted: boolean
  insertedBy: string
  updatedBy: string
  insertedAt: Date
  updatedAt: Date
}

export type Watermark = {
  threadId: string
  sequenceNumber: number
  updatedAt: Date | null
}

export type ThreadMessage = {
  id: string
  version: number
  threadId: string
  userId: string
  content: string
  contentFormatVersion: number
  sequenceNumber: number
  isDeleted: boolean
  insertedAt: Date
  updatedAt: Date
}

export type Zap = {
  id: string
  fromUserId: string
  toUserId: string
  threadId: string
  messageId: string
  isDeleted: boolean
  isAcked: boolean
  insertedAt: Date
  updatedAt: Date
}

export class ThreadSummary {
  // 1. Property Declarations with Type Annotations
  thread: Thread | null
  inboundZaps: Map<string, Zap>
  threadMembers: Map<string, ThreadMember>
  watermark: Watermark | null
  latestMessage: ThreadMessage | null

  // 2. The Constructor to Initialize Properties
  constructor() {
    this.thread = null
    this.inboundZaps = new Map()
    this.threadMembers = new Map()
    this.watermark = null
    this.latestMessage = null
  }

  setThread(thread: Thread): void {
    const old = this.thread
    if (!old || old.updatedAt.getTime() < thread.updatedAt.getTime()) {
      this.thread = thread
    }
  }

  setInboundZap(zap: Zap): void {
    const { id } = zap

    const old = this.inboundZaps.get(id)
    if (!old || old.updatedAt.getTime() < zap.updatedAt.getTime()) {
      this.inboundZaps.set(id, zap)
    }
  }

  setThreadMember(threadMember: ThreadMember): void {
    const { id } = threadMember

    const old = this.threadMembers.get(id)
    if (!old || old.updatedAt.getTime() < threadMember.updatedAt.getTime()) {
      this.threadMembers.set(id, threadMember)
    }
  }

  setWatermark(watermark: Watermark): void {
    const old = this.watermark
    if (!old || !old.updatedAt || old.updatedAt.getTime() < watermark.updatedAt!.getTime()) {
      this.watermark = watermark
    }
  }

  setLatestMessage(threadMessage: ThreadMessage): void {
    const old = this.latestMessage
    if (!old || old.sequenceNumber < threadMessage.sequenceNumber) {
      this.latestMessage = threadMessage
    }
  }
}
