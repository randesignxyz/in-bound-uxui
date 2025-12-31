import { StatusActionForm } from '@/pages/sale/mpu/settlement/data';
import type { SortOrder } from 'antd/lib/table/interface';
import type { Moment } from 'moment';
import moment from 'moment';
import type { ServiceType } from '../API';
import type { RequestActions, ServiceApiType } from '../apiGateway';
import {
  downloadReport,
  downloadSaleReport,
  exec,
  execService,
  find,
  findAll,
  findAllService,
  findMultiService,
  findPagingService,
  findService,
} from '../apiGateway';
import { CustomerItemLess } from '../crm/data';
import { CrmService } from '../crm/services';
import type { LookupData, LookupDataItem } from '../data';
import type {
  AddProductItem,
  ApprovalStockControlDto,
  CloseIndirectSoParams,
  CountStockDto,
  CustomerSaleInfo,
  EditSo,
  ExchangeRate,
  InitSaleInvoiceParam,
  InitSoParamsType,
  InitSuggestionParam,
  InitTradeOfferParamsType,
  LeadDetail,
  LeadLess,
  MpuStockControlItemLess,
  OfferCodeInfo,
  OfferParams,
  PackageOffer,
  PackagesLess,
  ProductItem,
  ProductItemDto,
  RsmRequestMpuDetail,
  SaleInvoiceLess,
  SaleServiceName,
  SalesTeamWorkLess,
  SaveProductItem,
  SaveRsmRequestMpu,
  SaveStockStore,
  SaveTeamWork,
  SettlementLess,
  SettlementModel,
  So,
  SoDeliveryDetail,
  SoDetail,
  SoItemLess,
  SoSummary,
  SoUploadLogAdvSearchParams,
  StockControlDetail,
  StockControlDetailDto,
  StockControlLess,
  StockDetailLess,
  StockStoreDetail,
  StockStoreLess,
  TeamWorkDto,
  TeamWorkLess,
  TopupLess,
  TranOfferParams,
  TransactionDetail,
  UpdateStockControlDto,
  VehicleLess,
  initProductParamsType,
} from './data';

export const SaleService = (serviceName?: SaleServiceName): ServiceType => {
  return {
    type: 'SALE',
    name: serviceName,
  };
};

const ReqParams = {
   fetchSoSummary: (data?: number[]): ServiceApiType<{}> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'fetch-so-summary',
    payload: data
  }),

  fetchInvoiceNo: (): ServiceApiType<{}> => ({
    type: 'FETCH_QUERY',
    endpoint: 'SALE',
    actionName: 'invoice-no',
  }),

  closeSo: (
    id: number,
    data: CloseIndirectSoParams,
  ): ServiceApiType<{
    soId: number;
    invoiceNo: string;
    invoiceDate: Moment;
    remarks?: string;
    distributor?: number;
    shippedItems: { deliveryItemId: number; shippedQty: number }[];
  }> => ({
    type: 'EXEC',
    endpoint: 'SALE',
    actionName: 'close-so',
    payload: {
      soId: id,
      invoiceNo: data.invoiceNo,
      invoiceDate: data.invoiceDate,
      remarks: data.remarks,
      shippedItems: data.shippedItems,
      distributor: data.distributor,
    },
  }),

  listSoByVisitIdParam: (visitId: number): ServiceApiType<{ id: number }> => ({
    type: 'LIST_QUERY',
    endpoint: 'SALE',
    actionName: 'list_so_by_visit_id',
    payload: { id: visitId },
  }),

  listSoUploadedLogParam: (
    searchValue?: string,
    advanceSearch?: SoUploadLogAdvSearchParams,
  ): ServiceApiType<{ searchValue?: string; advanceSearch?: SoUploadLogAdvSearchParams }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'SALE',
    actionName: 'list_so_by_visit_id',
    payload: {},
  }),
};

export const SaleServiceAPI = (actions?: RequestActions) => ({
  downloadSoReport: downloadReport<{
    reportType: string;
    salespersonId?: number[];
    orderedDate?: moment.Moment[];
    postedDate?: moment.Moment[];
    customerTypeId?: number[];
    soStatus?: string[];
  }>(actions),

  donwloadPOReport: downloadSaleReport<{
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
    status?: string[];
    reportType?: string;
    supplier?: string
  }>(actions),

  donwloadDSDReport: downloadSaleReport<{
    reportType: string;
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
  }>(actions),

  donwloadDSDLeadReport: downloadSaleReport<{
    salespersonCode?: string[];
    openedDate?: moment.Moment[];
  }>(actions),

  donwloadDSDVisitReport: downloadSaleReport<{
    visitedDates?: moment.Moment[];
    salespersonCode?: string[];
  }>(actions),

  fetchSoSummary: (data?: number[]) => find<SoSummary>(ReqParams.fetchSoSummary(data))(actions),

  listSoByVisitId: (visitId: number) =>
    findAll<SoItemLess>(ReqParams.listSoByVisitIdParam(visitId))(actions),

  listSo: findPagingService<{ searchValue?: string; sort?: Record<string, SortOrder> }, SoItemLess>(
    SaleService('list-so'),
    actions,
  ),
  listArea: findAllService<{ searchValue?: string; sort?: Record<string, SortOrder> }, SoItemLess>(
    SaleService('list-area'),
    actions,
  ),
  listSoDelivery: findPagingService<
    { searchValue?: string; sort?: Record<string, SortOrder> },
    SoDeliveryDetail
  >(SaleService('list-so-delivery'), actions),
  listPackages: findPagingService<{ searchValue?: string }, PackagesLess>(
    SaleService('list-packages'),
    actions,
  ),

  closeSo: (id: number, data: CloseIndirectSoParams) => exec(ReqParams.closeSo(id, data))(actions),

  findSo: findService<{ id: number }, SoDetail>(SaleService('find-so'), actions),

  listOfferCodes: findAllService<{ id: number }, OfferCodeInfo>(
    SaleService('list-offer-code'),
    actions,
  ),

  listAttachments: findAllService<{ id: number }, { id: number; imageId: string }>(
    SaleService('list-attachment'),
    actions,
  ),
  initSoData: findMultiService<InitSoParamsType, {}>(SaleService(), actions),
  initProductData: findMultiService<initProductParamsType, {}>(SaleService(), actions),

  // customerTransportOfferSrv: findAllService<{id: number}, CustomerTransportOfferDto>(SaleService('customer_transport_offer'), actions),
  getPackageOffer: findAllService<OfferParams, PackageOffer>(SaleService('get-offer'), actions),

  saveSodata: execService<So, { id: number }>(SaleService('save-so'), actions),

  editSodata: execService<EditSo, { id: number }>(SaleService('update_sap_sale_plan'), actions),


  initTDOData: findMultiService<InitTradeOfferParamsType, {}>(SaleService(), actions),

  // calculationItems: findAllService<{customerId: number, isSelfPickup: boolean, items:SoItemType[]}, SoItemType>(SaleService('calculation-items'), actions),

  // listCategories = (action?: RequestActions) => findAllService<{}, LookupData>(SaleService('look-up-data'), action)
  // listCustomerGroup = (action?: RequestActions) => findAllService<{}, CustomerGroup>(SaleService('list-customer-group'), action)
  loadingProductItems: findAllService<{ id: number }, ProductItemDto>(
    SaleService('list-product-item-by-type'),
    actions,
  ),
  //listAddressByCustomerId: findAllService<{id: number}, AddressInfo >(SaleService('listAddressByCustomerId'), actions),

  // findCustomerGroup = (action?: RequestActions) => findService<{id: number}, CustomerGroup>(SaleService('find-cg'), action)
  // findCustomerPriceGroup = (action?: RequestActions) => findService<{id: number}, CustomerPriceGroup>(SaleService('find-cpg'), action)

  // listProductItem: findPagingService<{ searchText?: string }, ProductItem>(
  //   SaleService('list-product-item'),
  //   actions,
  // ),
  addProductItem: execService<AddProductItem, { id?: number; message: string }>(
    SaleService('add-product-item'),
    actions,
  ),
  saveProductItem: execService<SaveProductItem, ProductItem>(
    SaleService('save-product-item'),
    actions,
  ),
  activateProductItem: execService<SaveProductItem, { id?: number; message: string }>(
    SaleService('activate-product-item'),
    actions,
  ),
  findProductItem: findService<{ id: number; customerId: number; auto?: boolean }, ProductItem>(
    SaleService('find-product-item'),
    actions,
  ),
  findCustomerSaleInfoByCustomerId: findService<
    { id: number; requiredDistributor?: boolean },
    CustomerSaleInfo
  >(SaleService('fetch-customer-sale-info'), actions),

  initProductData: findMultiService<initProductParamsType, {}>(SaleService(), actions),

  initSaleInvoiceData: findMultiService<InitSaleInvoiceParam, {}>(SaleService(), actions),

  initSuggestionData: findMultiService<InitSuggestionParam, {}>(SaleService(), actions),

  getItemByIdList: findAllService<{ ids: number[] }, ProductItem>(
    SaleService('get-item-by-ids'),
    actions,
  ),

  postSoToSAP: execService<{ soId: number; remarks?: string }, { data: any; message: string }>(
    SaleService('post-so'),
    actions,
  ),
  postSoToSAPNew: execService<{ soId: number; remarks?: string }, { data: any; message: string }>(
    SaleService('post-so-new'),
    actions,
  ),
  syncFromSFA: execService<{}, { data: string, message: string }>(
    SaleService('sync-so-from-sfa')
    , actions
  ),
  cancelSo: execService<{ soId: number; remarks: string }, { data: string; message: string }>(
    SaleService('cancel-so'),
    actions,
  ),

  listTransportationOffer: findAllService<TranOfferParams, PackageOffer>(
    SaleService('list-transportation-offer'),
    actions,
  ),

  listSuggestionStock: findPagingService<
    {
      role: string;
      searchValue?: string;
      advanceSearch?: { status?: string };
      sort?: Record<string, SortOrder>;
    },
    StockControlLess
  >(SaleService('list-suggestion-stock'), actions),

  listSettlements: findPagingService<
    { searchValue?: string; advanceSearch?: { status: string }; sort?: Record<string, SortOrder> },
    SettlementLess
  >(SaleService('list-settlement'), actions),

  fetchInvoiceNo: () => find<{ refNo: string }>(ReqParams.fetchInvoiceNo())(actions),
  searchLeadByPhone: findPagingService<{ id: string }, LeadLess>(
    SaleService('fetch-lead-by-phone'),
    actions,
  ),

  searchVehicleByPlateNumber: findAllService<{ id: string }, VehicleLess>(
    SaleService('find-vehicle-by-plate-number'),
    actions,
  ),

  pageVehicleByPlateNumber: findAllService<{ id: string }, VehicleLess>(
    SaleService('page-vehicle-by-plate-number'),
    actions,
  ),

  onSaveLead: execService<LeadLess, { data: any; message: string }>(
    SaleService('save-lead'),
    actions,
  ),

  onSaveSaleInvoice: execService<SaleInvoiceLess, { data: any; message: string }>(
    SaleService('save-sale-invoice'),
    actions,
  ),

  onAcceptStockRequest: execService<{ id: number }, { data: any; message: string }>(
    SaleService('accept-stock-request'),
    actions,
  ),
  onRejectStockRequest: execService<StatusActionForm, { data: any; message: string }>(
    SaleService('reject-request-stock'),
    actions,
  ),

  onApprovalStockRequest: execService<ApprovalStockControlDto, { data: any; message: string }>(
    SaleService('approve-stock-request'),
    actions,
  ),

  onSettleStockRequest: execService<{ id: number }, { data: any; message: string }>(
    SaleService('settle-stock-request'),
    actions,
  ),
  onClosedStockRequest: execService<{ id: number }, { data: any; message: string }>(
    SaleService('close-stock-request'),
    actions,
  ),

  onSaveSettlement: execService<SettlementLess, { data: string; message: string }>(
    SaleService('save-settlement'),
    actions,
  ),

  onSaveSettlementModel: execService<SettlementModel, { data: string; message: string }>(
    SaleService('save-settlement-model'),
    actions,
  ),

  onSaveVehicle: execService<VehicleLess, { data: VehicleLess; message: string }>(
    SaleService('save-vehicle'),
    actions,
  ),

  onUpdateStockControl: execService<UpdateStockControlDto, { id: number; message: string }>(
    SaleService('update-stock-control'),
    actions,
  ),
  listSaleTeamWork: findPagingService<
    { searchValue?: string; sort?: Record<string, SortOrder> },
    TeamWorkLess
  >(SaleService('page-team-work'), actions),

  listSaleInvoiceWithStockControl: findPagingService<
    { stockControlId?: number; searchValue?: string; sort?: Record<string, SortOrder> },
    SaleInvoiceLess
  >(SaleService('list-sale-invoice-stock-control'), actions),

  listSaleInvoiceWithSalesperson: findPagingService<
    { stockStoreId?: number; searchValue?: string; sort?: Record<string, SortOrder> },
    SaleInvoiceLess
  >(SaleService('list-sale-invoices-stock-store'), actions),

  listSaleInvoice: findPagingService<
    { stockControlId?: number; searchValue?: string; sort?: Record<string, SortOrder> },
    SaleInvoiceLess
  >(SaleService('list-sale-invoice'), actions),

  createStockControl: execService<TopupLess, { id: number; message: string }>(
    SaleService('create-stock-control'),
    actions,
  ),

  initializeStockControl: execService<TopupLess, { id: number; message: string }>(
    SaleService('initialize-stock-control'),
    actions,
  ),

  findStock: findService<{ id: number }, StockControlDetail>(SaleService('detail-stock'), actions),
  listTransactions: findPagingService<
    { stockControlId?: number; searchValue?: string; sort?: Record<string, SortOrder> },
    TransactionDetail
  >(SaleService('list-transactions'), actions),

  findSettlement: findService<{ id: number }, SettlementLess>(
    SaleService('detail-settlement'),
    actions,
  ),

  countStock: execService<CountStockDto, { id?: number; message: string }>(
    SaleService('count-stock'),
    actions,
  ),

  listStockCategory: findAllService<{}, LookupDataItem>(
    SaleService('list-stock-category'),
    actions,
  ),
  listTypeProductItems: findAllService<{}, { type: number; value: LookupDataItem[] }>(
    SaleService('list-type-product-items'),
    actions,
  ),
  stockDetailItems: findService<{ stockControlId: number; typeId: number }, StockDetailLess>(
    SaleService('detail-stock-item'),
    actions,
  ),

  // listStockDetailItems: findAllService<{ id: number }, StockDetailLess>(
  //   SaleService('list-detail-stock-item'),
  //   actions,
  // ),

  fetchLastStockControl: findAllService<{ id: string }, StockDetailLess>(
    SaleService('fetch-last-stock-control'),
    actions,
  ),

  // todo
  loadProductItemBySE: findAllService<{}, LookupDataItem>(
    SaleService('load-product-items-by-se'),
    actions,
  ),

  importSalesStockFile: execService<{ id: string }, { data: string; message: string }>(
    SaleService('import-sales-stock-control'),
    actions,
  ),

  isInitialManual: findService<{ id: string }, { noneData: boolean }>(
    SaleService('is-initial-manual'),
    actions,
  ),

  saveTeamwork: execService<SaveTeamWork, { data: SaveTeamWork; message: string }>(
    SaleService('save-team-work'),
    actions,
  ),
  detailTeamWork: findService<{ id: number }, TeamWorkDto>(
    SaleService('detail-team-work'),
    actions,
  ),

  saveStockStore: execService<SaveStockStore, { data: SaveStockStore; message: string }>(
    SaleService('save-stock-store'),
    actions,
  ),
  pageStockStore: findPagingService<
    { searchValue?: string; sort?: Record<string, SortOrder> },
    StockStoreLess
  >(SaleService('page-stock-store'), actions),

  listTeamWork: findAllService<{}, TeamWorkLess>(SaleService('list-team-work'), actions),
  fetchStockStore: findService<{ id: number }, StockStoreDetail>(
    SaleService('detail-stock-store'),
    actions,
  ),
  pageHistory: findPagingService<{ id: number }, StockControlDetailDto>(
    SaleService('page-history'),
    actions,
  ),
  findExchangeRate: findService<{}, ExchangeRate>(SaleService('exchange-rate'), actions),
  findDSDExchangeRate: findService<{}, ExchangeRate>(
    SaleService('exchange-rate-dsd-only'),
    actions,
  ),

  pageLead: findPagingService<{ id?: string; sort?: Record<string, SortOrder> }, LeadDetail>(
    SaleService('page-lead'),
    actions,
  ),

  // LH: RSM Request

  pageMpu: findPagingService<
    { searchValue?: string; advanceSearch?: string; sort?: Record<string, SortOrder> },
    RsmRequestMpuDetail
  >(SaleService('list-rsm-request-mpu'), actions),

  fetchMpu: findService<{ id: number }, RsmRequestMpuDetail>(
    SaleService('find-rsm-request-mpu'),
    actions,
  ),

  saveMpuRequest: execService<SaveRsmRequestMpu, { data: SaveRsmRequestMpu; message: string }>(
    SaleService('save-store-request-mpu'),
    actions,
  ),

  searchSaleTeamworkByMpu: findAllService<{ searchValue: string }, VehicleLess>(
    SaleService('list-sale-teamwork-mpu'),
    actions,
  ),

  findSaleTeamworkByCode: findAllService<{ code: string }, SalesTeamWorkLess>(
    SaleService('find-by-salesperson-code'),
    actions,
  ),

  searchDistributor: findAllService<{ searchValue: string }, CustomerItemLess>(
    CrmService('find-distributor'),
    actions,
  ),

  fetchPosm: findAllService<{ searchValue: string }, LookupData>(SaleService('sync-posm'), actions),

  listMpuStockDetailItems: findAllService<{ id: number }, MpuStockControlItemLess>(
    SaleService('list-rsm-request-mpu-item'),
    actions,
  ),
});
