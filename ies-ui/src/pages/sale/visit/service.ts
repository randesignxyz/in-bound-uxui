// import { TableViewSearchParams } from '@/components/DataCrud/TableView';
// import { Paging } from '@/services/API';
// import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';

// const FuelAction = {
//   page: (
//     params: TableViewSearchParams<FuelAvanceSearchParam>,
//   ): ServiceApiType<{ searchValue?: string }> => ({
//     type: 'PAGING_QUERY',
//     endpoint: 'FLEET',
//     actionName: 'page-fuel',
//     payload: { ...params.criteria },
//     pagination: {
//       pageSize: params.pagination?.pageSize,
//       page: params.pagination?.current,
//     },
//   }),

//   list: (id: string): ServiceApiType<{ id?: string }> => ({
//     type: 'LIST_QUERY',
//     actionName: 'list-fuel',
//     endpoint: 'FLEET',
//     payload: { id },
//   }),
//   listByTank: (id: number): ServiceApiType<{ id?: number }> => ({
//     type: 'LIST_QUERY',
//     actionName: 'list-by-tank',
//     endpoint: 'FLEET',
//     payload: { id },
//   }),

//   summary: (param: FuelAvanceSearchParam): ServiceApiType<FuelAvanceSearchParam> => ({
//     type: 'LIST_QUERY',
//     actionName: 'summary-fuel',
//     endpoint: 'FLEET',
//     payload: param,
//   }),

//   save: (data: FuelCreate): ServiceApiType<FuelCreate> => ({
//     actionName: 'save-fuel',
//     endpoint: 'FLEET',
//     type: 'EXEC',
//     payload: data,
//   }),
//   void: (data: FuelDTO): ServiceApiType<FuelDTO> => ({
//     actionName: 'void-fuel',
//     endpoint: 'FLEET',
//     type: 'EXEC',
//     payload: data,
//   }),
//   delete: (data: FuelDTO): ServiceApiType<FuelDTO> => ({
//     actionName: 'delete-fuel',
//     endpoint: 'FLEET',
//     type: 'EXEC',
//     payload: data,
//   }),
//   fetchFuelByVehicle: (id?: string): ServiceApiType<{ id?: string }> => ({
//     actionName: 'fetch-fuel',
//     endpoint: 'FLEET',
//     type: 'FETCH_QUERY',
//     payload: { id },
//   }),
// };

// export const FuelServiceAPI = (requestActions: RequestActions) => {
//   return {
//     page: (params: TableViewSearchParams<FuelAvanceSearchParam>) =>
//       singleRequest<FuelDTO>(FuelAction.page(params))(requestActions) as Promise<Paging<FuelDTO>>,

//     save: (data: FuelCreate) =>
//       singleRequest<{ data: string; message: string }>(FuelAction.save(data))(requestActions),
//     void: (data: FuelDTO) =>
//       singleRequest<{ data: string; message: string }>(FuelAction.void(data))(requestActions),
//     delete: (data: FuelDTO) =>
//       singleRequest<{ data: string; message: string }>(FuelAction.delete(data))(requestActions),
//     list: (id: string) =>
//       singleRequest<FuelDTO>(FuelAction.list(id))(requestActions) as Promise<FuelDTO[]>,
//     listTank: (id: number) =>
//       singleRequest<FuelDTO>(FuelAction.listByTank(id))(requestActions) as Promise<FuelDTO[]>,
//     summary: (data: FuelAvanceSearchParam) =>
//       singleRequest<TruckSummary>(FuelAction.summary(data))(requestActions) as Promise<
//         TruckSummary[]
//       >,

//     fetchFuelVehicle: (id?: string) =>
//       singleRequest<FuelDTO>(FuelAction.fetchFuelByVehicle(id))(requestActions) as Promise<FuelDTO>,
//   };
// };
