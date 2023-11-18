import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:meta-layouts'
import {useAppStore} from "../stores/app";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes: (routes) => setupLayouts(routes),
})

router.beforeEach((to, from) => {
  if (to.path == "/login")
    return true;

  if (useAppStore().token === 'not_yet_set') {
    return {name: '/login'}
  }

  return  true;
})

export default router;
