import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { simpleRequestActions } from '@/services/model';
import { useAccess } from '@umijs/max';
import { useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import { ProdPaths } from '../..';
import { SparePartRequestServiceAPI } from './service';
import type { SparePartTab } from './data';
import { MyRequestListview } from './my-request';
import { MyReceivedListview } from './my-received';
import ItemListView from '../ItemListView';

export default () => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestServiceAPI(requestActions);

  const [activeTab, setActiveTab] = useState<SparePartTab>('spare-list');

  const routes = [
    { path: ProdPaths.prod, label: 'Prod' },
    { path: '', label: 'Spare Part Request' },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />

      {!access.canAccessSparePartFinder ? (
        <Card>
          <Typography.Text type="danger">
            You do not have permission to access Spare Part Finder.
          </Typography.Text>
        </Card>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as SparePartTab)}
          items={[
            {
              key: 'spare-list',
              label: 'Spare Part List',
              children: (
                <ItemListView
                  services={services}
                  activeTab={activeTab}
                  onSwitchToMyRequests={() => setActiveTab('my-requests')}
                />
              ),
            },
            ...(access.canSpfRequester || access.canSpfApprover
              ? [
                  {
                    key: 'my-requests' as const,
                    label: 'My Requests',
                    children: <MyRequestListview services={services} />,
                  },
                ]
              : []),
            ...(access.canSpfWarehouseStaff
              ? [
                  {
                    key: 'my-received' as const,
                    label: 'My Received',
                    children: <MyReceivedListview services={services} />,
                  },
                ]
              : []),
          ]}
        />
      )}
    </>
  );
};
