import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized } from 'vue-router'
import { useSocketStore } from '@/stores/socket'
import HomeView from '@/views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/views/SignInView.vue')
  },
  {
    path: '/:workspaceSlug',
    component: () => import('@/views/workspace/WorkspaceLayoutView.vue'),
    beforeEnter: workspaceGuard,
    children: [
      {
        path: '',
        name: 'work',
        component: () => import('@/views/workspace/InboxView.vue')
      }
    ]
  }
]

async function workspaceGuard(to: RouteLocationNormalized) {
  const { workspaceSlug } = to.params

  const socketStore = useSocketStore()

  if (socketStore.connectedWorkspaceSlug !== workspaceSlug) {
    await socketStore.connect(workspaceSlug as string)
  }

  return socketStore.connectedWorkspaceSlug === workspaceSlug
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
