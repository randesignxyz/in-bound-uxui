import transferIcon from '@/assets/transfer.png';
import warehouseTransferIcon from '@/assets/warehouse_transfer.png';
import dailyWaterTreatmentIcon from '@/assets/task-list.png';
import ListMenuComp from '@/components/ListMenu';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
export const ProdPaths = {
  prod: '/prod',
  transferRequest: '/prod/inventory-transfer-request',
  inventoryTransfer: '/prod/inventory-transfer',
  inventoryInboundOutbound: '/prod/inventory-inbound-outbound',
  inventoryInboundRequest: '/prod/inventory-inbound-outbound/request',
  inventoryOutboundTransfer: '/prod/inventory-inbound-outbound/transfer',
  upcomingInbound: '/prod/inventory-inbound-outbound/upcoming-inbound',
  dailyWaterTreatment: '/prod/daily-water-treatment',
  dailyPreWaterTreatment: '/prod/daily-pre-water-treatment',
  dailyHACCPMonitoringtOzone: '/prod/daily-haccp-monitoring-ozone',
  dailyHACCPMonitoring: '/prod/daily-haccp-monitoring',
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
    {
      id: 'inventoryInboundOutbound',
      name: 'Inbound Outbound',
      description: 'Inbound Outbound Hub',
      icon: warehouseTransferIcon,
      link: `${ProdPaths.inventoryInboundOutbound}/list`,
      visible: access.canAccessInventoryInboundOutboundHub,
    },
    // {
    //   id: 'dailyWaterTreatment',
    //   name: 'Daily Water Treatment',
    //   description: 'Daily Water Treatment Plant 2',
    //   icon: dailyWaterTreatmentIcon,
    //   link: `${ProdPaths.dailyWaterTreatment}/list`,
    //   visible: access.canAccessDailyWaterTreatmentMenuItem,
    // },
    {
      id: 'dailyPreWaterTreatment',
      name: 'Daily Pre-Water Treatment',
      description: 'Daily Pre-Water Treatment Control',
      icon: dailyWaterTreatmentIcon,
      link: `${ProdPaths.dailyPreWaterTreatment}/list`,
      visible: access.canAccessDailyPreWaterTreatmentMenuItem,
    },
    {
      id: 'dailyHACCPMonitoring',
      name: 'Daily HACCP Monitoring Line',
      description: 'Daily HACCP Monitoring Line',
      icon: dailyWaterTreatmentIcon,
      link: `${ProdPaths.dailyHACCPMonitoring}/list`,
      visible: access.canAccessDailyHACCPMonitoringMenuItem,
    },
    {
      id: 'dailyHACCPMonitoringtOzone',
      name: 'Daily HACCP Monitoring of WTP',
      description: 'Daily HACCP Monitoring Ozone',
      icon: dailyWaterTreatmentIcon,
      link: `${ProdPaths.dailyHACCPMonitoringtOzone}/list`,
      visible: access.canAccessDailyHACCPMonitoringOzoneMenuItem,
    },
  ];

  return (
    <PageContainer title={false}>
      <ListMenuComp items={itemList} />
    </PageContainer>
  );
};
