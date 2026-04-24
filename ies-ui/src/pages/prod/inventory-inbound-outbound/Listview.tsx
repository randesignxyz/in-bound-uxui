import transferIcon from '@/assets/transfer.png';
import warehouseTransferIcon from '@/assets/warehouse_transfer.png';
import ListMenuComp from '@/components/ListMenu';
import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { useAccess } from '@@/exports';
import { ProdPaths } from '..';

export default () => {
  const access = useAccess();

  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: '',
      label: 'Inbound Outbound',
    },
  ];

  const items = [
    {
      id: 'inventoryOutboundRequest',
      name: 'Outbound Request',
      description: 'Outbound Request List',
      icon: transferIcon,
      link: `${ProdPaths.inventoryInboundRequest}/list`,
      visible: access.canAccessInventoryTranferRequestMenuItem,
    },
    {
      id: 'inventoryOutboundTransfer',
      name: 'Outbound Transfer',
      description: 'Outbound Transfer List',
      icon: warehouseTransferIcon,
      link: `${ProdPaths.inventoryOutboundTransfer}/list`,
      visible: access.canAccessInventoryTranferMenuItem,
    },
    {
      id: 'upcomingInbound',
      name: 'Upcoming Inbound',
      description: 'Upcoming Inbound Receipt & PO Tracking',
      icon: transferIcon,
      link: `${ProdPaths.upcomingInbound}/list`,
      visible: access.canAccessUpcomingInboundMenuItem,
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <ListMenuComp items={items} />
    </>
  );
};
