import { LookupDataItem } from "@/services/data";
import moment, { Moment } from "moment";
import { FieldInfo } from "@/services/shared/data";

export type SaveContactData = {
  id?: number;
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


export type ContractAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  processStatus: 'All' | 'NEW' | 'RENEW' | 'TERMINATED',
  searchValue?: string;
  brandId?: number[],
  contractTypeId?: number[],
  termId?: number[],
  startedDateFrom?: moment.Moment,
  startedDateTo?: moment.Moment,
  endedDateFrom?: moment.Moment,
  endedDateTo?: moment.Moment,
};

export type ContractPOSMItem = {
  id: number
  itemId: number;
  qty: number;
  remarks?: string;
  attachment?:string[];
}

export type Terms = {
  terms: string
}

export type SavePosmParams = {
  id?: number
  contractId: number
  itemId: number
  qty: number
  remarks?: string
}


export type POSM = {
  id: number;
  name: string;
  descrtion?: string;
  categoryId?: number;
}


export type POSMView = {
  id: number
  category: string
  item: LookupDataItem
  qty: number
  remarks?: string
}

export type POSMItemCheck = {
  id: number
  category: string
  itemId: number
  itemName: string
  qty: number
  actualQty: number
  remarks?: string
}

export interface ContractViewData {
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
  terms?: LookupDataItem,
  remarks?: string;
  posmItems?: POSMView[],
  customerAddressList: number[]
}

export type PosmChecked = {
  itemId: number
  qty: number
  actualQty: number
  remarks?: string
}

export type SaveContractCheck = {
  contractId: number
  compliance: string;
  status?: string;
  remarks?: string
}

export type SaveContractCheckList = {
  visitId: number
  items: SaveContractCheck[]
}

export type EditContractCheck = {
  id: number;
  compliance: number;
  status?: number;
  remarks?: string
}

export type PosmCheckDataView = {
  id: number
  contractPosmId: number
  itemId: number
  qty: number
  actualQty: number
  remarks?: string
}

export type ContractCheckedDataView = {
  id: number
  contractId: Int
  checkedDate: Moment
  checkedBy: string
  compliance: LookupDataItem,
  status?: LookupDataItem,
  remarks?: string
  // posmItems: PosmCheckDataView[]
}


export type SaveCustomerPosmParams = {
  id?: number
  customerId: number
  itemId: number
  qty: number
  remarks?: string
}

export type ContractReportParams = {
  status?: string[],
  brandId?: number[],
  contractTypeId?: number[],
  termId?: number[]
}




export type ImportedContract = {
  id: number;
  customerCode?: string;
  contractNo?: string;
  contractType?: string;
  brand?: string;
  budgetCode?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: string;
  action?: string;
  terms?: string;
  remarks?: string;
  fieldInfoList: FieldInfo[];
}