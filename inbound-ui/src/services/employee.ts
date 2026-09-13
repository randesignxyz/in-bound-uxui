import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { fetchDataPagingService } from '@/services/apiGateway';

export interface EmployeeListItem {
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  [key: string]: any;
}

export interface EmployeeAdvanceSearchParams {
  searchValue?: string;
  [key: string]: any;
}

export const EmployeeServices = {
  list: (params: TableViewSearchParams<EmployeeAdvanceSearchParams>) =>
    fetchDataPagingService<EmployeeListItem, { searchValue?: string }>({
      actionName: 'list-employee',
      endpoint: 'HR',
      payload: { ...params.criteria },
      pagination: {
        pageSize: params.pagination?.pageSize,
        page: params.pagination?.current,
      },
    }),
};
