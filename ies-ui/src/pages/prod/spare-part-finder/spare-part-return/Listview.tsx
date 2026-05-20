import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProdPaths } from '../..';
import MySparePartList from './MySparePartList';
import MyRequestsToReturn from './MyRequestsToReturn';
import { RequestActions } from '@/services/apiGateway';
import { SparePartReturnAPI } from './service';

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
        const [pendingApprovedpartially, setPendingApprovedpartially] = useState(0);

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
        }, [requestAction]);

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
    destroyInactiveTabPane={true}
    items={[
        {
            label: 'My Spare Parts List',
            key: '1',
            children: <MySparePartList />
        },
        {
            label: (
                    <Badge color="red" offset={[12, 0]} count={pendingApprovedpartially}>
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