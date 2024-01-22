import { defineConfig } from '@umijs/max';

const layout = false

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Delivery',
  },
  qiankun: {
    slave: {},
  },
  routes: [
    {
      path: '/',
      layout: layout,
      redirect: '/home',
    },
    {
      name: 'home',
      path: '/home',
      component: './Home',
      layout: layout,
    },
    {
      name: 'access',
      path: '/access',
      component: './Access',
      layout: layout,
    },
    {
      name: ' CRUD',
      path: '/table',
      component: './Table',
      layout: layout,
    },
  ],
  npmClient: 'yarn',
});

