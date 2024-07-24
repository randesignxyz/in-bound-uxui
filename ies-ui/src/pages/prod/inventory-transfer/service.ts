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
    actionName: 'fetch-paging-transfer',
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
    actionName: 'fetch-paging-transfer-fg',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detail: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'detail-transfer',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),

  receive: (data: ReceivedItem): ServiceApiType<ReceivedItem> => ({
    actionName: 'received-item',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  receive_change: (data: ReceiveStatusChange): ServiceApiType<ReceiveStatusChange> => ({
    actionName: 'receive-status-change',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  save: (data: TransferCreate): ServiceApiType<TransferCreate> => ({
    actionName: 'save-transfer',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),

  detail_list: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'detail-transfer-list',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { id },
  }),

  get_receive: (data: GetReceive): ServiceApiType<GetReceive> => ({
    actionName: 'get-receive',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data,
  }),
  close_request: (data: SAPCloseDoc): ServiceApiType<SAPCloseDoc> => ({
    actionName: 'close-sap-transfer',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
  update_provided_status: (data: updateProvidedParams): ServiceApiType<updateProvidedParams> => ({
    actionName: 'update-provide-status',
    endpoint: 'PROD',
    type: 'EXEC',
    payload: data,
  }),
  get_item_for_close: (data: getItemforCloseParams): ServiceApiType<getItemforCloseParams> => ({
    actionName: 'get-provide-item-for-close',
    endpoint: 'PROD',
    type: 'LIST_QUERY',
    payload: data,
  }),
  detail_sap: (docEntry: number): ServiceApiType<{ docEntry: number }> => ({
    actionName: 'detail-sap-transfer',
    endpoint: 'PROD',
    type: 'FETCH_QUERY',
    payload: { docEntry },
  }),
};

export const TransferServiceAPI = (requestAction: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<TransferSearch>) =>
      singleRequest<Transfer>(TransferAction.page(params))(requestAction) as Promise<
        Paging<Transfer>
      >,
    pageFG: (params: TableViewSearchParams<TransferSearch>) =>
      singleRequest<Transfer>(TransferAction.pageFG(params))(requestAction) as Promise<
        Paging<Transfer>
      >,
    detail: (id: number) =>
      singleRequest<Transfer>(TransferAction.detail(id))(requestAction) as Promise<Transfer>,
    receive: (data: ReceivedItem) =>
      singleRequest<{ data: string; message: string }>(TransferAction.receive(data))(requestAction),
    receive_change: (data: ReceiveStatusChange) =>
      singleRequest<{ data: string; message: string }>(TransferAction.receive_change(data))(
        requestAction,
      ),
    save: (data: TransferCreate) =>
      singleRequest<{ data: string; message: string }>(TransferAction.save(data))(requestAction),
    detail_list: (id: number) =>
      singleRequest<Transfer>(TransferAction.detail_list(id))(requestAction) as Promise<Transfer>,
    get_receive: (data: GetReceive) =>
      singleRequest<{ data: string; message: string }>(TransferAction.get_receive(data))(
        requestAction,
      ),
    close_request: (data: SAPCloseDoc) =>
      singleRequest<{ data: string; message: string }>(TransferAction.close_request(data))(
        requestAction,
      ),

    update_provided_status: (data: updateProvidedParams) =>
      singleRequest<{ data: string; message: string }>(TransferAction.update_provided_status(data))(
        requestAction,
      ),
    get_item_for_close: (data: getItemforCloseParams) =>
      singleRequest<{ data: string; message: string }>(TransferAction.get_item_for_close(data))(
        requestAction,
      ),
    detail_sap: (docEntry: number) =>
      singleRequest<Transfer>(TransferAction.detail_sap(docEntry))(requestAction) as Promise<Transfer>,

  };
};
