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
    path: '/prod/inventory-inbound/:view/*',
    name: 'inventoryInbound',
    hideInMenu: 'true',
    access: 'canAccessInventoryInboundHub',
    component: './prod/inventory-inbound/',
  },

  {
    path: '/prod/inventory-inbound/upcoming-inbound/:view/*',
    name: 'upcomingInbound',
    hideInMenu: 'true',
    access: 'canAccessUpcomingInboundMenuItem',
    component: './prod/inventory-inbound/upcoming-inbound/',
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
  // ================== SPF ======================
  {
    path: '/prod/spare-part-return/:view/*',
    name: 'spare-parts',
    hideInMenu: 'true',
    access: 'canAccessSparePartFinder',
    component: './prod/spare-part-finder/spare-part-return',
  },
  {
    path: '/prod/spare-part-request/:view/*',
    name: 'sparePartRequest',
    hideInMenu: 'true',
    access: 'canAccessSparePartFinder',
    component: './prod/spare-part-finder/spare-part-request/',
  },
  {
    path: '/prod/spare-part-warehouse/:view/*',
    name: 'sparePartWarehouse',
    hideInMenu: 'true',
    access: 'canSpfWarehouseStaff',
    component: './prod/spare-part-finder/spare-part-warehouse',
  },
  {
    path: '/prod/spare-part-approval/:view/*',
    name: 'sparePartApproval',
    hideInMenu: 'true',
    access: 'canSpfApprover',
    component: './prod/spare-part-finder/spare-part-approval',
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
