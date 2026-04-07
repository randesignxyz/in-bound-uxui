import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Tabs } from 'antd';
import { ProdPaths } from '../..';
import MyRequestListview from '../spare-part-request/my-request/MyRequestListview';
import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';
import { access } from 'fs';
import { useAccess } from '@umijs/max';
// import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';

export default function ListView() {
    const access = useAccess();
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
            label: 'Request List',
            key: '1',
            children: <MyRequestListview />,
        },
            ...(access.canSpfApprover ?[
                {
                    label: 'Return List',
                    key: '2',
                    children: <MyRequestsToReturn />,
                }
            ]:[])
    ]}
    />
  </>
  );
}