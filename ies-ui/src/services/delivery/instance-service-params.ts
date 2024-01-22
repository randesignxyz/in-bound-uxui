import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ServiceApiType } from "../apiGateway";
import { InstanceAdvanceSearchParams } from "./instance.types";
import { Moment } from "moment";

export const InstanceSrvParams = {


    listBoard: (params: TableViewSearchParams<InstanceAdvanceSearchParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-delivery-board',
        payload: { ...params.criteria },

    }),

    claim: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'claim',
        payload: { id }
    }),

    hold: (instanceId: number, remarks: string): ServiceApiType<{ instanceId: number; remarks: string }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'hold-instance',
        payload: { instanceId, remarks }
    }),

    release: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'release',
        payload: { id }
    }),

    issueDN: (id: number,
        docDate: Moment,
        shift: string,
        driverId?: number,
        licensePlate?: string,
    ): ServiceApiType<{
        id: number;
        docDate: Moment;
        shift: string;
        driverId?: number;
        licensePlate?: string;
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'issue-dn',
        payload: { id, docDate, shift, driverId, licensePlate }
    }),

    list: (params: TableViewSearchParams<InstanceAdvanceSearchParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-instances',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listLoading: (params: TableViewSearchParams<InstanceAdvanceSearchParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-instances-loading',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listDelivery: (params: TableViewSearchParams<InstanceAdvanceSearchParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-instances-delivery',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetch: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'fetch-instance',
        payload: { id }
    })
}