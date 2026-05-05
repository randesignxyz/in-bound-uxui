import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProdPaths } from '../..';
import MyRequestListview from '../spare-part-request/my-request/MyRequestListview';
import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';
import { useAccess } from '@umijs/max';
import { RequestActions } from '@/services/apiGateway';
import { SparePartReturnAPI } from '../spare-part-return/service';
import { SparePartRequestService } from '../spare-part-request/service';
// import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';

export default function ListView() {
        const access = useAccess();
        const [contPendingReturns, setContPendingReturns] = useState(0);
        const [pendingRequestCount, setPendingRequestCount] = useState(0);

        const requestAction: RequestActions = useMemo(
            () => ({
                start: (serviceName) => console.log(`Loading: ${serviceName}`),
                end: (status, reason) => console.log(status, reason),
            }),
            [],
        );

        const services = useMemo(() => SparePartRequestService(requestAction), [requestAction]);

        const refreshPendingReturns = useCallback(async () => {
            try {
                const result = await SparePartReturnAPI(requestAction).fetch_batch_spare_parts_return({
                    pagination: {
                        current: 1,
                        pageSize: 1,
                    },
                    criteria: {
                        advanceSearch: {
                            status: 'PENDING',
                        },
                    },
                });

                setContPendingReturns(result.total ?? result.items.length ?? 0);
            } catch (error) {
                console.error('Failed to count pending returns:', error);
                setContPendingReturns(0);
            }
        }, [requestAction]);

        useEffect(() => {
            refreshPendingReturns();
        }, [refreshPendingReturns]);

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
        const dashboard = await services.getApprovalDashboard();
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
            children: <MyRequestListview />,
        },
            ...(access.canSpfApprover ?[
                {
                label: (
                    <Badge color="red" offset={[12, 0]} count={contPendingReturns}>
                        Return List
                    </Badge>
            ),
                    key: '2',
                    children: <MyRequestsToReturn onUpdated={refreshPendingReturns} />,
                }
            ]:[])
    ]}
    />
  </>
  );
}
