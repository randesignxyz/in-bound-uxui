export interface RegisterCustomerInfo {
  id: number;
  formNo: string;
  buName: string;
  buNameKh: string;
  ownerName: string;
  ownerNameKh: string;
  purchaseName: string;
  purchasenameKh: string;
  ownerPhone: string;
  purchasePhone: string;
}

export type RegisterCuistomerInfoAdvanceSearchParams = {
  status: 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
//   acquiredDate?: Moment[];
//   requestedDate?: Moment[];
//   subStatus?: string;
//   searchValue?: string;
//   service?: boolean;
//   integratedStatus?: string;
//   deptIds?: number[];
//   buIds?: number[];
};


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
}