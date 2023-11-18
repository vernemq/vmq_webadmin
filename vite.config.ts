import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import SvgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import Layouts from 'vite-plugin-vue-meta-layouts'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Modify from '@kingyue/rollup-plugin-modify'
import * as mdicons from '@mdi/js'

const mdi: Record<string, string> = {}
Object.keys(mdicons).forEach((key) => {
  const value = (mdicons as Record<string, string>)[key]
  mdi[
    key.replace(
      /[A-Z]+(?![a-z])|[A-Z0-9]/g,
      ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
    )
  ] = value
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Modify({
      exclude: ['node_modules/**'],
      find: /\b(?<![/\w])(mdi-[\w-]+)\b(?!\.)/,
      replace: (match: string) => {
        if (mdi[match]) {
          return mdi[match]
        } else {
          console.warn('[plugin-modify] No matched svg icon for ' + match)
          return match
        }
      },
      sourcemap: false,
    }),
    VueRouter({ importMode: 'sync', dts: './src/typed-router.d.ts' }),
    Vue({ template: { transformAssetUrls } }),
    SvgLoader({
      svgoConfig: {
        plugins: [
          'cleanupEnableBackground',
          'removeDoctype',
          'removeMetadata',
          'removeComments',
          'removeXMLNS',
          'removeXMLProcInst',
          'sortDefsChildren',
          'convertTransform',
          {
            name: 'addClassesToSVGElement',
            params: { className: 'v-icon__svg' },
          },
        ],
      },
    }),
    Layouts(),
    Vuetify({ autoImport: true }),
    Components({ dts: './src/components.d.ts', types: [] }),
    AutoImport({
      imports: [
        'vue',
        'pinia',
        VueRouterAutoImports,
        {
          vuetify: [
            'useTheme',
            'useRtl',
            'useLocale',
            'useDisplay',
            'useLayout',
          ],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/stores'],
    }),
  ],
  server: {
    proxy: {
      '/webuiapi/v1/nodefwd/self/': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
        secure: false,
        headers: { 'x-api-key': '' },
        rewrite: (path) => path.replace(/^\/webuiapi\/v1\/nodefwd\/self\//, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target a:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target a:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/webuiapi/v1/nodefwd/VerneMQ@127.0.0.1/': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
        secure: false,
        headers: { 'x-api-key': '' },
        rewrite: (path) => path.replace(/^\/webuiapi\/v1\/nodefwd\/VerneMQ@127.0.0.1\//, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target a:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target a:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/webuiapi/v1/nodefwd/VerneMQ@127.0.0.2/': {
        target: 'http://127.0.0.2:8888',
        changeOrigin: true,
        secure: false,
        headers: { 'x-api-key': 'E57mFERHoFw6QxUiqjldyILOx8IToB0m' },
        rewrite: (path) => path.replace(/^\/webuiapi\/v1\/nodefwd\/VerneMQ@127.0.0.2\//, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target c :', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target c:', proxyRes.statusCode, req.url);
          });
        },
      },
      cors:false
    }
  },
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    include: ['test/**/*.test.ts', 'src/**/__tests__/*'],
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    server: { deps: { inline: ['vuetify'] } },
  },
})
