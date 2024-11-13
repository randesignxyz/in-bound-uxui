import reportIcon from '@/assets/clipboard.png';
import userIcon from '@/assets/customer.png';
import deliveryIcon from '@/assets/delivery.png';
import plannerIcon from '@/assets/planner.png';
import productIcon from '@/assets/product.png';
import scheduleIcon from '@/assets/schedule.png';

import pricingIcon from '@/assets/price-64.png';
// import customerIcon from '@/assets/people.png';
import settlementIcon from '@/assets/receive-cash.png';
// import orderItemIcon from '@/assets/requisition.png';
import dailyReportIcon from '@/assets/dsd-report-icon.png';

// import soInvoiceIcon from '@/assets/sale-invoice.png';
import agreementIcon from '@/assets/agreement.png';
import complainIcon from '@/assets/complain.png';
import purchaseOrderIcon from '@/assets/order-items.png';

import saleIcon from '@/assets/shopping.png';
import stockIcon from '@/assets/stock.png';
import storeIcon from '@/assets/store.png';
import stockCountId from '@/assets/stock-count.png';

import FOC from '@/assets/free.png';

import type { ListMenuItem } from '@/components/ListMenu';
import ListMenuComp from '@/components/ListMenu';
import {
  BarChartOutlined,
  PlusCircleOutlined,
  ScheduleOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Divider, Menu, message } from 'antd';
import { useState } from 'react';
import { history, useAccess } from 'umi';
import type { ReportName } from './reports';

import { PageContainer } from '@ant-design/pro-components';
import { MenuProps } from 'rc-menu';
import { MPUPath } from './mpu';
import Reports from './reports';
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
  purchaseOrder: "/sale/purchase-order"
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

  const soMenu = (
    <Menu
      onClick={(info) => {
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
      }}
      items={[
        getItem(
          'Actions',
          'action-menu',
          null,
          [getItem('New SO', 'newSaleOrder', <PlusCircleOutlined />)],
          'group',
        ),
        getItem(
          'Reports',
          'report-menu',
          null,
          [getItem('Sale Order Report', 'sale-order-report', <BarChartOutlined />)],
          'group',
        ),
      ]}
    />
  );

  const reportsMenu = (
    <Menu
      onClick={(info) => {
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
          default:
            message.error('Something went wrong.');
        }
        return undefined;
      }}
      items={[
        // getItem('Export Leads', 'lead-reports', <BarChartOutlined />),
        // getItem('Sales Invoice Report', 'dsd-reports', <AuditOutlined />),
        getItem(
          'Reports',
          'lead-report-menu',
          null,
          [
            getItem('Export Leads', 'lead-reports', <TeamOutlined />),
            getItem('Sales Invoice Report', 'dsd-reports', <TagsOutlined />),
            getItem('Visit Report', 'visit-reports', <ScheduleOutlined />),
          ],
          'group',
        ),
      ]}
    />
  );

  // const itemsMenu: MenuProps['items'] = [
  //   getItem('Sales Invoice Report', 'sales-invoice-report', <BarChartOutlined />),
  //   getItem('Sale Items Report', 'sale-items-report', <SlidersOutlined />),
  // ];

  // const reportMenus = (
  //   <Menu
  //     items={itemsMenu}
  //     onClick={(info) => {
  //       switch (info.key) {
  //         case 'sales-invoice-report':
  //           setReport('sales-invoice-report');
  //           break;
  //         case 'sale-items-report':
  //           setReport('sale-items-report');
  //           break;
  //         default:
  //           message.error('Something went wrong.');
  //       }
  //       return undefined;
  //     }}
  //   />
  // );

  const stockMenuItems: ListMenuItem[] = [
    {
      id: 'suggestion',
      name: 'Task List',
      description: 'Task list of stock control',
      link: `${SalePaths.suggestion}/list`,
      icon: plannerIcon,
      // visible: access.canAcessStockControlMenuItem || access.canAccessSettlementMenuItem,
      visible:access.canAccessSaleTaskList
    },
    {
      id: 'store',
      name: 'Store',
      description: 'Store for Van Sale and MPU',
      link: `${SalePaths.store}/list`,
      icon: storeIcon,
      // visible: access.canAccessAllMenuDSD || access.canAccessTabWarehouse,
      visible : access.canAccessSaleStore
    },
    {
      id: 'stock',
      name: 'Stock Control',
      description: 'Van Sale',
      link: `${SalePaths.stock}/list`,
      icon: stockIcon,
      visible: access.canAcessStockControlMenuItem,
    },
    {
      id: 'sales-visit',
      name: 'Visit',
      description: 'DSD Visit',
      link: `${SalePaths.visit}/list`,
      icon: scheduleIcon,
      // visible: access.canAccessAllMenuDSD,
      visible: access.canAccessSaleVisit,
    },
    {
      id: 'settlement',
      name: 'Cash Collection',
      description: 'Cash collection list',
      link: `${SalePaths.settlement}/list`,
      icon: settlementIcon,
      // visible: access.canAccessSettlementMenuItem,
      visible: access.canAccessSaleCash,
    },
    {
      id: 'lead',
      name: 'Lead',
      description: 'DSD Customers',
      link: `${SalePaths.lead}/list`,
      //overlay: leadReportMenu,
      icon: userIcon,
      // visible: access.canAccessAllMenuDSD,
      visible: access.canAccessSaleLead,
    },
    {
      id: 'daily',
      name: 'Daily Report View',
      description: 'Daily report',
      link: `${SalePaths.daily}/list`,
      icon: dailyReportIcon,
      visible: access.canAccessSaleDailyReport,
    },
    {
      id: 'dsdReport',
      name: 'Reports',
      description: 'All Reports in DSD.',
      icon: reportIcon,
      visible: access.canAccessSaleReport,
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
              getItem('Visit Report', 'visit-reports', <ScheduleOutlined />),
            ],
            'group',
          ),
        ]
      }
      // overlay: reportsMenu,
      // onClick: () => {
      //   setReport('dsd-reports');
      // },
    },
    {
      id: 'item-sales-line-price',
      name: 'Pricing',
      description: 'Setting Pricing for DSD',
      icon: pricingIcon,
      visible: access.canAccessAllMenuDSD,
      link: `${SalePaths.pricing}/list`,
    },
    {
      id: 'settlement',
      name: 'Settlement',
      description: '',
      icon: settlementIcon,
      // visible: access.canAccessAllMenuDSD,
      link: `${MPUPath.mpuSettlement}/list`,
    },
    {
      id: 'stock-count',
      name: 'Stock Counts',
      description: '',
      icon: stockCountId,
      // visible: access.canAccessAllMenuDSD,
      link: `${MPUPath.mpuCountStock}/list`,
    }, 
    // {
    //   id: 'free-of-charge',
    //   name: 'Free Of Charge',
    //   description: '',
    //   icon: FOC,
    //   link: `${MPUPath.mpuCountStock}/list`,
    // }, 
  ];

  const items: ListMenuItem[] = [
    {
      id: 'so',
      name: 'Sale Order',
      description: 'Sale Order List',
      link: `${SalePaths.so}/list`,
      icon: saleIcon,
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
          getItem(
            'Actions',
            'action-menu',
            null,
            [getItem('New SO', 'newSaleOrder', <PlusCircleOutlined />)],
            'group',
          ),
          getItem(
            'Reports',
            'report-menu',
            null,
            [getItem('Sale Order Report', 'sale-order-report', <BarChartOutlined />)],
            'group',
          ),
        ]
      }
      // overlay: soMenu,
    },
    {
      id: 'deliveryPlan',
      name: 'Delviery Preview',
      description: 'Delivery SO related Preview',
      link: `${SalePaths.delivery}/list`,
      icon: deliveryIcon,
    },
    {
      id: 'productItem',
      name: 'Product Preview',
      description: 'Products Preview',
      visible: access.canAcessStockControlMenuItem,
      link: `${SalePaths.product}/list`,
      icon: productIcon,
    },
  ];

  const mpuMenuItems = [
    // {
    //   id: 'rsm_request',
    //   // name: 'RSM Request',
    //   name: 'Purchase Request',
    //   description: 'Order Items',
    //   link: `${MPUPath.rsmRequest}/list`,
    //   icon: agreementIcon,
    //   visible: access.canAccessViewMpu,
    // },
    {
      id: 'mpu_po',
      name: 'Purchase Order',
      description: 'make po for request stock',
      link: `${MPUPath.mpuPurchaseOrder}/list`, 
      icon: purchaseOrderIcon,
      visible: access.canAccessViewMpu,
    },
    {
      id: 'mpu_stock',
      name: 'MPU Stock',
      description: '',
      link: `${MPUPath.mpuStock}/list`,
      icon: stockIcon,
      visible: access.canAccessViewMpu,
    },
    {
      id: 'mpu_count_stock',
      name: 'Daily Count Stock',
      description: '',
      link: `${MPUPath.mpuCountStock}/list`,
      icon: complainIcon,
      visible: access.canAccessViewMpu,
    },

    {
      id: 'mpu_report',
      name: 'MPU Report',
      description: '',
      link: `${MPUPath.mpuReport}/list`,
      icon: reportIcon,
      visible: access.canAccessViewMpu,
    },
  ];

  // const retailerMenuItems = [
  //   {
  //     id: 'retailer',
  //     name: 'Retailer',
  //     description: 'Retailer Back End.',
  //     link: `${SalePaths.retailer}`,
  //     icon: orderItemIcon,
  //   },

  // {
  //   id: 'customer_retailer',
  //   name: 'Customer',
  //   description: 'Customers had order from retailer app.',
  //   link: `${SalePaths.customer}/list`,
  //   icon: customerIcon,
  // },
  // {
  //   id: 'user_retailer',
  //   name: 'User',
  //   description: 'Users for retailer app.',
  //   link: `${SalePaths.user}/list`,
  //   icon: userIcon,
  // },

  // ];
  const purchaseOrder = [
    {
      id: "rsmRequest",
      name: "Purchase Order" ,
      description: "Rsm make Purchase Order for MMA",
      link: `${SalePaths.purchaseOrder}/list`,
      icon:purchaseOrderIcon,
      // visible: access.canAccessRSMRequestToMPU,
    }
  ];

  return (
    <PageContainer title={false} >
      {access.canAccessSaleMenuItems && <ListMenuComp items={items} />}
      {/* <ListMenuComp items={retailerMenuItems} /> */}
      <Reports reportName={report} onClose={() => setReport(undefined)} />

      {(access.canAcessStockControlMenuItem ||
        access.canAccessSettlementMenuItem ||
        access.canAccessARMenuItem) && (
          <>
            <Divider/>
            <ListMenuComp items={stockMenuItems} />
          </>
        )}
      {access.canAccessViewMpu && (
        <>
          <Divider plain orientation='left' >MPU</Divider>
          <ListMenuComp items={mpuMenuItems} />
        </>
      )}
        {/* {access.canAccessRSMRequestToMPU && ( */}
        <>
          <Divider plain orientation='left'>MMA</Divider>
          <ListMenuComp items={purchaseOrder} />
        </>
      {/* // )} */}
    </PageContainer>
  );
};
