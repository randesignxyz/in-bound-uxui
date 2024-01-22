import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ServiceApiType } from "../apiGateway";
import { ReviewerParams, ReviewParams } from "./req-params";

export const ReqSurveyParams = {
    listReviewer: (params: TableViewSearchParams<ReviewerParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-reviewer',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listReview: (params: TableViewSearchParams<ReviewParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-review',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listReviewByReviwerId: (id: number, pagination?: {
        pageSize?: number;
        current?: number;
      }): ServiceApiType<{ id: number; pagination?: {
        pageSize?: number;
        current?: number;
      }}> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-review-by-reviewer',
        payload: { id },
        pagination: {
            pageSize: pagination?.pageSize,
            page: pagination?.current
        },
    }),

    listReviewItem: (id: number): ServiceApiType<{id: number;}> =>({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-review-detail',
        payload: {id}
    }),

    assignCustomerToReviewer: (reviewerId: number ,customerCode: string): ServiceApiType<{id: number, customerCode: string}> =>({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'assign-customer-to-reviewer',
        payload: {id: reviewerId, customerCode: customerCode}
    })
}