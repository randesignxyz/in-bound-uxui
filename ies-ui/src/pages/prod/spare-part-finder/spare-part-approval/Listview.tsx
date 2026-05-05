import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Tabs } from 'antd';
import { ProdPaths } from '../..';
import MyRequestListview from '../spare-part-request/my-request/MyRequestListview';
import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';
import { useAccess } from '@umijs/max';
import { SparePartRequestService } from '../spare-part-request/service';
// import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';

export default function ListView() {
    const access = useAccess();
    const services = useMemo(() => SparePartRequestService({}), []);
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
      if (!access.canSpfApprover) {
        setPendingRequestCount(0);
        return;
      }

      try {
        const dashboard = await services.getApprovalDashboard();
        setPendingRequestCount(Number(dashboard.pendingCount || 0));
      } catch {
        setPendingRequestCount(0);
      }
    }, [access.canSpfApprover, services]);

    useEffect(() => {
      loadPendingRequestCount();
    }, [loadPendingRequestCount]);

    useEffect(() => {
      const handleWindowFocus = () => {
        loadPendingRequestCount();
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          loadPendingRequestCount();
        }
      };

      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [loadPendingRequestCount]);

    useEffect(() => {
      const timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadPendingRequestCount();
        }
      }, 30000);

      return () => window.clearInterval(timer);
    }, [loadPendingRequestCount]);

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    items={[
        {
            label: (
                <Badge count={pendingRequestCount} size="small" overflowCount={999}>
                    <span>Request List</span>
                </Badge>
            ),
            key: '1',
            children: <MyRequestListview scope="approval" onDataChanged={loadPendingRequestCount} />,
        },
            ...(access.canSpfApprover ?[
                {
                    label: 'Return List',
                    key: '2',
                    children: <MyRequestsToReturn />,
                }
            ]:[])
    ]}
    />
  </>
  );
}
