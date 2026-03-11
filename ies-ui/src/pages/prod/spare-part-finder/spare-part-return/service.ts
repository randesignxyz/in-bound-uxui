import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { Paging } from "@/services/API"
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway"
import type {
  MyRequestToReturnItem,
  SparePartReturnItem,
  SparePartReturnItemSearch,
  SparePartReturnListItem,
} from "./data"
import { MOCK_MY_REQUESTS_TO_RETURN, MOCK_SPARE_PART_RETURN_LIST } from "./data"

const SparePartReturnAction = {
   page_my_spare_list: (
    params: TableViewSearchParams<SparePartReturnItemSearch>,
   ):ServiceApiType<{searchValue?: string,  }> =>({
    type:'PAGING_QUERY',
    actionName:'spare-parts-return-search',
    endpoint: 'PROD',
    payload: { ...params.criteria },
    pagination: { 
    pageSize: params.pagination?.pageSize,
    page: params.pagination?.current
},
}),
 display_image: (imageId: string): ServiceApiType<{imageId: string}> => ({
  type: 'EXEC',
  actionName: 'file', // so endpoint should be /services/files/api/files/{imageId}
  endpoint: 'FILE',
  payload: { imageId },
}),
}

const SparePartReturnAPI = (requestAction: RequestActions) =>{
 return {
    page_my_spare_list: (params: TableViewSearchParams<SparePartReturnItemSearch>) => 
    singleRequest<SparePartReturnItem>(SparePartReturnAction.page_my_spare_list(params))(requestAction) as Promise<
    Paging<SparePartReturnItem>
 >
 }
}

/** Pagination params for mock/list requests */
export interface SparePartReturnMockPagination {
  current?: number
  pageSize?: number
}

/**
 * Mock list: returns paginated spare part return list from data.ts.
 * Use this instead of the real endpoint when working with mock data.
 */
export function getSparePartReturnMockPage(
  pagination?: SparePartReturnMockPagination,
): Promise<Paging<SparePartReturnListItem>> {
  const current = pagination?.current ?? 1
  const pageSize = pagination?.pageSize ?? 10
  const start = (current - 1) * pageSize
  const items = MOCK_SPARE_PART_RETURN_LIST.slice(start, start + pageSize)
  return Promise.resolve({
    items,
    total: MOCK_SPARE_PART_RETURN_LIST.length,
    pageSize,
  })
}

/**
 * Mock list: returns paginated "My Requests to Return" from data.ts.
 */
export function getMyRequestsToReturnMockPage(
  pagination?: SparePartReturnMockPagination,
): Promise<Paging<MyRequestToReturnItem>> {
  const current = pagination?.current ?? 1
  const pageSize = pagination?.pageSize ?? 10
  const start = (current - 1) * pageSize
  const items = MOCK_MY_REQUESTS_TO_RETURN.slice(start, start + pageSize)
  return Promise.resolve({
    items,
    total: MOCK_MY_REQUESTS_TO_RETURN.length,
    pageSize,
  })
}

export { SparePartReturnAPI }