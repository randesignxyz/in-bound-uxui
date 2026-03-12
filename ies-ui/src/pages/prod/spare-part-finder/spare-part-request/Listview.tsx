import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { simpleRequestActions } from '@/services/model';
import { Tabs } from 'antd';
import { ProdPaths } from '../..';
// @ts-ignore JSX component without local declaration file
import SparePartList from './SparePartList';
import MyRequestListview from './my-request/MyRequestListview';

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
            children: <SparePartList />,
          },
          {
            label: 'My Request',
            key: '2',
            children: <MyRequestListview/>,
          },
        ]}
      />

    </>
  );
}