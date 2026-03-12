import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import type { SparePartRequestItem, SparePartStockStatus, SparePartType } from './data';

export interface SparePartRequestListSearch { 
  searchValue?: string;
  status?: string;
  category?: string;
  type?: string;
  warehouse?: string;
}

interface SparePartRequestListApiSearch {
  advanceSearch: {
    searchValue: string;
    warehouse: string;
    status: string;
    category: string;
    type: string;
  };
}

export interface SparePartRequestListApiItem {
  id: number;
  productId: string;
  partName: string;
  description?: string;
  tag?: string;
  type: string;
  category: string;
  stock: number;
  status: string;
  avalailableStock?: number;
  imageId?: string;
  isActive: boolean;
  businessUnit: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  locations?: Location[];
}

interface Location {
  warehouseCode: string;
  warehouseName: string;
  zone: string;
  shelf: string;
  levelBin: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  reorderLevel: number;
}
        
type SparePartRequestPageParams = {
  criteria?: SparePartRequestListSearch;
  pagination?: {
    current?: number;
    pageSize?: number;
  };
};

const SparePartRequestTestAction = {
  page: (params: SparePartRequestPageParams): ServiceApiType<SparePartRequestListApiSearch> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'get-search-spare-part',
    payload: {
      advanceSearch: {
        searchValue: params.criteria?.searchValue || '',
        warehouse: params.criteria?.warehouse || '',
        status: '',
        category: params.criteria?.category || '',
        type: params.criteria?.type && params.criteria.type !== 'All' ? params.criteria.type : '',
      },
    },
    pagination: {
      page: params.pagination?.current,
      pageSize: params.pagination?.pageSize,
    },
  }),
  // createRequest: 
};

const mapStockStatus = (stock: number): SparePartStockStatus => {
  if (stock <= 0) return 'no-stock';
  if (stock <= 2) return 'low';
  return 'available';
};

const mapType = (type?: string): SparePartType => {
  const normalized = String(type || 'MRO_W').replace(/_/g, '-');
  if (normalized === 'MRO-S') return 'MRO-S';
  if (normalized === 'MRO-G') return 'MRO-G';
  return 'MRO-W';
};

const mapItem = (item: SparePartRequestListApiItem, fallbackWarehouse?: string): SparePartRequestItem => {
  const firstLocation = item.locations?.[0];
  const stock = firstLocation?.availableQty ?? item.avalailableStock ?? item.stock ?? 0;

  return {
    id: item.id,
    image: undefined,
    imageId: item.imageId,
    productId: item.productId,
    partName: item.partName,
    description: item.description,
    tags: item.tag ? [item.tag] : undefined,
    type: mapType(item.type),
    category: item.category,
    stock,
    businessUnit: item.businessUnit,
    status: mapStockStatus(stock),
    warehouse: firstLocation?.warehouseCode || fallbackWarehouse || '',
    tab: 'spare-list',
    createdDate: item.createdDate,
  };
};

const mapPagingResult = (
  response: Paging<SparePartRequestListApiItem> | any,
  params: SparePartRequestPageParams,
): Paging<SparePartRequestItem> => {
  const rawItems = Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

  let items = rawItems.map((item) => mapItem(item, params.criteria?.warehouse));

  if (params.criteria?.status && params.criteria.status !== 'All') {
    items = items.filter((item) => item.status === params.criteria?.status);
  }

  return {
    items,
    total: response?.total ?? items.length,
    pageSize: response?.pageSize ?? params.pagination?.pageSize,
    refNo: response?.refNo,
  };
};

export const SparePartRequestAPI = (requestAction?: RequestActions) => ({
  page: async (params: SparePartRequestPageParams): Promise<Paging<SparePartRequestItem>> => {
    const response = await singleRequest<SparePartRequestListApiItem>(SparePartRequestTestAction.page(params))(
      requestAction,
    );
    return mapPagingResult(response, params);
  },
});
