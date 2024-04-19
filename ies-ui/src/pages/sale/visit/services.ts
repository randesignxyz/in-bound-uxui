// import { TableViewSearchParams } from '@/components/DataCrud/TableView';
// import { Paging } from '@/services/API';
// import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { VisitAvanceSearchParam, VisitDTO } from './data';

const VisitAction = {
  page: (
    params: TableViewSearchParams<VisitAvanceSearchParam>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'SALE',
    actionName: 'page-visit',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  detail: (id?: number): ServiceApiType<{ id?: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'detail-visit',
    payload: { id },
  }),
};

export const VisitServiceAPI = (requestActions: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<VisitAvanceSearchParam>) =>
      singleRequest<VisitDTO>(VisitAction.page(params))(requestActions) as Promise<
        Paging<VisitDTO>
      >,
    detail: (id?: number) =>
      singleRequest<VisitDTO>(VisitAction.detail(id))(requestActions) as Promise<VisitDTO>,
  };
};
