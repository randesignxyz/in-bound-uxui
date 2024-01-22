import { execDataService, fetchDataItemService, fetchDataListService } from '@/services/apiGateway';
import { QueueLayoutConfig, QueueLayoutItemList, QueueLayoutSaveParams } from './queue';

export const QueueServices = {

  fetchDefaultQueueLayout: fetchDataItemService<QueueLayoutItemList| undefined>({
    actionName: 'fetch-default-queue-layout',
    endpoint: 'DELIVERY'
  }),

  fetchListQueueLayout: fetchDataListService<QueueLayoutItemList>({
    actionName: 'list-all-queue-layout',
    endpoint: 'DELIVERY',
  }),

  fetchQueueLayoutDetail : (id: number) => fetchDataItemService<QueueLayoutConfig, {id: number;}>({
    actionName: 'fetch-queue-layout',
    endpoint: 'DELIVERY',
    payload: {id}
  }),

  saveQueueLayout: (data: QueueLayoutSaveParams) => execDataService<never, QueueLayoutSaveParams>({
    actionName: 'save-queue-layout',
    endpoint: 'DELIVERY',
    payload: data
  })
};
