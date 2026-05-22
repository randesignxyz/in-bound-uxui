import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProdPaths } from '../..';
import MyRequestListview from '../spare-part-request/my-request/MyRequestListview';
import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';
import { useAccess } from '@umijs/max';
import { useModel } from '@umijs/max';
import { RequestActions } from '@/services/apiGateway';
import { SparePartReturnAPI } from '../spare-part-return/service';
import { SparePartRequestService } from '../spare-part-request/service';
import { getUnreadBadgeCount, markBadgeSeen } from '../shared/badgeStorage';
// import MyRequestsToReturn from '../spare-part-return/MyRequestsToReturn';

export default function ListView() {
        const access = useAccess();
        const { initialState } = useModel('@@initialState');
        const [contPendingReturns, setContPendingReturns] = useState(0);
        const [pendingRequestCount, setPendingRequestCount] = useState(0);
        const [pendingRequestUnreadCount, setPendingRequestUnreadCount] = useState(0);
        const [pendingReturnUnreadCount, setPendingReturnUnreadCount] = useState(0);
        const [activeTabKey, setActiveTabKey] = useState('1');
        const currentUserLogin = initialState?.currentUser?.login;
        const approvalRequestBadgeKey = 'approver:request-list:pending';
        const approvalReturnBadgeKey = 'approver:return-list:pending';

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
                setPendingReturnUnreadCount(
                    getUnreadBadgeCount(
                        approvalReturnBadgeKey,
                        result.total ?? result.items.length ?? 0,
                        currentUserLogin,
                    ),
                );
            } catch (error) {
                console.error('Failed to count pending returns:', error);
                setContPendingReturns(0);
                setPendingReturnUnreadCount(0);
            }
        }, [currentUserLogin, requestAction]);

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
      if (!access.canSpfApprover) {
        setPendingRequestCount(0);
        return;
      }

      try {
        const dashboard = await services.getApprovalDashboard();
        const currentCount = Number(dashboard.pendingCount || 0);
        setPendingRequestCount(currentCount);
        setPendingRequestUnreadCount(
          getUnreadBadgeCount(approvalRequestBadgeKey, currentCount, currentUserLogin),
        );
      } catch {
        setPendingRequestCount(0);
        setPendingRequestUnreadCount(0);
      }
    }, [access.canSpfApprover, currentUserLogin, services]);

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

    useEffect(() => {
      if (activeTabKey === '1') {
        markBadgeSeen(approvalRequestBadgeKey, pendingRequestCount, currentUserLogin);
        setPendingRequestUnreadCount(0);
      }
      if (activeTabKey === '2') {
        markBadgeSeen(approvalReturnBadgeKey, contPendingReturns, currentUserLogin);
        setPendingReturnUnreadCount(0);
      }
    }, [activeTabKey, contPendingReturns, currentUserLogin, pendingRequestCount]);

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    activeKey={activeTabKey}
    onChange={setActiveTabKey}
    items={[
        {
            label: (
                <Badge count={pendingRequestUnreadCount} color="red" offset={[12, 0]} overflowCount={999}>
                    <span>Request List</span>
                </Badge>
            ),
            key: '1',
            children: <MyRequestListview scope="approval" onDataChanged={loadPendingRequestCount} />,
        },
            ...(access.canSpfApprover ?[
                {
                label: (
                    <Badge color="red" offset={[12, 0]} count={pendingReturnUnreadCount}>
                        Return List
                    </Badge>
            ),
                    key: '2',
                    children: <MyRequestsToReturn defaultStatus="Pending" onUpdated={refreshPendingReturns} />,
                }
            ]:[])
    ]}
    />
  </>
  );
}
