import {defineConfig} from 'vite';
<<<<<<< HEAD
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{main:resolve(import.meta.dirname,'index.html'),trivia:resolve(import.meta.dirname,'trivia.html')}}}});
=======
export default defineConfig({build:{rollupOptions:{input:{main:'index.html',crane:'crane.html',lan:'lan.html'}}},server:{host:'0.0.0.0',hmr:{port:2617}}});
>>>>>>> refs/recovery/m22/crane
