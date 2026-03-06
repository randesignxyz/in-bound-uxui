import transferIcon from '@/assets/transfer.png';
import warehouseTransferIcon from '@/assets/warehouse_transfer.png';
import dailyWaterTreatmentIcon from '@/assets/task-list.png';
import vehicleToolIcon from '@/assets/vehicle-tools.png';
import ListMenuComp from '@/components/ListMenu';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
export const ProdPaths = {
  prod: '/prod',
  transferRequest: '/prod/inventory-transfer-request',
  inventoryTransfer: '/prod/inventory-transfer',
  sparePartRequest: '/prod/spare-part-request',
  dailyWaterTreatment: '/prod/daily-water-treatment',
  dailyPreWaterTreatment: '/prod/daily-pre-water-treatment',
  dailyHACCPMonitoringtOzone: '/prod/daily-haccp-monitoring-ozone',
  dailyHACCPMonitoring: '/prod/daily-haccp-monitoring',
  sparePartReturn: '/prod/spare-part-return',
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
      id: 'sparePartRequest',
      name: 'Spare Part Request',
      description: 'Spare Part Request List',
      icon: warehouseTransferIcon,
      link: `${ProdPaths.sparePartRequest}/list`,
      visible: access.canSpfRequester || access.canSpfApprover,
    },
    {
      id: 'sparePartRequestApproval',
      name: 'Request Approval',
      description: 'Approve Items requests',
      icon: warehouseTransferIcon,
      link: `${ProdPaths.sparePartRequest}/list`,
      visible: access.canSpfApprover,
    },
    {
      id: 'sparePartRequestWarehouse',
      name: 'Spare Part Request List',
      description: 'Spare Part Request List',
      icon: warehouseTransferIcon,
      link: `${ProdPaths.sparePartRequest}/list`,
      visible: access.canSpfWarehouseStaff,
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
    {
      id: 'sparePartRequest',
      name: 'Spare Part Request',
      description: 'Spare Part Request List',
      icon: vehicleToolIcon,
      link: `${ProdPaths.sparePartRequest}/list`,
      visible: access.canAccessSparePartRequestMenuItem,
    },
     {
      id: 'sparePartReturn',
      name: 'Spare Part Return',
      description: 'Spare Part Return List',
      icon: vehicleToolIcon,
      link: `${ProdPaths.sparePartReturn}/list`,
      visible: access.canAccessSparePartReturnMenuItem,
    },
  ];

  return (
    <PageContainer title={false}>
      <ListMenuComp items={itemList} />
    </PageContainer>
  );
};
