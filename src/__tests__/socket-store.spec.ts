import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSocketStore } from '@/stores/socket'

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn<(endpoint: string) => Promise<unknown>>((endpoint) => {
    if (endpoint.startsWith('/api/sign-in/token')) {
      return Promise.resolve({ token: 'test-token', workspaceId: 'w1', userId: 'u1' })
    }
    if (endpoint.includes('/users')) return Promise.resolve([])
    return Promise.resolve({ id: 'w1' })
  }),
}))

class FakeWebSocket {
  static instances: FakeWebSocket[] = []

  readyState = 0 // CONNECTING
  binaryType = 'arraybuffer'
  timeout = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onerror: ((error: unknown) => void) | null = null
  onmessage: ((event: unknown) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null

  constructor(readonly url: string, readonly protocols?: string[]) {
    FakeWebSocket.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    if (this.readyState === 3) return
    this.readyState = 3
    this.onclose?.({ code: 1000, wasClean: true } as CloseEvent)
  }

  open() {
    this.readyState = 1
    this.onopen?.()
  }
}

describe('useSocketStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    FakeWebSocket.instances = []
    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves connect() once the transport opens', async () => {
    const store = useSocketStore()

    const connected = store.connect('acme')

    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1))
    FakeWebSocket.instances[0]!.open()

    // With a deep reactive Socket (ref instead of shallowRef), phoenix.js never
    // recognises the connection as open and this promise never settles.
    await expect(connected).resolves.toBeUndefined()
    expect(store.connectionState).toBe('connected')
    expect(store.isConnected).toBe(true)
    expect(store.workspaceSlug).toBe('acme')
  })
})
