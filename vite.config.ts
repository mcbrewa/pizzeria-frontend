import path from 'path'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  preview: {
    allowedHosts: ['pizza.mcbrewa.pl', 'www.pizza.mcbrewa.pl'],
  },
  server: {
    proxy: {
      '/api-auth': {
        target: 'http://localhost:5000',
        rewrite: (path) => path.replace('/api-auth', '/api'),
      },
      '/api': {
        target: 'http://localhost:5001',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src/styles')],
      },
    },
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
