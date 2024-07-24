import { useAccess } from '@umijs/max';

export const MPUPath = {
  rsmRequest: '/sale/mpu',
  mpuStock: '/sale/mpu_stock',
  mpuPurchaseOrder: '/sale/mpu_purchase_order',
  mpuReport: '/sale/mpu_report',
  mpuCountStock: '/sale/mpu_count_stock',
  mpuSettlement: '/sale/mpu_settlement',
  //   productItem: '/retailer/products',
  //   customer: '/retailer/customers',
  //   customergroup: '/retailer/group/customer',
  //   category: '/retailer/categories',
  //   ingredient: '/retailer/ingredients',
  //   customer_pricing: '/retailer/customer_pricing',
  //   pricing: '/retailer/pricings',
  //   registration: '/retailer/registrations',
  //   settings: '/retailer/settings',
};

export default () => {
  const access = useAccess();
  // const [report, setReport] = useState<ReportName>();

  //   const menus = [
  //     {
  //       id: 'mpu_request',
  //       name: 'RSM Request',
  //       description: '',
  //       link: `${MPUPath.rsmRequest}/list`,
  //       icon: agreementIcon,
  //       visible: access.canAccessViewMpu,
  //     },
  //   ];
  return (
    <>
      {/* <ListMenuComp items={menus} /> */}
      {/* <Reports reportName={report} onClose={() => setReport(undefined)} /> */}
    </>
  );
};
