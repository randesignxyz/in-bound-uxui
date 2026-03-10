import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';
import type { MyRequestItem, MyRequestSearch, MyReceivedItem, MyReceivedSearch, SparePartRequestItem, SparePartRequestSearch } from './data';
import type {
  ChangeSparePartRequestStatusPayload,
  CreateSparePartRequestPayload,
  CreateSparePartReturnPayload,
  ProvideSparePartRequestPayload,
  RequestSparePartExtensionPayload,
  SparePartRequestServiceContract,
} from './service';

const SparePartRequestAction = {
  page: (params: TableViewSearchParams<SparePartRequestSearch>): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-spare-part-request',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  myRequestsPage: (params: TableViewSearchParams<MyRequestSearch>): ServiceApiType<MyRequestSearch> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-my-spare-part-request',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  myReceivedPage: (params: TableViewSearchParams<MyReceivedSearch>): ServiceApiType<MyReceivedSearch> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-my-received-spare-part',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  createRequest: (payload: CreateSparePartRequestPayload): ServiceApiType<CreateSparePartRequestPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'create-spare-part-request',
    payload,
  }),
  createReturn: (payload: CreateSparePartReturnPayload): ServiceApiType<CreateSparePartReturnPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'create-spare-part-return',
    payload,
  }),
  approveRequest: (
    payload: ChangeSparePartRequestStatusPayload,
  ): ServiceApiType<ChangeSparePartRequestStatusPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'approve-spare-part-request',
    payload,
  }),
  rejectRequest: (
    payload: ChangeSparePartRequestStatusPayload,
  ): ServiceApiType<ChangeSparePartRequestStatusPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'reject-spare-part-request',
    payload,
  }),
  provideRequest: (
    payload: ProvideSparePartRequestPayload,
  ): ServiceApiType<ProvideSparePartRequestPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'provide-spare-part-request',
    payload,
  }),
  limitRequest: (
    payload: ProvideSparePartRequestPayload,
  ): ServiceApiType<ProvideSparePartRequestPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'limit-spare-part-request',
    payload,
  }),
  requestExtension: (
    payload: RequestSparePartExtensionPayload,
  ): ServiceApiType<RequestSparePartExtensionPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'request-spare-part-extension',
    payload,
  }),
  approveExtension: (
    payload: ChangeSparePartRequestStatusPayload,
  ): ServiceApiType<ChangeSparePartRequestStatusPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'approve-spare-part-extension',
    payload,
  }),
  rejectExtension: (
    payload: ChangeSparePartRequestStatusPayload,
  ): ServiceApiType<ChangeSparePartRequestStatusPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'reject-spare-part-extension',
    payload,
  }),
};

export const createSparePartRequestApiService = (
  requestAction: RequestActions,
): SparePartRequestServiceContract => ({
  page: async (params: TableViewSearchParams<SparePartRequestSearch>) =>
    (await singleRequest<SparePartRequestItem>(SparePartRequestAction.page(params))(
      requestAction,
    )) as Paging<SparePartRequestItem>,

  myRequestsPage: async (params: TableViewSearchParams<MyRequestSearch>) =>
    (await singleRequest<MyRequestItem>(SparePartRequestAction.myRequestsPage(params))(
      requestAction,
    )) as Paging<MyRequestItem>,

  myReceivedPage: async (params: TableViewSearchParams<MyReceivedSearch>) =>
    (await singleRequest<MyReceivedItem>(SparePartRequestAction.myReceivedPage(params))(
      requestAction,
    )) as Paging<MyReceivedItem>,

  createRequest: async (payload: CreateSparePartRequestPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.createRequest(payload))(
      requestAction,
    )) as any;
    // Backend exec APIs may return either payload directly or wrapped in { data, message }.
    return (rs?.data ?? rs) as MyRequestItem;
  },
  createReturn: async (payload: CreateSparePartReturnPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.createReturn(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  approveRequest: async (payload: ChangeSparePartRequestStatusPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.approveRequest(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  rejectRequest: async (payload: ChangeSparePartRequestStatusPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.rejectRequest(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  provideRequest: async (payload: ProvideSparePartRequestPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.provideRequest(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  limitRequest: async (payload: ProvideSparePartRequestPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.limitRequest(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  requestExtension: async (payload: RequestSparePartExtensionPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.requestExtension(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  approveExtension: async (payload: ChangeSparePartRequestStatusPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.approveExtension(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
  rejectExtension: async (payload: ChangeSparePartRequestStatusPayload) => {
    const rs = (await singleRequest<any>(SparePartRequestAction.rejectExtension(payload))(
      requestAction,
    )) as any;
    return (rs?.data ?? rs) as MyRequestItem;
  },
});
