import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => {
    // Load environment variables
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            host: '0.0.0.0',
            allowedHosts: env.VITE_HOST_URLS ? env.VITE_HOST_URLS.split(',') : [],
        },
        plugins: [
            react(),
            tailwindcss(),
        ],
        base: '/',
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src',
                    import.meta.url)),
                '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: false, // optional: turn off source maps for production
        },
    };
});