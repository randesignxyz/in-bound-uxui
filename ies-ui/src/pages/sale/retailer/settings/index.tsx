import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';

export default () => {
  // const access = useAccess();
  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: '',
      label: 'Settings',
    },
  ];

  return (
    <PageContainer title={false}>
      <BreadCrumbCom separator=">" routes={routes} />
      <Card title="Configuration"></Card>
    </PageContainer>
  );
};
