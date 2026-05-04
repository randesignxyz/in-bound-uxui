import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { request } from '@umijs/max';
import type { SparePartRequestItem, SparePartStockStatus } from './data';

export interface SparePartRequestListSearch { 
  searchValue?: string;
  status?: string;
  category?: string;
  categoryId?: number;
  warehouse?: string;
  businessUnit?: string | string[];
}

interface SparePartRequestListApiSearch {
  advanceSearch: {
    searchValue: string;
    warehouse: string;
    status: string;
    category: string;
    type: string;
    categoryId?: number;
    businessUnit?: string | string[];
  };
}

export interface SparePartCategoryApiItem {
  id: number;
  category_name: string;
}

export interface SparePartRequestListApiItem {
  id: number;
  productId: string;
  partName: string;
  description?: string;
  uom?: string | string[] | null;
  kind?: string | null;
  category_id?: number | null;
  category?: { id?: number | null; category_name?: string | null } | string | null;
  stock: number;
  avalailableStock?: number;
  imageId?: string[];
  isActive: boolean;
  businessUnit?: string | null;
  stockStatus?: string | null;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  locations?: Location[];
}

interface Location {
  warehouseCode: string;
  warehouseName?: string;
  level: string;
  shelve: string;
  rack: string;
  bin: string;
  onHandQty?: number;
  reservedQty?: number;
  availableQty: number;
  reorderLevel: number;
  stockStatus?: string | null;
  sapStock?: number | null;
  lastSyncedAt?: string | null;
}

type SparePartDetailParams = {
  id?: number;
  productId?: string;
};

export type UpdateSparePartDetailPayload = {
  id?: number;
  productId?: string;
  partName: string;
  description?: string;
  uom: string[];
  kind?: string;
  categoryId?: number;
  isActive: boolean;
};
        
type SparePartRequestPageParams = {
  criteria?: SparePartRequestListSearch;
  pagination?: {
    current?: number;
    pageSize?: number;
  };
  signal?: AbortSignal;
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
        status: params.criteria?.status === 'All' ? '' : (params.criteria?.status || ''),
        category: params.criteria?.category || '',
        type: '',
        categoryId: params.criteria?.categoryId,
        businessUnit: params.criteria?.businessUnit || '',
      },
    },
    pagination: {
      page: params.pagination?.current || 1,
      pageSize: params.pagination?.pageSize,
    },
  }),
  detail: (params: SparePartDetailParams): ServiceApiType<SparePartDetailParams> => ({
    type: 'FETCH_QUERY',
    endpoint: 'PROD',
    actionName: 'get-spare-part-detail',
    payload: {
      id: params.id,
      productId: params.productId,
    },
  }),
  updateImages: (payload: { productId: string; images: string[] }): ServiceApiType<{ productId: string; images: string[] }> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'update-spare-part-images',
    payload,
  }),
  updateDetail: (payload: UpdateSparePartDetailPayload): ServiceApiType<UpdateSparePartDetailPayload> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'update-spare-part-detail',
    payload,
  }),
  deleteImages: (payload: { productId: string; images: string[] }): ServiceApiType<{ productId: string; images: string[] }> => ({
    type: 'EXEC',
    endpoint: 'PROD',
    actionName: 'delete-spare-part-images',
    payload,
  }),
  // createRequest: 
};

const mapStockStatus = (stock: number, reorderLevel?: number): SparePartStockStatus => {
  if (stock <= 0) return 'no-stock';
  if ((reorderLevel ?? 0) > 0 && stock <= (reorderLevel ?? 0)) return 'low';
  return 'available';
};

const mapBackendStockStatus = (status?: string | null): SparePartStockStatus | undefined => {
  switch (status?.trim().toUpperCase()) {
    case 'OUT_OF_STOCK':
      return 'no-stock';
    case 'LOW_STOCK':
      return 'low';
    case 'IN_STOCK':
      return 'available';
    default:
      return undefined;
  }
};

const normalizeUomOptions = (value?: string | string[] | null): string[] => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => String(item || '').trim()).filter(Boolean)));
  }

  const normalized = String(value || '').trim();
  if (!normalized) return [];

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map((item) => String(item || '').trim()).filter(Boolean)));
    }
  } catch (error) {
    // Keep fallback parsing below for non-JSON payloads such as "[PCS,BOX]".
  }

  const flattened = normalized
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map((item) => item.trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean);

  return Array.from(new Set(flattened.length > 0 ? flattened : [normalized]));
};

const resolveCategoryName = (category?: SparePartRequestListApiItem['category']): string =>
  typeof category === 'string' ? category : category?.category_name || '-';

const resolveCategoryId = (item: SparePartRequestListApiItem): number | undefined =>
  item.category_id ?? (typeof item.category === 'object' ? item.category?.id ?? undefined : undefined);

export const mapItem = (item: SparePartRequestListApiItem): SparePartRequestItem => {
  const firstLocation = item.locations?.[0];
  const stock = firstLocation?.availableQty ?? item.avalailableStock ?? item.stock ?? 0;
  const reorderLevel = firstLocation?.reorderLevel;
  const backendStockStatus = mapBackendStockStatus(firstLocation?.stockStatus ?? item.stockStatus);
  const uomOptions = normalizeUomOptions(item.uom);

  return {
    id: item.id,
    image: undefined,
    imageId: item.imageId || [],
    productId: item.productId,
    partName: item.partName,
    description: item.description,
    kind: item.kind || undefined,
    categoryId: resolveCategoryId(item),
    category: resolveCategoryName(item.category),
    uom: uomOptions[0],
    uomOptions,
    stock,
    businessUnit: item.businessUnit || '-',
    isActive: item.isActive,
    status: backendStockStatus || mapStockStatus(stock, reorderLevel),
    warehouse: firstLocation?.warehouseCode || '',
    stockStatus: firstLocation?.stockStatus || item.stockStatus || undefined,
    locations: (item.locations || []) as any,
    tab: 'spare-list',
    createdDate: item.createdDate,
    updatedDate: item.updatedDate,
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

  let items: SparePartRequestItem[] = rawItems.map((item: SparePartRequestListApiItem) =>
    mapItem(item),
  );

  return {
    items,
    total: response?.total ?? items.length,
    pageSize: response?.pageSize ?? params.pagination?.pageSize,
    refNo: response?.refNo,
  };
};

export const SparePartRequestAPI = (requestAction?: RequestActions) => ({
  page: async (params: SparePartRequestPageParams): Promise<Paging<SparePartRequestItem>> => {
    const action = SparePartRequestTestAction.page(params);
    let response: Paging<SparePartRequestListApiItem> | SparePartRequestListApiItem[] | SparePartRequestListApiItem;

    if (params.signal) {
      try {
        requestAction?.start?.();
        const current = params.pagination?.current || (action as any).pagination?.page || 1;
        const pageIndex = Math.max(0, current - 1);
        const pageSize = params.pagination?.pageSize || (action as any).pagination?.pageSize || 20;
        const res = await request<Paging<SparePartRequestListApiItem>>(
          `${getServiceUrl(action.endpoint)}/name/${action.actionName}/list-paging/page/${pageIndex}/size/${pageSize}`,
          {
            method: 'POST',
            data: action.payload || {},
            signal: params.signal,
          } as any,
        );
        response = (res as any)?.data ?? res;
        requestAction?.end?.('SUCCESS');
      } catch (error: any) {
        if (params.signal.aborted || error?.name === 'AbortError') {
          requestAction?.end?.('SUCCESS');
          throw error;
        }
        requestAction?.end?.('FAILED');
        throw error;
      }
    } else {
      response = await singleRequest<SparePartRequestListApiItem>(action)(requestAction);
    }

    return mapPagingResult(response, params);
  },
  detail: async (params: SparePartDetailParams): Promise<SparePartRequestItem> => {
    const response = await singleRequest<SparePartRequestListApiItem>(SparePartRequestTestAction.detail(params))(
      requestAction,
    );
    return mapItem(response as SparePartRequestListApiItem);
  },
  updateImages: async (productId: string, images: string[]): Promise<SparePartRequestItem> => {
    const response = await singleRequest<any>(SparePartRequestTestAction.updateImages({ productId, images }))(
      requestAction,
    );
    const payload = response?.data ?? response;
    return mapItem(payload as SparePartRequestListApiItem);
  },
  updateDetail: async (payload: UpdateSparePartDetailPayload): Promise<SparePartRequestItem> => {
    const response = await singleRequest<any>(SparePartRequestTestAction.updateDetail(payload))(requestAction);
    const nextPayload = response?.data ?? response;
    return mapItem(nextPayload as SparePartRequestListApiItem);
  },
  deleteImages: async (productId: string, images: string[]): Promise<SparePartRequestItem> => {
    const response = await singleRequest<any>(SparePartRequestTestAction.deleteImages({ productId, images }))(
      requestAction,
    );
    const payload = response?.data ?? response;
    return mapItem(payload as SparePartRequestListApiItem);
  },
});

export const uploadFilesToFileService = async (files: File[]): Promise<string[]> => {
  const token = localStorage.getItem('accessToken');
  const uploadUrl = `${getServiceUrl('FILE')}/upload`;
  const ids: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }
    const fileId = await res.text();
    const normalizedId = fileId.replace(/"/g, '').trim();
    if (normalizedId) {
      ids.push(normalizedId);
    }
  }

  return ids;
};

export const fetchSparePartCategories = async (): Promise<SparePartCategoryApiItem[]> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${getServiceUrl('PROD')}/spare-part-finder/categories`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('Failed to load spare part categories.');
  }

  const payload = await response.json().catch(() => []);
  return Array.isArray(payload) ? payload : [];
};

export const fetchSparePartBusinessUnits = async (): Promise<{ businessUnit: string }[]> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${getServiceUrl('PROD')}/name/get-spare-part-business-units/list`, {
    method: 'POST',
    headers: token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to load spare part business units.');
  }

  const payload = await response.json().catch(() => []);
  return Array.isArray(payload) ? payload : [];
};

export const fetchSparePartWarehouses = async (
  businessUnit?: string,
): Promise<{ warehouseCode: string; warehouseName: string }[]> => {
  const token = localStorage.getItem('accessToken');
  const url = businessUnit
    ? `${getServiceUrl('PROD')}/spare-part-finder/warehouses?businessUnit=${encodeURIComponent(businessUnit)}`
    : `${getServiceUrl('PROD')}/spare-part-finder/warehouses`;
  const response = await fetch(
    url,
    {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error('Failed to load spare part warehouses.');
  }

  const payload = await response.json().catch(() => []);
  return Array.isArray(payload) ? payload : [];
};
