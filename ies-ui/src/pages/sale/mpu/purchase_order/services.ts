import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { Page } from '@/services/shared/data';
import moment from 'moment';
import { IdRemarkParam, PurchaseOrderDTO, PurchaseOrderDtoCreate, PurchaseOrderItem } from './data';

const PurchaseOrderAction = {
  save: (data: PurchaseOrderDtoCreate): ServiceApiType<PurchaseOrderDtoCreate> => ({
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
    param: TableViewSearchParams<AdvanceSearchParam>,
  ): ServiceApiType<{
    searchValue?: string;
    advanceSearch: { status?: string; salespersonId?: string; orderedDate?: moment.Moment[] };
  }> => ({
    actionName: 'page-purchase-order',
    endpoint: 'SALE',
    type: 'PAGING_QUERY',
    payload: {
      ...param.criteria,
      advanceSearch: {
        status: param.criteria?.advanceSearch?.status,
        salespersonId: param.criteria?.advanceSearch?.salespersonId,
        orderedDate: param.criteria?.advanceSearch?.dates && [
          moment(param.criteria.advanceSearch.dates[0]),
          moment(param.criteria.advanceSearch.dates[1]),
        ],
      },
    },
    pagination: {
      page: param.pagination?.current,
      pageSize: param.pagination?.pageSize,
    },
  }),
  rejecting: (param: IdRemarkParam): ServiceApiType<IdRemarkParam> => ({
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
        data: PurchaseOrderDtoCreate;
      }>,
    detail: (id?: number) =>
      singleRequest(PurchaseOrderAction.detail(id))(requestActions) as Promise<PurchaseOrderDTO>,
    page: (params: TableViewSearchParams<AdvanceSearchParam>) =>
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
