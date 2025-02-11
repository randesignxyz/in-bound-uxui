import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { Page } from '@/services/shared/data';
import {
  IdRemarkParam,
  PurchaseOrderAdvanceSearch,
  PurchaseOrderCreate,
  PurchaseOrderDTO,
  PurchaseOrderDtoCreate,
  PurchaseOrderItem,
} from './data';

const PurchaseOrderAction = {
  save: (data: PurchaseOrderCreate): ServiceApiType<PurchaseOrderCreate> => ({
    actionName: 'save-purchase-order',
    endpoint: 'SALE',
    type: 'EXEC',
    payload: data,
  }),
  detail: (id?: number): ServiceApiType<{ id?: number }> => ({
    actionName: 'detail-purchase-order',
    endpoint: 'SALE',
    type: 'FETCH_QUERY',
    payload: { id },
  }),
  page: (
    params: TableViewSearchParams<PurchaseOrderAdvanceSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    actionName: 'page-purchase-order',
    endpoint: 'SALE',
    type: 'PAGING_QUERY',
    payload: {
      ...params.criteria,
    },
    pagination: {
      page: params.pagination?.current,
      pageSize: params.pagination?.pageSize,
    },
  }),
  rejecting: (param: IdRemarkParam): ServiceApiType<{}> => ({
    actionName: 'reject-po',
    endpoint: 'SALE',
    type: 'EXEC',
    payload: param,
  }),
  finOrderItem: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'find-purchase-order-item',
    endpoint: 'SALE',
    type: 'LIST_QUERY',
    payload: { id },
  }),
};

export const PurchaseOrderServiceAPI = (requestActions: RequestActions) => {
  return {
    save: (data: PurchaseOrderDtoCreate) =>
      singleRequest(PurchaseOrderAction.save(data))(requestActions) as Promise<{
        message: string;
        data: PurchaseOrderCreate;
      }>,
    detail: (id?: number) =>
      singleRequest(PurchaseOrderAction.detail(id))(requestActions) as Promise<PurchaseOrderDTO>,
    page: (params: TableViewSearchParams<PurchaseOrderAdvanceSearch>) =>
      singleRequest(PurchaseOrderAction.page(params))(requestActions) as Promise<
        Page<PurchaseOrderDTO>
      >,
    findOrderItem: (id: number) =>
      singleRequest(PurchaseOrderAction.finOrderItem(id))(requestActions) as Promise<
        PurchaseOrderItem[]
      >,
    rejected: (param: IdRemarkParam) =>
      singleRequest(PurchaseOrderAction.rejecting(param))(requestActions),
  };
};
