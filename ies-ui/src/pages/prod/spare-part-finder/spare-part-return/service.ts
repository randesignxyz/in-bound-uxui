import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import {
  RequestActions,
  ServiceApiType,
  singleRequest,
} from "@/services/apiGateway";

import type {
  MyRequestToReturnItem,
  SparePartPickedRequest,
  SparePartReturnBatchResponseItem,
  SparePartReturnAdvanceSearch,
  SparePartReturnListItem,
  TableViewSearchReturnsParam,
} from "./data";

import {
  mapToFlattenedRowsMySparePartList,
  mapToMyRequestToReturn,
} from "./data";

const SparePartReturnAction = {
  page_my_spare_list: (
    params: TableViewSearchParams<SparePartReturnAdvanceSearch>
  ): ServiceApiType<{
    searchValue?: string;
    advanceSearch?: SparePartReturnAdvanceSearch;
  }> => ({
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

  submit_Return_Request: (payload: any): ServiceApiType<any> => ({
    type: "EXEC",
    actionName: "return-spare-part-request",
    endpoint: "PROD",
    payload,
  }),
  fetch_batch_spare_parts_return: (
    params: TableViewSearchParams<TableViewSearchReturnsParam>
  ): ServiceApiType<any> => ({
    type: "PAGING_QUERY",
    actionName: "fetch-batch-spare-parts-return",
    endpoint: "PROD",
    payload: {
      searchValue: params.criteria?.searchValue ?? "",
      status: params.criteria?.advanceSearch?.status ?? "",
      approvedDateFrom:
        params.criteria?.advanceSearch?.approvedDateFrom ?? undefined,
      approvedDateTo:
        params.criteria?.advanceSearch?.approvedDateTo ?? undefined,
      rejectedDateFrom:
        params.criteria?.advanceSearch?.rejectedDateFrom ?? undefined,
      rejectedDateTo:
        params.criteria?.advanceSearch?.rejectedDateTo ?? undefined,
      returnDateFrom:
        params.criteria?.advanceSearch?.returnDateFrom ?? undefined,
      returnDateTo:
        params.criteria?.advanceSearch?.returnDateTo ?? undefined,
    },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
};

const SparePartReturnAPI = (requestAction: RequestActions) => {
  return {
    page_my_spare_list: async (
      params: TableViewSearchParams<SparePartReturnAdvanceSearch>
    ): Promise<Paging<SparePartReturnListItem>> => {
      const res = (await singleRequest<Paging<SparePartPickedRequest>>(
        SparePartReturnAction.page_my_spare_list(params)
      )(requestAction)) as Paging<SparePartPickedRequest>;

      return {
        ...res,
        items: mapToFlattenedRowsMySparePartList(res.items || []),
      };
    },

    submit_Return_Request: async (payload: any): Promise<any> => {
      const res = (await singleRequest<any>(
        SparePartReturnAction.submit_Return_Request(payload)
      ))(requestAction);
      return res;
    },
    fetch_batch_spare_parts_return: async (
      params: TableViewSearchParams<TableViewSearchReturnsParam>
    ): Promise<Paging<MyRequestToReturnItem>> => {
      const res = (await singleRequest<Paging<SparePartReturnBatchResponseItem>>(
        SparePartReturnAction.fetch_batch_spare_parts_return(params)
      )(requestAction)) as Paging<SparePartReturnBatchResponseItem>;

      return {
        ...res,
        items: (res.items || []).map(mapToMyRequestToReturn),
      };
    },
  };
};

export { SparePartReturnAPI };
