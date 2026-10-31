import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{input:{main:'index.html',trivia:'trivia.html',crane:'crane.html',lan:'lan.html'}}}});
