import reportIcon from '@/assets/clipboard.png';
import userIcon from '@/assets/customer.png';
import deliveryIcon from '@/assets/delivery.png';
import productIcon from '@/assets/product.png';
import scheduleIcon from '@/assets/schedule.png';

// import customerIcon from '@/assets/people.png';
import settlementIcon from '@/assets/receive-cash.png';
// import orderItemIcon from '@/assets/requisition.png';
import dailyReportIcon from '@/assets/dsd-report-icon.png';

// import soInvoiceIcon from '@/assets/sale-invoice.png';
import agreementIcon from '@/assets/agreement.png';
import purchaseOrderIcon from '@/assets/order-items.png';

import salesInvoiceIcon from '@/assets/invoice.png';
import saleIcon from '@/assets/shopping.png';
import stockCountId from '@/assets/stock-count.png';
import stockIcon from '@/assets/stock.png';
import storeIcon from '@/assets/store.png';

import type { ListMenuItem } from '@/components/ListMenu';
import ListMenuComp from '@/components/ListMenu';
import {
  BarChartOutlined,
  FundOutlined,
  PlusCircleOutlined,
  ScheduleOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Divider, message } from 'antd';
import { useState } from 'react';
import { history, useAccess } from 'umi';
import type { ReportName } from './reports';

import { PageContainer } from '@ant-design/pro-components';
import { MenuProps } from 'rc-menu';
import { MPUPath } from './mpu';
import Reports from './reports';
import { DeliveryPaths } from '../delivery';
import Supporter from './supporter';
{
  /* <TeamOutlined /> */
}

export const SalePaths = {
  so: '/sale/so',
  stock: '/sale/stock',
  store: '/sale/store',
  soInvoice: '/sale/so-invoice',
  transaction: '/sale/transaction',
  suggestion: '/sale/suggestion',
  settlement: '/sale/settlement',
  lead: '/sale/lead',
  daily: '/sale/daily-report',
  promotion: '/sale/promotion',
  tradeOffer: '/sale/trade-offer',
  delivery: '/sale/delivery',
  paymentTerm: '/sale/payment-term',
  storeLocation: '/sale/store-location',
  shippingMethod: '/sale/shipping-method',
  product: '/sale/product',
  uom: '/sale/uom',
  teamWork: '/sale/team-work',
  visit: '/sale/visit',
  // ------------- retailer app -------------
  retailer: '/retailer',
  customer: '/retailer/customers/list',
  groupCustomer: '/retailer/group/customer/list',
  order: '/retailer/order/list',
  user: '/sale/user',
  pricing: '/sale/pricing',
  purchaseOrder: '/sale/purchase-order',
  delAllocate: '/sale/allocate',
};

export default () => {
  const access = useAccess();

  const [report, setReport] = useState<ReportName>();

  type MenuItem = Required<MenuProps>['items'][number];

  const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem => {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  };

  const stockMenuItems: ListMenuItem[] = [
    // {
    //   id: 'suggestion',
    //   name: 'Task List',
    //   description: 'All suggestions from Salesperson.',
    //   link: `${SalePaths.suggestion}/list`,
    //   icon: plannerIcon,
    //   // visible: access.canAcessStockControlMenuItem || access.canAccessSettlementItem,
    //   visible: access.canAcessStockControlMenuItem,
    // },
    {
      id: 'store',
      name: 'Store',
      description: 'Store for Salespersons',
      link: `${SalePaths.store}/list`,
      icon: storeIcon,
      // visible: access.canAccessAllMenuDSD || access.canAccessTabWarehouse,
      visible: access.canAccessSaleStoreItems || access.canAccessSaleStoreItem,
    },
    {
      id: 'stock',
      name: 'Stock Control',
      description: 'Daily Stock Control',
      link: `${SalePaths.stock}/list`,
      icon: stockIcon,
      visible: access.canAcessStockControlItem || access.canAccessSaleStockCtrl,
    },
    {
      id: 'sales-visit',
      name: 'Visit',
      description: 'Visit without plan.',
      link: `${SalePaths.visit}/list`,
      icon: scheduleIcon,
      // visible: access.canAccessAllMenuDSD,
      visible: access.canAccessSaleVisit || access.canAccessSaleVisitItem,
    },
    {
      id: 'settlement',
      name: 'Cash Collection',
      description: 'Cash collection list',
      link: `${SalePaths.settlement}/list`,
      // icon: settlementIcon,
      icon: agreementIcon,
      // visible: access.canAccessSettlementItem,
      visible: access.canAccessSaleCash || access.canAccessSaleCashCollectionItem,
    },
    {
      id: 'lead',
      name: 'Lead',
      description: 'Outlet Information',
      link: `${SalePaths.lead}/list`,
      //overlay: leadReportMenu,
      icon: userIcon,
      // visible: access.canAccessAllMenuDSD,
      visible: access.canAccessSaleLead || access.canAccessSaleLeadItem,
    },
    {
      id: 'daily',
      name: 'Daily Report View',
      description: 'Daily report',
      link: `${SalePaths.daily}/list`,
      icon: dailyReportIcon,
      visible: access.canAccessSaleDailyReport || access.canAccessSaleDailyReportItem,
    },
    {
      id: 'dsdReport',
      name: 'Reports',
      description: 'All Reports',
      icon: reportIcon,
      visible: access.canAccessSaleReport || access.canAccessSaleDailyReport || access.canAccessSaleReportLst,
      menu: {
        onClick: (info) => {
          switch (info.key) {
            // case 'newSaleOrder':
            //   history.push(`${SalePaths.so}/create`);
            //   break;
            case 'lead-reports':
              setReport('dsd-lead-report');
              break;
            case 'dsd-reports':
              setReport('dsd-reports');
              break;
            case 'visit-reports':
              setReport('visit-report');
              break;
            case 'sale-invoice-report-v1':
              setReport('sale-invoice-report-v1');
              break
            case 'purchase-order-reports':
              setReport('purchase-order-reports');
              break;
            case 'performance-po-report':
              setReport('performance-po-report');
              break;
            default:
              message.error('Something went wrong.');
          }
          return undefined;
        },
        items: [
          // getItem('Export Leads', 'lead-reports', <BarChartOutlined />),
          // getItem('Sales Invoice Report', 'dsd-reports', <AuditOutlined />),
          getItem(
            'Reports',
            'lead-report-menu',
            null,
            [
              getItem('Export Leads', 'lead-reports', <TeamOutlined />),
              getItem('Sales Invoice Report', 'dsd-reports', <TagsOutlined />),
              getItem('Sales Invoice Report V1', 'sale-invoice-report-v1', <TagsOutlined />),
              getItem('Visit Report', 'visit-reports', <ScheduleOutlined />),
              getItem('Purchase Order Report', 'purchase-order-reports', <ShoppingOutlined />),
              getItem('Performance P.O Report', 'performance-po-report', <FundOutlined />),
            ],
            'group',
          ),
        ],
      },
      // overlay: reportsMenu,
      // onClick: () => {
      //   setReport('dsd-reports');
      // },
    },
    // {
    //   id: 'item-sales-line-price',
    //   name: 'Pricing',
    //   description: 'Pricing for Sales Invoice',
    //   icon: pricingIcon,
    //   visible: access.canAccessAllMenuDSD,
    //   link: `${SalePaths.pricing}/list`,
    // },
    {
      id: 'mpu_po',
      name: 'Purchase Order',
      description: 'Make P.O for Stock Receive.',
      link: `${MPUPath.mpuPurchaseOrder}/list`,
      icon: purchaseOrderIcon,
      visible:
        access.canAccessViewMpu || access.canAccessSaleDailyReport || access.canAccessTabWarehouse || access.canAccessSalePurchaseOrder,
    },
    {
      id: 'stock-count',
      name: 'Stock Counts',
      description: 'Daily Stock Count Review',
      icon: stockCountId,
      visible: access.canAcessStockControlItem || access.canAccessSaleDailyReport || access.canAccessSaleStockCount,
      link: `${MPUPath.mpuCountStock}/list`,
    },
    {
      id: 'settlement',
      name: 'Settlement',
      description: 'Daily Settlement Review',
      icon: settlementIcon,
      visible:
        access.canAccessAllMenuDSD ||
        access.canAccessSaleDailyReport ||
        access.canAccessSettlementItem ||
        access.canAccessSaleSettlement,
      link: `${MPUPath.mpuSettlement}/list`,
    },

    {
      id: 'invoice',
      name: 'Sales Invoice',
      description: 'Daily Sales Invoice',
      icon: salesInvoiceIcon,
      visible:
        access.canAccessAllMenuDSD ||
        access.canAccessSaleDailyReport ||
        access.canAccessSettlementItem ||
        access.canAccessSaleInvoice,
      link: `${MPUPath.salesInvoice}/list`,
    },
    {
      id: 'allocationDel',
      name: 'Delivery Order Plan',
      description: 'Delivery Order Plan List',
      link: `${SalePaths.delAllocate}/list`,
      icon: agreementIcon,
      visible: access.canAccesAllocateSaleView || access.canAccesSaleDeliveryOrderPlan
    },

    // {
    //   id: 'free-of-charge',
    //   name: 'Free Of Charge',
    //   description: '',
    //   icon: FOC,
    //   visible: access.canAcessStockControlItem,
    //   link: `${MPUPath.mpuFOC}/list`,
    // },
    // {
    //   id: 'mpu_po',
    //   name: 'Purchase Order',
    //   description: 'Under warehouse review.',
    //   link: `${MPUPath.warehousePOPortal}/list`,
    //   icon: purchaseOrderIcon,
    //   visible: access.canAccessTabWarehouse,
    // },
  ];

  const items: ListMenuItem[] = [
    {
      id: 'so',
      name: 'Purchase Order',
      description: 'Purchase Order List',
      link: `${SalePaths.so}/list`,
      icon: saleIcon,
      visible: access.canAccessSaleItems || access.canAccessSaleSo,
      menu: {
        onClick: (info) => {
          switch (info.key) {
            case 'newSaleOrder':
              history.push(`${SalePaths.so}/create`);
              break;
            case 'sale-order-report':
              setReport('sale-order-report');
              break;
            default:
              message.error('Something went wrong.');
          }
          return undefined;
        },
        items: [
          access.canCreateEditSo ? getItem(
            'Actions',
            'action-menu',
            null,
            [getItem('New PO', 'newSaleOrder', <PlusCircleOutlined />)],
            'group',
          ) : null,
          getItem(
            'Reports',
            'report-menu',
            null,
            [getItem('Purchase Order Report', 'sale-order-report', <BarChartOutlined />)],
            'group',
          ),
        ],
      },
      // overlay: soMenu,
    },
    {
      id: 'so',
      name: 'All Sale Order List',
      description: 'All Sale Order List',
      link: `${SalePaths.so}/list/all`,
      icon: saleIcon,
      visible: access.canAccessSaleItems || access.canAccessSaleSo,
      menu: {
        onClick: (info) => {
          switch (info.key) {
            case 'newSaleOrder':
              history.push(`${SalePaths.so}/create`);
              break;
            case 'sale-order-report':
              setReport('sale-order-report');
              break;
            default:
              message.error('Something went wrong.');
          }
          return undefined;
        },
        items: [
          access.canCreateEditSo ? getItem(
            'Actions',
            'action-menu',
            null,
            [getItem('New PO', 'newSaleOrder', <PlusCircleOutlined />)],
            'group',
          ) : null,
          getItem(
            'Reports',
            'report-menu',
            null,
            [getItem('Purchase Order Report', 'sale-order-report', <BarChartOutlined />)],
            'group',
          ),
        ],
      },
      // overlay: soMenu,
    },
    {
      id: 'deliveryPlan',
      name: 'Delivery Preview',
      description: 'Delivery SO related Preview',
      link: `${SalePaths.delivery}/list`,
      icon: deliveryIcon,
      visible: access.canAccessSaleItems || access.canAccessSaleDelPrev,
    },
    {
      id: 'productItem',
      name: 'Product Preview',
      description: 'Products Preview',
      visible: access.canAcessStockControlItem || access.canAccessSaleProdPrev,
      link: `${SalePaths.product}/list`,
      icon: productIcon,
    }
  ];


  return (
    <PageContainer title={false}>
      {(access.canAccessSaleItems || access.canAccessSaleSo || access.canAccessSaleDelPrev || access.canAccessSaleProdPrev) && <ListMenuComp items={items} />}
      {/* <ListMenuComp items={retailerMenuItems} /> */}

      <Reports reportName={report} onClose={() => setReport(undefined)} />

      {(access.canAcessStockControlMenuItem ||
        access.canAccessSettlementMenuItem ||
        access.canAccessARMenuItem ||
        access.canAccessViewMpuMenu ||

        access.canAccessSaleStoreMenuItem ||
        access.canAccessSaleLeadMenu ||
        access.canAccessSaleReportLst ||
        access.canAccessSaleInvoice ||
        access.canAccesSaleDeliveryOrderPlan ||
        access.canAccesAllocateSaleView || access.canAccesSaleDeliveryOrderPlan
      ) && (
          <>
            <Divider />
            <ListMenuComp items={stockMenuItems} />
            <Divider orientation='left' plain >Supporter</Divider>
            <Supporter />
          </>
        )}
    </PageContainer>
  );
};
