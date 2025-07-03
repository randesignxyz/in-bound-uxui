import { RequestActions, ServiceApiType, singleRequest, findAllService, findMultiService } from "@/services/apiGateway";
import { AddressParams, AddresssView, DoRequireCustomerList, RegisterCuistomerInfoAdvanceSearchParams, RegisterCustomer, RegisterCustomerDetailResponse, RegisterCustomerListItem, RegisterCustomerWFPayload, RegisterItemBrandList, RegisterPPItemList, SaveRegisterCustomerAddressParams } from "./data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
// import {
//   downloadReport,
//   exec,
//   execService,
//   find,
//   findAll,
//   findAllService,
//   findMultiService,
//   findPaging,
//   findPagingService,
//   findService,
//   RequestActions,
//   ServiceApiType,
// } from '../apiGateway';
import detail from "../gratis/request/detail";
import { TaskActionDataParam } from "@/services/process-workflow/params";
import { LookupDataType } from "@/services/data";
import { Locations } from "@/services/crm/data";
import { InitData } from "./model";

export type LocationType = 'PROVINCE' | 'DISTRICT' | 'COMMUNE' | 'VILLAGE' | 'REGION' | 'DIVISION';
type LocationsParams = {
  type: LocationType;
  parentId?: number;
};
export type InitCustomerParamsType ={
    actionName: 'locations';
    responseKey: string;
    payload: LocationsParams;
  }
  | {
    actionName: 'outletTypeList';
    payload: {};
  }
  | {
    actionName: 'sale';
    responseKey: string;
    payload: {};
  }
  | {
    actionName: 'lookupDataList';
    payload: { list: LookupDataType[] };
  } | undefined;


export const RegisterCustomerParams = {
    list: (
      params: TableViewSearchParams<RegisterCuistomerInfoAdvanceSearchParams>,
    ): ServiceApiType<{ searchValue?: string }> => ({
      type: 'PAGING_QUERY',
      endpoint: 'CRM',
      actionName: 'list-register-customer',
      payload: { ...params.criteria },
      pagination: {
        pageSize: params.pagination?.pageSize,
        page: params.pagination?.current,
      },
    }),    
    save: (params: RegisterCustomer): ServiceApiType<RegisterCustomer> => ({
        type: 'EXEC',
        endpoint: 'CRM',
        actionName: 'save-register-customer',
        payload: { ...params },
    }),
    submit:  (params: RegisterCustomer): ServiceApiType<RegisterCustomer> => ({
      type: 'EXEC',
      endpoint: 'CRM',
      actionName: 'submit-register-customer',
      payload: { ...params },
    }),
    cancelForm:  (id: number): ServiceApiType<RegisterCustomer> => ({
      type: 'EXEC',
      endpoint: 'CRM',
      actionName: 'cancel-register-customer',
      payload: { id},
    }),
    detail: (id: number): ServiceApiType<{ id: number }> => ({
      type: 'FETCH_QUERY',
      endpoint: 'CRM',
      actionName: 'fetch-register-customer',
      payload: { id },
    }),
    detailByProcessFlow: (id: string): ServiceApiType<{ id: string }> => ({
      type: 'FETCH_QUERY',
      endpoint: 'CRM',
      actionName: 'detail-rc-by-process-flow',
      payload: { id },
    }),
   
    listAddressDetailByCustomerId: (params:{id: number,type: string}): ServiceApiType<{ id: number }> => {
      return ({
        type: 'LIST_QUERY',
        endpoint: 'CRM',
        actionName: 'list-address-detail-by-register-customer-id',
        payload: {...params},
      });
    },
    saveAddress: (params: SaveRegisterCustomerAddressParams): ServiceApiType<SaveRegisterCustomerAddressParams> => ({
        type: 'EXEC',
        endpoint: 'CRM',
        actionName: 'save-register-customer-address',
        payload: { ...params },
    }),
    removeAddress: (params: AddressParams): ServiceApiType<AddressParams> => ({
        type: 'EXEC',
        endpoint: 'CRM',
        actionName: 'remove-register-customer-address',
        payload: { ...params },
    }),
    listRegisterPPItem: (): ServiceApiType<{}> => {
      return ({
        type: 'LIST_QUERY',
        endpoint: 'CRM',
        actionName: 'list-register-pp-item',
        payload:{} ,
      });
    },
    listRegisterItemBrand: (): ServiceApiType<{}> => {
      return ({
        type: 'LIST_QUERY',
        endpoint: 'CRM',
        actionName: 'list-register-item-brand',
        payload: {},
      });
    },
    listDocRequirement: (): ServiceApiType<{}> => {
      return ({
        type: 'LIST_QUERY',
        endpoint: 'CRM',
        actionName: 'list-register-doc-requirement',
        payload: {},
      });
    },
    updateFinanceProcess: (params: TaskActionDataParam<RegisterCustomerWFPayload>): ServiceApiType<TaskActionDataParam<RegisterCustomerWFPayload>> => ({
        type: 'EXEC',
        endpoint: 'CRM',
        actionName: 'update-register-customer-finance-process',
        payload: { ...params },
    }),
    postToSAP: (id: number): ServiceApiType<RegisterCustomer> => ({
        type: 'EXEC',
        endpoint: 'CRM',
        actionName: 'post-customer-to-sap',
        payload: {id },
    }),

}
export const RegisterCustomerServiceAPI = (requestActions?: RequestActions) => {

    return{
      list: (params: TableViewSearchParams<RegisterCuistomerInfoAdvanceSearchParams>) => singleRequest<RegisterCustomerListItem>(RegisterCustomerParams.list(params))(requestActions) as Promise<Paging<RegisterCustomerListItem>>,
      save: (params: RegisterCustomer) => singleRequest(RegisterCustomerParams.save(params))(requestActions),
      submit: (params: RegisterCustomer) => singleRequest(RegisterCustomerParams.submit(params))(requestActions),
      cancelForm: (id: number) => singleRequest(RegisterCustomerParams.cancelForm(id))(requestActions),
      detail: (id: number) => singleRequest(RegisterCustomerParams.detail(id))(requestActions) as Promise<RegisterCustomerDetailResponse>,
      detailByProcessFlow: (id: string) => singleRequest(RegisterCustomerParams.detailByProcessFlow(id))(requestActions) as Promise<RegisterCustomerDetailResponse>,
      listAddressDetailByCustomerId: (params:{id: number,type:string}) => singleRequest(RegisterCustomerParams.listAddressDetailByCustomerId(params))(requestActions) as Promise<AddresssView[]>,
      saveAddress: (params: SaveRegisterCustomerAddressParams) => singleRequest(RegisterCustomerParams.saveAddress(params))(requestActions),
      removeAddress: (params: AddressParams) => singleRequest(RegisterCustomerParams.removeAddress(params))(requestActions),
      listRegisterPPItem: () => singleRequest(RegisterCustomerParams.listRegisterPPItem())(requestActions) as Promise<RegisterPPItemList[]>,
      listRegisterItemBrand: () => singleRequest(RegisterCustomerParams.listRegisterItemBrand())(requestActions) as Promise<RegisterItemBrandList[]>,
      listDocRequirement: () => singleRequest(RegisterCustomerParams.listDocRequirement())(requestActions) as Promise<DoRequireCustomerList[]>,
      updateFinanceProcess: (params: TaskActionDataParam<RegisterCustomerWFPayload>) => singleRequest(RegisterCustomerParams.updateFinanceProcess(params))(requestActions),
      initCustomerData: findMultiService<InitCustomerParamsType, InitData>({type: 'CRM'}, requestActions),
      findAllLocations: findAllService<LocationsParams, Locations>({type: 'CRM',name:'locations'}, requestActions),
      findLocationByParents: findAllService<{ ids: number[] }, Locations>({type: 'CRM',name:'get-location-by-parents'}, requestActions),
      postToSAP: (id: number) => singleRequest(RegisterCustomerParams.postToSAP(id))(requestActions),
    }
    

}