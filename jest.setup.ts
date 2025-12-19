import '@testing-library/jest-dom'
import 'cross-fetch/polyfill'
import { TextDecoder, TextEncoder } from 'util'

// --------------------------------------------------
// Polyfill TextEncoder/TextDecoder (viem/wagmi)
// --------------------------------------------------
global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

// --------------------------------------------------
// Polyfill global crypto (web3 libs di Node env)
// --------------------------------------------------
import { webcrypto } from 'crypto'
if (!global.crypto) {
  global.crypto = webcrypto as any
}

// --------------------------------------------------
// Mock next/router
// --------------------------------------------------
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      reload: jest.fn(),
      back: jest.fn(),
    }
  },
}))

// --------------------------------------------------
// Mock next/image (Live react!)
// --------------------------------------------------
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'img',
    props,
    ref: null,
    key: null,
  }),
}))
