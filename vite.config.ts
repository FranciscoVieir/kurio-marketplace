import path from 'node:path'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  defineConfig,
} from 'vite'

import {
  socketIoPlugin,
} from './vite/socket-io-plugin.ts'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    socketIoPlugin(),
  ],

  resolve: {
    alias: {
      '@':
        path.resolve(
          __dirname,
          './src',
        ),
    },
  },
})