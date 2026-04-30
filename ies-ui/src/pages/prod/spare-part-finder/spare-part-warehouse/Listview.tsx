
import { Badge, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RequestActions } from '@/services/apiGateway';
import { ProdPaths } from '../..';
// @ts-ignore
import SparePartList from '../spare-part-request/SparePartList';
import RequestsListWarehouse from './RequestsListWarehouse';
import ReturnsListWarehouse from './ReturnsListWarehouse';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { SparePartWarehouseReturnAPI } from './service.return';

// Count returns with APPROVED or PARTIAL_RETURN status
const countApprovedAndPartialReturns = async (requestAction: RequestActions): Promise<number> => {
  try {
    const response = await SparePartWarehouseReturnAPI(requestAction)
      .paga_fetch_spare_parts_return_by_status_approved(1, 1000);

    const items = (response as any)?.items ?? [];
    const count = items.filter(
      (item: any) =>
        item.returnStatus === 'APPROVED' || item.returnStatus === 'PARTIAL_RETURN'
    ).length;

    return count;
  } catch (error) {
    console.error('Failed to count returns:', error);
    return 0;
  }
};

export default function ListView() {
  const [returnCount, setReturnCount] = useState(0);

  const requestAction: RequestActions = useMemo(
    () => ({
      start: (name) => console.log(`Loading: ${name}`),
      end: (status) => console.log(status),
    }),
    [],
  );

  const refreshCount = useCallback(() => {
    countApprovedAndPartialReturns(requestAction).then(setReturnCount);
  }, [requestAction]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

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
        items={[
          {
            label: 'Spare Parts',
            key: '1',
            children: <SparePartList />,
          },
          {
            label: 'Requests List',
            key: '2',
            children: <RequestsListWarehouse />,
          },
          {
            label: (
              <Badge count={returnCount} color="red" offset={[12, 0]}>
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
