import { ContractCheckedDataView, ContractViewData, POSMView } from '@/pages/crm/contract/types';
import moment, { Moment } from 'moment';
import { CustomerLess, LookupData, LookupDataItem, LookupDataType } from '../data';
import { CustomerSaleInfo, ProductItem } from '../sale/data';
import { ContactData, ContactListItem } from './contact';
import { ContractLess, SubContractType } from './contract';

export interface NotificationLess extends SaveNotification {
  id: number;
  createdDate: moment.Moment;
}

export interface SaveNotification {
  title: string;
  body: string;
  imageUrl?: string;
  type: string;
  status: string;
  isSend: boolean;
}

export interface CustomerItemBase {
  id: number;
  code?: string;
  name?: string;
  source: string;
  status: string;
  type: { id: number; name: string };
}

export interface CustomerItemLess extends CustomerItemBase {
  internalName?: string;
  contactPerson: string;
  phone: string;
  province: string;
  district: string;
  commune: string;
  address: string;
  region?: string;
  channel?: string;
  outletType?: string;
  sale: string;
}

export interface SalePerson {
  id: number;
  code: string;
  name: string;
}

export interface outletType {
  id: number;
  name: string;
  mainChannel: string;
  subChannel: string;
}

export interface BasicData {
  id?: number;
  internalName: string;
  name: string;
  typeId?: number;
  divisionId?: number;
  outletTypeId?: number;
  mainChannel?: string;
  subChannel?: string;
  saleId?: number;
  supplySourceId?: number;
  description?: string;
  ownerName?: string;
}

export interface AddressInfo {
  id: number;
  address: string;
  addressKh?: string;
  houseNo?: string;
  streetName?: string;
  streetNo?: string;
  village?: string;
  commune?: string;
  district?: string;
  province?: string;
  latitude?: string;
  longitude?: string;
  hotspot?: string;
  direction?: string;
  customerAddressId?: number;
}

export interface AddressData {
  id?: number;
  key?: string;
  address: string;
  typeId?: number;
  houseNo?: string;
  streetNo?: string;
  streetName?: string;
  houseNoKh?: string;
  streetNoKh?: string;
  streetNameKh?: string;
  latitude: string;
  longitude: string;
  provinceId: number;
  districtId: number;
  communeId?: number;
  villageId?: number;
  hotspot?: string;
  direction?: string;
  enabledVisitPlan?: boolean;
  visitPlanOptionIds?: number[];
}

// export interface ContactData {
//     typeId: number;
//     internalName: string;
//     name: string;
//     phone: string;
//     email?: string;
// }

export interface IncentiveScheme {
  id: number;
  name: string;
  tier1: string;
  tier2?: string;
  tier3?: string;
}

export interface Locations {
  id: number;
  code?: string;
  name: string;
  type?: 'DIVISION' | 'PROVINCE' | 'DISTRICT' | 'COMMUNE' | 'VILLAGE';
  parent?: number;
  internalName?: string;
}

export interface PurchaseEstData {
  itemId: number;
  quantity: number;
}

export interface PlanData {
  id: number;
  type: LookupDataType;
}

export interface SaveCustomer {
  basicInfo: Omit<BasicData, 'mainChannel' | 'subChannel'>;
  addressList: AddressData[];
  contact: ContactData;
  purchaseEstList: PurchaseEstData[];
}

export interface ContractTermData {
  id?: number;
  bizName?: string;
  owner?: string;
  effectiveDate?: string;
  expiryDate: string;
  phoneList: string;
  partyATerms: TermText[];
  partyBTerms: TermText[];
  duration: string;
  address?: string;
  comment?: string;
}

export interface ContractTerm {
  id?: number;
  bizName?: string;
  owner?: string;
  effectiveDate?: moment.Moment;
  expiryDate?: moment.Moment;
  address?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  email?: string;
  partyATerms: TermText[];
  partyBTerms: TermText[];
  terms?: ContractTermInfo[];
}

export interface ContractTermInfo {
  lineItem: number;
  term: string;
  type:
  | 'BIZ_NAME'
  | 'OWNER_NAME'
  | 'PHONE_LIST'
  | 'PARTY_A'
  | 'PARTY_B'
  | 'COTRACT_DRUATION'
  | 'EFFECTIVE_DATE'
  | 'EXPIRY_DATE'
  | 'ADDRESS'
  | 'DURATION';
}

export interface TermText {
  lineItem: number;
  term: string;
}

export interface ContractDetail {
  id: number;
  contractNo?: string;
  contractType: LookupData;
  contractSubType: LookupData;
  subContractType: SubContractType;
  budgetCode: string;
  refNo: string;
  contractDate: moment.Moment;
  effectiveDate: moment.Moment;
  expireDate: moment.Moment;
  status: string;
  description: string;
  customer: CustomerView;
  shippingChannel: LookupDataItem;
  frequencySettlement: LookupData;
  settlementPlan: LookupData;
  options: LookupData[];
  itemSponsor: ContractItem[];
  productDisplay: ContractItem[];
  settlementList: SettlementPlan[];
  incentiveScheme?: {
    incentiveSchemeTier1?: string;
    incentiveSchemeTier2?: string;
    incentiveSchemeTier3?: string;
    incentiveSchemeRemarks?: string;
  };
  contractDocPrepared?: boolean;
  attachmentFileIds?: string[];
  remarks?: string;
}

export interface IncentiveSchemeInfo {
  schemeNo: number;
  item: LookupDataItem;
  qty: number;
  sponsorItem: LookupDataItem;
  sponsorQty: number;
  remarks?: string;
}

export interface ContractItem {
  id: number;
  code: string;
  name: string;
  amount: number;
}

export interface IntialSponsor {
  statedDate: moment.Moment;
  required: boolean;
  estimatedAmount: number;
  items?: { itemId: number; qty: number }[];
}

export interface FindSettlementPlanParams {
  settledUntil: moment.Moment;
  customerId?: number;
  regions?: number[];
  outletTypes?: number[];
  salePersons?: number[];
  frequencySettlement?: number;
  subChannels?: number[];
  mainChannels?: number[];
}

export interface SettlementPlan1 {
  id: number;
  customerNo: string;
  customerName: string;
  outLetType: string;
  area: string;
  region: string;
  contractNo: string;
  budgetCode: string;
  subContractType: string;
  frequencySettlement: string;
  channels: string[];
  settlementPlan: SettlementPlan;
}

export interface SettlementPlan {
  id: number;
  customer: LookupDataItem;
  contract: LookupDataItem;
  scheduledDate: moment.Moment;
  isSettled: boolean;
  settledDate?: moment.Moment;
  total: number;
  status?: string;
  comment?: string;
  commentInternal?: string;
  itemList: SettlementPlanItem[];
}

export interface SettlementPlanItem {
  id: number;
  displayCode?: string;
  item: LookupData;
  qty: number;
}

export interface ContactChannel {
  channelTypeId: number;
  name: string;
  description?: string;
}

export interface Address {
  houseNo?: string;
  streetNo?: string;
  streetName?: string;
  provinceId: number;
  districtId: number;
  communeId: number;
  villageId: number;
  latitude: string;
  longitude: string;
}

export interface CustomerView extends CustomerItemBase {
  internalName: string;
  ownerName?: string;
  sale?: LookupDataItem;
  outletType?: outletType;
  division?: LookupDataItem;
  region: LookupDataItem;
  addressList: AddresssView[];
  contacts?: ContactListItem[];
  contracts?: ContractLess[];
  description?: string;
  purchaseEstList?: PurchaseEstData[];
  supplySource?: LookupDataItem;
  attachmentFileIds?: string[];
  settlementList: SettlementPlan[];
  saleInfo?: CustomerSaleInfo;
  posmItems?: POSMView[];
  codeTracking?: {
    idl9?: string;
    idl0?: string;
    idm0?: string;
    idc0?: string;
  };
  visitPlans?: VisitPlanDataView[];
}

export interface VisitPlanAdvanceSearchParams {
  regionId?: number;
  provinceId?: number;
  salespersonId?: number;
}

export interface CustomerAdvanceSearchParams {
  customerTypeId?: number;
  outletTypeId?: number;
  source?: string;
  salespersonId?: number;
  status?: string;
  divisionId?: number;
}

export interface VisitScheduleAdvanceSearchParams {
  customerId?: number;
  salespersonId?: number;
  status?: string;
  dates?: moment.Moment[];
  completedDate?: moment.Moment[];
  planned?: string;
  hasContractOnly?: boolean;
  hasPosmCheckedOnly?: boolean;
  contractTypeIds?: number[];
  devisionIds?: number[];
  month?: Moment;
  contractVerified?: boolean;
  posmVerified?: boolean;
  hasAttachment?: boolean;
  // hasErrorAttachment?: boolean;
}

export interface VisitPlanData {
  id: number;
  key: string;
  addressKey: string;
  weekOfTheMonths: number[];
  dayOfTheWeeks?: number;
}

export interface VisitPlanDataView {
  id: number;
  key?: string;
  address: LookupDataItem;
  items: LookupData[];
}

export interface VisitPlanItem {
  id?: number;
  address: AddressData;
  visitItem: LookupData[];
}

export interface AddresssView {
  id?: number;
  key?: string;
  address: string;
  type?: LookupData;
  province?: LookupDataItem;
  district?: LookupDataItem;
  commune?: LookupDataItem;
  village?: LookupDataItem;
  houseNoKh?: string;
  streetNoKh?: string;
  streetNameKh?: string;
  houseNo?: string;
  streetNo?: string;
  streetName?: string;
  hotspot?: string;
  direction?: string;
  latitude: string;
  longitude: string;
  visitPlanOptionList?: number[];
  // weekOfTheMonths?: number[];
  // dayOfTheWeek?: number;
}

export interface SettlementInfo {
  business: LookupDataItem;
  effectiveDate: moment.Moment;
  expiryDate: moment.Moment;
  durationInMonths: number;
  frequencySettlement: LookupDataItem;
  settlementPlan?: LookupDataItem;
  contractItemList: ItemView[];
  settlementPlans: SettlementPlan[];
}

export interface ItemView {
  item: LookupDataItem;
  quantity: number;
  type: 'PURCHASE_EST' | 'ITEM_SPONSOR' | 'PRODUCT_DISPLAY';
}

/** settlement schedule */

export interface SettlementScheduleItemList {
  id: number;
  name: string;
  salePerson: LookupDataItem;
  status: LookupData;
  cycleType: LookupData;
  cycleDay: number;
  effectiveDate: moment.Moment;
  ranDate: moment.Moment;
  nextRunDate: moment.Moment;
}

export interface SettlementScheduleSaveData {
  id?: number;
  name: string;
  salePersonId: number;
  statusId: number;
  cycleTypeId: number;
  cycleDay: number;
  effectiveDate: moment.Moment;
  customers: number[];
}

export interface FindCustomerParams {
  customerId?: number;
  regionIds?: number[];
  salePersonIds?: number[];
  frequencySettlementId?: number[];
  mainChannelIds?: number[];
  subChannelIds?: number[];
  outletTypeIds?: number[];
}

export interface CustomerSearchResult {
  customerId: number;
  customerCode: string;
  customerName: string;
}

export interface SettlementScheduleDetail {
  id: number;
  name: string;
  salePerson: LookupDataItem;
  status: LookupData;
  jobStatus: LookupData;
  cycleType: LookupData;
  cycleDay: number;
  effectiveDate: moment.Moment;
  runDate: moment.Moment;
  nextRunDate: moment.Moment;
  customers: CustomerSearchResult[];
  settlementPlans: SettlementPlan[];
  settlements: Settlement[];
}

export interface Settlement {
  description: string;
  id: number;
  manualReason: string;
  manualRun: true;
  processDate: moment.Moment;
  createdDate: moment.Moment;
  refNo?: string;
  status: string;
}

export interface VisitPlanListItem {
  id: number;
  customer: LookupDataItem;
  salePerson: LookupDataItem;
  address: AddressInfo;
  visits: LookupData[];
  // autoCreateSchedule: boolean;
  numDaysBefore?: number;
  remarks?: string;
  region?: { name: string };
}

export interface UploadedVisitPlan {
  rowId: number;
  id: number;
  customerCode: string;
  salespersonCode: string;
  salespersonName: string;
  customerName: string;
  address?: string;
  addressId?: number;
  weeks?: string;
  dayOfWeek?: string;
  isNew?: boolean;
  errors?: any;
}

export interface UploadVisitPlanResponse {
  items?: UploadedVisitPlan[];
  externalId: string;
  isError: boolean;
  customerCodes?: string[];
  salespersonCodes?: string[];
}

export interface VisitScheduleGenItem {
  id: number;
}

export interface VisitScheduleDetail extends VisitScheduleItem {
  visit?: VisitDetail;
  stockCountList: StockCount[];
  posmItems: POSMView[];
  posmReviewList: PosmReview[];
  posmCheckedList: PosmCheckedDataView[];
  contracts: ContractViewData[];
  contractCheckedList: ContractCheckedDataView[];
}

export interface VisitDetail {
  id: number;
  actualLatitude: string;
  actualLongitude: string;
  checkInDate: moment.Moment;
  checkInImage: string;
  checkInRemarks: string;
  checkoutDate: moment.Moment;
  checkoutRemarks: string;
  externalDoc?: string;
  remarks?: string;
  shopIsClosed?: boolean;
  attachments?: { id: number; imageId: string }[];
}

export interface StockCount {
  id: number;
  itemId: number;
  item?: ProductItem;
  quantity: number;
  remarks?: string;
  stockExpired?: { quantity: number; expiredDate: moment.Moment }[];
}

export interface PosmCheckedDataView {
  id: number;
  category: string;
  item: LookupDataItem;
  qty: number;
  actualQty: number;
  itemCheckedStatus: LookupDataItem;
  checkedStatus: LookupDataItem;
  remarks?: string;
}

export interface PosmReview {
  id: number;
  category: string;
  posm: LookupDataItem;
  quantity: number;
  // imageId: string;
  status: string;
  remarks?: string;
  attachments?: { id: number; imageId: string }[];
}

export interface VisitScheduleItem {
  id: number;
  customer: CustomerLess;
  salesperson: LookupDataItem;
  address: LookupDataItem;
  customerAddressId: number;
  scheduleDate: moment.Moment;
  district?: string;
  province?: string;
  createdBy: string;
  createdDate: moment.Moment;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  contractChecked?: boolean;
  posmChecked?: boolean;
  completedDate?: moment.Moment;
  completedBy?: string;
  remarks?: string;
  scheduleType?: string;
  attachments: { id: number; imageId: string }[];
  hasAttachment?: boolean;
  hasErrorAttachment?: boolean;
}

/**********Incentive Scheme**********/
export interface IncentiveScheme {
  id: number;
  name: string;
  tier1: string;
  tier2?: string;
  tier3?: string;
  description: string;
}

export interface Commant {
  id?: number;
  author?: string;
  date?: moment.Moment;
  description: string;
  objectId: number;
  objectTypeId: number;
}
