import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/furunja/' : '/',
  plugins: [basicSsl()],
  server: {
    host: true,
  },
}));
