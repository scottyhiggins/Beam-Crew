import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{main:resolve(import.meta.dirname,'index.html'),party:resolve(import.meta.dirname,'party.html'),trivia:resolve(import.meta.dirname,'trivia.html')}}}});
