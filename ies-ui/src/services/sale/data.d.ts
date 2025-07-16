import type moment from 'moment';
import type { Moment } from 'moment';
import type { AddressInfo } from '../crm/data';
import type { LookupData, LookupDataItem } from '../data';

export type SaleServiceName =
  | 'list-so'
  | 'list-offer-code'
  | 'list-sales-team-work-1'
  | 'find-so'
  | 'new-so'
  | 'save-so'
  | 'list-payment-term'
  | 'add-payment-term'
  | 'save-payment-term'
  | 'find-payment-term'
  | 'list-shipping-method'
  | 'add-shipping-method'
  | 'save-shipping-method'
  | 'find-shipping-method'
  | 'list-store-location'
  | 'add-store-location'
  | 'save-store-location'
  | 'find-store-location'
  | 'list-product-item'
  | 'add-product-item'
  | 'save-product-item'
  | 'activate-product-item'
  | 'find-product-item'
  | 'list-uom'
  | 'add-uom'
  | 'save-uom'
  | 'find-uom'
  | 'list-customer'
  // | 'find-cg'
  // | 'find-cpg'
  // | 'listAddressByCustomerId'
  | 'look-up-data'
  | 'list-customer-group'
  | 'list-product-item-by-type'
  | 'list-item-category'
  | 'list-packages-by-channel-id'
  | 'fetch-packages-by-id'
  | 'calculation-items'
  | 'fetch-customer-sale-info'
  | 'list-visit-plan'
  | 'list-visit-schedule'
  | 'get-item-by-ids'
  | 'customer_transport_offer'
  | 'get-offer'
  | 'post-so'
  | 'cancel-so'
  | 'list-so-delivery'
  | 'list-transportation-offer'
  | 'list-packages'
  | 'list-budget'
  | 'list-attachment'
  | 'list-stock'
  | 'detail-stock'
  | 'list-transactions'
  | 'list-stock-category'
  | 'list-type-product-items'
  | 'detail-stock-item'
  | 'list-detail-stock-item'
  | 'list-sale-invoice-stock-control'
  | 'list-sale-invoice'
  | 'list-lead-phone'
  | 'load-product-items-by-se'
  | 'fetch-lead-by-phone'
  | 'save-lead'
  | 'save-sale-invoice'
  | 'save-settlement'
  | 'fetch-last-stock-control'
  | 'save-vehicle'
  | 'find-vehicle-by-plate-number'
  | 'page-vehicle-by-plate-number'
  | 'import-sales-stock-control'
  | 'is-initial-manual'
  | 'list-sales-team-work'
  | 'save-team-work'
  | 'detail-team-work'
  | 'update-stock-control'
  | 'page-team-work'
  | 'page-stock-store'
  | 'save-stock-store'
  | 'list-team-work'
  | 'detail-stock-store'
  | 'page-history'
  | 'list-sale-invoices-stock-store'
  | 'accept-stock-request'
  | 'approve-stock-request'
  | 'list-settlement'
  | 'detail-settlement'
  | 'list-suggestion-stock'
  | 'count-stock'
  | 'exchange-rate'
  | 'save-settlement-model'
  | 'page-lead'
  | 'initialize-stock-control'
  | 'create-stock-control'
  | 'close-stock-request'
  | 'settle-stock-request'
  | 'exchange-rate-dsd-only'
  | 'reject-request-stock'
  | 'list-rsm-request-mpu'
  | 'find-rsm-request-mpu'
  | 'save-store-request-mpu'
  | 'list-sale-teamwork-mpu'
  | 'find-by-salesperson-code'
  | 'sync-posm'
  | 'list-rsm-request-mpu-item';

/** Stock */
// export interface StockControl {
//   stockName: string;
//   isActive: number;
//   owner: string;
//   approvedBy?: string;
//   approvedDate?: moment.Moment;
//   amount: number;
// }

export interface ExchangeRate {
  source_currency: string;
  target_currency: string;
  source_symbol?: string;
  target_symbol?: string;
  source_amount?: number;
  target_amount?: number;
}

export interface SaveStockStore {
  id?: number;
  name: string;
  description?: string;
  isActive: boolean;
  memberIds?: string[];
  vehicleIds?: string[];
  teamWorkId?: number;
  removeTeamWorkId?: number;
  isInitialize: boolean;
}

export interface StockStoreLess {
  id: number;
  name: string;
  description?: string;
  amount?: number;
  amountKH?: number;
  beginningQuantity?: number;
  requestQuantity?: number;
  currentQuantity?: number;
  soldQuantity?: number;
  status: string;
  isActive: boolean;
  teamWork?: TeamWorkLess;
  createdDate?: moment.Moment;
  vehicle?: VehicleLess;
  members?: SalesTeamWorkLess[];
  isInitialize?: boolean;
}

export interface StockDetail1Less extends StockDetailLess {
  settlement?: SettlementLessDto;
  stockControlId: number;
  soldAmount?: number;
  referenceNo?: string;
  id: number;
  status?: string;
  requestDate?: moment.Moment;
  approvalDate?: moment.Moment;
  receivedBy?: SalesTeamWorkLess;
  approval?: SalesTeamWorkLess;
  isKeepForwarding?: boolean;
  approvedBy?: SalesTeamWorkLess;
}

export interface StockStoreDetail extends StockStoreLess {
  stockControl?: StockDetail1Less;
  histories?: StockControlDetailDto[];
}

export interface StockControlDetailDto {
  id: number;
  status: string;
  cashOnHand: number;
  cashOnHandKH: number;
  serialNumber: string;
  internalId: string;
  soldAmount: number;
  transactions: StockQuantity[];
  isKeepForwarding: boolean;
  requestDate?: moment.Moment;
}

export interface TeamWorkLess {
  id: number;
  teamName: string;
  description?: string;
  stockStoreName?: string;
  plateNumber?: string;
  createdDate?: moment.Moment;
  isActive: boolean;
}

export interface TeamWorkDto {
  id: number;
  teamName: string;
  description?: string;
  createdDate?: moment.Moment;
  vehicle?: VehicleLess;
  members?: SalesTeamWorkLess[];
  stockStoreName?: string;
  requester?: SalesTeamWorkLess;
}

export interface SaveTeamWork {
  id?: number;
  teamName: string;
  description?: string;
  requesterCode: string;
  stockStoreId?: number;
  isActive?: boolean = true;
  memberIds?: string[];
  vehicleIds?: string[];
}

export interface SalesTeamWorkLess {
  id: number;
  salespersonCode: string;
  salespersonName: string;
  // parentId?: string;
  // position?: string,
  phoneNumber?: string;
  teamType?: string;
  role?: string;
  isRequester: boolean;
  isApprover: boolean;
  vehicle?: VehicleLess;
  isActive?: boolean;
}

export interface VehicleLess {
  id?: number;
  type: string;
  plateNumber: string;
}

export interface LeadLess {
  id?: number;
  lastName?: string;
  firstName?: string;
  internalName?: string;
  phone: string;
  houseNo?: string;
  regionId?: number;
  streetNo?: string;
  streetName?: string;
  villageId?: number;
  communeId?: number;
  districtId?: number;
  provinceId?: number;
  salespersonCode?: string;
  outletTypeId?: number;
  remark?: string;
}
export interface LeadInfo extends LeadLess {
  id: number;
}

export interface LeadDetail {
  status: ReactNode;
  isVerified: boolean | undefined;
  id: number;
  leadCode?: string;
  lastName?: string;
  firstName?: string;
  internalName?: string;
  phone: string;
  phone1?: string;
  phone2?: string;
  houseNo?: string;
  region?: LookupDataItem;
  streetNo?: string;
  streetName?: string;
  village?: LookupDataItem;
  commune?: LookupDataItem;
  district?: LookupDataItem;
  province?: LookupDataItem;
  salesperson?: SalesTeamWorkLess;
  outletType?: LookupData;
  remark?: string;
  latitude?: number;
  longitude?: number;
}

// export interface SaveSettlement {
//   id?: number;
//   salespersonId: number;
//   amount: number;
//   amountKH: number;
//   cashierName: number;
//   exchangeRate: number;
//   settlementDate: moment.Moment;
//   isKeepForwarding: boolean;
//   remark: string;
//   stockControlId: number;
//   invoices: { invoiceId: number; stockControlId: number; isSettlement: boolean }[];
// }

export interface SettlementModel {
  soldAmount: number;
  amount: number;
  amountKH: number;
  settlementDate: moment.Moment;
  remark: string;
  bankAmount?: number = 0.0;
  exchangeRate: number;
  stockControlId: number;
}

export interface SettlementLess {
  id?: number;
  salespersonCode: string;
  soldAmount: number;
  amount: number;
  amountKH: number;
  // actualAmount?: number;
  // actualAmountKH?: number;
  cashierName: number;
  exchangeRate: number;
  settlementDate: moment.Moment;
  isKeepForwarding: boolean;
  remark: string;
  stockControlId: number;
  stockDetails: StockDetailItemSettle[];
  bankAmount?: number = 0.0;
  // invoices: {
  //   stockControlId: number;
  //   id: number;
  //   invoiceNo: string;
  //   referenceNo?: string;
  //   invoiceDate: moment.Moment;
  //   amount: number;
  //   status: string;
  //   isSettlement: boolean;
  // }[];
}

export interface SaleInvoiceLess {
  key?: string;
  index: number;
  id?: number;
  invoiceNo: string;
  invoiceDate: moment.Moment;
  subAmount: number;
  amount: number;
  discount: number;
  status: string;
  referenceNo?: string;
  createdDate: moment.Moment;
  salesperson: SalesTeamWorkLess;
  salespersonCode: string;
  internalId: string;
  storeId?: number;
  customer?: LeadLess;
  customerId?: string;
  discount: number = 0.0;
  stockControlId?: number;
  items: SaleInvoiceItemLess[];
  exchangeRate: number;
}

export interface SaleItem {
  id: number;
  name: string;
  code: string;
  qty: number;
  price: number;
  batchNo?: string;
}

export interface SaleInvoiceItemLess {
  key?: string;
  index?: number;
  itemType?: string;
  // saleType?: string;
  itemId: number;
  itemName: string;
  itemCode: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  amount: number;
  stockCategoryId?: number;
  batchNo?: string;
  discountAmount?: number;
  discountPrice?: number;
}

export interface TopupLess {
  empNo: string;
  amount: number;
  attachments?: string[];
  requestedDate: moment.Moment;
  approvedDate: moment.Moment;
}

export interface SaveStockControl extends TopupLess {
  isVanSale: boolean;
  items: StockControlItemLess[];
  serialNumber?: string;
  plateNumber: string;
  approvedBy: string;
  receivedBy: string;
  beginningItems: StockControlItemLess[];
  stockStoreId?: number;
}

export interface StockControlItemLess {
  key?: string;
  index: number;
  itemType: number;
  itemId: number;
  itemName: string;
  type: string;
  itemQuantity: number;
  expiredDate?: moment.Moment;
  batchNo?: string;
  remark?: string;
}

export interface StockControlDetail {
  id: number;
  stockName: string;
  description?: string;
  isActive: number;
  status:
    | string
    | 'pending'
    | 'canceled'
    | 'open'
    | 'approved'
    | 'closed'
    | 'settled'
    | 'count stock';
  owner: SalesTeamWorkLess;
  approvedBy?: SalesTeamWorkLess;
  receivedBy?: SalesTeamWorkLess;
  approvedDate?: moment.Moment;
  cashOnHand?: number;
  internalId: string;
  serialNumber?: string;
  plateNumber?: string;
  soldAmount?: number;
  isKeepForwarding?: boolean;
  transactions: StockQuantity[];
  settlement?: SettlementLessDto;
  // children?: { string: StockDetailLess[] };
  items?: StockDetailLess[];
  pendingItems?: StockDetailLess[];
}

export interface EditableStockItem {
  id?: number;
  key: React.Key;
  batchNo?: moment.Moment;
  itemName: string;
  itemCode: string;
  uom: string;
  isBeginning: boolean;
  beginningQty: number;
  quantity: number;
  expiredDate?: moment.Moment;
  isSplit: boolean;
  stockCategoryId?: number;
  status: string;
  internalId?: string;
  itemType?: number;
}

export interface ApprovalStockControlDto {
  stockControlId: number;
  description?: string;
  referenceNo?: string;
  receivedBy?: string;
  items?: ApprovalStockItemDto[];
  distributorCode?: string;
}

// <<<<<<< HEAD
// =======
// export interface MMAAprovalEntity{
//   stockControlId?: number;
//   description?: string;
//   referenceNo?: string;
//   receivedBy?: string;
//   items?: EditableStockItem[];
//   distributorCode?: string;
//   distributorName?: string;
//   distributorPhone?: string;
//   distributorId?: number;
//   addressId?: number;
//   latitude?: string;
//   longitude?: string;
//   shippingAddressId?: number;
//   address?: string;
// }

// export interface MMAApprovalStockItemDto {
//   id: number;
//   itemCode: string;
//   quantity: number;
//   isBeginning: boolean;
//   batchNo: string;
//   expiredDate?: moment.Moment;
//   isSplit: boolean;
//   stockCategoryId?: number;
//   internalId?: string;
//   price:number;
//   itemId:number;
//   itemName:string;
//   division:string;

// }

// >>>>>>> 9efce41f6d8d562258adeb799dd966c4c6afae07
export interface ApprovalStockItemDto {
  id: number;
  itemCode: string;
  quantity: number;
  isBeginning: boolean;
  batchNo: string;
  expiredDate?: moment.Moment;
  isSplit: boolean;
  stockCategoryId?: number;
  internalId?: string;
  pricing?: number;
  state: string;
}

export interface SettlementLessDto {
  amount: number;
  amountKH: number;
  bankAmount: number;
  cashierName: number;
  exchangeRate: number;
  settlementDate: moment.Moment;
  isKeepForwarding: boolean;
  remark: string;
  adjustMentItems?: StockAdjustmentDto[] = [];
  stockAdjusts?: StockAjust;
}

export interface StockQuantity {
  itemType: number;
  quantity: number;
  pendingQty?: number;
  soldQty?: number;
  beginningQty?: number;
}

export interface TransactionDetail {
  id: number;
  stockControlId: number;
  fromCustomerCode: string;
  transactionType: string;
  previousValue: number;
  transactionValue: number;
  currentValue: number;
  status: string;
  createdDate?: moment.Moment;
  items: TransactionItemDetail[];
}

export interface TransactionItemDetail {
  itemCode: string;
  id: number;
  key?: string;
  stockTransactionId: number;
  itemId: number;
  itemName: string;
  previousQty: number;
  requestQty: number;
  currentQty: number;
  status: string;
  expiredDate?: moment.Moment;
}

export interface StockControlLess {
  id: number;
  stockName: string;
  description: string;
  isActive: number;
  owner: string;
  requestedBy?: SalesTeamWorkLess;
  approvedBy?: string;
  approvedDate?: moment.Moment;
  requestedDate?: moment.Moment;
  cashOnHand?: number;
  status: string;
  referenceNo?: string;
  createdDate: moment.Moment;
  plateNumber?: string;
  receivedBy?: string;
  items?: StockDetailItemLess[];
  invoices?: SaleInvoiceLess[];
  adjustmentItems?: StockAdjustmentDto[] = [];
  beginningQty: number;
  comments?: Comments[];
  stockAdjusts?: StockAjust;
  stockCountId?: number;
  isKeepForwarding?: boolean;
  storeId?: number;
  description?: string;
}

interface Comments {
  id: number;
  description: string;
}

interface StockAjust {
  adjustBy: string;
  adjustDate: moment.Moment;
  approvedBy?: string;
  approvedDate?: moment.Moment;
  remark?: string;
  status: string;
  stockControlId: number;
  stockStoreId: number;
  items: StockAdjustmentItem[];
}
interface StockAdjustmentItem {
  batchNo: string;
  itemCode: string;
  itemId: number;
  itemName: stirng;
  quantity: number;
  remark: string;
  sequence: number;
  status: string;
  uom: string;
}

export interface StockAdjustmentDto {
  adjustmentDate: moment.Moment;
  adjustBy: string;
  adjustQuantity: number;
  originQuantity: number;
  reason: string;
  itemId: number;
  itemName: string;
  salespersonCode: string;
  stockControlId: number;
  unitPrice?: number = 0.0;
}

export interface UpdateStockControlDto {
  id: number;
  plateNumber?: string;
  receivedBy?: string;
  approvedBy?: string;
  approvedDate?: moment.Moment;
  referenceNo?: string;
}

export interface StockDetailLess {
  pendingQty?: number;
  currentQty: number;
  soldQty?: number;
  lastModifiedDate: moment.Moment;
  typeId: number;
  items: StockDetailItemLess[];
}

export interface StockDetailItemLess {
  id?: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  uom?: string;
  description?: string;
  quantity: number;
  pendingQty: number;
  expiredDate?: moment.Moment;
  beginningQty: number;
  soldQty: number;
  batchNo?: string;
  actualQty?: number;
  itemType?: number;
  status: string;
  internalId?: string;
}

export interface StockDetailItemSettle extends StockDetailItemLess {
  remark?: string;
  isSettle?: boolean;
  totalQty?: number;
  endQty?: number;
}

export interface CountStockDto {
  stockControlId: number;
  isForwardingStockControl: boolean;
  items?: CountStockItemDto[];
}

export interface CountStockItemDto {
  id: number;
  actualQty: number;
  endQty: number;
  remark?: string;
}

/** SO */
export interface SoItemLess {
  id: number;
  poNo?: string;
  province?: string;
  region?: string;
  soNo?: string;
  amount: number;
  qty: ?number;
  // discountAmount: number;
  // vatAmount: number;
  // totalAmount: number;
  postedDate?: moment.Moment;
  orderedDate?: moment.Moment;
  status?: string;
  source?: string;
  postedBy?: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  salespersonId: number;
  // salespersonCode: string;
  salespersonName: string;
  shippingAddress: string;
  deliveryMethod: string;
  hasAttachment?: boolean;
  uploaded?: boolean;
}

export interface So {
  id?: number;
  customerId: number;
  orderDate?: moment.Moment;
  refNo?: string;
  salespersonId: number;
  shippingAddressId: number;
  deliveryMethodId: number;
  address?: string;

  subtotalAmount?: number;
  discountAmount?: number;
  vatAmount?: number;
  totalAmount?: number;
  remarks?: string;
  scheduleDate?: moment.Moment;
  deliveryDate?: moment.Moment;
  status?: string;
  items?: SoItem[];
  deliveries?: Delivery[];
  budgetCode?: string;
  distributorId?: number;
  attachments?: { id: number; imageId: string; status: string }[];
}

export interface SoDetail {
  id: number;
  soNo?: string;
  amount: number;
  discountAmount: number;
  vatAmount?: number;
  totalAmount: number;
  postedBy?: string;
  postedDate?: moment.Moment;
  shippingDate?: moment.Moment;
  deliveryDate?: moment.Moment;
  orderedDate?: moment.Moment;
  status?: string;
  refNo?: string;
  createdBy: string;
  createdDate: moment.Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: moment.Moment;
  remarks?: string;
  budgetCode?: string;
  docEntryNum?: string;
  invoiceNo?: string;
  invoiceDate?: moment.Moment;
  invoiceType: number;
  associatedTo: {
    customer: CustomerLookup;
    paymentTerm?: LookupDataItem;
    shippingAddress: {
      id: number;
      address?: string;
      addressKh?: string;
      houseNo?: string;
      streetNo?: string;
      village?: string;
      district: string;
      commune: string;
      province: string;
    };
    deliveryMethod: SoDeliveryMethod;

    salesperson: {
      id: number;
      code: string;
      name: string;
    };
    attachments: { id: number; imageId: string }[];
  };
  items?: SoItemDetail[];
  deliveries?: Delivery[];
  distributor?: {
    id: number;
    name: string;
    code: string;
    noneOfl: {
      shop_name: string;
      phone_number: string;
      first_name?: string;
      last_name?: string;
      house_no?: string;
      street_no?: string;
      street_name?: string;
      village: string;
      commune: string;
      district: string;
      province: string;
      region: string;
    };
  };
}

export interface StatusLookup {
  id: number;
  code: string;
  name: string;
  type: string;
}

export interface CustomerLookup {
  id: number;
  code?: string;
  name: string;
  customerGroup?: CustomerGroup;
  customerPriceGroup?: CustomerPriceGroup;
  typeId?: number;
}
export interface CustomerGroup {
  id: number;
  code: string;
  description?: string;
}

export interface CustomerPriceGroup {
  id: number;
  code: string;
  description?: string;
}

export interface SoItem {
  id?: number;
  key?: string;
  itemId: number;
  itemCode: string;
  description: string;
  uomId: number;
  uom: string;
  qty: number;
  amount: number;
  discountAmount: ?number;
  discountPercent?: number;
  totalAmount: umber;
  price: number;
  description: string;
  remarks?: string;
  saleTypeId?: number;
  parentId?: number;
  categoryId?: number;
  type?: string;
  budgetCode?: string;
  subItems?: SoItem[];
  associatedTo?: {
    uom?: {
      id: number;
      code: string;
      name: string;
    };
  };
}

export interface Delivery {
  id?: number;
  deliveryMethodId?: number;
  deliveryDate?: moment.Moment;
  shippingAddressId?: number;
  // shippingAddressCode?: string;
  shippingAddress?: string;
  remarks?: string;
  itemList: DeliveryItem[];
  associatedTo: ?{
    shippingAddress: ?AddressInfo;
  };
}

export interface DeliveryItem {
  id?: number;
  itemId: number;
  itemCode: string;
  itemDesc: string;
  uomId: number;
  type: string;
  qty: number;
  shippedQty?: number;
  associatedTo?: {
    uom: LookupDataItem;
  };
}

export interface SoDeliveryDetail {
  id: number;
  shippingDate: moment.Moment;
  remarks?: string;
  so: LookupDataItem;
  customer: LookupDataItem;
  shippingAddress: LookupDataItem;
  salesperson: LookupDataItem;
  deliveryMethod: LookupDataItem;
}

export interface CustomerGroup {
  id: number;
  code: string;
  description?: string;
}

export interface CustomerPriceGroup {
  id: number;
  code: string;
  description?: string;
}

export interface OfferCodeInfo {
  offerCode: string;
  itemsIds: number[];
  saleType: string;
}

export interface OfferCodeParam {
  soItemId: number;
  itemId: number;
  description: string;
  itemCode: string;
  quantity: number;
  type: string;
  uom: string;
  offerCode?: string;
  isChecked: boolean;
}

export interface SoItemDetail {
  id: number;
  seq: number;
  itemId: number;
  itemCode: string;
  key: ?string;
  uomId: number;
  uom: string;
  qty: number;
  price: number;
  amount: number;
  discountAmount: number;
  discountPercent: number;
  totalAmount: number;
  description: string;
  remarks?: string;
  type?: string;
  parentId?: number;
  parentKey?: string;
  budgetCode?: string;
  index?: number;
}

export interface Distributor {
  id: number;
  code?: string;
  internalName?: string;
  name: string;
  salespersonId: number;
}

interface SoDeliveryMethod {
  id: number;
  code: string;
  name: string;
  description: ?strring;
}

interface SoPaymentTerm {
  id: number;
  code: string;
  name: string;
  description: ?strring;
}

interface SoStoreLocation {
  id: number;
  code: string;
  name: string;
  description: ?strring;
}

interface SoShippingMethod {
  id: number;
  code: string;
  name: string;
  description: ?strring;
}

// ---------------------------- BEGIN ----------------------
// ------------- Sales Trade Order Provider ---------------

export interface PackagesLess {
  id: number;
  name: string;
  type?: string;
  minQty: number;
  isMixed?: boolean;
  effectiveDate?: moment.Moment;
  expiredDate?: moment.Moment;
  // isPackage?: boolean,
}

// interface CustomerTransportOfferDto {
//     // id: number,
//     customerCode: string,
//     customerAddressCode: string,
//     productItemCode: string,
//     categoryId: number,
//     minQty: number,
//     offerQty: number,
//     latitude: string,
//     longitude: string,
//     distance: number,
//     // effectiveDate: Instant,
// }

interface PackagesDto {
  id: number;
  name: string;
  type?: string;
  minQty: number;
  isMixed?: boolean;
  isPackage?: boolean;
  packagesItems?: PackagesItemDto[];
  packagesOffer: PackagesOfferDto[];
}

interface PackagesItemDto {
  productItemId: number;
  productItemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

interface PackagesOfferDto {
  productItemId: number;
  productItemName: string;
  quantity: number;
  offerType?: string;
  uomId?: number;
  uomDescription?: string;
}

interface OfferParams {
  customerId: number;
  items: AddSoLineItem[];
}

interface SoLineItemEntry {
  id: number;
  uomId: number;
  qty: number;
  price: number;
  type: string;
  amount: number;
  main: boolean;
  discountPercent?: number;
  remarks?: string;
  budgetCode?: string;
}

export interface TranOfferParams {
  customerId: number;
  items: SoItemEntry[];
}

interface PackageOffer {
  id: number;
  description: string;
  offerList: {
    packagesOfferId: number;
    offerType: string;
    itemItem: LookupDataItem;
    qty: number;
    price: number;
    budgetCode: string;
  }[];
}

// ---------------------------- END ----------------------

interface ProductItem {
  uom: string?;
  id: number;
  code: string;
  barcode: string;
  name: string;
  uomId: number;
  price: number;
  cost?: number;
  discountPercent?: number;
  priceAfterDiscount?: number;
  description?: string;
  description2?: string;
  thumbnail?: string;
  photo?: string;
  isActive: boolean;
  itemBrandId?: number;
  itemCategoryId?: number;
  itemGroupId?: number;
  isServiceItem?: boolean;
  costingMethod?: string;
  createdBy?: string;
  createdDate?: moment.Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: moment.Moment;
  isCompetitor?: boolean;
  isWebEnabled?: boolean;
  isStockCountEnabled?: boolean;
  isActiveMobileSales?: boolean;
  associatedTo?: {
    uom?: {
      id: number;
      code: string;
      name: string;
    };
    brand?: {
      id: number;
      code: string;
      name: string;
    };
    category?: {
      id: number;
      code: string;
      name: string;
    };
    group?: {
      id: number;
      code: string;
      name: string;
    };
  };
  hasOffer?: boolean;
  mixedProductItemList: ProductItem[];
}

export interface PromotionProposal {
  id: number;
  title: string;
  objective: string;
  productCategoryName: string;
  territoryName: string;
  promotionDate: string;
}

export interface PromotionMechanic {
  id: number;
  productItemId: number;
  productItemName: string;
  categoryId: number;
  categoryName: string;
  customerGroupId: number;
  customerGroupName: string;

  minQuantity: number;
  purchaseQuantity: number;
  tradeOfferQty: number;
  priceTDO: number;
  isTDO: boolean;
  isMixed: boolean;
}

export interface ProductItemDto {
  id: number;
  code: string;
  barcode: string;
  name: string;
  price: number;
  cost?: number;
  description?: string;
  thumbnail?: string;
  photo?: string;
  isServiceItem?: boolean;
}

export interface ItemCategoryDto {
  id: number;
  code: string;
  description?: string;
  isActive?: boolean;
}

type SavePromotionMechanic = Omit<
  PromotionMechanic,
  ['id', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description', 'associatedTo']
>;

type AddPromotionProposal = Omit<
  PromotionProposal,
  ['id', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description', 'associatedTo']
>;
type SavePromotionProposal = Omit<
  PromotionProposal,
  ['id', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description', 'associatedTo']
>;

type ProductItemLess = Omit<
  ProductItem,
  ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description', 'associatedTo']
>;

type AddProductItem = Omit<
  ProductItem,
  ['id', 'createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'associatedTo']
>;

type SaveProductItem = Omit<
  ProductItem,
  ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'associatedTo']
>;

interface UoM {
  id: number;
  code: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdDate?: moment.Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: moment.Moment;
}

interface BCG {
  id: number;
  code: string;
  description: string;
}

type BrandLess = Omit<
  BCG,
  ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description2']
>;

type CategoryLess = Omit<
  BCG,
  ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description2']
>;

type GroupLess = Omit<
  BCG,
  ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description2']
>;

type UoMLess = Omit<
  UoM,
  ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate', 'description']
>;

type AddUoM = Omit<UoM, ['id', 'createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate']>;

type SaveUoM = Omit<UoM, ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate']>;

export interface BudgetCodeLess {
  saleType: number;
  budgets: LookupDataItem[];
}

export interface CustomerSaleInfo {
  id: number;
  customerGroup?: LookupDataItem;
  customerPriceGroup?: LookupDataItem;
  vat?: { code: string; rate: number };
  salesperson?: LookupDataItem;
  transportationMOQ?: any;
  isIndirectCustomer: boolean;
  distributors: LookupDataItem[];
}

export interface ShippingAddress {
  id: number;
  type: 'shippingAddress';
  addressCode: string;
  addressName: string;
  address: string;
  province?: string;
  commune?: string;
  latitude?: string;
  longitude?: string;
  contactName: string;
  contactNo: stirng;
}

export interface DeliveryEntry {
  id?: number;
  key?: string;
  deliveryMethodId?: number;
  deliveryDate?: moment.Moment;
  shippingAddressId?: number;
  shippingAddressCode?: string;
  remarks?: string;
  default?: boolean;
  itemList: DeliveryItemEntry[];
}

export interface DeliveryItemEntry {
  id?: number;
  itemId: number;
  key?: string;
  itemCode: string;
  itemDesc: string;
  uomId: number;
  uomName?: string;
  type: string;
  qty: number;
}

export interface DeliverySoItemEntry {
  id?: number;
  key?: string;
  deliveryDate?: moment.Moment;
  shippingAddressId?: number;
  shippingAddressCode?: string;
  itemId: number;
  itemCode: string;
  description: string;
  type: string;
  qty: number;
  uomId: number;
  uomName: string;
  remarks?: string;
  main?: boolean;
  default?: boolean;
  mainKey?: string;
}

export interface InitData {
  paymentTermList?: SoPaymentTerm[];
  deliveryMethodList?: SoDeliveryMethod[];
  salePersonList?: SalePerson[];
  buList?: BusinessUnit[];
  status?: StatusLookup[];
  transportOffers?: CustomerTransportOfferDto[];
  itemList?: ProductItemLess[];
  addressList?: AddressInfo[];
}

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    so?: So;
    soDetail?: SoDetail;
    soItems?: SoItemEntry[];
    deliverySoItems?: DeliverySoItemEntry[];
    deliveryList?: DeliveryEntry[];
    customerSaleInfo?: CustomerSaleInfo;
    productItem?: ProductItem;
    packageOffer?: PackageOffer[];
  };
}

export interface SoAdvanceSearchParams {
  soNum?: string;
  customerId?: number;
  status?: string;
  source?: string;
  deliveryMethodId?: number;
  salespersonId?: number;
  customerType?: string;
  hasAttachment?: boolean;
}

export interface StockStoreAdvanceSearchParams {
  status?: string;
  searchValue?: string;
  role?: string;
}

export interface StockAdvanceSearchParams {
  // salespersonId?: number;
  // active?: number;
  owner?: string;
  status?: string;
  requestedDate?: moment.Moment;
}

export interface TeamWorkAdvanceSearchParams {
  // salespersonId?: number;
  // active?: number;
  owner?: string;
  status?: string;
  //requestedDate?: moment.Moment;
}

export interface DeliveryAdvanceSearchParams {
  status?: string;
  // customerId?: number;
  salespersonId?: number;
  deliveryMethodId?: number;
  saleOrderNum?: string;
  dates?: moment.Moment[];
  // shippingAddressId?: number;
}

// export type InitStockStoreParam = {
//   actionName: 'list-team-work';
//   responseKey: string;
//   payload: TeamWorkLess[];
// };

export type InitSuggestionParam =
  | {
      actionName: 'exchange-rate';
      responseKey: string;
      payload: any;
    }
  | {
      actionName: 'exchange-rate-dsd';
      responseKey: string;
      payload: any;
    };

export type InitSaleInvoiceParam =
  | {
      actionName: 'look-up-data';
      responseKey: string;
      payload: {
        list: string[];
      };
    }
  | {
      actionName: 'list-stock-category';
      responseKey: 'types';
      payload: any;
    }
  | {
      actionName: 'list-type-product-items';
      responseKey: 'typeProductItems';
      payload: any;
    }
  // | {
  //     actionName: 'list-sale-invoices';
  //     responseKey: 'saleInvoiceList';
  //     payload: { id: number };
  //   }
  | {
      actionName: 'list-sales-team-work';
      responseKey: string;
      payload: any;
    };

export type InitSoParamsType =
  | {
      actionName: 'list-payment-term';
      responseKey: 'paymentTermList';
      payload: any;
    }
  | {
      actionName: 'list-shipping-method';
      responseKey: string;
      payload: any;
    }
  | {
      actionName: 'list-shipping-method';
      responseKey: 'shippingMethodList';
      payload: any;
    }
  | {
      actionName: 'list-store-location';
      responseKey: 'storeLocationList';
      payload: any;
    }
  | {
      actionName: 'look-up-data';
      responseKey: string;
      payload: {
        list: string[];
      };
    }
  | {
      actionName: 'list-product-item-by-type';
      responseKey: 'itemList';
      payload: {
        id: number;
      };
    }
  | {
      actionName: 'listCustomer';
      responseKey: string;
      payload: any;
    }
  | {
      actionName: 'listSalesperson';
      responseKey: string;
      payload: any;
    }
  | {
      actionName: 'list-uom';
      responseKey: 'uomList';
      payload: any;
    }
  | {
      actionName: 'list-budget';
      responseKey: string;
      payload: any;
    };

export type initProductParamsType =
  | {
      actionName: 'list-uom';
      responseKey: 'uomList';
      payload: any;
    }
  | {
      actionName: 'list-brand';
      responseKey: 'brandList';
      payload: any;
    }
  | {
      actionName: 'list-category';
      responseKey: 'categoryList';
      payload: any;
    }
  | {
      actionName: 'list-group';
      responseKey: 'groupList';
      payload: any;
    };

export type InitTradeOfferParamsType =
  | {
      actionName: 'list-item-category';
      responseKey: 'categories';
      payload: any;
    }
  | {
      actionName: 'list-customer-group';
      responseKey: 'customerGroup';
      payload: any;
    };

export interface SoSummary {
  pendingMCDirect: number;
  pendingDirect: number;
  pendingIndirect: number;
  failed: number;
}

export interface SoUploadedLog {
  id: number;
  mobileInfo: string;
  payload: string;
  status: string;
  createdBy: string;
  createdDate: string;
  completedDate: string;
  trace?: string;
}

export interface SoUploadLogAdvSearchParams {
  status?: string;
}

export interface CloseIndirectSoParams {
  invoiceNo: string;
  invoiceDate: Moment;
  remarks?: string;
  shippedItems: { deliveryItemId: number; shippedQty: number }[];
  distributor?: number;
}

// LH : RSM request to MPU
export interface PoAdvanceSearchParams {
  status?: string;
  searchValue?: string;
  role?: string;
}

export interface FetchStore {
  id?: number;
  name: string;
  description?: string;
  isActive: boolean;
  memberIds?: string[];
  vehicleIds?: string[];
  teamWorkId?: number;
  removeTeamWorkId?: number;
  isInitialize: boolean;
}

export interface StockReceiptBalance {
  poAllQuantity?: number;
  receiptAllQuantity?: number;
  netAllQuantity?: number;
}

export interface RsmRequestMpuDetail {
  id?: number;
  description?: string;
  internalId?: string;
  isActive?: number;
  plateNumber?: string;
  receivedBy?: string;
  referenceNo?: string;
  requestedDate?: moment.Moment;
  status?: string;
  stockName?: string;
  storeId?: number;
  isKeepForwarding?: number;
  stockControlType?: string;
  distributorCode?: string;
  distributorName?: string;
  distributorPhone?: string;
  stockControlId?: number;
  latitude?: string;
  longitude?: string;
  owner?: SalesTeamWorkLess;
  distributor?: {
    active?: stirng;
    createdBy?: string;
    createdDate?: moment.Moment;
    currencyId?: numner;
    customerCode?: string;
    customerGroupId?: number;
    customerId?: number;
    customerInternalName?: string;
    customerName?: string;
    customerPriceGroupId?: number;
    id?: number;
    lastModifiedBy?: number;
    lastModifiedDate?: moment.Moment;
    paymentMethodId?: number;
    paymentTermCode?: string;
    paymentTermId?: number;
    regionId?: number;
    salespersonCode?: string;
    salespersonId?: number;
    salespersonName?: string;
    shippingMethodId?: number;
    subChannel?: number;
    subDivisionId?: number;
    territory?: string;
    vatId?: number;
  };
  addressInfo?: {
    id?: number;
    address?: string;
    addressKh?: string;
    houseNo?: string;
    streetName?: string;
    streetNo?: string;
    houseNoKh?: string;
    streetNameKh?: string;
    streetNoKh?: string;
    village?: string;
    commune?: string;
    district?: string;
    province?: string;
    latitude?: string;
    longitude?: string;
    hotspot?: string;
    direction?: string;
    customerAddressId?: number;
    region?: string;
  };
  createdDate?: moment.Moment;
  createdBy?: string;
  lastModifiedDate?: moment.Moment;
  lastModifiedBy?: string;
  // items: MpuStockDetailItemLess[];
  items: MpuFleetStockReceiptItemLess[];
  poItems: MpuStockDetailItemLess[];
  balance?: StockReceiptBalance;
  grandTotalAmount?: number;
  totalAmount?: number;
  discountAmount?: number;
  discountPercent?: number;
}

export interface SaveRsmRequestMpu {
  id?: number;
  description?: string;
  internalid: string;
  isActive?: number;
  owner?: string;
  plateNumber?: string;
  receivedBy?: string;
  referenceNo: string;
  requestedDate?: moment.Moment;
  status?: string;
  stockName?: string;
  storeId?: number;
  isKeepForwarding?: number;
  stockControlType?: string;
  distributorCode?: string;
  item: MpuStockControlItemLess[];
}

export interface MpuStockControlItemLess {
  pendingQty?: number;
  currentQty: number;
  soldQty?: number;
  lastModifiedDate: moment.Moment;
  typeId: number;
  // items: MpuStockDetailItemLess[];
  items: MpuFleetStockReceiptItemLess[];
}

export interface MpuFleetStockReceiptItemLess {
  receiptNumber: string;
  fleetReceiptPo: MpuStockDetailItemLess[];
  balanceAmount: {
    totalAmount: Double;
    grandTotalAmount: Double;
  };
}

export interface MpuStockDetailItemLess {
  id?: number;
  itemId: number;
  itemName: string;
  code: string;
  uom?: string;
  description?: string;
  quantity: number;
  pendingQty: number;
  totalQuantity: number;
  expiredDate?: moment.Moment;
  beginningQty: number;
  soldQty: number;
  // batchNo?: string;
  actualQty?: number;
  itemType?: number;
  price?: number;
  isBeginning: boolean;
  stockCategoryId: number;
  batchNo: string;
  haveBatchNo: number;
}

export interface MpuStockDetailItemSettle extends MpuStockDetailItemLess {
  remark?: string;
  isSettle?: boolean;
  totalQty?: number;
  endQty?: number;
}

export interface MpuStockControlDetail {
  id: number;
  stockName: string;
  description?: string;
  isActive: number;
  status: string;
  owner: SalesTeamWorkLess;
  approvedBy?: SalesTeamWorkLess;
  receivedBy?: SalesTeamWorkLess;
  approvedDate?: moment.Moment;
  cashOnHand?: number;
  internalId: string;
  referenceNo?: string;
  plateNumber?: string;
  soldAmount?: number;
  transactions: StockQuantity[];
  settlement?: SettlementLessDto;
  createdDate?: moment.Moment;
  createdBy?: string;
  lastModifiedDate?: moment.Moment;
  lastModifiedBy?: string;
  discount?: number;
}

// ////////////////

// LH : END //////////////
