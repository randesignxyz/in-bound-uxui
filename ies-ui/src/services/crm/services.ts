import { SortOrder } from 'antd/lib/table/interface';
import moment, { Moment } from 'moment';
import { Pagination, ServiceType } from '../API';
import {
  downloadReport,
  exec,
  execService,
  find,
  findAll,
  findAllService,
  findMultiService,
  findPaging,
  findPagingService,
  findService,
  RequestActions,
  ServiceApiType,
} from '../apiGateway';
import { LookupData, LookupDataItem, LookupDataType } from '../data';
import { Distributor } from '../sale/data';
import { ContactData, ContactDetail, ContactListItem } from './contact';
import { CompleteContractData, ContractData, ContractLess, SubContractType } from './contract';

import {
  AddressData,
  AddressInfo,
  AddresssView,
  BasicData,
  ContractDetail,
  ContractTerm,
  ContractTermData,
  CustomerItemLess,
  CustomerSearchResult,
  CustomerView,
  FindCustomerParams,
  FindSettlementPlanParams,
  IntialSponsor,
  Locations,
  NotificationLess,
  PurchaseEstData,
  SaveCustomer,
  SaveNotification,
  SettlementPlan1,
  SettlementScheduleDetail,
  SettlementScheduleItemList,
  SettlementScheduleSaveData,
  UploadVisitPlanResponse,
  VisitPlanListItem,
  VisitScheduleDetail,
  VisitScheduleGenItem,
  VisitScheduleItem,
} from './data';

export type CrmServiceName =
  | 'outletTypeList'
  | 'regionList'
  | 'channelTypeList'
  | 'supplySourceList'
  | 'seList'
  | 'shippingChannelList'
  | 'locationList'
  | 'listCustomer'
  | 'listBusiness'
  | 'listBusinessLess'
  | 'listAddressByCustomerId'
  | 'searchCustomer'
  | 'createCustomer'
  | 'customerDetail'
  | 'saveCustomer'
  | 'saveCustomerBasic'
  | 'getAddress'
  | 'addBiz'
  | 'saveBiz'
  | 'provinceList'
  | 'districtList'
  | 'productList'
  | 'itemList'
  | 'lookupDataList'
  | 'communeList'
  | 'villageList'
  | 'findContactTypeByCode'
  | 'business'
  | 'shippingChannel'
  | 'customer'
  | 'get-address-by-customer-id'
  | 'outletType'
  | 'region'
  | 'channelType'
  | 'salePerson'
  | 'listContract'
  | 'listSubContractType'
  | 'contract'
  | 'find-contract'
  | 'saveContact'
  | 'saveAddress'
  | 'removeContact'
  | 'contractLess'
  | 'generatePlan'
  | 'getGratisSettlement'
  | 'location'
  | 'locations'
  | 'gratis'
  | 'settlementInfoByContract'
  | 'saveSettlementPlan'
  | 'listSettlementPlan'
  | 'listPageSettlementPlan'
  | 'get-settlement-plan'
  | 'find-settlement-plan'
  | 'createGratisSettlement'
  | 'listGratis'
  | 'listContractPaging'
  | 'saveVisitPlan'
  | 'getVisiPlanList'
  | 'product'
  | 'check-initial-sponsor'
  | 'save-settlement'
  | 'save-basic-settlement'
  | 'save-settlement-item'
  | 'create-contract'
  | 'save-contract'
  | 'check-initial-sponsor'
  | 'get-contract-term'
  | 'save-contract-term-temp'
  | 'save-contract-term'
  | 'contract-doc-temp-export'
  | 'renew-contract'
  | 'cancel-contract'
  | 'attach'
  | 'save-purchase-est'
  | 'settlement-search-customer'
  | 'save-settlement-schedule'
  | 'save-settlement-schedule-general'
  | 'save-settlement-schedule-customers'
  | 'find-settlement-schedule'
  | 'list-settlement-schedule'
  | 'force-run-settlement-schedule'
  | 'list-visit-plan'
  | 'list-visit-schedule'
  | 'get-visit-plan-item'
  | 'create-visit-schedule'
  | 'list-visit-schedule'
  | 'list-visit-schedule-gen'
  | 'list-visit-schedule-by-customer'
  | 'get-visit-schedule'
  | 'get-location-by-parents'
  | 'cancel-visit-schedule'
  | 'save-full-visit-plan'
  | 'remove-visit-plan'
  | 'removeAddress'
  | 'search-basic-customer'
  | 'list-address-by-customer'
  | 'sales-person-by-customer'
  | 'list-visit-schedule-by-date'
  | 'list-incentive-scheme'
  | 'save-incentive-scheme'
  | 'find-incentive-scheme'
  | 'list-contact'
  | 'save-contact'
  | 'find-contact'
  | 'fetch-contact'
  | 'assign-contact-to-customer'
  | 'un-assign-contact-to-customer'
  | 'new-contact-assign-to-customer'
  | 'list-uploaded-visit-plan-by-file-id'
  | 'save-uploaded-visit-plan-by-file-id'
  | 'fetch-salesperson-by-customer'
  | 'delete-visit-plan'
  | 'find-distributor'
  | 'list-contract'
  | 'regiion'
  | 'division'
  | 'list-notification'
  | 'detail-notification'
  | 'save-notification'
  | 'send-notification-with-id'
  | 'list-visit-plan-by-customer-id'
  | 'list-address-detail-by-customer-id'
  | 'promote-customer'

export const CrmService = (serviceName?: CrmServiceName): ServiceType => {
  return {
    type: 'CRM',
    name: serviceName,
  };
};

export type LocationType = 'PROVINCE' | 'DISTRICT' | 'COMMUNE' | 'VILLAGE' | 'REGION' | 'DIVISION';

type LocationsParams = {
  type: LocationType;
  parentId?: number;
};

export type InitVisitScheduleParamsType =
  | {
    actionName: 'sale';
    responseKey: string;
    payload: {};
  }
  | {
    actionName: 'listCustomer';
    responseKey: string;
    payload: {};
  }
  | {
    actionName: 'lookupDataList';
    responseKey: string;
    payload: {};
  }
  | {
    actionName: 'region';
    responseKey: string;
    payload: {};
  }
  | {
    actionName: 'division';
    responseKey: string;
    payload: {};
  }
  | undefined;

export type InitCustomerParamsType =
  | {
    actionName: 'customer';
    type: 'Single';
    payload: {
      id: number;
    };
  }
  | {
    actionName: 'get-address-by-customer-id';
    type: 'Single';
    responseKey: string;
    payload: {
      id: number;
    };
  }
  | {
    actionName: 'list-incentive-scheme';
    responseKey: 'incentiveSchemeList';
    payload: {};
  }
  | {
    actionName: 'listSubContractType';
    responseKey: 'subContractTypeList';
    payload: {
      id: number;
    };
  }
  | {
    actionName: 'listAddressByCustomerId';
    responseKey: string;
    payload: {
      id: number;
    };
  }
  | {
    actionName: 'shippingChannelList';
    payload: {
      id?: number;
    };
  }
  | {
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
  }
  | {
    actionName: 'product';
    responseKey: 'productList';
    payload: {};
  }
  | {
    actionName: 'item';
    responseKey: 'itemList';
    payload: {};
  }
  | {
    actionName: 'locations';
    responseKey: 'regionList';
    payload: {};
  }
  | {
    actionName: 'list-region-by-provinces';
    responseKey: 'regionList';
    payload: {
      ids: number[];
    };
  }
  | {
    actionName: 'list-supply-source-by-provinces';
    responseKey: 'supplySources';
    payload: {
      ids: number[];
    };
  }
  | {
    actionName: 'get-current-salesperson';
    responseKey: 'currentSalesperson';
    type: 'Single';
    payload: {};
  }
  | undefined;

const ReqParams = {
  disableCustomer: (id: number, remarks: string): ServiceApiType<{ id: number; remarks: string; }> => ({
    type: 'EXEC',
    endpoint: 'CRM',
    actionName: 'disable-customer',
    payload: { id: id, remarks },
  }),

  activateCustomer: (id: number, remarks: string): ServiceApiType<{ id: number; remarks: string; }> => ({
    type: 'EXEC',
    endpoint: 'CRM',
    actionName: 'activate-customer',
    payload: { id: id, remarks },
  }),

  transferCustomer: (
    id: number,
    salespersonId: number,
    remarks?: string,
  ): ServiceApiType<{ id: number; salespersonId: number; remarks?: string }> => ({
    type: 'EXEC',
    endpoint: 'CRM',
    actionName: 'transfer-customer',
    payload: { id: id, salespersonId: salespersonId, remarks: remarks },
  }),
};

const ReqContactParams = {
  fetchContact: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'CRM',
    actionName: 'find-contact',
    payload: { id: id },
  }),

  listContact: (
    searchValue?: string,
    pagination?: Pagination,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'CRM',
    actionName: 'list-contact',
    payload: { searchValue: searchValue },
    pagination: pagination,
  }),

  assignContactToCustomer: (
    contactId: number,
    customerId: number,
  ): ServiceApiType<{ id: number; customerId: number }> => ({
    type: 'EXEC',
    endpoint: 'CRM',
    actionName: 'assign-contact-to-customer',
    payload: { id: contactId, customerId: customerId },
  }),

  completeContract: (data: CompleteContractData): ServiceApiType<CompleteContractData> => ({
    type: 'EXEC',
    endpoint: 'CRM',
    actionName: 'complete-contract',
    payload: data,
  }),
};

const listLookupData = (
  typeList: LookupDataType[],
): ServiceApiType<{ list: LookupDataType[] }> => ({
  type: 'LIST_QUERY',
  endpoint: 'CRM',
  actionName: 'lookupDataList',
  responseKey: 'list',
  payload: {
    list: typeList,
  },
});

export const CrmServiceAPI = (actions?: RequestActions) => ({
  findAllNotifications: findPagingService<
    { searchValue?: string; sort?: Record<string, SortOrder> },
    NotificationLess
  >(CrmService('list-notification'), actions),

  promoteCustomer: execService<{ customerId: number; newCode: string; remarks: string }, any>(
    CrmService('promote-customer'),
    actions,
  ),

  // findAllNotifications: findAllService<
  //   { searchValue?: string; sort?: Record<string, SortOrder> },
  //   NotificationLess
  // >(CrmService('list-notification'), actions),

  sendNotificationWithId: execService<{ id: number }, { data: string; message: string }>(
    CrmService('send-notification-with-id'),
    actions,
  ),

  saveNotification: execService<SaveNotification, { message: string; id: number }>(
    CrmService('save-notification'),
    actions,
  ),
  detailNotification: findService<{ id: number }, NotificationLess>(
    CrmService('detail-notification'),
    actions,
  ),
  //reports
  dowloadVistScheduleReport: downloadReport<{
    status?: string[];
    scheduleType?: string[];
    salespersonId?: number[];
    scheduleDate?: moment.Moment[];
    completedDate?: moment.Moment[];
  }>(actions),

  downloadPosmReport: downloadReport<{
    scheduleType?: string[];
    salespersonId?: number[];
    scheduleDate?: moment.Moment[];
    divisionId?: number[];
    regionId?: number[];
  }>(actions),

  downloadStockCountReport: downloadReport<{
    reportType: string;
    scheduleType?: string[];
    salespersonId?: number[];
    scheduleDate?: moment.Moment[];
  }>(actions),

  downloadProductivityReport: downloadReport<{
    scheduleType?: string[];
    salespersonId?: number[];
    scheduleDate?: moment.Moment[];
  }>(actions),

  inactiveCustomer: (id: number, remarks: string) => exec(ReqParams.disableCustomer(id, remarks))(actions),
  activateCustomer: (id: number, remarks: string) => exec(ReqParams.activateCustomer(id, remarks))(actions),

  transferCustomer: (id: number, salespersonId: number, remarks?: string) =>
    exec(ReqParams.transferCustomer(id, salespersonId, remarks))(actions),

  // loadMulti: () =>MultiRequest<{lookupDataList: LookupData[], }>([listLookupData(['GENDER', 'CONTACT_TYPE']),ReqContactParams.fetchContact(1)])(actions),

  listLookupData: (typeList: LookupDataType[]) =>
    findAll<LookupData>(listLookupData(typeList))(actions),

  //Customer
  findAllCustomer: findPagingService<
    { searchValue?: string; advanceSearch?: any, sort?: Record<string, SortOrder> },
    CustomerItemLess
  >(CrmService('searchCustomer'), actions),

  findDetailCustomer: findService<{ id: number }, CustomerView>(
    CrmService('customerDetail'),
    actions,
  ),

  findAllLocations: findAllService<LocationsParams, Locations>(CrmService('locations'), actions),

  findLocationByParents: findAllService<{ ids: number[] }, Locations>(
    CrmService('get-location-by-parents'),
    actions,
  ),

  // CH: 12/10/2021
  initialModalData: findService<{ id: string }, UploadVisitPlanResponse>(
    CrmService('list-uploaded-visit-plan-by-file-id'),
    actions,
  ),
  saveModalData: execService<{ id: string }, { message: string }>(
    CrmService('save-uploaded-visit-plan-by-file-id'),
    actions,
  ),

  initCustomerData: findMultiService<InitCustomerParamsType, {}>(CrmService(), actions),
  initVisitScheduleData: findMultiService<InitVisitScheduleParamsType, {}>(CrmService(), actions),
  checkInitialSponsor: findService<{ id: number }, IntialSponsor>(
    CrmService('check-initial-sponsor'),
    actions,
  ),

  saveCustomer: execService<SaveCustomer, { id: number }>(CrmService('createCustomer'), actions),
  saveCustomerBasic: execService<
    {
      id: number;
      basicInfo: Omit<BasicData, 'mainChannel' | 'subChannel'>;
    },
    {}
  >(CrmService('saveCustomerBasic'), actions),

  /********Contract***********/
  listContract: findPagingService<{ searchValue?: string }, ContractLess>(
    CrmService('list-contract'),
    actions,
  ),
  findContract: findService<{ id: number }, ContractDetail>(CrmService('find-contract'), actions),

  createContract: execService<ContractData, { id: number; requestNo?: string }>(
    CrmService('create-contract'),
    actions,
  ),
  saveContract: execService<ContractData, { id: number }>(CrmService('save-contract'), actions),

  findContractTerm: findService<{ id: number }, ContractTerm>(
    CrmService('get-contract-term'),
    actions,
  ),
  saveContractTermTemp: execService<ContractTermData, { id: string }>(
    CrmService('save-contract-term-temp'),
  ),
  saveContractTerm: execService<ContractTermData, { id: string }>(CrmService('save-contract-term')),
  renewContract: execService<
    { currentContractId: number; expiryDate: moment.Moment; remarks?: string },
    { id: number }
  >(CrmService('renew-contract')),
  cancelContract: execService<{ id: number }, { id: number }>(CrmService('cancel-contract')),

  completeContract: (data: CompleteContractData) =>
    exec(ReqContactParams.completeContract(data))(actions),

  /********Contact***********/
  fetchContact: (id: number) => find<ContactDetail>(ReqContactParams.fetchContact(id))(actions),
  listContact: (searchValue?: string, pagination?: Pagination) =>
    findPaging<ContactListItem>(ReqContactParams.listContact(searchValue, pagination))(actions),
  assignContact: (contactId: number, customerId: number) =>
    exec(ReqContactParams.assignContactToCustomer(contactId, customerId))(actions),
  //listContact: findPagingService<{ searchValue?: string; }, ContactListItem>(CrmService('list-contact'), actions),
  saveContact: execService<ContactData, ContactListItem>(CrmService('save-contact'), actions),
  fetchContactDetail: findService<{ id: number }, ContactDetail>(
    CrmService('find-contact'),
    actions,
  ),
  removeContact: execService<{ id: number }, {}>(CrmService('removeContact'), actions),
  fetchContat: findService<{ id: number }, ContactData>(CrmService('fetch-contact'), actions),
  assignContactToCustomer: execService<{ id: number; customerId: number }, {}>(
    CrmService('assign-contact-to-customer'),
    actions,
  ),
  unassignContactToCustomer: execService<{ id: number; customerId: number }, {}>(
    CrmService('un-assign-contact-to-customer'),
    actions,
  ),
  newContactAndAssignToCustomer: execService<{ contact: ContactData; customerId: number }, {}>(
    CrmService('new-contact-assign-to-customer'),
    actions,
  ),

  saveAddress: execService<{ customerId?: number; address: AddressData }, { id: number }>(
    CrmService('saveAddress'),
    actions,
  ),
  removeAddress: execService<{ id?: number }, { id: number }>(CrmService('removeAddress'), actions),
  // saveVisitPlan: execService<{ id?: number, visitPlan: number[], autoCreateSchedule: boolean, numDaysBefore?: number, remarks?: string }, {}>(CrmService('saveVisitPlan'), actions),

  /************* Visit Plan **************/
  saveVisitPlan: execService<
    { id?: number; customerAddressId: number; visitPlan: number[]; numDaysBefore?: number; remarks?: string },
    {}
  >(CrmService('saveVisitPlan'), actions),
  deleteVisitPlan: execService<{ id: number; remarks: string }, {}>(
    CrmService('remove-visit-plan'),
    actions,
  ),
  saveFullVisitPlan: execService<
    { id?: number; visitPlan: number[]; addressId: number },
    { id: number }
  >(CrmService('save-full-visit-plan'), actions),

  exportCustomer: downloadReport<{
    regionId?: number[];
    provinceId?: number[];
    salespersonId?: number[];
    customerTypeId?: number[];
    outletTypeId?: number[];
    source?: string[];
    status?: string[];
    neverVisit?: boolean;
    neverVisitDate?: Moment;
    hasNoPlan?: boolean;
    billingAddressOnly?: boolean;
  }>(actions),

  downloadVisitPlan:
    downloadReport<{ regionId?: number[]; provinceId?: number[]; salespersonId?: number[] }>(
      actions,
    ),
  savePurchaseEst: execService<{ id?: number; items: PurchaseEstData[] }, {}>(
    CrmService('save-purchase-est'),
    actions,
  ),
  attachFiles: execService<
    { fileIdList: string[]; attachToId: number; attachTo: 'CUSTOMER' | 'CONTRACT' },
    {}
  >(CrmService('attach'), actions),

  findAddress: findService<{ id: number }, AddressData>(CrmService('getAddress'), actions),
  // listAddressByCustomerId: findAllService<{ id: number }, AddressInfo>(CrmService('listAddressByCustomerId'), actions),

  listAddressByCustomer: findAllService<{ id: number }, AddressInfo>(
    CrmService('list-address-by-customer'),
    actions,
  ),
  salespersonByCustomer: findService<{ id: number }, LookupDataItem>(
    CrmService('fetch-salesperson-by-customer'),
    actions,
  ),

  findBasicInfo: findService<{ id: number }, Omit<BasicData, 'mainChannel' | 'subChannel'>>(
    CrmService('customer'),
    actions,
  ),

  listSubContract: findAllService<{ id: number }, SubContractType>(
    CrmService('listSubContractType'),
    actions,
  ),
  findVisiPlanList: findAllService<{ id: number }, LookupData>(
    CrmService('getVisiPlanList'),
    actions,
  ),
  findProductList: findAllService<{ id: number }, LookupDataItem>(CrmService('product'), actions),
  findShippingChennelList: findAllService<{ id: number }, LookupDataItem>(
    CrmService('shippingChannelList'),
    actions,
  ),
  //Settlement

  getSettlemPlans: findAllService<{ settleDate: moment.Moment }, SettlementPlan1>(
    CrmService('get-settlement-plan'),
    actions,
  ),
  findSettlementPlans: findAllService<FindSettlementPlanParams, SettlementPlan1>(
    CrmService('find-settlement-plan'),
    actions,
  ),
  listAddressByCustomerId: findAllService<{ id: number }, AddressInfo>(
    CrmService('listAddressByCustomerId'),
    actions,
  ),

  listAddressDetailByCustomerId: findAllService<{ id: number }, AddresssView>(
    CrmService('list-address-detail-by-customer-id'),
    actions,
  ),

  listVisitPlanByCustomerId: findAllService<{ id: number }, VisitPlanListItem>(
    CrmService('list-visit-plan-by-customer-id'),
    actions
  ),
  //Temp Removed
  // findAllGratisSettlement: findPagingService<{ searchValue?: string; }, GratisSettlement>(CrmService('listGratis'), actions),
  // findGratisSettlement: findService<{ id: number }, GratisSettlement>(CrmService('gratis'), actions),
  // addSettlement: execService<CreateSettlementFormData, any>(CrmService('createGratisSettlement'), actions),
  // findAllRegions: findAllService<any, Region>(CrmService('regionList'), actions),

  // saveSettlement: execService<SaveSettlement, any>(CrmService('save-settlement'), actions),
  // saveBasicSettlement: execService<BasicInfo, any>(CrmService('save-basic-settlement'), actions),
  // saveSettlementItems: execService<SaveSettlementItems, any>(CrmService('save-settlement-item'), actions),

  downloadContractDocTemp: downloadReport<{ id: number; tempId?: string }>(actions),
  viewContractRequestForm: downloadReport<{ id: number }>(actions),

  //Settlement schedule
  seachSettlementCustomer: findPagingService<FindCustomerParams, CustomerSearchResult>(
    CrmService('settlement-search-customer'),
    actions,
  ),

  saveSettlementShedule: execService<SettlementScheduleSaveData, { id: number }>(
    CrmService('save-settlement-schedule'),
    actions,
  ),
  forceRun: execService<{ id: number; reason: string }, { id: number }>(
    CrmService('force-run-settlement-schedule'),
    actions,
  ),
  saveSettlementSheduleGeneral: execService<SettlementScheduleSaveData, { id: number }>(
    CrmService('save-settlement-schedule-general'),
    actions,
  ),
  saveSettlementSheduleCustomers: execService<{ id: number; customers: number[] }, { id: number }>(
    CrmService('save-settlement-schedule-customers'),
    actions,
  ),

  findSettlementSchedule: findService<{ id: number }, SettlementScheduleDetail>(
    CrmService('find-settlement-schedule'),
    actions,
  ),
  listSettlementSchedules: findPagingService<{}, SettlementScheduleItemList>(
    CrmService('list-settlement-schedule'),
    actions,
  ),
  listVisitPlan: findPagingService<
    { searchValue?: string; sort?: Record<string, SortOrder> },
    VisitPlanListItem
  >(CrmService('list-visit-plan'), actions),

  getVisitSchedule: findService<{ id: number }, VisitScheduleDetail>(
    CrmService('get-visit-schedule'),
    actions,
  ),
  listVisitSchedule: findPagingService<
    { searchValue?: string; sort?: Record<string, SortOrder> },
    VisitScheduleItem
  >(CrmService('list-visit-schedule'), actions),
  listVisitScheduleByDate: findAllService<{ date: moment.Moment }, VisitScheduleItem>(
    CrmService('list-visit-schedule-by-date'),
    actions,
  ),

  listVisitScheduleByCustomer: findPagingService<{ id: number; status: string }, VisitScheduleItem>(
    CrmService('list-visit-schedule-by-customer'),
    actions,
  ),

  listVisitScheduleGen: findPagingService<{}, VisitScheduleGenItem>(
    CrmService('list-visit-schedule-gen'),
    actions,
  ),

  getVisitPlanItem: findService<{ id: number }, VisitPlanListItem>(
    CrmService('get-visit-plan-item'),
    actions,
  ),
  listDistributor: findAllService<{}, Distributor>(CrmService('find-distributor'), actions),

  createVisitSchedule: execService<
    {
      monthCreated: moment.Moment;
      effectiveDate?: moment.Moment;
      salespersonId?: number;
      overwritePending?: boolean;
      description?: string;
      customerIdList?: number[];
    },
    { id: number; data: number }
  >(CrmService('create-visit-schedule'), actions),

  cancelVisitSchedule: execService<{ id: number; remarks: string }, {}>(
    CrmService('cancel-visit-schedule'),
    actions,
  ),
});
