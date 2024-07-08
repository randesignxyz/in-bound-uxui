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
    path: '/task-list',
    name: 'task-list',
    icon: 'FileDoneOutlined',
    component: './process-flow/task-list',
    access: 'canAccessTaskListMenu',
  },
  {
    path: '/process-request',
    name: 'process-request',
    access: 'canAccessRequestListMenu',
    icon: 'AuditOutlined',
    component: './process-flow/request',
  },
  {
    path: '/external/data-form/:formKey/:id',
    layout: false,
    name: 'external',
    hideInMenu: 'true',
    component: './process-flow/form',
  },
  {
    path: '/data-form/:formKey/:id',
    name: 'process',
    hideInMenu: 'true',
    component: './process-flow/form',
  },
  {
    path: '/crm/contact/:view/*',
    name: 'contact',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/contact',
  },
  {
    path: '/crm',
    name: 'crm',
    icon: 'TeamOutlined',
    access: 'canAccessCrmMenuItem',
    component: './crm',
  },
  {
    path: '/crm/customer/:view/*',
    name: 'view-customer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/customer',
  },
  // {
  //   path: '/crm/customer/new',
  //   name: 'customers',
  //   icon: 'UnorderedListOutlined',
  //   hideInMenu: 'true',
  //   access: 'canAccessCrmMenuItem',
  //   component: './crm/customer/CustomerNew',
  // },
  {
    path: '/external/crm/customer/:view/*',
    name: 'view-customer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    layout: false,
    access: 'canAccessCrmMenuItem',
    component: './crm/customer',
  },
  {
    path: '/crm/visit-plan/:view/*',
    name: 'visit-plan',
    icon: 'TeamOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/visit-plan',
  },
  {
    path: '/external/crm/visit-plan/:view/*',
    name: 'visit-plan',
    icon: 'TeamOutlined',
    hideInMenu: 'true',
    layout: false,
    access: 'canAccessCrmMenuItem',
    component: './crm/visit-plan',
  },
  {
    path: '/crm/visit-schedule/:view/*',
    name: 'visit-schedule',
    icon: 'TeamOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/visit-schedule',
  },
  {
    path: '/external/crm/visit-schedule/:view/*',
    name: 'visit-schedule',
    icon: 'TeamOutlined',
    hideInMenu: 'true',
    layout: false,
    access: 'canAccessCrmMenuItem',
    component: './crm/visit-schedule',
  },
  {
    path: '/crm/contract/:view/*',
    name: 'contract',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/contract',
  },
  {
    path: '/external/crm/contract/:view/*',
    name: 'contract',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    layout: false,
    access: 'canAccessCrmMenuItem',
    component: './crm/contract',
  },
  {
    path: '/crm/notification/:view/*',
    name: 'notification',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/notification',
  },
  {
    path: '/crm/term/:view/*',
    name: 'term',
    icon: 'TeamOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/term',
  },
  {
    path: '/external/crm/term/:view/*',
    name: 'term',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    layout: false,
    access: 'canAccessCrmMenuItem',
    component: './crm/term',
  },

  /**********<<Pro**************/
  {
    path: '/pro',
    name: 'pro',
    icon: 'FormOutlined',
    access: 'canAccessProMenuItem',
    component: './pro',

  },

  {
    path: '/pro/requisition/:view/*',
    name: 'requisition',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessProMenuItem',
    component: './pro/requisition',
  },

  {
    path: '/pro/quotation/:view/*',
    name: 'quotation',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessProPQMenuItem',
    component: './pro/quotation',
  },

  {
    path: '/external/pro/quotation/:view/*',
    name: 'quotation',
    icon: 'UnorderedListOutlined',
    layout: false,

    hideInMenu: 'true',
    access: 'canAccessProPQMenuItem',
    component: './pro/quotation',
  },

  {
    path: '/pro/price-comparison/:view/*',
    name: 'priceComparison',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessProQCMenuItem',
    component: './pro/price-comparison',
  },
  {
    path: '/pro/po/:view/*',
    name: 'requisition',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessProPOMenuItem',
    component: './pro/po',
  },
  {
    path: '/crm/gratis/:view/*',
    name: 'gratis',
    icon: 'TeamOutlined',
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/gratis',
  },
  {
    path: '/external/crm/gratis/:view/*',
    name: 'gratis',
    icon: 'UnorderedListOutlined',
    layout: false,
    hideInMenu: 'true',
    access: 'canAccessCrmMenuItem',
    component: './crm/gratis',
  },
  /**********Pro>>**************/

  /**********<<HRM**************/
  {
    path: '/hrm',
    name: 'hrm',
    icon: 'FormOutlined',
    access: 'canAccessHrMenu',
    component: './hrm',
  },

  {
    path: '/hrm/employee/:view/*',
    name: 'employee',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessHrEmployeeMenuItem',
    component: './hrm/employee',
  },

  {
    path: '/hrm/staff-requisistion/:view/*',
    name: 'staff-requisition',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessHrStaffRequisitionMenuItem',
    component: './hrm/staff-requisition',
  },

  {
    path: '/hrm/staff-proposal/:view/*',
    name: 'staff-proposal',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessHrStaffProposalMenuItem',
    component: './hrm/staff-proposal',
  },
  {
    path: '/hrm/appraisal-submit/:view/*',
    name: 'appraisal-submit',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAppraisalSubmit',
    component: './hrm/appraisal-submit',
  },
  {
    path: '/external/hrm/appraisal-submit/:view/*',
    name: 'appraisal-submit',
    icon: 'UnorderedListOutlined',
    layout: false,
    hideInMenu: 'true',
    access: 'canAccessAppraisalSubmit',
    component: './hrm/appraisal-submit',
  },
  {
    path: '/hrm/appraisal-request/:view/*',
    name: 'appraisal-request',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAppraisalReaquest',
    component: './hrm/appraisal-request',
  },
  /**********HRM>>**************/

  /**********<<Sale**************/
  {
    path: '/sale',
    name: 'sale',
    icon: 'DollarCircleOutlined',
    access: 'canAccessSaleMenuItem',
    component: './sale',
  },
  {
    path: '/sale/so/:view/*',
    name: 'so',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessSaleMenuItems',
    component: './sale/so',
  },

  {
    path: 'external/sale/so/:view/*',
    name: 'so',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    layout: false,
    access: 'canAccessSaleMenuItems',
    component: './sale/so',
  },

  {
    path: '/sale/delivery/:view/*',
    name: 'delivery',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessSaleMenuItems',
    component: './sale/delivery',
  },
  {
    path: '/sale/product/:view/*',
    name: 'product',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessSaleMenuItems',
    component: './sale/product',
  },
  /******************* DSD *******************/
  {
    path: '/sale/stock/:view/*',
    name: 'stock',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAcessStockControlMenuItem',
    component: './sale/stock-control',
  },
  {
    path: '/sale/so-invoice/:view/*',
    name: 'so-invoice',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessSettlementMenuItem',
    component: './sale/so-invoice',
  },
  {
    path: '/sale/team-work/:view/*',
    name: 'team-work',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAllMenuDSD',
    component: './sale/team-work',
  },
  {
    path: '/sale/store/:view/*',
    name: 'store',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAllMenuDSD',
    component: './sale/store',
  },
  {
    path: '/sale/transaction/:view/*',
    name: 'transaction',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAllMenuDSD',
    component: './sale/transaction',
  },
  {
    path: '/sale/suggestion/:view/*',
    name: 'suggestion',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDSD',
    component: './sale/suggestion',
  },
  {
    path: '/sale/settlement/:view/*',
    name: 'settlement',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessSettlementMenuItem',
    component: './sale/settlement',
  },
  {
    path: '/sale/lead/:view/*',
    name: 'lead',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAllMenuDSD',
    component: './sale/lead',
  },
  {
    path: '/sale/daily-report/:view/*',
    name: 'daily',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessARMenuItem',
    component: './sale/daily_report',
  },
  {
    path: '/sale/visit/:view/*',
    name: 'sales-visit',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAllMenuDSD',
    component: './sale/visit',
  },
  {
    path: '/sale/pricing/:view/*',
    name: 'item-sales-line-price',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessAllMenuDSD',
    component: './sale/pricing',
  },

  /******************* MPU *******************/

  // {
  //   path: '/sale/mpu',
  //   name: 'mpu',
  //   icon: 'UnorderedListOutlined',
  //   access: 'canAccessViewMpu',
  //   component: './sale/mpu',
  // },

  // {
  //   path: '/sale/stock/:view/*',
  //   name: 'stock',
  //   icon: 'UnorderedListOutlined',
  //   hideInMenu: 'true',
  //   access: 'canAcessStockControlMenuItem',
  //   component: './sale/stock-control',
  // },

  {
    path: '/sale/mpu/:view/*',
    name: 'sale_rsm_request',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessViewMpu',
    component: './sale/mpu/request',
  },
  {
    path: '/sale/mpu_stock/:view/*',
    name: 'sale_mpu_stock',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessViewMpu',
    component: './sale/mpu/stock',
  },
  {
    path: '/sale/mpu_purchase_order/:view/*',
    name: 'sale_mpu_purchase_order',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessViewMpu',
    component: './sale/mpu/purchase_order',
  },
  {
    path: '/sale/mpu_count_stock/:view/*',
    name: 'sale_mpu_count_stock',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessViewMpu',
    component: './sale/mpu/count_stock',
  },

  /******************* MPU *******************/

  /******************* Retailer *******************/
  {
    path: '/retailer',
    name: 'retailer',
    icon: 'UnorderedListOutlined',
    access: 'canViewRetailerSalesperons',
    component: './sale/retailer',
  },

  {
    path: '/retailer/order/:view/*',
    name: 'retailer_order',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailer',
    component: './sale/retailer/orders',
  },

  {
    path: '/retailer/group/customer/:view/*',
    name: 'retailer_cutomer_group',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailerSalesperons',
    component: './sale/retailer/groupCustomer',
  },

  {
    path: '/retailer/products/:view/*',
    name: 'retailer_product',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailer',
    component: './sale/retailer/product',
  },
  {
    path: '/retailer/customers/:view/*',
    name: 'retailer_customer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailerSalesperons',
    component: './sale/retailer/customer',
  },
  {
    path: '/retailer/categories/:view/*',
    name: 'retailer_customer',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailer',
    component: './sale/retailer/category',
  },

  {
    path: '/retailer/ingredients/:view/*',
    name: 'retailer_ingredient',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessRetailer',
    component: './sale/retailer/ingredient',
  },

  {
    path: '/retailer/customer_pricing/:view/*',
    name: 'retailer_customer_pricing',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailerSalesperons',
    component: './sale/retailer/customer_pricing',
  },

  {
    path: '/retailer/pricings/:view/*',
    name: 'retailer_pricing',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canViewRetailerSalesperons',
    component: './sale/retailer/pricing',
  },
  {
    path: '/retailer/registrations/:view/*',
    name: 'registration_form',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canCreateRetailer',
    component: './sale/retailer/registration',
  },
  {
    path: '/retailer/settings/*',
    name: 'settings_form',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canCreateRetailer',
    component: './sale/retailer/settings',
  },
  /******************* Retailer *******************/

  /******************* Developer *******************/
  // {
  //   path: '/configure/:view/*',
  //   name: 'dev_configure',
  //   icon: 'UnorderedListOutlined',
  //   hideInMenu: 'true',
  //   access: 'canAccessDevLevel',
  //   component: './sale/configure',
  // },
  /******************* Developer *******************/

  {
    path: '/profile',
    name: 'account',
    // icon: 'DeliveredProcedureOutlined',
    // access: 'canAccesDeliveyMenu',
    hideInMenu: 'true',
    component: './profile',
  },

  /************************ Delivery Tracking  ******************/

  /*
  {
    name: 'delivery',
    path: '/delivery/*',
    microApp: 'delivery',
  },
  */

  {
    path: '/delivery',
    name: 'delivery',
    icon: 'DeliveredProcedureOutlined',
    access: 'canAccesDeliveyMenu',
    component: './delivery',
  },

  {
    path: '/delivery/board',
    name: 'deliveryBoard',
    icon: 'SnippetsOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryMenuItem',
    component: './delivery/board',
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
    path: '/delivery/loading',
    name: 'loading',
    hideInMenu: 'true',
    // icon: 'SnippetsOutlined',
    access: 'canAccessLoadingMenuItem',
    component: './delivery/loading',
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
    path: '/delivery/cash-collection',
    name: 'cash-collection',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryCashSettlementMenuItem',
    component: './delivery/cash-collection',
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
    path: '/delivery/ticket-board',
    name: 'ticketBoard',
    hideInMenu: 'true',
    icon: 'UnorderedListOutlined',
    access: 'canAccessQueueMenuItem',
    component: './queue/ticket-board',
  },
  {
    path: '/delivery/ticket-history',
    name: 'ticketHistory',
    hideInMenu: 'true',
    icon: 'UnorderedListOutlined',
    access: 'canAccessQueueMenuItem',
    component: './queue/ticket-history',
  },
  {
    path: '/delivery/display',
    name: 'display',
    icon: 'SnippetsOutlined',
    hideInMenu: 'true',
    access: 'canAccessQueueMenuItem',
    component: './queue/display',
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
    path: '/delivery/loading-board',
    name: 'loadingBoard',
    icon: 'SnippetsOutlined',
    hideInMenu: 'true',
    access: 'canAccessDeliveryLoading',
    component: './queue/loading-board',
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
  /**********<<ICT**************/
  {
    path: '/ict',
    name: 'ict',
    icon: 'CustomerServiceOutlined',
    access: 'canAccessIctMenuItem',
    component: './ict',
  },

  {
    path: '/ict/incident/:view/*',
    name: 'incident',
    icon: 'BugOutlined',
    hideInMenu: 'true',
    access: 'canAccessIncidentMenuItem',
    component: './ict/incident',
  },

  {
    path: '/ict/request/:view/*',
    name: 'itRequest',
    icon: 'BugOutlined',
    hideInMenu: 'true',
    access: 'canAccessITRequestFormMenuItem',
    component: './ict/it-request',
  },

  {
    path: '/ict/new-staff/:view/*',
    name: 'ict-new-staff',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessITNewStaffMenuITem',
    component: './ict/new-staff',
  },

  /**********ICT>>**************/

  /**********<<FMA**************/
  {
    path: '/fma/new-staff/:view/*',
    name: 'fma-new-staff',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessFMANewStaffMenuITem',
    component: './fma/new-staff',
  },
  /**********FMA>>**************/

  /*************<<Delivery Expense********************/

  {
    path: '/expense/delivery',
    name: 'delExpenpse',
    icon: 'ReconciliationOutlined',
    access: 'canAccessDeliveryExpenseMenu',
    component: './expense/delivery',
  },
  {
    path: '/expense/delivery/view/:id',
    name: 'viewDelivery',
    hideInMenu: 'true',
    icon: 'UnorderedListOutlined',
    access: 'canAccessDeliveryExpenseMenu',
    component: './expense/delivery/DeliveryList/View',
  },
  {
    path: '/expense/delivery/delivery-list',
    name: 'deliveryList',
    hideInMenu: 'true',
    access: 'canAccessDeliveryExpenseMenu',
    component: './expense/delivery/DeliveryList',
  },
  {
    path: '/expense/delivery/dn-finder',
    name: 'deliveryNoteFinder',
    hideInMenu: 'true',
    access: 'canAccessDeliveryExpenseMenu',
    component: './expense/delivery/DNFinder',
  },
  {
    path: '/expense/delivery/price-list',
    name: 'deliveryPriceList',
    hideInMenu: 'true',
    access: 'canAccessDeliveryExpenseMenu',
    component: './expense/delivery/PriceList',
  },
  /*************Delivery Expense>>********************/

  //  =================  FLEET =================

  {
    path: '/fleet',
    name: 'fleet',
    icon: 'CarOutlined',
    component: './fleet/',
    access: 'canAccessFleetMenu',
  },
  {
    path: '/fleet/vehicle/:view/*',
    name: 'fleet_vehicle',
    icon: 'UnorderedListOutlined',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/vehicle/',
  },
  {
    path: '/external/fleet/vehicle/:view/*',
    layout: false,
    name: "fleet",
    component: './fleet/vehicle/',
    access: 'canAccessFleetMenu',
    hideInMenu: 'true',
  },

  {
    path: '/fleet/maintenance/:view/*',
    name: 'fleet_maintenence',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/maintenance/',
  },
  {
    path: '/external/fleet/maintenance/:view/*',
    name: 'fleet_maintenence',
    layout: false,
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/maintenance/',
  },
  {
    path: '/fleet/inspection/:view/*',
    name: 'fleet_inspection',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/inspection/',
  },
  {
    path: '/external/fleet/inspection/:view/*',
    name: 'inspection',
    layout: false,
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/inspection/',
  },
  {
    path: '/fleet/fuel/:view/*',
    name: 'fleet_fuel',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/fuel/',
  },
  {
    path: '/fleet/setting/:view',
    name: 'Setting',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/setting/',
  },
  {
    path: '/fleet/fuel-stock/:view/*',
    name: 'fleet_fuel_stock',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/fuelStock/',
  },
  {
    path: '/fleet/report/:view/*',
    name: 'report',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/report/',
  },
  {
    path: '/fleet/maintenance-and-service/:view/*',
    name: 'fleet_mantenance_plan',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/servicereminder/',
  },
  {
    path: '/fleet/dashboard/:view/*',
    name: 'fleet_dashboard',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/dashboard/',
  },
  {
    path: '/fleet/service-tasks/:view/*',
    name: 'fleet_service',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/serviceTask/',
  },
  {
    path: '/fleet/stock/:view/*',
    name: 'fleet_stock',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/fuelStock/',
  },
  {
    path: '/fleet/accessory/:view/*',
    name: 'fleet_accessory',
    hideInMenu: 'true',
    access: 'canAccessFleetMenu',
    component: './fleet/accessory/',
  },
  //  ================= END FLEET =================

  // ================= DMS =======================
  {
    path: '/dms',
    name: 'dms',
    icon: 'FileSearchOutlined',
    component: './dms',
    access: 'canAccessDMSMenu',
    redirect: '/dms/workspace/library',
  },

  {
    path: '/dms/workspace/:view/*',
    name: 'dms',
    icon: 'FileSearchOutlined',
    component: './dms',
    access: 'canAccessDMSMenu',
    hideInMenu: 'true',
  },

  {
    path: "/dms/workspace/:view",
    name: "dms",
    icon: "FileSearchOutlined",
    component: "./dms",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },

  {
    path: "/dms/setting/:view/*",
    name: "dms",
    component: "./dms/setting",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  {
    path: "/dms/folder/:view/*",
    name: "dms",
    component: "./dms/folder",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  {
    path: "/dms/document/:view/*",
    name: "dms",
    component: "./dms/documentation",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  {
    path: '/external/dms/document/:view/*',
    layout: false,
    name: "dms",
    component: "./dms/documentation",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  {
    path: "/dms/contracts/:view/*",
    name: "dms",
    component: "./dms/contract",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  {
    path: "/dms/share/:view/:id",
    name: "dms",
    component: "./dms/share",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  {
    path: "/dms/company/:view/*",
    name: "dms",
    component: "./dms/contract/company",
    access: "canAccessDMSMenu",
    hideInMenu: 'true',
  },
  // ==================== END DMS ================

  //  =================Begin Prod =================
  {
    path: '/prod',
    name: 'prod',
    icon: 'ReconciliationOutlined',
    access: 'canAccessProdMenu',
    component: './prod',
  },
  {
    path: '/prod/inventory-transfer-request/:view/*',
    name: 'inventoryTransferRequest',
    hideInMenu: 'true',
    access: 'canAccessInventoryTranferRequestMenuItem',
    component: './prod/inventory-transfer-request',
  },

  {
    path: '/prod/inventory-transfer/:view/*',
    name: 'inventoryTransfer',
    hideInMenu: 'true',
    access: 'canAccessInventoryTranferMenuItem',
    component: './prod/inventory-transfer/',
  },

  {
    path: '/prod/daily-water-treatment/:view/*',
    name: 'dailyWaterTreatment',
    hideInMenu: 'true',
    access: 'canAccessDailyWaterTreatmentMenuItem',
    component: './prod/daily-water-treatment/',
  },
  {
    path: '/prod/daily-pre-water-treatment/:view/*',
    name: 'dailyPreWaterTreatment',
    hideInMenu: 'true',
    access: 'canAccessDailyPreWaterTreatmentMenuItem',
    component: './prod/daily-pre-water-treatment/',
  },
  {
    path: '/prod/daily-haccp-monitoring/:view/*',
    name: 'dailyHACCPMonitoring',
    hideInMenu: 'true',
    access: 'canAccessDailyHACCPMonitoringMenuItem',
    component: './prod/daily-haccp-monitoring/',
  },

  //  ================= END Prod =================
  //  ================= Setting =================

  {
    path: '/setting',
    name: 'setting',
    icon: 'SettingOutlined',
    component: './setting',
    access: 'canAccessSettingMenu',
  },
  {
    path: '/',
    component: 'initial-page',
    // redirect: '/user/auth',
    // redirect: '/task-list',
    // redirect: '/expense/delivery',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
