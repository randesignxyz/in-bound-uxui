import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { Tabs } from 'antd';
import { ProdPaths } from '../..';
import SparePartListTest from './SparePartsListTest';

export default function ListView() {
  const routes = [
    {
      path: '/prod',
      label: 'Prod',
    },
    {
      path: ProdPaths.sparePartRequestTest,
      label: 'Spare Part Request',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Tabs
        items={[
        {
          label: 'Spare Part Request List',
          key: '1',
          children: <SparePartListTest />,
        },
      ]}
      />
    </>
  );
}