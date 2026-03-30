// import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
// import type { Paging } from '@/services/API';
// import type { RequestActions } from '@/services/apiGateway';
// import { createSparePartRequestApiService } from './service.api';
// import { createSparePartRequestMockService } from './service.mock';
// import type {
//   MyRequestItem,
//   MyRequestSearch,
//   RequestPriority,
//   SparePartRequestItem,
//   SparePartRequestSearch,
// } from './data';

// export interface CreateSparePartRequestPayload {
//   items: { item: SparePartRequestItem; quantity: number; purpose: string }[];
//   remark: string;
//   priority: RequestPriority;
//   dueDate?: string;
// }

// export interface ChangeSparePartRequestStatusPayload {
//   id: number;
//   remark?: string;
// }

// export interface ProvideSparePartRequestPayload {
//   id: number;
//   providedItems: number;
//   remark?: string;
// }

// export interface RequestSparePartExtensionPayload {
//   id: number;
//   extensionDueDate: string;
//   reason: string;
// }

// export interface CreateSparePartReturnPayload {
//   requestPk: number;
//   items: { item: SparePartRequestItem; quantity: number; purpose: string }[];
//   remark: string;
//   priority: RequestPriority;
//   dueDate?: string;
// }

// export interface SparePartRequestServiceContract {
//   page(params: TableViewSearchParams<SparePartRequestSearch>): Promise<Paging<SparePartRequestItem>>;
//   myRequestsPage(params: TableViewSearchParams<MyRequestSearch>): Promise<Paging<MyRequestItem>>;
//   createRequest(payload: CreateSparePartRequestPayload): Promise<MyRequestItem>;
//   createReturn(payload: CreateSparePartReturnPayload): Promise<MyRequestItem>;
//   approveRequest(payload: ChangeSparePartRequestStatusPayload): Promise<MyRequestItem>;
//   rejectRequest(payload: ChangeSparePartRequestStatusPayload): Promise<MyRequestItem>;
//   provideRequest(payload: ProvideSparePartRequestPayload): Promise<MyRequestItem>;
//   limitRequest(payload: ProvideSparePartRequestPayload): Promise<MyRequestItem>;
//   requestExtension(payload: RequestSparePartExtensionPayload): Promise<MyRequestItem>;
//   approveExtension(payload: ChangeSparePartRequestStatusPayload): Promise<MyRequestItem>;
//   rejectExtension(payload: ChangeSparePartRequestStatusPayload): Promise<MyRequestItem>;
// }

// export const SparePartRequestServiceAPI = (requestAction: RequestActions): SparePartRequestServiceContract => {
//   const api = createSparePartRequestApiService(requestAction);
//   const mock = createSparePartRequestMockService();

//   const withFallback = async <T>(fn: () => Promise<T>, fallback: () => Promise<T>, label: string): Promise<T> => {
//     try {
//       return await fn();
//     } catch (err) {
//       // Fallback mode for local/dev resilience.
//       console.warn(`[SPF] ${label} failed. Falling back to mock data.`, err);
//       return fallback();
//     }
//   };

//   return {
//     ...api,
//     page: (params) => withFallback(() => api.page(params), () => mock.page(params), 'page'),
//     myRequestsPage: (params) =>
//       withFallback(() => api.myRequestsPage(params), () => mock.myRequestsPage(params), 'myRequestsPage'),
//     createRequest: (payload) =>
//       withFallback(() => api.createRequest(payload), () => mock.createRequest(payload), 'createRequest'),
//     createReturn: (payload) =>
//       withFallback(() => api.createReturn(payload), () => mock.createReturn(payload), 'createReturn'),
//     approveRequest: (payload) =>
//       withFallback(() => api.approveRequest(payload), () => mock.approveRequest(payload), 'approveRequest'),
//     rejectRequest: (payload) =>
//       withFallback(() => api.rejectRequest(payload), () => mock.rejectRequest(payload), 'rejectRequest'),
//     provideRequest: (payload) =>
//       withFallback(() => api.provideRequest(payload), () => mock.provideRequest(payload), 'provideRequest'),
//     limitRequest: (payload) =>
//       withFallback(() => api.limitRequest(payload), () => mock.limitRequest(payload), 'limitRequest'),
//     requestExtension: (payload) =>
//       withFallback(() => api.requestExtension(payload), () => mock.requestExtension(payload), 'requestExtension'),
//     approveExtension: (payload) =>
//       withFallback(() => api.approveExtension(payload), () => mock.approveExtension(payload), 'approveExtension'),
//     rejectExtension: (payload) =>
//       withFallback(() => api.rejectExtension(payload), () => mock.rejectExtension(payload), 'rejectExtension'),
//   };
// };

// export type SparePartRequestServiceReturn = ReturnType<typeof SparePartRequestServiceAPI>;
