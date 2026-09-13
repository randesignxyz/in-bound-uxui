import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RequestActions } from '@/services/apiGateway';
import { ProdPaths } from '../..';
// @ts-ignore JSX component without local declaration file
import SparePartList from './SparePartList';
import type { RequestDetailData } from './RequestedBatchDrawer';
import { SparePartRequestService } from './service';
import MyRequestListview from './my-request/MyRequestListview';
import { getUnreadBadgeCount, markBadgeSeen } from '../shared/badgeStorage';
import { useModel } from '@umijs/max';

export default function ListView() {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [resubmitDraft, setResubmitDraft] = useState<RequestDetailData | null>(null);
  const [readyToPickupCount, setReadyToPickupCount] = useState(0);
  const [readyToPickupUnreadCount, setReadyToPickupUnreadCount] = useState(0);
  const requestActions: RequestActions = useMemo(
    () => ({
      start: (serviceName) => console.log(`Loading: ${serviceName}`),
      end: (status, reason) => console.log(status, reason),
    }),
    [],
  );
  const services = useMemo(() => SparePartRequestService(requestActions), [requestActions]);
  const currentUserLogin = initialState?.currentUser?.login;
  const readyBadgeKey = 'requester:my-requests:ready-to-pickup';

  const loadReadyToPickupCount = useCallback(async () => {
    if (!access.canSpfRequester && !access.canSpfApprover) {
      setReadyToPickupCount(0);
      setReadyToPickupUnreadCount(0);
      return;
    }

    try {
      const pageSize = 10;
      let currentPage = 1;
      let total = 0;
      let readyCount = 0;

      do {
        const response = await services.pageMyRequests(
          {
            criteria: {
              advanceSearch: {},
            },
            pagination: {
              current: currentPage,
              pageSize,
            },
          },
          'my',
        );

        const items = response.items || [];
        total = Number(response.total || 0);
        readyCount += items.filter((item) => item.requestStatus === 'ready_to_Pickup').length;
        currentPage += 1;

        if (items.length === 0) break;
      } while ((currentPage - 1) * pageSize < total);

      setReadyToPickupCount(readyCount);
      setReadyToPickupUnreadCount(getUnreadBadgeCount(readyBadgeKey, readyCount, currentUserLogin));
    } catch {
      setReadyToPickupCount(0);
      setReadyToPickupUnreadCount(0);
    }
  }, [access.canSpfApprover, access.canSpfRequester, currentUserLogin, services]);

  useEffect(() => {
    loadReadyToPickupCount();
  }, [loadReadyToPickupCount]);

  /*
  useEffect(() => {
    const handleWindowFocus = () => loadReadyToPickupCount();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadReadyToPickupCount();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadReadyToPickupCount]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadReadyToPickupCount();
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [loadReadyToPickupCount]);
  */

  useEffect(() => {
    if (activeTabKey !== '2') return;
    markBadgeSeen(readyBadgeKey, readyToPickupCount, currentUserLogin);
    setReadyToPickupUnreadCount(0);
  }, [activeTabKey, currentUserLogin, readyToPickupCount]);

  const routes = [
    {
      path: '/prod',
      label: 'Prod',
    },
    {
      path: ProdPaths.sparePartRequest,
      label: 'Spare Part Request',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={[
          {
            label: 'Spare Parts List',
            key: '1',
            children: (
              <SparePartList
                resubmitDraft={resubmitDraft}
                onResubmitDraftHandled={() => setResubmitDraft(null)}
              />
            ),
          },
          {
            label: (
              <Badge count={readyToPickupUnreadCount} color="red" offset={[12, 0]} overflowCount={999}>
                <span>My Requests</span>
              </Badge>
            ),
            key: '2',
            children: (
              <MyRequestListview
                isActive={activeTabKey === '2'}
                onDataChanged={loadReadyToPickupCount}
                onResubmitRequest={(detail) => {
                  setResubmitDraft(detail);
                  setActiveTabKey('1');
                }}
              />
            ),
          },
        ]}
      />

    </>
  );
}
