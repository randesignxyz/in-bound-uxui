import transferIcon from '@/assets/transfer.png';
import ListMenuComp from '@/components/ListMenu';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
export const ProdPaths = {
  prod: '/prod',
  transferRequest: '/prod/inventory-transfer-request',
  inventoryTransfer: '/prod/inventory-transfer',
  upcomingInbound: '/prod/inventory-inbound',
  sparePartRequest: '/prod/spare-part-request',
  dailyWaterTreatment: '/prod/daily-water-treatment',
  dailyPreWaterTreatment: '/prod/daily-pre-water-treatment',
  dailyHACCPMonitoringtOzone: '/prod/daily-haccp-monitoring-ozone',
  dailyHACCPMonitoring: '/prod/daily-haccp-monitoring',
  sparePartReturn: '/prod/spare-part-return',
  sparePartWarehouse: '/prod/spare-part-warehouse',
  sparePartApproval: '/prod/spare-part-approval',
};

export default () => {
  const access = useAccess();
  const inboundLink =
    access.canAccessInboundProcurement && !access.canAccessUpcomingInboundOperationsMenuItem
      ? `${ProdPaths.upcomingInbound}/procurement/list`
      : `${ProdPaths.upcomingInbound}/list`;

  const itemList = [
    {
      id: 'upcomingInbound',
      name: 'Inventory Inbound',
      description: 'Upcoming Inbound Receipt & PO Tracking',
      icon: transferIcon,
      link: inboundLink,
      visible: access.canAccessUpcomingInboundMenuItem,
    },
  ];

  return (
    <PageContainer title={false}>
      <ListMenuComp items={itemList} />
    </PageContainer>
  );
};
