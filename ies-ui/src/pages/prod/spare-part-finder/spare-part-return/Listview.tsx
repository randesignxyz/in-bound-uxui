import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Tabs } from 'antd';
import { ProdPaths } from '../..';
import MySparePartList from './MySparePartList';
// import MyRequestsToReturn from './MyRequestsToReturn';

export default function ListView() {
    const routes =[
        {
           path: '/prod',
           label: 'Prod',
        },
        { 
           path: ProdPaths.sparePartRequest,
           label: 'Spare Part Return',
        }
    ]

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    items={[
        {
            label: 'My Spare Parts List',
            key: '1',
            children: <MySparePartList />
        },
        {
            label: 'My Requests to Return',
            key: '2',
            // children: <MyRequestsToReturn/>,
        },
    ]}
    />
  </>
  );
}