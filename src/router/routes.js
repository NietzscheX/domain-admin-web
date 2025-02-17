import Layout from '@/layout/index.vue'
import Login from '@/views/login/Login.vue'
import { RoleEnum } from '@/emuns/role-enums.js'

export const routes = [
  // 登录
  {
    path: '/login',
    component: Login,
    meta: {
      hidden: true,
    },
  },

  // 首页
  {
    path: '/',
    redirect: {
      name: 'cert-list',
    },
    meta: {
      hidden: true,
    },
  },

  // 证书
  {
    path: '/cert',
    name: 'cert',
    component: Layout,
    meta: {
      title: '证书',
      icon: 'Tickets',
    },

    redirect: {
      name: 'cert-list',
    },

    children: [
      {
        path: 'list',
        name: 'cert-list',
        component: () => import('../views/domain-list/index.vue'),
        meta: {
          title: '证书列表',
          icon: 'Tickets',
        },
      },
    ],
  },

  // 域名
  {
    path: '/domain',
    name: 'domain',
    component: Layout,
    meta: {
      title: '域名',
      icon: 'Coin',
    },
    redirect: { name: 'domain-list' },
    children: [
      {
        path: 'list',
        name: 'domain-list',
        component: () => import('../views/domain-info-list/index.vue'),
        meta: {
          title: '域名列表',
          icon: 'Coin',
        },
      },
    ],
  },

  {
    path: '/group',
    name: 'group',
    component: Layout,
    meta: {
      title: '分组',
      icon: 'Files',
    },

    redirect: { name: 'group-list' },
    children: [
      {
        path: 'list',
        name: 'group-list',
        component: () => import('../views/group-list/index.vue'),
        meta: {
          title: '分组管理',
          icon: 'Files',
        },
      },
    ],
  },

  {
    path: '/notify',
    name: 'notify',
    component: Layout,
    meta: {
      title: '通知',
      icon: 'Message',
    },

    redirect: { name: 'notify-list' },
    children: [
      {
        path: 'edit',
        name: 'notify-list',
        // component: () => import('../views/notify-edit/index.vue'),
        component: () => import('../views/notify-list/index.vue'),
        meta: {
          title: '通知列表',
          icon: 'Message',
        },
      },
    ],
  },
  {
    path: '/data',
    name: 'data',
    component: Layout,
    redirect: { name: 'data-cert-list' },
    meta: {
      title: '数据管理',
      icon: 'Box',
      roles: [RoleEnum.Admin],
    },
    children: [
      {
        path: 'cert-list',
        name: 'data-cert-list',
        component: () => import('../views/domain-list/index.vue'),
        meta: {
          title: '全部证书',
          icon: 'Tickets',
        },
        props: {
          role: RoleEnum.Admin,
        },
      },
      {
        path: 'domain-list',
        name: 'data-domain-list',
        component: () => import('../views/domain-info-list/index.vue'),
        meta: {
          title: '全部域名',
          icon: 'Coin',
        },
        props: {
          role: RoleEnum.Admin,
        },
      },

      {
        path: 'group-list',
        name: 'data-group-list',
        component: () => import('../views/group-list/index.vue'),
        meta: {
          title: '全部分组',
          icon: 'Files',
        },
        props: {
          role: RoleEnum.Admin,
        },
      },
    ],
  },

  {
    path: '/admin',
    name: 'admin',
    component: Layout,
    redirect: { name: 'admin-user-list' },
    meta: {
      title: '系统管理',
      icon: 'Setting',
      roles: [RoleEnum.Admin],
    },
    children: [
      {
        path: 'user-list',
        name: 'admin-user-list',
        component: () => import('../views/user-admin-list/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          roles: [RoleEnum.Admin],
        },
      },

      {
        path: 'system-setup',
        name: 'system-setup',
        component: () => import('../views/system-setup/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting',
          roles: [RoleEnum.Admin],
        },
      },
    ],
  },

  {
    path: '/log',
    name: 'log',
    component: Layout,
    redirect: { name: 'log-scheduler-list' },
    meta: {
      title: '系统日志',
      icon: 'Clock',
      roles: [RoleEnum.Admin],
    },
    children: [
      {
        path: 'log-scheduler-list',
        name: 'log-scheduler-list',
        component: () => import('../views/log-scheduler-list/index.vue'),
        meta: {
          title: '监测日志',
          icon: 'Calendar',
          roles: [RoleEnum.Admin],
        },
      },
      {
        path: 'log-operation-list',
        name: 'log-operation-list',
        component: () => import('../views/log-operation-list/index.vue'),
        meta: {
          title: '操作日志',
          icon: 'Compass',
          roles: [RoleEnum.Admin],
        },
      },
      {
        path: 'log-async-task-list',
        name: 'log-async-task-list',
        component: () => import('../views/log-async-task-list/index.vue'),
        meta: {
          title: '异步任务',
          icon: 'Compass',
          roles: [RoleEnum.Admin],
        },
      },
    ],
  },

  {
    path: '/utils',
    name: 'utils',
    component: Layout,
    redirect: { name: 'lab' },
    meta: {
      hidden: true,
      title: '工具箱',
    },

    children: [
      {
        path: 'lab',
        name: 'lab',
        component: () => import('../views/lab/index.vue'),
        meta: {
          title: 'WHOIS查询',
          icon: 'Box',
          // roles: [RoleEnum.Admin],
          hidden: true,
        },
      },
      {
        path: 'domain-cert-list',
        name: 'domain-cert-list',
        component: () => import('../views/domain-cert-list/index.vue'),
        meta: {
          title: '子域名证书查询',
          icon: 'Box',
          // roles: [RoleEnum.Admin],
          hidden: true,
        },
      },
      {
        path: 'cert-info',
        name: 'cert-info',
        component: () => import('../views/cert-info/index.vue'),
        meta: {
          title: '证书信息查询',
          icon: 'Box',
          // roles: [RoleEnum.Admin],
          hidden: true,
        },
      },
      {
        path: 'icp-info',
        name: 'icp-info',
        component: () => import('../views/icp-info/index.vue'),
        meta: {
          title: 'ICP备案查询',
          icon: 'Box',
          // roles: [RoleEnum.Admin],
          hidden: true,
        },
      },
      {
        path: 'issue-certificate-list',
        name: 'issue-certificate-list',
        component: () => import('../views/issue-certificate-list/index.vue'),
        meta: {
          title: 'SSL证书申请',
          icon: 'Box',
          // roles: [RoleEnum.Admin],
          hidden: true,
        },
      },
      
    ],
  },
]
