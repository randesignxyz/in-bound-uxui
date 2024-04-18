import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Moment } from 'moment';
import { fetchDataListService, ServiceApiType } from '../apiGateway';
import { LookupData } from '../data';
import { LoadingAdvanceSearchParams, SaveLoadedParam, startLoadingParam } from './req-params';

export const LoadingParams = {
  listLoading: (
    params: TableViewSearchParams<LoadingAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'list-loading',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  listByLoadingDock: (params: TableViewSearchParams<{ id: number }>): ServiceApiType<{}> => ({
    type: 'PAGING_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'list-loading-history-by-loading-dock',
    payload: { id: params.criteria?.advanceSearch?.id },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  summary: (): ServiceApiType<{}> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'loading-summary-status',
  }),

  fetchLoadingInfo: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-loaded-info-w',
    payload: { id },
  }),

  cancelPikingSlip: (
    id: number,
    remarks: string,
  ): ServiceApiType<{ id: number; remarks: string }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'cancel-picking-slip',
    payload: { id, remarks },
  }),

  cancelLoading: (
    id: number,
    remarks: string,
  ): ServiceApiType<{ id: number; remarks: string }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'cancel-loading',
    payload: { id, remarks },
  }),

  searchLoadingItem: (
    id: number,
    docDate: Moment,
    shift: string,
    driverId?: number,
    licensePlate?: string,
  ): ServiceApiType<{
    id: number;
    docDate: Moment; shift: string;
    driverId?: number;
    licensePlate?: string;
  }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'search-picking-slip-items',
    payload: { id, docDate, shift, driverId, licensePlate },
  }),


  fetchDN: (
    id: number,
    docDate: Moment,
    shift: string,
    driverId?: number,
    licensePlate?: string,
  ): ServiceApiType<{
    id: number;
    docDate: Moment; shift: string;
    driverId?: number;
    licensePlate?: string;
  }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-dn',
    payload: { id, docDate, shift, driverId, licensePlate },
  }),

  assignedPickingSlip: (
    id: number,
    docDate: Moment,
    shift: string,
    deliveryIds: number[],
    items: { itemCode: string, qty: number }[],
    whsCode?: string,
    remarks?: string,
    driverId?: number,
    licensePlate?: string,
    modified?: boolean,
    ownedTruckLoading?: boolean
  ): ServiceApiType<{
    id: number;
    docDate: Moment;
    shift: string;
    deliveryIds: number[];
    items: { itemCode: string, qty: number }[],
    whsCode?: string;
    remarks?: string;
    driverId?: number;
    licensePlate?: string;
    modified?: boolean;
    ownedTruckLoading?: boolean;
  }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'assigned-picking-slip',
    payload: {
      id: id,
      docDate: docDate,
      shift: shift,
      deliveryIds: deliveryIds,
      items: items,
      whsCode: whsCode,
      remarks: remarks,
      driverId: driverId,
      licensePlate: licensePlate, modified: modified,
      ownedTruckLoading: ownedTruckLoading
    },
  }),

  fetchLoadingItem: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'list-picking-slip-items',
    payload: { id },
  }),

  fetchLoadedItem: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-current-picking-slip',
    payload: { id },
  }),

  startLoading: (data: startLoadingParam): ServiceApiType<startLoadingParam> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'start-loading',
    payload: data,
  }),

  saveLoaded: (data: SaveLoadedParam): ServiceApiType<SaveLoadedParam> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'save-loaded',
    payload: data,
  }),

  fetchLoadedDetail: (
    id: number,
    driverId?: number,
    licensePlate?: string,
    deliveryDate?: Moment,
    shift?: string,
    remarks?: string,
  ): ServiceApiType<{
    id: number;
    driverId?: number;
    licensePlate?: string;
    deliveryDate?: Moment;
    shift?: string;
    remarks?: string;
  }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-loaded-detail',
    payload: { id, driverId, licensePlate, deliveryDate, shift, remarks },
  }),

  holdLoading: (id: number, remarks: string): ServiceApiType<{ id: number; remarks: string }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'hold-loading',
    payload: { id, remarks },
  }),

  recalLoading: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'recall-loading',
    payload: { id },
  }),

  attentionCall: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'attention-call',
    payload: { id },
  }),

  updateTruck: (
    instanceId: number,
    licensePlate: string,
    remarks: string,
  ): ServiceApiType<{
    instanceId: number;
    licensePlate: string;
    remarks: string;
  }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'update-truck',
    payload: { instanceId, licensePlate, remarks },
  }),

  listWarehouse: fetchDataListService<LookupData>({
    actionName: 'list-warehouse',
    responseKey: 'warehouses',
    endpoint: 'DELIVERY',
  })
};
