import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Tabs } from 'antd';
import { ProdPaths } from '../..';
// @ts-ignore
import SparePartList from '../spare-part-request/SparePartList';
import RequestsListWarehouse from './RequestsListWarehouse';
import ReturnsListWarehouse from './ReturnsListWarehouse';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { SparePartWarehouseService } from './service';
import { subscribeWarehouseBadgeRefresh } from '../shared/badgeEvents';
export default function ListView() {
    const services = useMemo(() => SparePartWarehouseService({}), []);
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
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

    const loadPendingRequestCount = useCallback(async () => {
      try {
        const dashboard = await services.getDashboard();
        setPendingRequestCount(Number(dashboard.pendingCount || 0));
      } catch {
        setPendingRequestCount(0);
      }
    }, [services]);

    useEffect(() => {
      loadPendingRequestCount();
    }, [loadPendingRequestCount]);

    useEffect(() => {
      const handleWindowFocus = () => {
        loadPendingRequestCount();
      };
      const unsubscribeWarehouseBadgeRefresh = subscribeWarehouseBadgeRefresh(() => {
        loadPendingRequestCount();
      });

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          loadPendingRequestCount();
        }
      };

      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        unsubscribeWarehouseBadgeRefresh();
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [loadPendingRequestCount]);

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    items={[
        {
            label: 'Spare Parts',
            key: '1',
            children: <SparePartList/>
        },
        {
            label: (
              <Badge count={pendingRequestCount} size="small" overflowCount={999}>
                <span>Requests List</span>
              </Badge>
            ),
            key: '2',
            children: <RequestsListWarehouse/>,
        },
        {
            label: 'Return List',
            key: '3',
            children: <ReturnsListWarehouse/>,
        }
    ]}
    />
  </>
  );
}
