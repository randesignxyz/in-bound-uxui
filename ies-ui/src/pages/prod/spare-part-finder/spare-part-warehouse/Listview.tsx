import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { Tabs } from 'antd';
import { ProdPaths } from '../..';
// @ts-ignore
import SparePartList from '../spare-part-request/SparePartList';
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
    ]}
    />
  </>
  );
}