import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import {
  exec,
  fetchDataItemService,
  fetchDataListService,
  findAll,
  RequestActions,
  ServiceApiType,
  singleRequest,
} from '@/services/apiGateway';
import { SalesTeamWorkLess } from '@/services/sale/data';
import {
  CountOrder,
  CustomerDistance,
  DeleteOrderItemParam,
  DeliveryCreate,
  OrderAdvanceParams,
  OrderDeliveryParam,
  OrderDto,
  OrderStatusHistoryCreate,
  PurchaseOrderDto,
} from './data';

const OrderAction = {
  list: (
    params: TableViewSearchParams<OrderAdvanceParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    actionName: 'page-invoice',
    endpoint: 'RETAILER',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  detail: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'RETAILER',
    actionName: 'detail-invoice',
    payload: { id },
  }),

  updateStatus: (param: OrderStatusHistoryCreate): ServiceApiType<OrderStatusHistoryCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'update-invoice-status',
    payload: param,
  }),

  listSalesTeamWork: (): ServiceApiType<undefined> => ({
    type: 'LIST_QUERY',
    actionName: 'list-sales-team-work',
    endpoint: 'SALE',
    payload: undefined,
  }),

  saveDelivery: (data: DeliveryCreate): ServiceApiType<DeliveryCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-delivery',
    payload: data,
  }),

  deleteOrderDelivery: (data: OrderDeliveryParam): ServiceApiType<OrderDeliveryParam> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'delete-delivery',
    payload: data,
  }),
  deleteOrderItem: (data: DeleteOrderItemParam): ServiceApiType<DeleteOrderItemParam> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'delete-order-item',
    payload: data,
  }),
};

export const OrderServiceAPI = (requestActions: RequestActions) => {
  return {
    listSalesTeamWork: () =>
      findAll<SalesTeamWorkLess>(OrderAction.listSalesTeamWork())(requestActions),
    listOrder: (params: TableViewSearchParams<OrderAdvanceParams>) =>
      singleRequest<PurchaseOrderDto>(OrderAction.list(params))(requestActions) as Promise<
        Paging<PurchaseOrderDto>
      >,
    detailOrder: (id: string) =>
      singleRequest<OrderDto>(OrderAction.detail(id))(requestActions) as Promise<OrderDto>,

    // orderItems: (params: TableViewSearchParams<OrderAdvanceParams>) =>
    //   singleRequest<OrderItems>(OrderAction.orderItem(params))(requestActions) as Promise<
    //     Paging<OrderItems>
    //   >,

    updateStatus: (param: OrderStatusHistoryCreate) =>
      exec<{ id: string; message: string }>(OrderAction.updateStatus(param))(requestActions),

    deleteOrderDelivery: (param: OrderDeliveryParam) =>
      exec<{ id: string; message: string }>(OrderAction.deleteOrderDelivery(param))(requestActions),

    deleteOrderItem: (param: DeleteOrderItemParam) =>
      exec<{ id: string; message: string }>(OrderAction.deleteOrderItem(param))(requestActions),

    saveDelivery: (params: DeliveryCreate) =>
      singleRequest<{ data: string; message: string }>(OrderAction.saveDelivery(params))(
        requestActions,
      ),
    //
    // CountOrder
    countOrder: fetchDataItemService<CountOrder>({
      actionName: 'count-order',
      endpoint: 'RETAILER',
      responseKey: 'countOrder',
      payload: {},
    }),

    fetchCutomers: (latitude: number, longitude: number, searchText?: string) =>
      fetchDataListService<
        CustomerDistance,
        { latitude: number; longitude: number; searchValue?: string }
      >({
        actionName: 'calculate_distance',
        payload: { searchValue: searchText, latitude: latitude, longitude: longitude },
        endpoint: 'CRM',
        responseKey: 'customers',
      }),
  };
};
