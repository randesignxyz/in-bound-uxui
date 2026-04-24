// import { TableViewSearchParams } from '@/components/DataCrud/TableView';
// import { Paging } from '@/services/API';
// import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
// import { TestSearch, Testing, TestingCreate, TestingVoid } from './data';

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import {
  GetReceive,
  ReceiveStatusChange,
  ReceivedItem,
  SAPCloseDoc,
  Transfer,
  TransferCreate,
  TransferSearch,
  getItemforCloseParams,
  updateProvidedParams,
} from './data';
import { ProvidedItem } from '../request/data';
import { ENABLE_FRONTEND_IIO_STATIC_MOCK } from '../mockConfig';
import { transferMockApi } from '../mockSeedData';

// const TestingAction={
//     pageTesting:(
//         params: TableViewSearchParams<TestSearch>,
//     ): ServiceApiType<{searchValue?:string}> =>({
//         type:'PAGING_QUERY',
//         endpoint:'PROD',
//         actionName:'paging-testing',
//         payload:{...params.criteria},
//         pagination:{
//             pageSize:params.pagination?.pageSize,
//             page:params.pagination?.current
//         }
//     }),

//     save: (data: TestingCreate): ServiceApiType<TestingCreate> => ({
//         actionName:'save-testing',
//         endpoint:'PROD',
//         type:"EXEC",
//         payload: data
//     }),

//     detail:(id:string): ServiceApiType<{id: string}> =>({
//         actionName:"detail-testing",
//         endpoint:"PROD",
//         type:"FETCH_QUERY",
//         payload:{id}
//     }),

//     void:(data:TestingVoid):ServiceApiType<TestingVoid> => ({
//         actionName: "void-testing",
//         endpoint: "PROD",
//         type: "EXEC",
//         payload: data
//     })
// }

// export const TestingServiceAPI = (requestActions: RequestActions) =>{
//     return{
//         pageTesting:(params:TableViewSearchParams<TestSearch>) => singleRequest<Testing>(TestingAction.pageTesting(params)) (requestActions) as Promise<Paging<Testing>>,
//         save: (data: TestingCreate) => singleRequest<{data: string, message: string}>(TestingAction.save(data))(requestActions),
//         detail:(id:string) => singleRequest<Testing>(TestingAction.detail(id))(requestActions) as Promise<Testing>,
//         void: (data: TestingVoid) => singleRequest<{data:string,message:string}> (TestingAction.void(data))(requestActions),

//     }
// }

const TransferAction = {
  page: (
    params: TableViewSearchParams<TransferSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'iio-fetch-paging-transfer',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  pageFinal: (
    params: TableViewSearchParams<TransferSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'iio-fetch-paging-transfer-final',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  pageFG: (
    params: TableViewSearchParams<TransferSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'iio-fetch-paging-transfer-fg',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detail: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'iio-detail-transfer',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),

  receive: (data: ReceivedItem): ServiceApiType<ReceivedItem> => ({
    actionName: 'iio-received-item',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  receive_change: (data: ReceiveStatusChange): ServiceApiType<ReceiveStatusChange> => ({
    actionName: 'iio-receive-status-change',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  save: (data: TransferCreate): ServiceApiType<TransferCreate> => ({
    actionName: 'iio-save-transfer',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  detail_list: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'iio-detail-transfer-list',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),

  get_receive: (data: GetReceive): ServiceApiType<GetReceive> => ({
    actionName: 'iio-get-receive',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data,
  }),
  close_request: (data: SAPCloseDoc): ServiceApiType<SAPCloseDoc> => ({
    actionName: 'iio-close-sap-transfer',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
  update_provided_status: (data: updateProvidedParams): ServiceApiType<updateProvidedParams> => ({
    actionName: 'iio-update-provide-status',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
  get_item_for_close: (data: getItemforCloseParams): ServiceApiType<getItemforCloseParams> => ({
    actionName: 'iio-get-provide-item-for-close',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data,
  }),
  detail_sap: (docEntry: number): ServiceApiType<{ docEntry: number }> => ({
    actionName: 'iio-detail-sap-transfer',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { docEntry },
  }),
  list_transfer: (docEntity: number): ServiceApiType<{ docEntity: number }> => ({
    actionName: 'iio-list-transfer',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { docEntity },
  }),
};

export const TransferServiceAPI = (requestAction: RequestActions) => {
  const useStaticMock = ENABLE_FRONTEND_IIO_STATIC_MOCK;

  return {
    page: (params: TableViewSearchParams<TransferSearch>) =>
      useStaticMock
        ? transferMockApi.page(params)
        :
      singleRequest<Transfer>(TransferAction.page(params))(requestAction) as Promise<
        Paging<Transfer>
      >,
    pageFianl: (params: TableViewSearchParams<TransferSearch>) =>
      useStaticMock
        ? transferMockApi.pageFinal(params)
        :
      singleRequest<Transfer>(TransferAction.pageFinal(params))(requestAction) as Promise<
        Paging<Transfer>
      >,
    pageFG: (params: TableViewSearchParams<TransferSearch>) =>
      useStaticMock
        ? transferMockApi.pageFG(params)
        :
      singleRequest<Transfer>(TransferAction.pageFG(params))(requestAction) as Promise<
        Paging<Transfer>
      >,
    detail: (id: number) =>
      useStaticMock
        ? transferMockApi.detail(id)
        :
      singleRequest<Transfer>(TransferAction.detail(id))(requestAction) as Promise<Transfer>,
    receive: (data: ReceivedItem) =>
      useStaticMock
        ? transferMockApi.receive()
        :
      singleRequest<{ data: string; message: string }>(TransferAction.receive(data))(requestAction),
    receive_change: (data: ReceiveStatusChange) =>
      useStaticMock
        ? transferMockApi.receiveChange(data)
        :
      singleRequest<{ data: string; message: string }>(TransferAction.receive_change(data))(
        requestAction,
      ),
    save: (data: TransferCreate) =>
      useStaticMock
        ? transferMockApi.save(data)
        :
      singleRequest<{ data: string; message: string }>(TransferAction.save(data))(requestAction),
    detail_list: (id: number) =>
      useStaticMock
        ? transferMockApi.detailList(id)
        :
      singleRequest<Transfer>(TransferAction.detail_list(id))(requestAction) as Promise<Transfer>,
    get_receive: (data: GetReceive) =>
      useStaticMock
        ? transferMockApi.getReceive(data)
        :
      singleRequest<{ data: string; message: string }>(TransferAction.get_receive(data))(
        requestAction,
      ),
    close_request: (data: SAPCloseDoc) =>
      useStaticMock
        ? transferMockApi.closeRequest(data)
        :
      singleRequest<{ data: string; message: string }>(TransferAction.close_request(data))(
        requestAction,
      ),

    update_provided_status: (data: updateProvidedParams) =>
      useStaticMock
        ? transferMockApi.updateProvidedStatus(data)
        :
      singleRequest<{ data: string; message: string }>(TransferAction.update_provided_status(data))(
        requestAction,
      ),
    get_item_for_close: (data: getItemforCloseParams) =>
      useStaticMock
        ? transferMockApi.getItemForClose(data)
        :
      singleRequest<ProvidedItem>(TransferAction.get_item_for_close(data))(
        requestAction,
      ) as Promise<ProvidedItem[]>,
    detail_sap: (docEntry: number) =>
      useStaticMock
        ? transferMockApi.detailSap(docEntry)
        :
      singleRequest<Transfer>(TransferAction.detail_sap(docEntry))(requestAction) as Promise<Transfer>,
    list_transfer: (docEntity: number) =>
      useStaticMock
        ? transferMockApi.listTransfer(docEntity)
        :
      singleRequest<Transfer>(TransferAction.list_transfer(docEntity))(requestAction) as Promise<Transfer>,

  };
};
