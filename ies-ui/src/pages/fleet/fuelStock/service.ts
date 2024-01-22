import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import {
  FuelTransactionSearch,
  TankCreate,
  TankDTO,
  TankMonthlyEndingCreate,
  TankMonthlyEndingDTO,
  TankStatus,
  TankTransactionCreate,
  TankTransactionDTO,
} from './data';

const TankFuelAction = {
  save: (data: TankCreate): ServiceApiType<TankCreate> => ({
    actionName: 'save-tank-fuel',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),

  list: (id?: string): ServiceApiType<{ id?: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'FLEET',
    actionName: 'list-tank-fuel',
    payload: { id },
  }),

  deleteTank: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'EXEC',
    actionName: 'delete-tank-fuel',
    endpoint: 'FLEET',
    payload: { id },
  }),

  blockTank: (param: TankStatus): ServiceApiType<TankStatus> => ({
    type: 'EXEC',
    actionName: 'block-tank-fuel',
    endpoint: 'FLEET',
    payload: param,
  }),

  //============= Monthly tank =============
  saveMonthlyEnding: (data: TankMonthlyEndingCreate): ServiceApiType<TankMonthlyEndingCreate> => ({
    actionName: 'save-tank-monthly-closing',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),

  pageTankMonthlyClosing: (
    params: TableViewSearchParams<FuelTransactionSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'FLEET',
    actionName: 'page-tank-monthly-closing',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  // =============== Fuel Transaction ===============
  pageFuelTransaction: (
    params: TableViewSearchParams<FuelTransactionSearch>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'FLEET',
    actionName: 'page-tank-transaction',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  saveFuelTransaction: (data: TankTransactionCreate): ServiceApiType<TankTransactionCreate> => ({
    actionName: 'save-tank-transaction',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),
  deleteTransaction: (data: TankTransactionDTO): ServiceApiType<TankTransactionDTO> => ({
    actionName: 'delete-tank-transaction',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),
  voidTransaction: (data: TankTransactionDTO): ServiceApiType<TankTransactionDTO> => ({
    actionName: 'void-tank-transaction',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),
  // ==================== END ====================
};

export const TankFuelServiceAPI = (requestActions: RequestActions) => {
  return {
    list: (id?: string) =>
      singleRequest<TankDTO>(TankFuelAction.list(id))(requestActions) as Promise<TankDTO[]>,

    save: (data: TankCreate) =>
      singleRequest<{ data: string; message: string }>(TankFuelAction.save(data))(requestActions),
    deleteTank: (id: number) =>
      singleRequest<{ id: number }>(TankFuelAction.deleteTank(id))(requestActions),
    blockTank: (param: TankStatus) =>
      singleRequest<TankStatus>(TankFuelAction.blockTank(param))(requestActions),

    // =============== monthly tank ===============
    pageTankMonthlyEnding: (params: TableViewSearchParams<FuelTransactionSearch>) =>
      singleRequest<TankMonthlyEndingDTO>(TankFuelAction.pageTankMonthlyClosing(params))(
        requestActions,
      ) as Promise<Paging<TankMonthlyEndingDTO>>,

    saveTankMonthlyEnding: (data: TankMonthlyEndingCreate) =>
      singleRequest<{ data: string; message: string }>(TankFuelAction.saveMonthlyEnding(data))(
        requestActions,
      ),

    // =============== Fuel Transaction ===============
    pageFuelTransaction: (params: TableViewSearchParams<FuelTransactionSearch>) =>
      singleRequest<TankTransactionDTO>(TankFuelAction.pageFuelTransaction(params))(
        requestActions,
      ) as Promise<Paging<TankTransactionDTO>>,

    saveFuelTransaction: (data: TankTransactionCreate) =>
      singleRequest<{ data: string; message: string }>(TankFuelAction.saveFuelTransaction(data))(
        requestActions,
      ),

    voidTransaction: (data: TankTransactionDTO) =>
      singleRequest<{ data: string; message: string }>(TankFuelAction.voidTransaction(data))(
        requestActions,
      ),
    deleteTransaction: (data: TankTransactionDTO) =>
      singleRequest<{ id: number }>(TankFuelAction.deleteTransaction(data))(requestActions),
    // ============ END =============
  };
};
