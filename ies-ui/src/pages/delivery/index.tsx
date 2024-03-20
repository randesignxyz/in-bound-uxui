import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import buildingIcon from '@/assets/building.png';
import driverIcon from '@/assets/driver.png';
import truckIcon from '@/assets/truck.png';
import cashCollectionIcon from '@/assets/cash-collection.png';
import reviewIcon from '@/assets/review.png';
import complainIcon from '@/assets/complain.png';
import boardIcon from '@/assets/clipboard.png';
import queueIcon from '@/assets/queue.png';
import ticketIcon from '@/assets/ticket.png';
import trollyIcon from '@/assets/trolley.png';
import settingIcon from '@/assets/settings.png';
import qrCodeIcon from '@/assets/qr-code.png';
import forkLift from '@/assets/fork-lift.png';
import { Divider, Menu } from 'antd';
import { AreaChartOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAccess, history } from 'umi';
import { PageContainer } from '@ant-design/pro-components';
import Reports, { ReportType } from './reports';
import { useState } from 'react';

export const DeliveryPaths = {
  default: '/delivery/default',
  company: '/delivery/company',
  driver: '/delivery/driver',
  officer: '/delivery/officer',

  truck: '/delivery/truck',

  tranportSource: '/delivery/transport-source',
  settlement: '/delivery/settlement',
  priceList: '/delivery/price-list',
  loading: '/delivery/loading',
  board: '/delivery/board',
  tracking: '/delivery/tracking',
  cashCollection: '/delivery/cash-collection',
  review: '/delivery/review',
  reviewer: '/delivery/reviewer',
  history: '/delivery/history',
  loadingHistory: '/delivery/loading-history'
};


export const QueuePaths = {
  ticket: '/delivery/ticket',
  ticketBoard: '/delivery/ticket-board',

  setting: '/delivery/setting',
  display: '/delivery/display',
  loadingBoard: '/delivery/loading-board',
  loadingDock: '/delivery/loading-dock',
  loadingBay: '/delivery/loading-bay',
  qrCode: '/delivery/qr-code',
  history: '/delivery/ticket-history',
};

export default () => {

  const access = useAccess()
  const [report, setReport] = useState<ReportType>()


  const deliveryMenu = (
    <Menu
      items={[
        {
          label: 'View History',
          icon: <HistoryOutlined />,
          key: 'delivery-history',
          onClick: () => history.push(DeliveryPaths.history),
        },
      ]}
    />
  );

  const queueItems: ListMenuItem[] = [
    {
      id: 'ticketBoard',
      name: 'Ticket Board',
      description: 'Ticket List',
      link: `${QueuePaths.ticketBoard}`,
      icon: ticketIcon,
      // isMenu: true,
      visible: access.canAccessDeliveryMenuItem,
      menu: {
        items: [{
          label: 'View History',
          icon: <HistoryOutlined style={{ fontSize: '16px', color: '#08c' }} />,
          key: 'ticket-history',
          onClick: () => history.push(QueuePaths.history),
        }]
      }
    },
    {
      id: 'dashboard',
      name: 'Loading Board',
      description: 'Manage Loading',
      link: `${QueuePaths.loadingBoard}`,
      icon: forkLift,
      visible: access.canAccessDeliveryLoading,
      menu: {
        items: [{
          label: 'Loading History',
          icon: <HistoryOutlined style={{ fontSize: '16px', color: '#08c' }} />,
          key: 'loading-list',
          onClick: () => history.push(DeliveryPaths.loadingHistory),
        },
        {
          type: 'divider'
        },
        {
          label: 'Loading Time Report',
          icon: <AreaChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
          key: 'loading-time-report',
          onClick: () => setReport({
            type: 'LOADING_TIME'
          }),
        }]
      }

    },
    {
      id: 'dashboard',
      name: 'Queue Board',
      description: 'Display Board',
      link: `${QueuePaths.display}`,
      visible: access.canAccessDeliveryMenuItem,
      icon: queueIcon,
    },
  ];

  const items: ListMenuItem[] = [
    {
      id: 'delivery-board',
      name: 'Delivery Board',
      description: 'List of delivery',
      link: `${DeliveryPaths.board}`,
      icon: boardIcon,
      // isMenu: true,
      overlay: deliveryMenu,
      visible: access.canAccessDeliveryMenuItem
    },
    {
      id: 'cashCollection',
      name: 'Cash Collection',
      description: 'Cash collection list',
      link: `${DeliveryPaths.cashCollection}`,
      icon: cashCollectionIcon,
      visible: access.canAccessDeliveryCashSettlementMenuItem
    },
    {
      id: 'reviewer',
      name: 'Reviewer',
      description: 'Reviewer List',
      link: `${DeliveryPaths.reviewer}`,
      icon: complainIcon,
      visible: access.canAccesDeliveryReviewMenuItem,
    },
    {
      id: 'review',
      name: 'Review',
      description: 'Review List',
      link: `${DeliveryPaths.review}`,
      icon: reviewIcon,
      visible: access.canAccesDeliveryReviewMenuItem
    },
  ];


  const setupItems = [
    {
      id: 'company',
      name: 'Company',
      description: 'Company List',
      link: `${DeliveryPaths.company}/list`,
      icon: buildingIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
    {
      id: 'transportSource',
      name: 'Transport Source',
      description: 'Transport Source List',
      link: `${DeliveryPaths.tranportSource}/list`,
      icon: driverIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
    {
      id: 'truck',
      name: 'Truck',
      description: 'Truck List',
      link: `${DeliveryPaths.truck}/list`,
      icon: truckIcon,
      visible: access.canAccessDeliveryTruck
    },
    {
      id: 'driver',
      name: 'Driver',
      description: 'Driver List',
      link: `${DeliveryPaths.driver}/list`,
      icon: driverIcon,
      visible: access.canAccessDeliveryDriver
    },
    {
      id: 'officer',
      name: 'Officer',
      description: 'Officer List',
      link: `${DeliveryPaths.officer}/list`,
      icon: driverIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
  ];

  const queueSetupItems = [
    {
      id: 'queue',
      name: 'Queue',
      description: 'Queue List',
      link: `${QueuePaths.setting}/list`,
      icon: settingIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
    {
      id: 'qrCode',
      name: 'QR Code',
      description: 'QR Code List',
      link: `${QueuePaths.qrCode}/list`,
      icon: qrCodeIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
    {
      id: 'loadingBay',
      name: 'Loading Bay',
      description: 'Loading Bay List',
      link: `${QueuePaths.loadingBay}/list`,
      icon: trollyIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
    {
      id: 'loadingDock',
      name: 'Loading Dock',
      description: 'Loading Dock List',
      link: `${QueuePaths.loadingDock}/list`,
      icon: trollyIcon,
      visible: access.canAccessDeliverySettingMenuItem
    },
  ];

  return (
    <PageContainer title={false}>
      {queueItems.some(it => it.visible) && <ListMenuComp items={queueItems} />}
      {queueItems.some(it => it.visible) && <Divider />}
      {items.some(it => it.visible) && <ListMenuComp items={items} />}
      {items.some(it => it.visible) && <Divider />}
      {setupItems.some(it => it.visible) && <ListMenuComp items={setupItems} />}
      {setupItems.some(it => it.visible) && <Divider />}
      {queueSetupItems.some(it => it.visible) && <ListMenuComp items={queueSetupItems} />}
      <Reports report={report} onClose={() => setReport(undefined)} />
    </PageContainer>
  );
};
