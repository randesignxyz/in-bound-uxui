
import { Tabs } from 'antd';
import { ProdPaths } from '../..';
// @ts-ignore
import SparePartList from '../spare-part-request/SparePartList';
import RequestsListWarehouse from './RequestsListWarehouse';
import ReturnsListWarehouse from './ReturnsListWarehouse';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
export default function ListView() {
    const routes =[
        {
           path: '/prod',
           label: 'Prod',
        },
        { 
           path: ProdPaths.sparePartRequest,
           label: 'Spare Parts',
        }
    ]

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    items={[
        {
            label: 'Spare Parts',
            key: '1',
            children: <SparePartList/>
        },
        {
            label: 'Requests List',
            key: '2',
            children: <RequestsListWarehouse/>,
        },
        {
            label: 'Return List',
            key: '3',
            children: <ReturnsListWarehouse/>,
        }
    ]}
    />
  </>
  );
}
