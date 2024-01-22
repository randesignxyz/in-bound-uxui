import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import {
  AccessoriesCreate,
  AccessoriesDTO,
  AccessoriesSearchParam,
  AddVehicleAccessory,
} from './data';

const AccessoryAction = {
  page: (
    params: TableViewSearchParams<AccessoriesSearchParam>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    actionName: 'page-accessory',
    endpoint: 'FLEET',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  save: (data: AccessoriesCreate): ServiceApiType<AccessoriesCreate> => ({
    actionName: 'save-accessory',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),

  addAccessorieTovehicle: (data: AddVehicleAccessory): ServiceApiType<AddVehicleAccessory> => ({
    endpoint: 'FLEET',
    actionName: 'save-accessory-to-vehicle',
    type: 'EXEC',
    payload: data,
  }),

  listAccessoriesByVehicle: (id: string): ServiceApiType<{ id: string }> => ({
    type: 'LIST_QUERY',
    actionName: 'list-accessory-by-vehicle',
    endpoint: 'FLEET',
    payload: { id },
  }),

  delete: (id: number): ServiceApiType<{ id: number }> => ({
    actionName: 'delete-accessory',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: { id },
  }),
};

export const AccessoryServiceAPI = (requestActions: RequestActions) => {
  return {
    page: (params: TableViewSearchParams<AccessoriesSearchParam>) =>
      singleRequest<AccessoriesDTO>(AccessoryAction.page(params))(requestActions) as Promise<
        Paging<AccessoriesDTO>
      >,

    save: (data: AccessoriesCreate) =>
      singleRequest<{ data: string; message: string }>(AccessoryAction.save(data))(requestActions),
    delete: (id: number) =>
      singleRequest<{ data: string; message: string }>(AccessoryAction.delete(id))(requestActions),

    addAccessoriesToVehicle: (params: AddVehicleAccessory) =>
      singleRequest<{ data: string; message: string }>(
        AccessoryAction.addAccessorieTovehicle(params),
      )(requestActions),

    list: (id: string) =>
      singleRequest<AccessoriesDTO>(AccessoryAction.listAccessoriesByVehicle(id))(
        requestActions,
      ) as Promise<AccessoriesDTO[]>,
  };
};
