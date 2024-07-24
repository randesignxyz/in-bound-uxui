/**
 *
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        name: 'auth',
        path: '/user/auth',
        component: './User/Auth',
      },
    ],
  },

  {
    path: '/delivery',
    name: 'delivery',
    icon: 'HomeOutlined',
    access: 'canAccesDeliveyMenu',
    component: './delivery',
  },

  {
    path: '/delivery/ticket-board',
    name: 'ticketBoard',
    // hideInMenu: 'true',
    icon: 'ScanOutlined',
    access: 'canAccessQueueMenuItem',
    component: './queue/ticket-board',
  },

  {
    path: '/delivery/board',
    name: 'deliveryBoard',
    icon: 'FieldTimeOutlined',
    // hideInMenu: 'true',
    access: 'canAccessDeliveryMenuItem',
    component: './delivery/board',
  },


  {
    path: '/delivery/loading-board',
    name: 'loadingBoard',
    icon: 'FieldTimeOutlined',
    // hideInMenu: 'true',
    access: 'canAccessDeliveryLoading',
    component: './queue/loading-board',
  },

  {
    path: '/delivery/loading',
    name: 'loading',
    hideInMenu: 'true',
    // icon: 'SnippetsOutlined',
    access: 'canAccessLoadingMenuItem',
    component: './delivery/loading',
  },

  {
    path: '/delivery/cash-collection',
    name: 'cash-collection',
    icon: 'DollarOutlined',
    // hideInMenu: 'true',
    access: 'canAccessDeliveryCashSettlementMenuItem',
    component: './delivery/cash-collection',
  },

  {
    path: '/delivery/display',
    name: 'queue-dashboard',
    icon: 'HourglassOutlined',
    // hideInMenu: 'true',
    access: 'canAccessQueueMenuItem',
    component: './queue/display',
  },

  {
    path: '/delivery/history',
    name: 'deliveryHistory',
    icon: 'SnippetsOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryMenuItem',
    component: './delivery/history',
  },

  {
    path: '/delivery/default/:view/*',
    name: 'delivery',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryMenuItem',
    component: './delivery/default',
  },

  {
    path: '/delivery/tracking',
    name: 'delivery-tracking',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryMenuItem',
    component: './delivery/tracking',
  },



  {
    path: '/delivery/review',
    name: 'review',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccesDeliveryReviewMenuItem',
    component: './delivery/review',
  },

  {
    path: '/delivery/reviewer',
    name: 'reviewer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccesDeliveryReviewMenuItem',
    component: './delivery/reviewer',
  },

  {
    path: '/delivery/price-list/:view/*',
    name: 'priceList',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccesDeliveyMenu',
    component: './delivery/price-list',
  },
  {
    path: '/delivery/company/:view/*',
    name: 'company',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './delivery/company',
  },
  {
    path: '/delivery/transport-source/:view/*',
    name: 'transport-source',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './delivery/transport-source',
  },
  {
    path: '/delivery/driver/:view/*',
    name: 'driver',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryTruck',
    component: './delivery/driver',
  },
  {
    path: '/delivery/officer/:view/*',
    name: 'officer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './delivery/officer',
  },
  {
    path: '/delivery/truck/:view/*',
    name: 'truck',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryTruck',
    component: './delivery/truck',
  },


  /************************ Queque  ******************/

  // {
  //   path: '/queue',
  //   name: 'queue',
  //   icon: 'SnippetsOutlined',
  //   access: 'canAccessQueueMenuItem',
  //   component: './queue',
  // },

  {
    path: '/delivery/ticket-history',
    name: 'ticketHistory',
    hideInMenu: 'true',
    icon: 'UnorderedListOutlined',
    access: 'canAccessQueueMenuItem',
    component: './queue/ticket-history',
  },

  {
    path: '/offline/delivery/display',
    name: 'display',
    icon: 'SnippetsOutlined',
    hideInMenu: 'true',
    layout: false,
    // access: 'canAccessQueueMenuItem',
    component: './queue/display',
  },

  {
    path: '/delivery/loading-history',
    name: 'loadingBoardHistory',
    icon: 'SnippetsOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryLoading',
    component: './queue/loading-board/LoadingHistory',
  },
  {
    path: '/delivery/ticket/:view/*',
    name: 'queue-ticket',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessQueueMenuItem',
    component: './queue/ticket',
  },

  {
    path: '/delivery/setting/:view/*',
    name: 'queueSetting',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './queue/setting',
  },

  {
    path: '/delivery/loading-bay/:view/*',
    name: 'loading-bay',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './queue/loading-bay',
  },
  {
    path: '/delivery/loading-dock/:view/*',
    name: 'loading-dock',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './queue/loading-dock',
  },
  {
    path: '/delivery/qr-code/:view/*',
    name: 'qr-code',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliverySettingMenuItem',
    component: './queue/qr-code',
  },

  {
    path: '/profile',
    name: 'account',
    // icon: 'DeliveredProcedureOutlined',
    // access: 'canAccesDeliveyMenu',
    hideInMenu: 'true',
    component: './profile',
  },

  {
    path: '/setting/process-def/:view/*',
    name: 'process-def',
    icon: 'SettingOutlined',
    hideInMenu: 'true',
    component: './setting/process-def',
  },
  {
    path: '/sale/trade-offer/:view/*',
    name: 'trade-offer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessSaleMenuItem',
    component: './sale/trade-offer',
  },

  {
    path: '/',
    redirect: '/delivery',

  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
