import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { Page } from '@/services/shared/data';
import moment from 'moment';
import { PurchaseOrderDistributorDto, SettlementMethodDetailDTO, StatusActionForm } from './data';

const SettlementMethodAction = {
  confirm: (param: StatusActionForm): ServiceApiType<StatusActionForm> => ({
    actionName: 'confirm_settlement_method',
    endpoint: 'SALE',
    type: 'EXEC',
    payload: param,
  }),
  reject: (param: StatusActionForm): ServiceApiType<StatusActionForm> => ({
    actionName: 'reject_settlement_method',
    endpoint: 'SALE',
    type: 'EXEC',
    payload: param,
  }),
  detail: (id?: number): ServiceApiType<{ id?: number }> => ({
    actionName: 'detail_settlement_method',
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
    actionName: 'page_settlement_method',
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

  changeDistributor: (
    data: PurchaseOrderDistributorDto,
  ): ServiceApiType<PurchaseOrderDistributorDto> => ({
    actionName: 'change-purchase-order-distributor',
    endpoint: 'SALE',
    type: 'EXEC',
    payload: data,
  }),
};

export const SettlementMethodServicAPI = (requestActions: RequestActions) => {
  return {
    confirm: (param: StatusActionForm) =>
      singleRequest(SettlementMethodAction.confirm(param))(requestActions),
    reject: (param: StatusActionForm) =>
      singleRequest(SettlementMethodAction.reject(param))(requestActions),
    detail: (id?: number) =>
      singleRequest(SettlementMethodAction.detail(id))(
        requestActions,
      ) as Promise<SettlementMethodDetailDTO>,
    page: (param: TableViewSearchParams<AdvanceSearchParam>) =>
      singleRequest(SettlementMethodAction.page(param))(requestActions) as Promise<
        Page<SettlementMethodDetailDTO>
      >,
    changeDistributor: (data: PurchaseOrderDistributorDto) =>
      singleRequest(SettlementMethodAction.changeDistributor(data))(requestActions) as Promise<{
        message: string;
        data: PurchaseOrderDistributorDto;
      }>,
  };
};
