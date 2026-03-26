import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import {
  RequestActions,
  ServiceApiType,
  singleRequest,
} from "@/services/apiGateway";

import type {
  SparePartPickedRequest,
  SparePartReturnListItem,
  SparePartReturnItemSearch,
} from "./data";

import {
  mapToFlattenedRowsMySparePartList,
} from "./data";

/**
 * =========================
 * ACTION DEFINITIONS
 * =========================
 */
const SparePartReturnAction = {
  page_my_spare_list: (
    params: TableViewSearchParams<SparePartReturnItemSearch>
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: "PAGING_QUERY",
    actionName: "fetch-paging-spare-part-picked-request",
    endpoint: "PROD",
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  display_image: (imageId: string): ServiceApiType<{ imageId: string }> => ({
    type: "EXEC",
    actionName: "file",
    endpoint: "FILE",
    payload: { imageId },
  }),
};

/**
 * =========================
 * API LAYER (REAL API)
 * =========================
 */
const SparePartReturnAPI = (requestAction: RequestActions) => {
  return {
    /**
     * Fetch + map data for table
     */
  page_my_spare_list: async (
    params: TableViewSearchParams<SparePartReturnItemSearch>
  ): Promise<Paging<SparePartReturnListItem>> => {
    const res = (await singleRequest<Paging<SparePartPickedRequest>>(  // ← SparePartPickedRequest
      SparePartReturnAction.page_my_spare_list(params)
    )(requestAction)) as Paging<SparePartPickedRequest>;                // ← SparePartPickedRequest

    return {
      ...res,
      items: mapToFlattenedRowsMySparePartList(res.items || []),
    };
  },
  };
};

export { SparePartReturnAPI };