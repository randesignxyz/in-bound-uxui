import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import {
  fetchDataItemService,
  fetchDataListService,
  RequestActions,
  ServiceApiType,
} from '@/services/apiGateway';

import { singleRequest } from '@/services/apiGateway';
import { LookupDataType } from '@/services/shared/data';
import { RegistrationAdvanceSearchParams, RegistrationForm, StatusSuggestion } from './data';

const RegistrationFormActions = {
  list: (
    params: TableViewSearchParams<RegistrationAdvanceSearchParams>,
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

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-suggestion',
    payload: { id },
  }),

  updateStatusSuggestion: (data: StatusSuggestion): ServiceApiType<StatusSuggestion> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-status-suggestion',
    payload: data,
  }),

  // listCustomerTypes: (data: string): ServiceApiType<any> => ({
  //   type: 'LIST_QUERY',
  //   endpoint: 'CRM',
  //   actionName: 'lookupDataList',
  //   payload: { payload: data },
  // }),

  // save: (data: GroupCustomer): ServiceApiType<GroupCustomer> => ({
  //   type: 'EXEC',
  //   endpoint: 'RETAILER',
  //   actionName: 'save-group-customer',
  //   payload: data,
  // }),
};

export const RegistrationFormAPI = (requestActions: RequestActions) => {
  return {
    listRegistrationForm: (params: TableViewSearchParams<RegistrationAdvanceSearchParams>) =>
      singleRequest<RegistrationForm>(RegistrationFormActions.list(params))(
        requestActions,
      ) as Promise<Paging<RegistrationForm>>,

    // detailRegistration: (id: string) =>
    //   singleRequest<RegistrationForm>(RegistrationFormActions.detail(id))(
    //     requestActions,
    //   ) as Promise<RegistrationForm>,

    detailRegistration: (id: string) =>
      fetchDataItemService<RegistrationForm>({
        actionName: 'detail-suggestion',
        endpoint: 'RETAILER',
        payload: { id: id },
        responseKey: 'registration',
      }),

    updateStatusSuggestion: (param: StatusSuggestion) =>
      singleRequest<{ data: string; message: string }>(
        RegistrationFormActions.updateStatusSuggestion(param),
      )(requestActions),

    // lookupData: () =>
    //   singleRequest<LookupDataType[]>(RegistrationFormActions.listCustomerTypes('CUSTOMER_TYPE'))(
    //     requestActions,
    //   ),

    listLookupData: fetchDataListService<LookupDataType>({
      actionName: 'lookupDataList',
      endpoint: 'CRM',
      responseKey: 'customerTypes',
      payload: { list: ['CUSTOMER_TYPE'] },
    }),

    // const listLookupData = (
    //   typeList: LookupDataType[],
    // ): ServiceApiType<{ list: LookupDataType[] }> => ({
    //   type: 'LIST_QUERY',
    //   endpoint: 'CRM',
    //   actionName: 'lookupDataList',
    //   responseKey: 'list',
    //   payload: {
    //     list: typeList,
    //   },
    // });

    // saveGroupCustomer: (params: GroupCustomer) =>
    //   singleRequest<{ data: string; message: string }>(RegistrationFormActions.save(params))(
    //     requestActions,
    //   ),
  };
};
