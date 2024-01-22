import type { ExchangeRate, SalesTeamWorkLess } from '@/services/sale/data';
import type { SalesInvoiceAR } from '../daily_report/data';

export interface SettlementDto {
  settlementDate: string;
  settledExchangeRate: ExchangeRate;
  soldExchangeRate: ExchangeRate;
  totalInvoice: number;
  totalQty: number;
  uom: string;
  // totalLostAmount: number;
  totalSoldAmount: number;
  // totalBankAmount: number;
  totalSettledAmount: number;
  settlements?: SettlementLess[];
}

export interface SettlementLess {
  id?: number;
  salesperson: SalesTeamWorkLess;
  soldAmount: number;
  amount: number;
  amountKH: number;
  cashierName: string;
  exchangeRate: number;
  settlementDate: moment.Moment;
  bankAmount?: number = 0.0;
  invoices?: SalesInvoiceAR[];
}
