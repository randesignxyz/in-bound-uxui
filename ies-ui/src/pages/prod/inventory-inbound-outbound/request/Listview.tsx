import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { Tabs } from 'antd';
import { ProdPaths } from '@/pages/prod';
import ProductionTransferReqListview from './production-transfer-request/ProductionTransferReqListview';
import WarehouseTransferReqListview from './warehouse-transfer-request/WarehouseTransferReqListview';
// import { TransferRequestServiceAPI } from './production-transfer-request/service';

export default () => {
  const access = useAccess();
  // const requestActions = simpleRequestActions();
  // const services = TransferRequestServiceAPI(requestActions);
  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: `${ProdPaths.inventoryInboundOutbound}/list`,
      label: 'Inventory Inbound Outbound',
    },
    {
      path: '',
      label: 'Inventory Inbound Request',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      {access.canAccessProductionTab ? (
        <Tabs
          items={[
            {
              label: 'Production',
              key: '1',
              children: <ProductionTransferReqListview />,
            },
          ]}
        />
      ) : access.canAccessWarehouseTab ? (
        // <Badge size="small" offset={[-1050, 20]} count={(services.page || 0)}>
        <Tabs
          items={[
            {
              label: 'Warehouse',
              key: '2',
              children: <WarehouseTransferReqListview />,
            },
          ]}
        />
      ) : // </Badge>
      access.canAccessItem ? (
        <Tabs
          items={[
            {
              label: 'Production',
              key: '1',
              children: <ProductionTransferReqListview />,
            },
            {
              label: 'Warehouse',
              key: '2',
              children: <WarehouseTransferReqListview />,
            },
          ]}
        />
      ) : (
        <Tabs />
      )}
    </>
  );
};
