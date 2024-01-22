import { fetchDataPagingService } from '@/services/apiGateway';
import type { StockControlAR, TableViewDailyReportParam } from './data';

export const DailyReportAPI = {
  queryPage: (params: TableViewDailyReportParam) =>
    fetchDataPagingService<StockControlAR, undefined>({
      actionName: 'page-daily-report',
      endpoint: 'SALE',
      payload: undefined,
      pagination: {
        pageSize: params.pagination?.pageSize,
        page: params.pagination?.current,
      },
    }),
};
