import moment from 'moment';

export interface VisitAvanceSearchParam {
  searchValue?: string;
  status?: string;
  salespersonCode?: string;
  customerId?: number;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
}

export interface VisitDTO {
  id: number;
  visitDate: moment.Moment;
  checkInDateTime: moment.Moment;
  checkOutDateTime: moment.Moment;
  status: string;
  checkInLatitude: string;
  checkInLongitude: string;
  checkOutLatitude?: string;
  checkOutLongitude?: string;
  remark?: string;
  salespersonCode: string;
  salespersonName: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  // houseNo?: string;
  // streetNo?: string;
  // streetName?: string;
  // village?: string;
  // district?: string;
  // commune?: string;
  // province?: string;
  region?: string;
  salesInvoiceId?: number;
  internalId?: string;
  attachments?: string[];
  salesInvoice?: SalesInvoiceInfo;
}

export interface SalesInvoiceInfo {
  id: number;
  invoiceNo: string;
  invoiceDate: moment.Moment;
  subAmount: number;
  amount: number;
  discount?: number = 0.0;
  status: string;
  salespersonCode: string;
  stockControlId: number;
  referenceNo?: string;
  customerId?: number;
  items?: SaleInvoiceItemInfo[];
}

export interface SaleInvoiceItemInfo {
  id: number;
  sequence: number;
  itemId: number;
  itemName?: string = null;
  stockCategoryId?: number = null;
  itemType: string;
  itemCode: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  batchNo?: string;
  description?: string;
  invoiceId: number;
}
