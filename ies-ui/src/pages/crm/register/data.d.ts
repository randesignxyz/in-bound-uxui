import { Moment } from "moment";
import { SetRendererRect } from "react-doc-viewer/build/state/actions";

export interface RegisterCustomer {
  id: number;
  customerCode?: string;
  vatInv?: string;
  purpose?: string;
  priceTradeOfferId?: string;
  paymentTermId?: string;
  outletTypeId?: number;
  divisionId?: number;
  channelId?: number;
  ppItems?: PurchasingPerformanceItem[];
  frequencyPurchase?: string;
  remarkFrequencyPurchase?: string;
  billing?: AddressParams[];
  shipping?: AddressParams[];
  docPersonalList?: DocRequirementCustomerParams[];
  docCorporateList?: DocRequirementCustomerParams[];
}
export interface DocRequirementCustomerParams{
  id: number;
  reCustomerId: number;
  reDocRequireId: number;
  checkList: number;
}
export type RegisterCuistomerInfoAdvanceSearchParams = {
  status: 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  subStatus?: string;
  subStatus2?: string;
  searchValue?: string;
  processStatus?: string;
  postedStatus?: string;
};
export interface RegisterCustomerListItem {
  id: number;
  customerCode?: string;  
  formNo?: string;
  processInstId: string;
  buName?: string;
  buNameKh?: string;
  ownerName?: string;
  ownerNameKh?: string;
  purchaseName?: string;
  purchasenameKh?: string;
  requestedBy?: string;
  processStatus?: string;
  status?: string;
  createdBy?: string;
  createdDate?: Moment;
  postedDate?: Moment;
  sapStatus?: string;
}
export interface RegisterCustomerDetailResponse{
  id: number;
  customerCode?: string;
  formNo: string;
  vatInv: string;
  vatText?: string;
  purpose: string;
  priceTradeOfferId?: number;
  priceTradeOfferName?: string;
  sapPriceTradeOfferId?: number;
  sapPriceTradeOfferName?: string;
  paymentTermId?: number;
  paymentTermName?: string;
  sapPaymentTermId?: number;
  sapPaymentTermName?: string;
  outletTypeId?: number;
  outletTypeName?: string;
  divisionId?: number;
  divisionName?: string;
  regionId?: number;
  regionName?: string;
  channelId?: number
  channelName?: string
  subChannelId?: number
  subChannelName?: string
  saleId?: string;
  saleName?: string;
  buName: string;
  buNameKh: string;
  ownerName: string;
  ownerNameKh: string;
  purchaseName: string;
  purchaseNameKh: string;
  ownerPhone: string;
  purchasePhone: string;
  status: string;
  createdBy: string;
  createdDate: Moment;
  ppItems?: PurchasingPerformanceItem[];
  frequencyPurchase?: string;  
  remarkFrequencyPurchase?: string;
  billing?: AddresssView[];
  shipping?: AddresssView[];
  docPersonalList?: DocumentRequireList[];
  docCorporateList?: DocumentRequireList[];
  attachedFiles?: string[];
  seriesId?: number;
}


export interface AddresssView {
  id?: number;
  key?: string;
  address: string;
  type?: string;
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
  // visitPlanOptionList?: number[];
}

export interface AddressParams {
  id: number,
  address: string,
  houseNo?: string,
  houseNoKh?: string,
  streetNo?: string,
  streetNoKh?: string,
  streetName?: string,
  streetNameKh?: string,
  latitude: string,
  longitude: string,
  provinceId: number,
  districtId: number,
  communeId: number,
  villageId: number,
  hotspot?: string,
  direction?: string
}

export interface SaveRegisterCustomerAddressParams {
  registerCustomerId: number,
  addressType: string,
  address: AddressParams
}

export interface RegisterPPItemList {
  id: number,
  code: string,
  name: string,
  productId: number,
  description?: string,
  active: string
}

export interface RegisterItemBrandList {
  id: number,
  code: string,
  name: string
}
export interface PurchasingPerformanceItem  {
    key: string
  id: number
  categoryId?: number
  categoryName?: string
  itemId?: string
  itemName?: string
  pqty?: number
  dqty?: number
}
// export interface DocumentRequire{
//   docName:string,
//   docType:string, 
//   docRequire:string,
//   checkList: number
// }
export interface DoRequireCustomerList {
  id: number,
  reCustomerId: number,
  reDocRequireId: number,
  docName: string,
  docType: string,
  docRequired: string,
  docSource: string,
  checkList: number
  sort: number,
}
export interface RegisterCustomerWFPayload{
  instId: string
  seriesId?: number
}

export interface RcSapEmpSale{
  empId: number
  empNo: string
  empName: string
  integratedSapOflSaleId: number
  status: string
}