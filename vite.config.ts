import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{podiumPreview:resolve(import.meta.dirname,'podium-preview.html'),main:resolve(import.meta.dirname,'index.html'),trivia:resolve(import.meta.dirname,'trivia.html')}}}});

