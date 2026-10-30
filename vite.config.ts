import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{input:{main:'index.html',crane:'crane.html',lan:'lan.html'}}},server:{host:'0.0.0.0',hmr:{port:2617}}});
