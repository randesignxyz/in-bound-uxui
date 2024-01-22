import transferIcon from '@/assets/transfer.png';
import warehouseTransferIcon from '@/assets/warehouse_transfer.png';

import ListMenuComp from '@/components/ListMenu';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
export const ProdPaths = {
  transferRequest: '/prod/inventory-transfer-request',
  inventoryTransfer: '/prod/inventory-transfer',
};

export default () => {
  const access = useAccess();

  const itemList = [
    {
      id: 'inventoryTransferRequest',
      name: 'Inventory Transfer Request',
      description: 'Inventory Transfer Request List',
      icon: transferIcon,
      link: `${ProdPaths.transferRequest}/list`,
      visible: access.canAccessInventoryTranferRequestMenuItem,
    },
    {
      id: 'inventoryTransfer',
      name: 'Inventory Transfer',
      description: 'Inventory Transfer List',
      icon: warehouseTransferIcon,
      link: `${ProdPaths.inventoryTransfer}/list`,
      visible: access.canAccessInventoryTranferMenuItem,
    },
  ];

  return (
    <PageContainer title={false}>
      <ListMenuComp items={itemList} />
    </PageContainer>
  );
};
