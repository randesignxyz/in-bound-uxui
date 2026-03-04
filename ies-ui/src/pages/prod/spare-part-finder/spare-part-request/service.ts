import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import type { RequestActions, ServiceApiType } from '@/services/apiGateway';
import type { SparePartRequestItem, SparePartRequestSearch } from './data';
import { sparePartRequestMockData } from './MockData/itemList';

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
  };
};
