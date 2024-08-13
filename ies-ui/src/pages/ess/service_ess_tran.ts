import { fetchDataPagingService,fetchDataListService} from '@/services/apiGateway'; 
import { request } from 'umi';
import { OpenEssDataItem,OpenAdvanceSearchParams } from './data_ess';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}


export const ServicesEss = {  
  listEssOpen: (params: TableViewSearchParams<OpenAdvanceSearchParams>) => fetchDataPagingService<OpenEssDataItem, { searchValue?: string }>({
    actionName: 'list-ess-open',
    endpoint: 'HR',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  listEssOpenItem: (params: TableViewSearchParams<OpenAdvanceSearchParams>) => fetchDataPagingService<OpenEssDataItem, { id: number }>({
    actionName: 'list-ess-open-item',
    endpoint: 'HR',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }), 

}