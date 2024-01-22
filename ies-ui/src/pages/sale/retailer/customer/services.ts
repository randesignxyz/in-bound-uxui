import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { exec, singleRequest } from '@/services/apiGateway';
import { CustomerGroupDetail, GroupCustomerAdvanceSearchParams } from '../groupCustomer/data';
import type {
  CRMDTO,
  CRMSearch,
  CustomerAddressDTO,
  CustomerAdvanceSearchParams,
  CustomerCreate,
  CustomerDto,
} from './data';

const CustomerActions = {
  list: (
    params: TableViewSearchParams<CustomerAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'page-customer',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-customer',
    payload: { id },
  }),

  resetVerificationCustomer: (data: { id: string }): ServiceApiType<{ id: string }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'reset-verification-customer',
    payload: data,
  }),

  updateStatusCustomer: (data: {
    id: string;
    status: string;
  }): ServiceApiType<{ id: string; status: string }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-status-customer',
    payload: data,
  }),

  updateCustomer: (data: CustomerCreate): ServiceApiType<CustomerCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-customer',
    payload: data,
  }),

  changeGroupCustomer: (data: {
    id: string;
    groupId: string;
  }): ServiceApiType<{ id: string; groupId: string }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'change-group-customer',
    payload: data,
  }),

  listGroupCustomer: (
    params: TableViewSearchParams<GroupCustomerAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'list-group-customer',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  listSuggestion: (
    params: TableViewSearchParams<CustomerAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'RETAILER',
    actionName: 'page-suggestion',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detailSuggestion: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-suggestion',
    payload: { id },
  }),

  customerAddressList: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'RETAILER',
    actionName: 'customer-address',
    payload: { id },
  }),

  crmList: (params: CRMSearch): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'CRM',
    actionName: 'search-info-customer',
    payload: { ...params },
    pagination: {
      pageSize: params.pageRequest?.pageSize,
      page: params.pageRequest?.page,
    },
  }),
};

export const CustomerServiceAPI = (requestActions: RequestActions) => {
  return {
    listCustomer: (params: TableViewSearchParams<CustomerAdvanceSearchParams>) =>
      singleRequest<CustomerDto>(CustomerActions.list(params))(requestActions) as Promise<
        Paging<CustomerDto>
      >,
    listGroupCustomer: (params: TableViewSearchParams<GroupCustomerAdvanceSearchParams>) =>
      singleRequest<CustomerGroupDetail>(CustomerActions.listGroupCustomer(params))(
        requestActions,
      ) as Promise<Paging<CustomerGroupDetail>>,

    detailCustomer: (id: string) =>
      singleRequest<CustomerDto>(CustomerActions.detail(id))(
        requestActions,
      ) as Promise<CustomerDto>,

    updateStatusCustomer: (params: { id: string; status: string }) =>
      exec<{ id: string; message: string }>(CustomerActions.updateStatusCustomer(params))(
        requestActions,
      ),

    resetVerificationCustomer: (params: { id: string }) =>
      exec<{ id: string; message: string }>(CustomerActions.resetVerificationCustomer(params))(
        requestActions,
      ),

    customerAddressList: (params: string) =>
      singleRequest<CustomerAddressDTO>(CustomerActions.customerAddressList(params))(
        requestActions,
      ) as Promise<CustomerAddressDTO[]>,

    updateCustomer: (params: CustomerCreate) =>
      exec<{ data: string; message: string }>(CustomerActions.updateCustomer(params))(
        requestActions,
      ),

    changeGroupCustomer: (params: { id: string; groupId: string }) =>
      exec<{ data: string; message: string }>(CustomerActions.changeGroupCustomer(params))(
        requestActions,
      ),

    // singleRequest<{ data: string; message: string }>(CustomerActions.updateCustomer(params))(
    //   requestActions,
    // ),

    crmList: (param: CRMSearch) =>
      singleRequest<CRMDTO>(CustomerActions.crmList(param))(requestActions) as Promise<
        Paging<CRMDTO>
      >,
  };
};
