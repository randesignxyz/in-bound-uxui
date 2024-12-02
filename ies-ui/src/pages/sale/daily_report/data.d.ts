import type { ExchangeRate, StockAdjustmentDto, StockDetailItemLess } from '@/services/sale/data';
import type moment from 'moment';

export interface TableViewDailyReportParam {
  //criteria: { selectedDates?: moment.Moment[]; sort?: Record<string, SortOrder> };
  pagination?: {
    pageSize?: number;
    current?: number;
  };
}

export interface StockControlAR {
  requestedDate: string;
  totalInvoice: number;
  totalSoldQty: number;
  settledExchangeRate: ExchangeRate;
  soldExchangeRate: ExchangeRate;
  totalSettledAmount: number;
  uom: string;
  totalSoldAmount: number;
  stockControls: List<StockControlARLess>;
}

export interface StockControlARLess {
  id: number;
  plateNumber?: string;
  owner: string;
  approvedBy: string;
  requestedDate: moment.Moment;
  isKeepForwarding: boolean;
  totalSoldAmount: number;
  totalSettledAmount: number;

  items?: StockDetailItemLess[];
  invoices?: SalesInvoiceAR[];
  adjustmentItems?: StockAdjustmentDto[];
}

export interface SalesInvoiceAR {
  id: number;
  invoiceNo: string;
  invoiceDate: moment.Moment;
  amount: double;
  salesperson: string;
  items: SalesInvoiceItemAR[];
}

export interface SalesInvoiceItemAR {
  id: number;
  name: string;
  code: string;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
