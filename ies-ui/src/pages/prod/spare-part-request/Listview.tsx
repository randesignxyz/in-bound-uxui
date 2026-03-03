import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { ProdPaths } from '..';
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Tabs } from 'antd';
import SparePartListingview from './SparePartListingview';
import MySparePartRequests from './MySparePartRequest';
import MyReceivedRequests from './MyReceivedRequest';

export default function ListView() {
    const routes =[
        {
           path: '/prod',
           label: 'Prod',
        },
        { 
           path: ProdPaths.sparePartRequest,
           label: 'Spare Part',
        }
    ]

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    items={[
        {
            label: 'Spare Part',
            key: '1',
            children: <SparePartListingview />
        },
        {
            label: 'My Request',
            key: '2',
            children: <MySparePartRequests />,
        },
        {
            label: 'My Received Request',
            key: '3',
            children: <MyReceivedRequests />,
        }
    ]}
    />
  </>
  );
}