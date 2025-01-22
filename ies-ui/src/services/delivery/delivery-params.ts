import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import moment, { Moment } from "moment";
import { execDataService0, fetchDataItemService, fetchDataListService, ServiceApiType } from "../apiGateway";
import { AssignDocParam, DeliveryNoteItem, Driver, Freight, ResolvedDNResponse, SaveCompany, SaveDriver, SaveOfficerParams, SaveTruck, SettlementParams } from "./data";
import { DeliveryAdvanceSearchParams, DeliveryCashCollectionParams } from "./req-params";

export const DeliveryParams = {

    summary: (): ServiceApiType<{}> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'delivery-summary-status',
    }),

    summarySettlement: (): ServiceApiType<{}> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'settlement-summary-status',
    }),

    cancelDelivery: (
        id: number,
        remarks: string,
    ): ServiceApiType<{ id: number; remarks: string }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'cancel-delivery',
        payload: { id, remarks },
    }),


    SettlementDetail: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'fetch-settlement-detail',
        payload: { id: id }
    }),

    listDelivery: (params: TableViewSearchParams<DeliveryAdvanceSearchParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-delivery',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listCashCollection: (params: TableViewSearchParams<DeliveryCashCollectionParams>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-cash-collection-w',
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listAllTranSource: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'transportSourceList',
        actionName: 'list-all-transport-source',
        payload: {}
    }),

    listTranSource: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-transport-source',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetchTranSource: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'fetch-transport-source',
        payload: { id }
    }),

    saveTranSource: (id: number, name: string, deliveryTracking?: boolean, description?: string): ServiceApiType<{
        id: number,
        name: string;
        deliveryTracking?: boolean;
        description?: string;
    }> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-transport-source',
        payload: { id, name, deliveryTracking, description }
    }),

    listAllTruck: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'truckList',
        actionName: 'list-all-truck',
        payload: {}
    }),

    listTruck: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-truck',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetchTruck: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'truck',
        actionName: 'fetch-truck',
        payload: { id }
    }),

    saveTruck: (params: SaveTruck): ServiceApiType<SaveTruck> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-truck',
        payload: params
    }),
    updateIntegrateId: (): ServiceApiType<{}> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'update-integrate-id',
        payload: {}
    }),

    listAllCompany: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'companyList',
        actionName: 'list-all-company',
        payload: {}
    }),

    listCompany: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-company',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetchCompany: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'company',
        actionName: 'fetch-company',
        payload: { id }
    }),

    saveCompany: (params: SaveCompany): ServiceApiType<SaveCompany> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-company',
        payload: params
    }),

    listActiveDrivers: fetchDataListService<Driver, {}>({
        actionName: 'list-active-drivers',
        endpoint: 'DELIVERY',
        payload: {}
    }),

    listAllDriver: (): ServiceApiType<{}> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'transportSourceList',
        actionName: 'list-all-driver',
        payload: {}
    }),

    listOfficer: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-officer',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    listDriver: (params: TableViewSearchParams<any>): ServiceApiType<{ searchValue?: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-driver',
        payload: { searchValue: params.criteria?.searchValue },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current
        },
    }),

    fetchOfficer: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'officer',
        actionName: 'fetch-officer',
        payload: { id }
    }),

    fetchDriver: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        responseKey: 'driver',
        actionName: 'fetch-driver',
        payload: { id }
    }),

    saveOfficer: (params: SaveOfficerParams): ServiceApiType<SaveOfficerParams> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-officer',
        payload: params
    }),

    saveDriver: (params: SaveDriver): ServiceApiType<SaveDriver> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'save-driver',
        payload: params
    }),

    listCheckout: (deliveryId: number): ServiceApiType<{ id: number }> => ({
        type: 'LIST_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'list-checkout',
        payload: { id: deliveryId }
    }),

    saveSettlement: (data: SettlementParams): ServiceApiType<SettlementParams> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'settled-cash-collection',
        payload: data
    }),

    fetchDeliveryInfo: (id: number): ServiceApiType<{ id: number }> => ({
        type: 'FETCH_QUERY',
        endpoint: 'DELIVERY',
        actionName: 'fetch-delivery-detail-w',
        payload: { id }
    }),

    assignDocs: (param: AssignDocParam): ServiceApiType<AssignDocParam> => ({
        type: 'EXEC',
        endpoint: 'DELIVERY',
        actionName: 'assign-delivery-docs',
        payload: param
    }),

    fetchChangedDNList: (deliveryId: number, dnDate?: Moment) => fetchDataListService<Freight, { deliveryId: number; dnDate: Moment; }>({
        actionName: 'fetch-changed-dn-list',
        endpoint: 'DELIVERY',
        payload: { deliveryId, dnDate: moment(dnDate) || moment() }
    }),


    fetchResolvingDn: (deliveryId: number, dnDate: Moment, shipToCode: string) => fetchDataItemService<ResolvedDNResponse, {
        deliveryId: number,
        shipToCode: string,
        dnDate: Moment
    }>({
        actionName: 'fetch-resolving-dn',
        endpoint: 'DELIVERY',
        payload: { deliveryId, dnDate: moment(dnDate), shipToCode }
    }),

    clearCancelDn: (freighId: number, remarks: string) => execDataService0<{ id: number; remarks: string; }>({
        actionName: 'clear-canceled-dn',
        endpoint: 'DELIVERY',
        payload: { id: freighId, remarks }
    }),

    clearChangedLocationDn: (freighId: number, remarks: string) => execDataService0<{ id: number; remarks: string; }>({
        actionName: 'clear-changed-location-dn',
        endpoint: 'DELIVERY',
        payload: { id: freighId, remarks }
    }),

    resolveDn: (
        currentFreightId: number,
        dnIds: number[],
        collectedInvoices: {
            docEntry: number;
            collected: boolean;
            remarks?: string;
        }[],
        returnItems: DeliveryNoteItem[]
    ) => execDataService0<{
        currentFreightId: number;
        dnIds: number[];
        collectedInvoices: {
            docEntry: number;
            collected: boolean;
            remarks?: string;
        }[];
        returnItems: DeliveryNoteItem[]
    }>({
        actionName: 'resolve-dn',
        endpoint: 'DELIVERY',
        payload: { currentFreightId, dnIds, collectedInvoices, returnItems }
    }),

    requestChangeLoading: (
        driverId: number,
        licensePlate: string,

        instanceId: number,
        deliveryNotes: number[],
        items: { itemCode: string, qty: number }[],
        pickedDate?: Moment,
        shift?: string,
        remarks?: string
    ) => execDataService0<{
        driverId: number;
        licensePlate: string;
        instanceId: number,
        deliveryNotes: number[],
        items: { itemCode: string, qty: number }[],
        pickedDate?: Moment;
        shift?: string;
        remarks?: string;

    }>({
        actionName: 'request-change-loading-items',
        endpoint: 'DELIVERY',
        payload: { driverId, licensePlate, instanceId, deliveryNotes, items, remarks, pickedDate, shift }
    }),

    cancelChangeLoading: (loadingId: number, remarks: string) => execDataService0<{ loadingId: number; remarks: string; }>({
        actionName: 'cancel-change-request',
        endpoint: 'DELIVERY',
        payload: { loadingId, remarks }
    })

}
