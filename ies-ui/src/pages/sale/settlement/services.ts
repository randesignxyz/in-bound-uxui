import { fetchDataPagingService } from '@/services/apiGateway';
// import type { SortOrder } from 'antd/lib/table/interface';
// import type moment from 'moment';
import type { SettlementDto } from './data';

export interface TableViewSettlementParam {
  //criteria: { selectedDates?: moment.Moment[]; sort?: Record<string, SortOrder> };
  pagination?: {
    pageSize?: number;
    current?: number;
  };
}
export const SettlementServiceAPI = {
  settlementPage: (params: TableViewSettlementParam) =>
    fetchDataPagingService<
      SettlementDto,
      undefined
      // { selectedDate?: moment.Moment[]; sort?: Record<string, SortOrder> }
    >({
      actionName: 'list-settlement',
      endpoint: 'SALE',
      payload: undefined,
      pagination: {
        pageSize: params.pagination?.pageSize,
        page: params.pagination?.current,
      },
    }),
};
