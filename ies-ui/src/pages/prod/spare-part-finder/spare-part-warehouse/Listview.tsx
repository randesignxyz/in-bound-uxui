
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RequestActions } from '@/services/apiGateway';
import { useModel } from '@umijs/max';
import { ProdPaths } from '../..';
// @ts-ignore
import SparePartList from '../spare-part-request/SparePartList';
import RequestsListWarehouse from './RequestsListWarehouse';
import ReturnsListWarehouse from './ReturnsListWarehouse';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { SparePartWarehouseReturnAPI } from './service.return';
import { SparePartWarehouseService } from './service';
import { getUnreadBadgeCount, markBadgeSeen } from '../shared/badgeStorage';

// Count returns with APPROVED or PARTIAL_RETURN status
const countApprovedAndPartialReturns = async (requestAction: RequestActions): Promise<number> => {
  try {
    const api = SparePartWarehouseReturnAPI(requestAction);
    const [approvedResponse, partialResponse] = await Promise.all([
      api.paga_fetch_spare_parts_return_by_status_approved(0, 1, undefined, undefined, 'APPROVED'),
      api.paga_fetch_spare_parts_return_by_status_approved(0, 1, undefined, undefined, 'PARTIAL_RETURN'),
    ]);

    return ((approvedResponse as any)?.total ?? 0) + ((partialResponse as any)?.total ?? 0);
  } catch (error) {
    console.error('Failed to count returns:', error);
    return 0;
  }
};

export default function ListView() {
  const { initialState } = useModel('@@initialState');
  const [returnCount, setReturnCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [returnUnreadCount, setReturnUnreadCount] = useState(0);
  const [pendingRequestUnreadCount, setPendingRequestUnreadCount] = useState(0);
  const [activeKey, setActiveKey] = useState('1');
  const currentUserLogin = initialState?.currentUser?.login;
  const warehouseRequestBadgeKey = 'warehouse:request-list:pending';
  const warehouseReturnBadgeKey = 'warehouse:return-list:approved-partial';

  const requestAction: RequestActions = useMemo(
    () => ({
      start: (name) => console.log(`Loading: ${name}`),
      end: (status) => console.log(status),
    }),
    [],
  );

  const refreshCount = useCallback(() => {
    countApprovedAndPartialReturns(requestAction).then((count) => {
      setReturnCount(count);
      setReturnUnreadCount(getUnreadBadgeCount(warehouseReturnBadgeKey, count, currentUserLogin));
    });
  }, [currentUserLogin, requestAction]);

  const refreshPendingRequestCount = useCallback(async () => {
    try {
      const dashboard = await SparePartWarehouseService(requestAction).getDashboard();
      const currentCount = Number(dashboard.pendingCount || 0);
      setPendingRequestCount(currentCount);
      setPendingRequestUnreadCount(
        getUnreadBadgeCount(warehouseRequestBadgeKey, currentCount, currentUserLogin),
      );
    } catch (error) {
      console.error('Failed to count pending warehouse requests:', error);
      setPendingRequestCount(0);
      setPendingRequestUnreadCount(0);
    }
  }, [currentUserLogin, requestAction]);

  useEffect(() => {
    refreshCount();
    refreshPendingRequestCount();
  }, [activeKey, refreshCount, refreshPendingRequestCount]);

  useEffect(() => {
    const handleWindowFocus = () => refreshPendingRequestCount();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPendingRequestCount();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshPendingRequestCount]);

  useEffect(() => {
    if (activeKey === '2') {
      markBadgeSeen(warehouseRequestBadgeKey, pendingRequestCount, currentUserLogin);
      setPendingRequestUnreadCount(0);
    }
    if (activeKey === '3') {
      markBadgeSeen(warehouseReturnBadgeKey, returnCount, currentUserLogin);
      setReturnUnreadCount(0);
    }
  }, [activeKey, currentUserLogin, pendingRequestCount, returnCount]);

  const routes = [
    {
      path: '/prod',
      label: 'Prod',
    },
    {
      path: ProdPaths.sparePartRequest,
      label: 'Spare Parts',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            label: 'Spare Parts',
            key: '1',
            children: <SparePartList />,
          },
          {
            label: (
              <Badge count={pendingRequestUnreadCount} color="red" offset={[12, 0]} overflowCount={999}>
                <span>Requests List</span>
              </Badge>
            ),
            key: '2',
            children: <RequestsListWarehouse onDataChanged={refreshPendingRequestCount} />,
          },
          {
            label: (
              <Badge count={returnUnreadCount} color="red" offset={[12, 0]}>
                Return List
              </Badge>
            ),
            key: '3',
            children: <ReturnsListWarehouse onUpdate={refreshCount} />,
          },
        ]}
      />
    </>
  );
}
