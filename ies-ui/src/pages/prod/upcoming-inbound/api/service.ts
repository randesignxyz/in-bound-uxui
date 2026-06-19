export * from './dto';
import type { RequestActions } from '@/services/apiGateway';

import { purchaseOrderServiceAPI } from './service/purchase-order';
import { goodsReceiptServiceAPI } from './service/goods-receipt';
import { masterDataServiceAPI } from './service/master-data';
import { dashboardServiceAPI } from './service/dashboard';

const upcomingInboundRequestActions: RequestActions = {
  start: undefined,
  end: undefined,
};

export const UpcomingInboundServiceAPI = (requestAction: RequestActions) => {
  return {
    ...purchaseOrderServiceAPI(requestAction),
    ...goodsReceiptServiceAPI(requestAction),
    ...masterDataServiceAPI(requestAction),
    ...dashboardServiceAPI(requestAction),
  };
};

export const upcomingInboundService = UpcomingInboundServiceAPI(upcomingInboundRequestActions);
