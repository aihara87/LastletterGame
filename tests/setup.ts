import { vi } from 'vitest'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234-5678-9abc-def012345678'
})
