import icons from "@/.umi/plugin-layout/icons";
import { access } from "fs";

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
    path: '/prod/inventory-inbound-outbound/:view/*',
    name: 'inventoryInboundOutbound',
    hideInMenu: 'true',
    access: 'canAccessInventoryInboundOutboundHub',
    component: './prod/inventory-inbound-outbound/',
  },
  {
    path: '/prod/inventory-inbound-outbound/request/:view/*',
    name: 'inventoryInboundRequest',
    hideInMenu: 'true',
    access: 'canAccessInventoryTranferRequestMenuItem',
    component: './prod/inventory-inbound-outbound/request/',
  },
  {
    path: '/prod/inventory-inbound-outbound/transfer/:view/*',
    name: 'inventoryOutboundTransfer',
    hideInMenu: 'true',
    access: 'canAccessInventoryTranferMenuItem',
    component: './prod/inventory-inbound-outbound/transfer/',
  },
  {
    path: '/prod/inventory-inbound-outbound/upcoming-inbound/:view/*',
    name: 'upcomingInbound',
    hideInMenu: 'true',
    access: 'canAccessUpcomingInboundMenuItem',
    component: './prod/inventory-inbound-outbound/upcoming-inbound/',
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
  {
    path: '/prod/daily-haccp-monitoring-ozone/:view/*',
    name: 'dailyHACCPMonitoringOzone',
    hideInMenu: 'true',
    access: 'canAccessDailyHACCPMonitoringOzoneMenuItem',
    component: './prod/daily-haccp-monitoring-ozone/',
  },

  //  ================= END Prod =================
 {
    path: '/',
    redirect: '/prod',

  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
