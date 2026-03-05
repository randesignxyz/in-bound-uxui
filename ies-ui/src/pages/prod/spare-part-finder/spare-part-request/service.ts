import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';
import type { MyRequestItem, MyRequestSearch, RequestPriority, SparePartRequestItem, SparePartRequestSearch } from './data';
import { sparePartRequestMockData } from './MockData/itemList';
import { myRequestMockData } from './MockData/myRequestList';

/** Runtime store – starts with mock seed, new requests get prepended */
let myRequestStore: MyRequestItem[] = [...myRequestMockData];

const SparePartRequestAction = {
  page: (
    params: TableViewSearchParams<SparePartRequestSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'PROD',
    actionName: 'fetch-paging-spare-part-request',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
};

export const SparePartRequestServiceAPI = (requestAction: RequestActions) => {
  const normalize = (value?: string) =>
    (value || '')
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const pageFromMock = async (
    params: TableViewSearchParams<SparePartRequestSearch>,
  ): Promise<Paging<SparePartRequestItem>> => {
    const searchValue = normalize(params.criteria?.searchValue);
    const tokens = searchValue ? searchValue.split(' ') : [];
    const filter = params.criteria?.advanceSearch || {};
    const current = params.pagination?.current || 1;
    const pageSize = params.pagination?.pageSize || 20;

    const filtered = sparePartRequestMockData.filter((item) => {
      const searchable = normalize(
        [
          item.productId,
          item.partName,
          item.category,
          item.type,
          item.status,
          item.status === 'no-stock' ? 'no stock' : item.status,
          item.businessUnit,
          item.tags?.join(' '),
          item.description,
        ]
          .filter(Boolean)
          .join(' '),
      );
      const matchedSearch = tokens.length === 0 || tokens.every((tk) => searchable.includes(tk));

      const matchedTab = !filter.tab || item.tab === filter.tab;
      const matchedType = !filter.type || filter.type === 'ALL' || item.type === filter.type;
      const matchedWarehouse = !filter.warehouse || item.warehouse === filter.warehouse;
      const matchedCategory = !filter.category || item.category === filter.category;
      const matchedStatus = !filter.status || filter.status === 'ALL' || item.status === filter.status;

      return (
        matchedSearch &&
        matchedTab &&
        matchedType &&
        matchedWarehouse &&
        matchedCategory &&
        matchedStatus
      );
    });

    const start = (current - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      pageSize,
    };
  };

  return {
    page: async (params: TableViewSearchParams<SparePartRequestSearch>) => {
      try {
        return (await singleRequest<SparePartRequestItem>(SparePartRequestAction.page(params))(
          requestAction,
        )) as Paging<SparePartRequestItem>;
      } catch (error) {
        return pageFromMock(params);
      }
    },

    myRequestsPage: async (
      params: TableViewSearchParams<MyRequestSearch>,
    ): Promise<Paging<MyRequestItem>> => {
      const searchValue = normalize(params.criteria?.searchValue);
      const tokens = searchValue ? searchValue.split(' ') : [];
      const filter = params.criteria?.advanceSearch || ({} as MyRequestSearch);
      const current = params.pagination?.current || 1;
      const pageSize = params.pagination?.pageSize || 10;

      const filtered = myRequestStore.filter((item) => {
        const searchable = normalize(
          [item.requestId, item.remark, item.priority, item.requestStatus].filter(Boolean).join(' '),
        );
        const matchedSearch = tokens.length === 0 || tokens.every((tk) => searchable.includes(tk));

        const matchedPriority =
          !filter.priority || filter.priority === 'ALL' || item.priority === filter.priority;
        const matchedStatus =
          !filter.status || filter.status === 'ALL' || item.requestStatus === filter.status;
        const matchedType = !filter.type || filter.type === 'ALL' || item.type === filter.type;

        let matchedDate = true;
        if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
          const itemDate = new Date(item.requestDate).getTime();
          const from = new Date(filter.dateRange[0]).getTime();
          const to = new Date(filter.dateRange[1]).getTime();
          matchedDate = itemDate >= from && itemDate <= to;
        }

        return matchedSearch && matchedPriority && matchedStatus && matchedType && matchedDate;
      });

      const start = (current - 1) * pageSize;
      return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        pageSize,
      };
    },

    createRequest: async (payload: {
      items: { item: SparePartRequestItem; quantity: number; purpose: string }[];
      remark: string;
      priority: RequestPriority;
    }): Promise<MyRequestItem> => {
      const nextId = myRequestStore.reduce((max, it) => Math.max(max, it.id), 0) + 1;
      const seqNum = String(nextId).padStart(4, '0');

      const newRequest: MyRequestItem = {
        id: nextId,
        requestId: `Re-${seqNum}`,
        priority: payload.priority,
        requestDate: new Date().toISOString(),
        totalItems: payload.items.reduce((sum, it) => sum + it.quantity, 0),
        receivedItems: 0,
        requestStatus: 'pending',
        remark: payload.remark || payload.items.map((it) => it.purpose).join('; '),
      };

      myRequestStore = [newRequest, ...myRequestStore];
      return newRequest;
    },
  };
};

export type SparePartRequestServiceReturn = ReturnType<typeof SparePartRequestServiceAPI>;
