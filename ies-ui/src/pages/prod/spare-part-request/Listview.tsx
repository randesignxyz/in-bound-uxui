import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { ProdPaths } from '..';
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Tabs } from 'antd';
import SparePartListingview from './SparePartListingview';

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
        // {
        //     label: 'Spare Part Request',
        //     key: '2',
        //     children: <TableView<TableViewSearchParams> endpoint={ProdPaths.sparePartRequest} />
        // }
    ]}
    />
  </>
  );
}