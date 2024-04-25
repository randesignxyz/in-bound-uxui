import moment, { Moment } from "moment";


export type SettlementCycleAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  processStatus: 'All' | 'NEW' | 'RENEW' | 'TERMINATED',
  brandId?: number[],
  contractTypeId?: number[],
  termId?: number[],
  contractNo?:string
};

export type SaveGratisContactData = {
  id?: number;
  contractId?: number;
  contractNo?: string;
  customerId: number;
  contractTypeId: number;
  brandId: number;
  budgetCode: string;
  contractDate: Moment;
  contractDuration: Moment[];
  termId: number;
  remarks?: string;
}

export type SaveGratisContractCheckListData = {
  id?: number;
  contractId?: number;
  remarks?: string;
}
export type SaveChangeStatusData = {
  id: number;
  status: string;
  remarks?: string;
}

export interface GratisContract {
  id: number;
  contractId: number;
  contractNo?: string;
  contractDate: moment.Moment;
  contractType: string;
  brand: string;
  subContract: SubContract;
  customer: LookupDataItem;
  addressId?: number;
  address?: string;
  effectiveDate: moment.Moment;
  expiryDate: moment.Moment;
  terms?: string;
  duration: number;
  daysLeft: number;
  budgetCode: string;
  refNo?: string;
  status?: string;
  contracts?: VerifyGratisContact[];
  achieved?: number;
  months?: number;
}

export type VerifyGratisContact = {
  id: number;
  gratisContractId: number;
  verifiedDate:  Moment;
  orderNo: number;
	createdBy: string;
	createdDate:  Moment;
	lastModifiedBy?: string;
	lastModifiedDate?:  Moment;
  status?: string;
  remarks?: string;
  verified?: string;
  invoices?: GratisInvoice[];
  title?:string;
  durationText?:string;
  uuid?:string;
  totalCustomerVisitUpdated?: number

}
export interface GratisVerifyItem {
 uuId: string;
 gContractId: number;
 gContractVerifyId: number;
 itemCode: string;
 itemName: string;
 qty: number;
 qty1: number;
 qty2: number;
 uomCode: string;
 customerId: number;
 customerCode: string;
 actionCode: string;
 invoices?: GratisInvoice[];
}
export interface GratisVerifySchedule {
  id: number,  
  scheduledDate:moment.Moment;
  completedDate?:moment.Moment;
  salespersonId: number;
  salesperson:string;
  customerId:number;
  contractId:number;
  contractNo?:string;
  scheduleType:string;
  status:string;
  complianceStatus:string;
 }
export interface GratisInvoice {
  id: number;
  invId: number;
  invNum: number;
  invDate: moment.Moment;
  qty: number;
  customerId: number;
  customerCode: string;
  contractVerifyId: number;
  editable: boolean;
  dataSource: string;
  items?: GratisInvoiceItem[];
  tranType?:string;
  actionCode?:string;
}
export interface GratisInvoiceItem {
  invId: number;
  invNum: number;
  invItemLineNum: number;
  invDate: moment.Moment;
  invItermCode: string;
  invItermName: string;
  qty: number;
  invUomCode: string;
  invItemDate: moment.Moment;
  contractVerifyId: number;
  
}

export interface LookupDataItem {
  id: number;
  key?: string;
  name: string;
  code?: string;
  description?: string;
}
export interface SettlementPlan {
  id: number;
  fromDate: moment.Moment;
  toDate: moment.Moment;
  processDate: moment.Moment;
  contractNo: string;
  businessName: string;
  item: string;
  totalQty: number;
  totalCash: number;
  remark?: string;
  internalRemark?: string;
  status: string;
}

export interface GratisContractViewData {
  id: number;
  contractNo?: string;
  contractType: LookupDataItem;
  customer: LookupDataItem;
  brand: LookupDataItem;
  budgetCode: string;
  refNo: string;
  contractDate: moment.Moment;
  effectiveDate: moment.Moment;
  expireDate: moment.Moment;
  status: string;
  terms: LookupDataItem?,
  remarks?: string;
  posmItems?: POSMView[]
}

export interface SettlementSearchDate {
  contractTypeId?: number[];
  contractTypeGroupCode?: string;
  dateFrom?: moment.Moment;
  dateTo?: moment.Moment;
  frenquency?:string;
  searchValue?:string;
  target?: number[];
  incentiveRate?:number[];
  skuSettled?:string[];

}
export interface CreateSettlemenDate { 
  label: string;
  remarks?: string;
  contracts: ContractAddressPayload[];
  // contractTypeId?: number;
  dateFrom?: moment.Moment;
  dateTo?: moment.Moment;
  frequency?:string;
  contractTypeGroupCode?: string;
}
export interface ContractAddressPayload{
  contractId: number;
  addressId?: number;
}

export interface IncentiveSettlement {
  id: number;
  formNo?: string;
  label: string;
  description: string;
  contractType?: LookupDataItem;
  settledPeriod?: string;
  processDate: moment.Moment;
  createdBy: string;
  createdDate: moment.Moment;
  lastModifiedBy?: String;
  lastModifiedDate?: moment.Moment;
  startedDate: moment.Moment;
  endedDate: moment.Moment;
  status: string;  
  processStatus: string;
  contracts: List<GratisContract>;
  requestStatus?: string;
  processInstId?: string;
}

export interface CriteriaExportReport {
  id: number;
  reportName: string;
}
export interface LookupDataItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
}
export type SettlementCycleActivity = {
  id: number;
  action: string;
  actionBy: string;
  actionDate: moment.Moment;
  settlementId: number;
  comment?: string;
  linkId: number;
  linkNo: number;
}
export interface SettlementCycle {
  id: number;
  startedDate: moment.Moment;
  endedDate: moment.Moment;  
  contractId: number;
  contractNo: string?;
  effectiveDate: moment.Moment;
  expiryDate: moment.Moment;
  customerId: number;
  customerCode: string;
  customerName: string;
  provine: string;
  region: string;
  outletType: string;
  saleExecute: string;
  budgetCode: string;
  contractType: string;
  brandId: number;
  brand: string;
  settledFrequency:string;
  skuSettled: string;
  termID: number;
  term: string?;
  qty: number;
  offers: number;
  achieved: number;
  months: number;
  status: string;
}
export interface SearchCriteria{
  id?:number;
  searchValue?:string;
  status?:string;
  filter?: string;
  dateFrom?: moment.Moment;
  dateTo?: moment.Moment;
}
export interface GratisVisitScheduleParams{ 
  gVerifyId?: number;
  scheduleId?: number;
  searchValue?:string;
}

export interface AdjustInfoOn {
  uuId: string;
  // itemCode: string;
  // itemName: string;
  customerId: number;
  customerCode: string;
  qty:number;
  lineNum?: number;
  contractVerifyId?: number;
  startedDate: moment.Moment;
  endedDate: moment.Moment;
  targets: number;
  dataSource: string;
  dscription?: string;
  items?: AdjustInfoItemDetail[]
}
export interface AdjustInfoItemDetail {
  uuId: string?;
  customerId: number?;
  customerCode: string?;
  itemCode: string?;
  itemName: string?;
  contractVerifyId: number?;
  qty: number?;   
  dataSource: string?;
}
interface AdjustItem {   
  uuId: string; 
  // id?: number; 
  docNum?: string;
  docDate?:moment.Moment;
  itemCode?: string;
  itemName?: string;
  lineNum?:number;
  qty?: number;
  uomCode: string;
  contractVerifyId?: number;
  dataSource?:string;
  startedDate?: moment.Moment;
  endedDate?: moment.Moment;
  dscription?: string;
}
interface AdjustCustomerVisitSchedule {   
  id: number;   
}
interface HistoryItem {
 item: string;
 contractVerifyId: number;
 items: HistorySubItem[]
}
interface HistorySubItem {
  id: number;
  item: string;
  docNum: number;
  docDate: moment.Moment;
  itemCode: string;
  itemName: string;
  qty: number;
  status: boolean;
  createdBy: string;
  createdDate: moment.Moment;
  modifiedBY: string;
  modifiedDate: moment.Moment;
  actionCode: string;
  tranType?: string;
}

interface ItemSAP {
  uuId: string;
  docEntry: number;
  docNum: string;
  docDate?: moment.Moment;
  canceled: string;
  customerCode : string;
  quantity: number;
  uomCode: string;
  lineNum: number;
  itemCode: string;
  itemName: string;
  dscription: string?;
  ds?: string;
  startedDate: moment.Moment;
  endedDate:  moment.Moment;
  dataSource?:string;
}

export type ApprovalRequestPayload= {
  settlementCycleId: number;
  requester: string;
  requesterBuId: number;
}

export type GratisSuggestedCustomer= {
  id: number;
  incentiveSettlementId: number;
  gcontractId: number;
  gcontractVerifyId: number;
  contractType: string;
  customer: LookupDataItem;
  brand: string;
  terms?: string;
  contractNo?: string;
  title: string;
  orderNo: number;
  durationText?:string;
  targets: number;
  qtyLess: number;
  qty: number;
  percentage: number;
  percentLess:number;
  status: string;
  soQty: number;
  soInvQty: number;
  totalQty: number;
  gratisSettlementConfigId?: number;
}
export interface  GratisSuggestedCustomerVisit {
  id: number,  
  incentiveSettlementId: number;
  gcontractId: number;
  gcontractVerifyId: number;
  contractType: string;
  customer: LookupDataItem;
  brand: string;
  terms?: string;
  gcontractNo?: string;
  title: string;
  orderNo: number;
  durationText?:string;
  scheduledDate:moment.Moment;
  completedDate?:moment.Moment;
  salespersonId: number;
  salesperson:string;
  customerId:number;
  address?: string;
  contractId:number;
  contractNo?:string;
  scheduleType:string;
  status:string;
  complianceStatus:string;
  contractId1:number;
  contractNo1?:string;
  complianceStatus1?:string;
  tranStatus?:string;
 }
