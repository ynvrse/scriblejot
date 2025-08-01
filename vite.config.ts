import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { repoName } from './src/config';
const basenameProd = `/${repoName}/`;

// https://vite.dev/config/

export default defineConfig(({ command }) => {
    const isProd = command === 'build';

    return {
        base: isProd ? basenameProd : '',
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                },
                includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
                manifest: {
                    name: 'ScribleJot – Catatan, To-Do List, dan Shopping List Interaktif',
                    short_name: 'ScribleJot',
                    description:
                        'ScribleJot adalah aplikasi web untuk mencatat, mengatur to-do list, pekerjaan rumah, dan daftar belanja, lengkap dengan fitur komentar untuk kolaborasi.',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: isProd ? `${basenameProd}` : '/',
                    icons: [
                        {
                            src: `${basenameProd}pwa-192x192.svg`,
                            sizes: '192x192',
                            type: 'image/svg',
                        },
                        {
                            src: `${basenameProd}pwa-512x512.svg`,
                            sizes: '512x512',
                            type: 'image/svg',
                        },
                        {
                            src: `${basenameProd}maskable_icon_x512.png`,
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable',
                        },
                    ],
                },
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        define: {
            global: {
                basename: isProd ? basenameProd : '',
            },
        },
    };
});
