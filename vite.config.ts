import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{input:{main:'index.html',crane:'crane.html'}}},server:{hmr:{port:2617}}});
