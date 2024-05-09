import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { execDataService0, ServiceApiType } from "../apiGateway";
import { SaveQueue } from "./data";


export interface SaveLoadingDockParams {
    id: number;
    name: string;
    code: string;
    loadingBayId: number;
    autoAssigned: boolean;
    status: string;
    combinedLoadingDocks?: number[];
    priority?: number;
    seq?: number;
    description?: string;
    createdBy: string;
    truckLoadingCapacityIds?: number[];
}

export const ReqQueuetParams = {

    forceAssignLoadingDock: execDataService0<any>({
        actionName: 'force-assign-loading-dock',
        endpoint: 'DELIVERY',
        payload: {}
    }),

    listAllQueueLayout: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'qrCodeList',
        actionName: 'list-all-qr-code',
        payload: {}
    }),


    listAllQRCode: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'qrCodeList',
        actionName: 'list-all-qr-code',
        payload: {}
    }),

    listQRCode: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-qr-code',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetchQRCode: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'fetch-qr-code',
        payload: { id }
    }),

    saveQRCode: (id: number, name: string, code: string, description?: string): ServiceApiType<{
        id: number,
        name: string;
        code: string;
        description?: string;
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-qr-code',
        payload: { id, name, code, description }
    }),

    summaryQueue: (): ServiceApiType<{}> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'queue-summary-status',
    }),


    listQueue: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-queue',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetchQueue: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'queue',
        actionName: 'fetch-queue',
        payload: { id }
    }),

    saveQueue: (parms: SaveQueue): ServiceApiType<SaveQueue> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-queue',
        payload: parms
    }),

    assignedLoadingDock: (id: number, loadingDockId: number, remarks?: String): ServiceApiType<{
        id: number, loadingDockId: number, remarks?: String
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'assigned-queue-to-loading-dock',
        payload: { id, loadingDockId, remarks }
    }),

    assignedPickingSlip: (id: number, shift: string, isModified?: boolean, remarks?: string): ServiceApiType<{
        id: number;
        shift: string;
        isModified?: boolean;
        remarks?: string;
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'assigned-picking-slip',
        payload: { id, shift, isModified, remarks }
    }),


    loadingCompleted: (id: number): ServiceApiType<{
        id: number
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'finish-loading',
        payload: { id }
    }),


    assigneDeliveryDoc: (id: number, deliveryNoteIds: number[], invoiceIds: number[]): ServiceApiType<{
        id: number; deliveryNoteIds: number[]; invoiceIds: number[];
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'assigned-delivery-doc',
        payload: { id, deliveryNoteIds, invoiceIds }
    }),

    fetchQueueDisplayData: (): ServiceApiType<{}> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'fetch-queue-display-data',
        payload: {}
    }),


}