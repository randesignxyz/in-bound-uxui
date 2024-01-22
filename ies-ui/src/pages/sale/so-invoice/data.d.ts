import type { LeadLess, SalesTeamWorkLess } from '@/services/sale/data';

export interface SalesInvoiceLess {
  id?: number;
  invoiceNo: string;
  invoiceDate: moment.Moment;
  subAmount: number;
  amount: number;
  status: string;
  referenceNo?: string;
  createdDate: moment.Moment;
  salesperson: SalesTeamWorkLess;
  customer?: LeadLess;
  discount: number = 0.0;
  items: SalesInvoiceItemLess[];
}

export interface SalesInvoiceItemLess {
  itemType?: string;
  itemName: string;
  itemCode: string;
  itemType: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
