import reportIcon from '@/assets/clipboard.png';
import userIcon from '@/assets/customer.png';
import deliveryIcon from '@/assets/delivery.png';
import plannerIcon from '@/assets/planner.png';
import productIcon from '@/assets/product.png';
// import customerIcon from '@/assets/people.png';
import settlementIcon from '@/assets/receive-cash.png';
// import orderItemIcon from '@/assets/requisition.png';
import dailyReportIcon from '@/assets/dsd-report-icon.png';

// import soInvoiceIcon from '@/assets/sale-invoice.png';
import saleIcon from '@/assets/shopping.png';
import stockIcon from '@/assets/stock.png';
import storeIcon from '@/assets/store.png';
import type { ListMenuItem } from '@/components/ListMenu';
import ListMenuComp from '@/components/ListMenu';
import { BarChartOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Divider, Menu, message } from 'antd';
import { useState } from 'react';
import { history, useAccess } from 'umi';
import type { ReportName } from './reports';

import { PageContainer } from '@ant-design/pro-components';
import { MenuProps } from 'rc-menu';
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
  // ------------- retailer app -------------
  retailer: '/retailer',
  customer: '/retailer/customers/list',
  groupCustomer: '/retailer/group/customer/list',
  order: '/retailer/order/list',
  user: '/sale/user',
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

  const leadReportMenu = (
    <Menu
      onClick={(info) => {
        switch (info.key) {
          // case 'newSaleOrder':
          //   history.push(`${SalePaths.so}/create`);
          //   break;
          case 'lead-report':
            setReport('dsd-lead-report');
            break;
          default:
            message.error('Something went wrong.');
        }
        return undefined;
      }}
      items={[
        getItem(
          'Reports',
          'lead-report-menu',
          null,
          [getItem('Export Leads', 'lead-report', <BarChartOutlined />)],
          'group',
        ),
        // getItem(
        //   'Reports',
        //   'report-menu',
        //   null,
        //   [getItem('Sale Order Report', 'sale-order-report', <BarChartOutlined />)],
        //   'group',
        // ),
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

  const stockMenuItems = [
    {
      id: 'suggestion',
      name: 'Task List',
      description: 'Task list of stock control',
      link: `${SalePaths.suggestion}/list`,
      icon: plannerIcon,
      visible: access.canAcessStockControlMenuItem || access.canAccessSettlementMenuItem,
    },
    {
      id: 'store',
      name: 'Store',
      description: 'Store for Van Sale and MPU',
      link: `${SalePaths.store}/list`,
      icon: storeIcon,
      visible: access.canAccessAllMenuDSD,
    },
    {
      id: 'stock',
      name: 'Stock Control',
      description: 'Van Sale or MPU',
      link: `${SalePaths.stock}/list`,
      icon: stockIcon,
      visible: access.canAcessStockControlMenuItem,
    },
    {
      id: 'settlement',
      name: 'Cash Collection',
      description: 'Cash collection list',
      link: `${SalePaths.settlement}/list`,
      icon: settlementIcon,
      visible: access.canAccessSettlementMenuItem,
    },
    {
      id: 'lead',
      name: 'Lead',
      description: 'DSD Customers',
      link: `${SalePaths.lead}/list`,
      overlay: leadReportMenu,
      icon: userIcon,
      visible: access.canAccessAllMenuDSD,
    },
    {
      id: 'daily',
      name: 'Daily Report View',
      description: 'Daily report',
      link: `${SalePaths.daily}/list`,
      icon: dailyReportIcon,
      visible: access.canAccessARMenuItem,
    },
    {
      id: 'dsdReport',
      name: 'DSD Reports',
      description: 'Sales Invoice and Sale Items',
      // link: `${SalePaths.daily}/list`,
      icon: reportIcon,
      visible: access.canAccessAllMenuDSD,
      onClick: () => {
        setReport('dsd-reports');
      },
      // isMenu: true,
      //overlay: reportMenus,
    },
  ];

  const items: ListMenuItem[] = [
    {
      id: 'so',
      name: 'Sale Order',
      description: 'Sale Order List',
      link: `${SalePaths.so}/list`,
      icon: saleIcon,
      //      isMenu: true,
      overlay: soMenu,
      // menu: soMenu,
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

  return (
    <PageContainer title={false}>
      {access.canAccessSaleMenuItems && (
        <>
          <ListMenuComp items={items} />
          <Divider />
        </>
      )}
      {/* <ListMenuComp items={retailerMenuItems} /> */}
      <Reports reportName={report} onClose={() => setReport(undefined)} />
      {(access.canAcessStockControlMenuItem ||
        access.canAccessSettlementMenuItem ||
        access.canAccessARMenuItem) && <ListMenuComp items={stockMenuItems} />}
      {/* {access.canAccessRetailer && (
        <>
          <Divider />
          <ListMenuComp items={retailerMenuItems} />
        </>
      )} */}
    </PageContainer>
  );
};
