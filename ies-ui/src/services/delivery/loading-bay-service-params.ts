import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Moment } from 'moment';
import { execDataService0, fetchDataListService, ServiceApiType, } from '../apiGateway';
import { LookupDataItem } from '../data';
import { LoadingBay, PickingSlipItem } from './data';
import { SaveLoadingDockParams } from './queue-params';
import { ChangeRequestParam } from './req-params';
import { activity } from './instance.types';

export type LoadedChangeRequest = {
  loadingId: number;
  licensePlate: string;
  driver: string;
}

export type AllocatedLoadingDockBase = {
  id: number;
  instanceId?: number;
  isActive?: boolean;
  isLocked?: boolean;
  allocated: boolean;
  name: string;
  code: string;
  status: string;
  isOwner: boolean;
  canPick: boolean;
  claimedBy?: string;
  ownedTruckLoading?: boolean;
  holdBy?: string;
  loadingId?: number;
  ticketId?: number;
  ticketNum?: string;
  driver?: string;
  truckNo?: string;
  loadingTeam?: LookupDataItem;
  loadingStartedDate?: Moment;
  loadingEndedDate?: Moment;
  autoAssigned: boolean;
  loadedChangeRequest?: LoadedChangeRequest;
  activities: activity[];
}


export type AllocatedLoadingDock = AllocatedLoadingDockBase & {

  loadingBayId: number;
  isActive: boolean;
  combinedLoadingDocks?: LoadingDockLookup[];

};

export interface LoadingDockLookup {
  id: number;
  key?: string;
  name: string;
  code?: string;
  description?: string;
  isTemp?: boolean;
}

export type AllocatedLoadingDockDetail = AllocatedLoadingDockBase & {
  combinedLoadingDocks: LookupDataItem[];
  loadingCapacities: LookupDataItem[];
  picking?: {
    items: PickingSlipItem[];
    newItems?: PickingSlipItem[];
  }
};

export const LoadingServiceParams = {
  availableLoadingDockForQueue: (queueId: number): ServiceApiType<{ id: number }> => ({
    type: 'LIST_QUERY',
    endpoint: 'DELIVERY',
    responseKey: 'loadingDockList',
    actionName: 'available-loading-dock-for-queue',
    payload: { id: queueId },
  }),

  listAllLoadingDock: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'DELIVERY',
    responseKey: 'loadingDockList',
    actionName: 'list-all-loading-dock',
    payload: {},
  }),

  listLoadingCapacity: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'DELIVERY',
    responseKey: 'loadingCapacityList',
    actionName: 'list-loading-capacity',
    payload: {},
  }),

  saveLoadingCapacity: (id: number, loadingCapacityIds: number[]) => execDataService0<{ id: number, loadingCapacityIds: number[] }>({
    actionName: 'assign-truck-loading-capacity',
    endpoint: 'DELIVERY',
    payload: { id, loadingCapacityIds }
  }),

  transferLoadingDock: (ticketId: number, loadingDockIds: number[], releaseCurrentLoadingDock: boolean, remarks?: string) => execDataService0<{
    ticketId: number; loadingDockIds: number[]; releaseCurrentLoadingDock: boolean; remarks?: string;
  }>({
    actionName: 'transfer-loading-dock',
    endpoint: 'DELIVERY',
    payload: {
      ticketId,
      loadingDockIds,
      releaseCurrentLoadingDock,
      remarks
    }

  }),

  listLoadingDock: (
    params: TableViewSearchParams<any>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'list-loading-dock',
    payload: { searchValue: params.criteria?.searchValue },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  listAvailableLoadingDocks: (ticketId: number) => fetchDataListService<AllocatedLoadingDock, { id: number }>({
    actionName: 'list-available-loading-docks',
    endpoint: 'DELIVERY',
    payload: { id: ticketId }
  }),

  fetchLoadingDock: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    responseKey: 'loadingDock',
    actionName: 'fetch-loading-dock',
    payload: { id },
  }),

  saveLoadingDock: (data: SaveLoadingDockParams): ServiceApiType<SaveLoadingDockParams> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'save-loading-dock',
    payload: data,
  }),

  listLoadingBay: (
    params: TableViewSearchParams<any>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'list-loading-bay',
    payload: { searchValue: params.criteria?.searchValue },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  listAllLoadingBay: (): ServiceApiType<{}> => ({
    type: 'LIST_QUERY',
    endpoint: 'DELIVERY',
    responseKey: 'loadingBayList',
    actionName: 'list-all-loading-bay',
    payload: {},
  }),

  fetchLoadingBay: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-loading-bay',
    payload: { id },
  }),

  saveLoadingBay: (data: LoadingBay): ServiceApiType<LoadingBay> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'save-loading-bay',
    payload: data,
  }),

  allocatedLoadingDock: (checkedIn?: boolean): ServiceApiType<{ checkedIn?: boolean }> => ({
    type: 'LIST_QUERY',
    endpoint: 'DELIVERY',
    responseKey: 'allocatedLoadingDockList',
    actionName: 'list-current-loading-dock',
    payload: { checkedIn },
  }),

  allocatedLoadingDockDetail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch_allocated_loading_dock_detail',
    payload: { id },
  }),

  openLoadingDock: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'open-loading-dock',
    payload: { id },
  }),
  closeLoadingDock: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'close-loading-dock',
    payload: { id },
  }),

  onChangRequest: (data: ChangeRequestParam): ServiceApiType<ChangeRequestParam> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'response-change-request',
    payload: data,
  }),

};
