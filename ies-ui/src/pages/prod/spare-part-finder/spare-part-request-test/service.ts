// import { Paging } from '@/services/API';
// import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';

// export interface SparePartRequestListSearch {
//   searchValue?: string;
//   tag?: string;
//   status?: string;
//   category?: string;
//   type?: string;
// }

// export interface SparePartRequestListItem {
//   id: number;
//   productId: string;
//   partName: string;
//   description?: string;
//   tag?: string;
//   type: string;
//   category: string;
//   stock: number;
//   status: string;
//   imageId?: string;
//   createdDate?: string;
// }

// type SparePartRequestPageParams = {
//   criteria?: SparePartRequestListSearch;
//   pagination?: {
//     current?: number;
//     pageSize?: number;
//   };
// };

// const SparePartRequestTestAction = {
//   page: (params: SparePartRequestPageParams): ServiceApiType<SparePartRequestListSearch> => ({
//     type: 'PAGING_QUERY',
//     endpoint: 'PROD',
//     actionName: 'get-search-spare-part',
//     payload: {
//       searchValue: params.criteria?.searchValue || '',
//       tag: params.criteria?.tag || '',
//       status: params.criteria?.status || 'All',
//       category: params.criteria?.category || '',
//       type: params.criteria?.type || 'All',
//     },
//     pagination: {
//       page: params.pagination?.current,
//       pageSize: params.pagination?.pageSize,
//     },
//   }),
// };

// export const SparePartRequestTestAPI = (requestAction?: RequestActions) => ({
//   page: async (params: SparePartRequestPageParams): Promise<Paging<SparePartRequestListItem>> =>
//     (await singleRequest<SparePartRequestListItem>(SparePartRequestTestAction.page(params))(
//       requestAction,
//     )) as Paging<SparePartRequestListItem>,
// });
