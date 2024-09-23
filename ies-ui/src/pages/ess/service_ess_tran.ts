import { fetchDataPagingService,fetchDataListService, execDataService0, fetchDataItemService} from '@/services/apiGateway'; 
import { request } from 'umi';
import { OpenEssDataItem,OpenAdvanceSearchParams } from './data_ess';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}


export const ServicesEss = {   
  essOpenActive: () =>fetchDataItemService<OpenEssDataItem, {}>({
    actionName: 'fetch-essinfo-active',
    endpoint: 'HR'
  }),
  essInfoDetail: (id: number,essId:number ) =>fetchDataItemService<OpenEssDataItem, { id: number,essId:number }>({
    actionName: 'fetch-essinfo-by-empid',
    endpoint: 'HR',
    payload: { id: id,essId:essId }
  }),
  essOpenDetail: (id: number) =>fetchDataItemService<OpenEssDataItem, { id: number }>({
    actionName: 'fetch-essopen-by-id',
    endpoint: 'HR',
    payload: { id: id }
  }),
  listEssOpen: (params: TableViewSearchParams<OpenAdvanceSearchParams>,step: number) => fetchDataPagingService<OpenEssDataItem, { step: number }>({
    actionName: 'list-ess-open',
    endpoint: 'HR',
    payload: { ...params.criteria,step:step },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),
  listEssOpenItem: (id: number,step:number,permissionLevel:'') => fetchDataListService<OpenEssDataItem, { id: number,step:number,permissionLevel:'' }>({
    actionName: 'list-ess-open-item',
    endpoint: 'HR',
    payload: { id: id, step: step,permissionLevel:permissionLevel }
  }),  
   
  // listEssOpenItem: (params: TableViewSearchParams<OpenAdvanceSearchParams>,id:number,step:number) => fetchDataPagingService<OpenEssDataItem, { id: number,step:number }>({
  //   actionName: 'list-ess-open-item',
  //   endpoint: 'HR',
  //   payload: {
  //     ...params.criteria,
  //     id: id,
  //     step: step
  //   },
  //   pagination: {
  //     pageSize: params.pagination?.pageSize,
  //     page: params.pagination?.current,
  //   },
  // }), 
  
  saveOpenAnnounce: (data: OpenEssDataItem) => execDataService0<OpenEssDataItem>({
    actionName: 'save-create-announce-open',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  
  closeAnnounce: (data: OpenEssDataItem) => execDataService0<OpenEssDataItem>({
    actionName: 'close-announce',
    endpoint: 'HR',
    payload: { ...data }
  }), 

}