import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{input:{main:'index.html',party:'party.html',trivia:'trivia.html',crane:'crane.html',lan:'lan.html',podiumPreview:'podium-preview.html'}}}});
