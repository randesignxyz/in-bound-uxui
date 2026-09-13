import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProdPaths } from '../..';
import MySparePartList from './MySparePartList';
import MyRequestsToReturn from './MyRequestsToReturn';
import { RequestActions } from '@/services/apiGateway';
import { SparePartReturnAPI } from './service';
import { useModel } from '@umijs/max';
import { getUnreadBadgeCount, markBadgeSeen } from '../shared/badgeStorage';

const countReturnStatuses = async (requestAction: RequestActions): Promise<number> => {
    const statuses = ['PENDING', 'APPROVED', 'PARTIAL_RETURN'];

    const results = await Promise.all(
        statuses.map(async (status) => {
            try {
                const response = await SparePartReturnAPI(requestAction).fetch_batch_spare_parts_return({
                    pagination: {
                        current: 1,
                        pageSize: 1,
                    },
                    criteria: {
                        advanceSearch: {
                            status,
                        },
                    },
                });

                return response.total ?? response.items.length ?? 0;
            } catch (error) {
                console.error(`Failed to count returns for status ${status}:`, error);
                return 0;
            }
        }),
    );

    return results.reduce((total, value) => total + value, 0);
};

export default function ListView() {
        const { initialState } = useModel('@@initialState');
        const [pendingApprovedpartially, setPendingApprovedpartially] = useState(0);
        const [pendingApprovedpartiallyUnreadCount, setPendingApprovedpartiallyUnreadCount] = useState(0);
        const [activeTabKey, setActiveTabKey] = useState('1');
        const currentUserLogin = initialState?.currentUser?.login;
        const requesterReturnBadgeKey = 'requester:return-list:pending-approved-partial';

        const requestAction: RequestActions = useMemo(
            () => ({
                start: (serviceName) => console.log(`Loading: ${serviceName}`),
                end: (status, reason) => console.log(status, reason),
            }),
            [],
        );

        const refreshPendingApprovedpartially = useCallback(async () => {
            const count = await countReturnStatuses(requestAction);
            setPendingApprovedpartially(count);
            setPendingApprovedpartiallyUnreadCount(
                getUnreadBadgeCount(requesterReturnBadgeKey, count, currentUserLogin),
            );
        }, [currentUserLogin, requestAction]);

        useEffect(() => {
            refreshPendingApprovedpartially();
        }, [refreshPendingApprovedpartially]);

        useEffect(() => {
            const handleReturnUpdated = () => {
                refreshPendingApprovedpartially();
            };

            window.addEventListener('spare-part-return-updated', handleReturnUpdated);
            return () => {
                window.removeEventListener('spare-part-return-updated', handleReturnUpdated);
            };
        }, [refreshPendingApprovedpartially]);

        useEffect(() => {
            if (activeTabKey !== '2') return;
            markBadgeSeen(requesterReturnBadgeKey, pendingApprovedpartially, currentUserLogin);
            setPendingApprovedpartiallyUnreadCount(0);
        }, [activeTabKey, currentUserLogin, pendingApprovedpartially]);

        const routes = [
                {
                     path: '/prod',
                     label: 'Prod',
                },
                { 
                     path: ProdPaths.sparePartRequest,
                     label: 'Spare Part Return',
                }
        ]

  return (
  <>
    <BreadCrumbCom separator=">" routes={routes} />
    <Tabs
    activeKey={activeTabKey}
    onChange={setActiveTabKey}
    destroyInactiveTabPane={true}
    items={[
        {
            label: 'My Spare Parts List',
            key: '1',
            children: <MySparePartList />
        },
        {
            label: (
                    <Badge color="red" offset={[12, 0]} count={pendingApprovedpartiallyUnreadCount}>
                        My Return List
                    </Badge>
            ),
            key: '2',
            children: <MyRequestsToReturn onUpdated={refreshPendingApprovedpartially} />,
        },
    ]}
    />
  </>
  );
}
