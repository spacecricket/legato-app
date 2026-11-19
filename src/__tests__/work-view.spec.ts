import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { ThreadSummaryResponse } from '@/types/workspace'

const mocks = vi.hoisted(() => {
  const channel = {
    on: vi.fn<(...args: unknown[]) => unknown>(),
    join: vi.fn<() => unknown>(),
    receive: vi.fn<(...args: unknown[]) => unknown>(),
    leave: vi.fn<() => void>(),
  }

  channel.on.mockReturnValue(channel)
  channel.join.mockReturnValue(channel)
  channel.receive.mockReturnValue(channel)

  return {
    channel,
    apiFetch: vi.fn<(endpoint: string, options?: RequestInit) => Promise<unknown>>(),
  }
})

vi.mock('@/stores/socket', () => ({
  useSocketStore: () => ({
    workspaceId: 'workspace-1',
    userId: 'user-1',
    getChannel: () => mocks.channel,
  }),
}))

vi.mock('@/api/client', () => ({
  apiFetch: mocks.apiFetch,
}))

import WorkView from '@/views/workspace/WorkView.vue'

function mountWorkView() {
  return mount(WorkView, {
    global: {
      stubs: {
        WorkToolbar: true,
        ThreadSummaryCard: true,
        OldThreadCover: true,
        ThreadMessageContainer: true,
      },
    },
  })
}

function activeThreadSummary(): ThreadSummaryResponse {
  const now = new Date('2026-01-01T00:00:00Z')

  return {
    thread: {
      id: 'thread-1',
      name: 'Project',
      isPrivate: false,
      messageCount: 1,
      isDeleted: false,
      lastMessageAt: now,
      insertedAt: now,
      updatedAt: now,
    },
    threadMembers: [],
    watermark: {
      threadId: 'thread-1',
      sequenceNumber: 0,
      updatedAt: null,
    },
    latestMessage: null,
  }
}

describe('WorkView', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.apiFetch.mockReset()
    mocks.channel.on.mockClear()
    mocks.channel.join.mockClear()
    mocks.channel.receive.mockClear()
    mocks.channel.leave.mockClear()
  })

  it('celebrates when there are no active thread summaries', async () => {
    mocks.apiFetch.mockResolvedValue({ threadSummaries: [] })

    const wrapper = mountWorkView()
    await flushPromises()

    expect(wrapper.text()).toContain("All's quiet on the work front")
  })

  it('keeps the empty state hidden while an active thread exists', async () => {
    mocks.apiFetch.mockResolvedValue({ threadSummaries: [activeThreadSummary()] })

    const wrapper = mountWorkView()
    await flushPromises()

    expect(wrapper.text()).not.toContain("All's quiet on the work front")
  })
})
