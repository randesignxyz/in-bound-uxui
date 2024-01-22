import bowlIcon from '@/assets/bowl.png';
import categoryIcon from '@/assets/categories.png';
import reportIcon from '@/assets/clipboard.png';
import customerIcon from '@/assets/customer.png';
import orderIcon from '@/assets/order-items.png';
import customerGroupIcon from '@/assets/people.png';
import suggestionIcon from '@/assets/planner.png';
import pricingIcon from '@/assets/pricing.png';
import productIcon from '@/assets/product.png';
import ListMenuComp from '@/components/ListMenu';
import { useAccess } from '@umijs/max';
import { useState } from 'react';
import Reports, { ReportName } from './reports';

export const RetailerPath = {
  orderItem: '/retailer/order',
  productItem: '/retailer/products',
  customer: '/retailer/customers',
  customergroup: '/retailer/group/customer',
  category: '/retailer/categories',
  ingredient: '/retailer/ingredients',
  pricing: '/retailer/pricings',
  registration: '/retailer/registrations',
  settings: '/retailer/settings',
};

export default () => {
  const access = useAccess();
  const [report, setReport] = useState<ReportName>();
  const menus = [
    {
      id: 'retailer_orders',
      name: 'Order Item',
      description: 'Order List.',
      link: `${RetailerPath.orderItem}/list`,
      icon: orderIcon,
      visible: access.canViewRetailer,
    },
    {
      id: 'retailer_customer',
      name: 'Customer',
      description: 'Customer List.',
      link: `${RetailerPath.customer}/list`,
      icon: customerIcon,
      visible: access.canViewRetailer,
    },
    {
      id: 'retailer_product',
      name: 'Product Item',
      description: 'Product List.',
      link: `${RetailerPath.productItem}/list`,
      icon: productIcon,
      visible: access.canViewRetailer,
    },
    {
      id: 'retailer_category',
      name: 'Category',
      description: 'Category List.',
      link: `${RetailerPath.category}/list`,
      icon: categoryIcon,
      visible: access.canViewRetailer,
    },
    {
      id: 'retailer_ingredient',
      name: 'Ingredient',
      description: 'Ingredient List.',
      link: `${RetailerPath.ingredient}/list`,
      icon: bowlIcon,
      visible: access.canViewRetailer,
    },
    {
      id: 'retailer_pricing',
      name: 'Pricing Rule',
      description: 'Pricing List.',
      link: `${RetailerPath.pricing}/list`,
      icon: pricingIcon,
      visible: access.canCreateRetailer,
    },
    {
      id: 'retailer_cutomer_group',
      name: 'Customer Group',
      description: 'Group List.',
      link: `${RetailerPath.customergroup}/list`,
      icon: customerGroupIcon,
      visible: access.canCreateRetailer,
    },
    {
      id: 'registration_form',
      name: 'Submission Form',
      description: 'Registration Form from App.',
      link: `${RetailerPath.registration}/list`,
      icon: suggestionIcon,
      visible: access.canCreateRetailer,
    },
    {
      id: 'retailerReport',
      name: 'Reports',
      description: 'Retailer Reports',
      // link: `${SalePaths.daily}/list`,
      icon: reportIcon,
      visible: access.canCreateRetailer,
      onClick: () => {
        setReport('retailer-reports');
      },
      // isMenu: true,
      //overlay: reportMenus,
    },
    {
      id: 'setting_form',
      name: 'Settings',
      description: 'Configuration Setting in App.',
      link: `${RetailerPath.settings}`,
      icon: suggestionIcon,
      visible: access.canCreateRetailer,
    },
  ];
  return (
    <>
      <ListMenuComp items={menus} />
      <Reports reportName={report} onClose={() => setReport(undefined)} />
    </>
  );
};
