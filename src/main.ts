import { createApp, ref, type Plugin } from 'vue'

import App from './App.vue'
import '@/assets/styles/index.scss'

const app = createApp(App)

Object.values(
  import.meta.glob<Plugin>('./plugins/*.ts', {
    eager: true,
    import: 'default',
  }),
).forEach((v) => app.use(v))

let workingNodeSelected = ref<any[]>([]);

app.provide('workingNodeSelected', workingNodeSelected)

app.mount('#app')
