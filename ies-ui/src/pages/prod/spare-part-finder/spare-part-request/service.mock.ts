import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import type {
  ChangeSparePartRequestStatusPayload,
  CreateSparePartRequestPayload,
  CreateSparePartReturnPayload,
  ProvideSparePartRequestPayload,
  RequestSparePartExtensionPayload,
  SparePartRequestServiceContract,
} from './service';
import type { MyRequestItem, MyRequestSearch, RequestStatus, SparePartRequestItem, SparePartRequestSearch } from './data';
import { myRequestsMockSeed } from './MockData/myRequests';
import { sparePartItemsMockSeed } from './MockData/sparePartItems';

let sparePartItemsStore: SparePartRequestItem[] = [...sparePartItemsMockSeed];
let myRequestsStore: MyRequestItem[] = [...myRequestsMockSeed];

const statusFromProvided = (provided: number, total: number): RequestStatus => {
  if (provided <= 0) return 'approved';
  if (provided < total) return 'partial';
  return 'in-progress';
};

const paginate = <T>(rows: T[], pagination?: { current?: number; pageSize?: number }): Paging<T> => {
  const current = pagination?.current || 1;
  const pageSize = pagination?.pageSize || 20;
  const start = (current - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    pageSize,
  };
};

const filterItems = (params: TableViewSearchParams<SparePartRequestSearch>): SparePartRequestItem[] => {
  const criteria = params?.criteria || {};
  const search = (criteria.searchValue || criteria.advanceSearch?.searchValue || '').trim().toLowerCase();
  const advance = criteria.advanceSearch || {};

  return sparePartItemsStore
    .filter((it) => {
      if (!search) return true;
      return [
        it.productId,
        it.partName,
        it.category,
        it.type,
        it.status,
        it.businessUnit,
      ]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(search));
    })
    .filter((it) => !advance.type || advance.type === 'ALL' || it.type === advance.type)
    .filter((it) => !advance.status || advance.status === 'ALL' || it.status === advance.status)
    .filter((it) => !advance.category || it.category === advance.category)
    .filter((it) => !advance.warehouse || it.warehouse === advance.warehouse);
};

const filterMyRequests = (params: TableViewSearchParams<MyRequestSearch>): MyRequestItem[] => {
  const criteria = params?.criteria || {};
  const search = (criteria.searchValue || criteria.advanceSearch?.searchValue || '').trim().toLowerCase();
  const advance = criteria.advanceSearch || {};

  return myRequestsStore
    .filter((it) => {
      if (!search) return true;
      return [it.requestId, it.remark, it.type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(search));
    })
    .filter((it) => !advance.priority || advance.priority === 'ALL' || it.priority === advance.priority)
    .filter((it) => !advance.status || advance.status === 'ALL' || it.requestStatus === advance.status)
    .filter((it) => !advance.type || advance.type === 'ALL' || it.type === advance.type);
};

const touchRequest = (id: number, mutator: (row: MyRequestItem) => MyRequestItem): MyRequestItem => {
  const idx = myRequestsStore.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`Mock request id=${id} not found`);
  const updated = mutator(myRequestsStore[idx]);
  myRequestsStore = [...myRequestsStore.slice(0, idx), updated, ...myRequestsStore.slice(idx + 1)];
  return updated;
};

export const createSparePartRequestMockService = (): SparePartRequestServiceContract => ({
  page: async (params) => paginate(filterItems(params), params.pagination),
  myRequestsPage: async (params) => paginate(filterMyRequests(params), params.pagination),

  createRequest: async (payload: CreateSparePartRequestPayload) => {
    const nextId = (myRequestsStore[0]?.id || 100) + 1;
    const now = new Date().toISOString();
    const row: MyRequestItem = {
      id: nextId,
      requestId: `Re-${String(nextId).padStart(4, '0')}`,
      priority: payload.priority,
      requestDate: now,
      totalItems: payload.items.reduce((sum, it) => sum + (it.quantity || 0), 0),
      receivedItems: 0,
      requestStatus: 'pending',
      remark: payload.remark || '',
      type: payload.items[0]?.item?.type,
    };
    myRequestsStore = [row, ...myRequestsStore];
    return row;
  },

  createReturn: async (payload: CreateSparePartReturnPayload) => {
    const nextId = (myRequestsStore[0]?.id || 100) + 1;
    const row: MyRequestItem = {
      id: nextId,
      requestId: `Rt-${String(nextId).padStart(4, '0')}`,
      priority: payload.priority,
      requestDate: new Date().toISOString(),
      totalItems: payload.items.reduce((sum, it) => sum + (it.quantity || 0), 0),
      receivedItems: 0,
      requestStatus: 'pending',
      remark: payload.remark || '',
      type: payload.items[0]?.item?.type,
    };
    myRequestsStore = [row, ...myRequestsStore];
    return row;
  },

  approveRequest: async (payload: ChangeSparePartRequestStatusPayload) =>
    touchRequest(payload.id, (r) => ({ ...r, requestStatus: 'approved', remark: payload.remark || r.remark })),

  rejectRequest: async (payload: ChangeSparePartRequestStatusPayload) =>
    touchRequest(payload.id, (r) => ({ ...r, requestStatus: 'rejected', remark: payload.remark || r.remark })),

  provideRequest: async (payload: ProvideSparePartRequestPayload) =>
    touchRequest(payload.id, (r) => ({
      ...r,
      receivedItems: Math.min(r.totalItems, payload.providedItems),
      requestStatus: statusFromProvided(payload.providedItems, r.totalItems),
      remark: payload.remark || r.remark,
    })),

  limitRequest: async (payload: ProvideSparePartRequestPayload) =>
    touchRequest(payload.id, (r) => ({
      ...r,
      receivedItems: Math.min(r.totalItems, payload.providedItems),
      requestStatus: statusFromProvided(payload.providedItems, r.totalItems),
      remark: payload.remark || r.remark,
    })),

  requestExtension: async (payload: RequestSparePartExtensionPayload) =>
    touchRequest(payload.id, (r) => ({ ...r, remark: payload.reason || r.remark })),

  approveExtension: async (payload: ChangeSparePartRequestStatusPayload) =>
    touchRequest(payload.id, (r) => ({ ...r, remark: payload.remark || r.remark })),

  rejectExtension: async (payload: ChangeSparePartRequestStatusPayload) =>
    touchRequest(payload.id, (r) => ({ ...r, remark: payload.remark || r.remark })),
});
