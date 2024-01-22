import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { SalesTeamWorkLess } from '@/services/sale/data';

const DSDReportActions = {
  salespersonList: (): ServiceApiType<undefined> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    actionName: 'list-sales-team-work',
    payload: undefined,
  }),
};

export const DSDReportAPI = (requestActions: RequestActions) => {
  return {
    salespersonList: () =>
      singleRequest<SalesTeamWorkLess[]>(DSDReportActions.salespersonList())(
        requestActions,
      ) as Promise<SalesTeamWorkLess[]>,
  };
};
