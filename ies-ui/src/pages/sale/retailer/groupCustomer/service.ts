import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import type {
  CustomerGroup,
  GroupCustomer,
  GroupCustomerAdvanceSearchParams,
  GroupCustomerStatus,
} from './data';

const GroupCustomerActions = {
  defaultCustomerGroup: (): ServiceApiType<CustomerGroup> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'default-customer-group',
  }),

  groupCustomerSave: (data: GroupCustomer): ServiceApiType<GroupCustomer> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-group-customer',
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

  updateGroupCustomerStatus: (
    param: GroupCustomerStatus,
  ): ServiceApiType<{ param: GroupCustomerStatus }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-status-group-customer',
    payload: { param },
  }),

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'item-group-customer',
    payload: { id },
  }),

  delete: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'delete-pricing-group',
    payload: { id },
  }),
};
export const GroupCustomerServiceAPI = (requestActions: RequestActions) => {
  return {
    fetchDefaultCustomerGroup: () =>
      singleRequest<CustomerGroup>(GroupCustomerActions.defaultCustomerGroup())(
        requestActions,
      ) as Promise<CustomerGroup>,

    detailGroupCustomer: (id: string) =>
      singleRequest<CustomerGroup>(GroupCustomerActions.detail(id))(
        requestActions,
      ) as Promise<CustomerGroup>,

    saveGroupCustomer: (params: GroupCustomer) =>
      singleRequest<{ data: string; message: string }>(
        GroupCustomerActions.groupCustomerSave(params),
      )(requestActions),

    listGroupCustomer: (params: TableViewSearchParams<GroupCustomerAdvanceSearchParams>) =>
      singleRequest<GroupCustomer>(GroupCustomerActions.listGroupCustomer(params))(
        requestActions,
      ) as Promise<Paging<GroupCustomer>>,

    deleteGroup: (id: string) =>
      singleRequest<GroupCustomer>(GroupCustomerActions.delete(id))(requestActions),

    statusGroupCustomer: (param: GroupCustomerStatus) =>
      singleRequest<{ data: string; message: string }>(
        GroupCustomerActions.updateGroupCustomerStatus(param),
      )(requestActions),
    // save: (params: PricingCreate) =>
    //   singleRequest<{ data: string; message: string }>(PricingActions.save(params))(requestActions),
  };
};
