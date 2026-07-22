import { createHash } from 'node:crypto'
// Polyfill crypto.hash for older Node versions (like v20.11.1)
const originalCrypto = globalThis.crypto;
Object.defineProperty(globalThis, 'crypto', {
  value: {
    ...originalCrypto,
    hash: (alg: string, data: any, format: any = 'hex') => {
      return createHash(alg).update(data).digest(format)
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
})

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  assetsInclude: ['**/*.svg'],
})
