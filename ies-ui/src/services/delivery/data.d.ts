import moment, { Moment } from 'moment';
import { LookupDataItem } from '../data';

export interface QRCodeListItem {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface QRCode {
  id: number;
  name: string;
  code: string;
  description?: string;
}
export interface LoadingBayListItem {
  id: number;
  code: string;
  name: string;
  status: string;
  warehouse?: { code: string };
  description?: string;
  priority?: number;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface LoadingBay {
  id: number;
  code: string;
  name: string;
  status: string;
  priority?: number;
  warehouse?: LookupDataItem;
  description?: string;
}

export interface LoadingDockListItem {
  id: number;
  name: string;
  code: string;
  loadingBay: { id: number; code: string; name: string };
  autoAssigned: boolean;
  status: string;
  priority?: number;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
  combinedLoadingDocks?: LookupDataItem[];
  truckLoadingCapacities?: LookupDataItem[];

}

export interface LoadingDock {
  id: number;
  name: string;
  code: string;
  loadingBay: {
    id: number;
  };
  autoAssigned: boolean;
  allocated?: boolean;
  status: string;
  priority?: number;
  seq?: number;
  description?: string;
  combinedLoadingDocks?: LookupDataItem[];
  createdBy: string;
  truckLoadingCapacities?: { id: number }[];
}

export interface LoadingCapacityListItem {
  id: number;
  name: string;
  value: number;
}

export interface QueueListItem {
  id: number;
  name: string;
  format?: string;
  resetNum?: number;
  dailyReset: boolean;
  overwriteAssigned: boolean;
  ownedTruckLoading?: boolean;
  qrCode: QRCode;
  transportSources: TransportSource[];
  loadingDocks: LoadingDock[];
  description?: string;
  createdBy: string;
  createdDate: Moment;
  priority?: number;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
  warehouse?: { code: string };
}

export interface SaveQueue {
  id: number;
  name: string;
  format?: string;
  resetNum: number;
  qrCodeId: number;
  transportSourceIds: number[];
  loadingDockIds: number[];
  dailyReset: boolean;
  ownedTruckLoading?: boolean;
  priority?: number;
  overwriteAssigned: boolean;
  description?: string;
  warehouseId?: number;
}

export interface Queue {
  id: number;
  name: string;
  format?: string;
  resetNum: number;
  qrCode: QRCode;
  transportSources: TransportSource[];
  loadingDocks: LoadingDock[];
  dailyReset: boolean;
  warehouseId?: number;
  overwriteAssigned: boolean;
  ownedTruckLoading: boolean;
  description?: string;
  priority?: number;
}

export interface QueueSummaryStatus {
  pending: number;
  inProgress: number;
}

export interface QueueTicketDetail {
  id: number;
  queueName: string;
  ticketNum: string;
  queueNum: number;
  resetNum: number;
  issuedDate: Moment;
  issuedBy: string;
  priority: number;
  driver: Driver;
  truck: Truck;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
  status: string;
  loading?: LoadingDetail;
}

export interface LoadingDetail {
  id: number;
  loadingBay: string;
  loadingDock: string;
  assignedBy?: string;
  assignedDate: string;
  assignedPickingSlipBy: string;
  shift: string;
  loadingStarted?: Moment;
  loadingEnded?: Moment;
  loadedAll: boolean;
  loadedStatus: string;
  items: LoadingItemDetail[];
  truckTransfer?: {
    driverName: string;
    licensePlate: string;
  };
  newItems: LoadingItemDetail[];
  changeRequestPending?: boolean
}

export interface LoadingItemDetail {
  id: number;
  itemCode: string;
  itemDescription: string;
  uom: string;
  qty: number;
  batchNum?: string;
  whsCode?: string;
  loadedQty?: number;
}

export interface QueueTicketListItem {
  id: number;
  queueName: string;
  ticketNum: string;
  queueNum: number;
  resetNum: number;
  issuedDate: Moment;
  loadingDock?: LoadingDock;
  priority: number;
  driver: Driver;
  truck: Truck;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
  status: string;
}

export interface QueueTicket {
  id: number;
  processInstance: ProcessInstance;
  ticketNum: string;
  status: string;
  issuedDate: Moment;
  createdDate: Moment;
}

export interface ProcessInstance {
  id: number;
  driver: Driver;
  truck: Truck;
  active: string;
}

export interface TransportSourceListItem {
  id: number;
  name: string;
  deliveryTracking?: boolean;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface TransportSource {
  id: number;
  name: string;
  deliveryTracking?: boolean;
  description?: string;
}

export interface TruckListItem {
  id: number;
  code: string;
  name: string;
  isSideDoor?: boolean;
  loadingCapacity?: { name: string };
  licensePlate: string;
  company: Company;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface SaveTruck {
  id?: number;
  code: string;
  name: string;
  companyId: number;
  isSideDoor?: boolean;
  loadingCapacityId: number;
  loadingCapacity: number;
  licensePlate: string;
  description?: string;
}

export interface Truck {
  id?: number;
  code: string;
  name: string;
  company: Company;
  loadingCapacity?: { id: number, name: string };
  isSideDoor?: boolean;
  licensePlate: string;
  description?: string;
}

export interface DriverListItem {
  id: number;
  firstName: string;
  lastName: string;
  accountName?: string;
  idCard: string;
  company?: Company;
  driverLicense?: string;
  driverLicenseType?: string;
  driverLicenseExpiredDate?: string;
  multiTicket?: boolean;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface SaveDriver {
  id?: number;
  firstName: string;
  lastName: string;
  accountName?: string;
  companyId: number;
  truckIds?: number[];
  idCard: string;
  driverLicense: string;
  driverLicenseType: string;
  driverLicenseExpiredDate: string;
  multiTicket?: boolean;
  description?: string;
}


export interface SaveOfficerParams {
  id?: number;
  name: string;
  userName: string;
  description?: string;
}

export interface OfficerItem {
  id: number;
  name: string;
  userName: string;
  description?: string;
  loadingDocks: LoadingDockListItem[],
  warehouses: LookupDataItem[];
}

export interface Officer {
  id: number;
  name: string;
  userName: string;
  loadingDocks: LoadingDockListItem[],
  warehouses: LookupDataItem[];
  description?: string;
  createdBy: string;
  createdDate: Moment,
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface SaveOfficer {
  id?: number;
  name: string;
  userName: string;
  loadingDockIds: number[],
  warehouses?: number[];
  description?: string;
}

export interface Driver {
  id?: number;
  firstName: string;
  lastName: string;
  accountName?: string;
  company: Company;
  trucks?: Truck[];
  isQuest?: boolean,
  idCard: string;
  phoneNo?: string;
  driverLicense: string;
  driverLicenseType: string;
  multiTicket?: boolean;
  driverLicenseExpiredDate: string;
  description?: string;
}

export interface CompanyListItem {
  id: number;
  name: string;
  transportSource: TransportSource;
  contactPerson?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  description?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
}

export interface SaveCompany {
  id?: number;
  name: string;
  contactPerson?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  transportSourceId: Int;
  description?: string;
}

export interface Company {
  id?: number;
  name: string;
  transportSource: TransportSource;
  contactPerson?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  description?: string;
}

export interface Loading {
  id: number;
  loadingDock: LoadingDock;
  processInstance: { id: number };
  manualAssigned?: boolean;
  assignedBy?: string;
  assignedDate: moment;
  loadingStarted?: moment;
  loadingEnded?: moment;
}

export interface QueueDisplayData {
  loading: Loading[];
  ticketList: QueueTicket[];
  url: string[];
}

export interface LoadingSummaryStatus {
  pending: number;
  loading: number;
}

export interface LoadingListItem {
  id: number;
  ticketNum?: string;
  loadingDock: string;
  driver: Driver;
  truck: Truck;
  assignedDate: Moment;
  ownedTruckLoading?: boolean;
  canPick?: boolean;
  loadingStarted?: Moment;
  loadingEnded?: Moment;
  status: string;
}

export interface LoadedInfo {
  id: number;
  loadingDock: string;
  driver: Driver;
  truck: Truck;
  loadingStarted: Moment;
  loadingEnded: Moment;
  status: string;
  items: LoadedItemInfo[];
}

export interface LoadedItemInfo {
  id: number;
  itemCode: string;
  itemDescription: string;
  uom: string;
  qty: number;
  batchNum?: string;
  whsCode?: string;
  loadedQty?: number;
}

export interface DeliverySummaryStatus {
  pending: number;
  inProcess: number;
}

export interface SettlementSummaryStatus {
  unsettled: number;
  hold: number;
}

export interface DeliveryListItem {
  id: number;
  // loading: Loading;
  driver: Driver;
  truck: Truck;
  assignedDocDate?: moment.Moment;
  deliveryDate: moment.Moment;
  shift?: string;
  startedDate?: moment.Moment;
  finishedDate?: moment.Moment;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
  status: string;
}

// export interface SettlementData {}

export interface CashCollectionListItem {
  id: number;
  instanceId: number;
  delivery: DeliveryListItem;
  settled: boolean;
  hold: boolean;
  amount: number;
  collectedAmount: number;
  settledBy: string?;
  settledDate: Moment?;
}

export interface Loaded {
  id: number;
  allowedActualLoadingAmount: boolean;
  shift: string;
  remarks?: string;
  items: LoadedItem[];
  newItems?: LoadedItem[];

}

export interface LoadedItem {
  id: number;
  itemCode: string;
  itemDescription: string;
  uom: string;
  qty: number;
  batchNum?: string;
  whsCode?: string;
}

export interface LoadingItem {
  pickingItems: PickingSlipItem[];
  deliveryNoteListItems: DeliveryNoteListItem[];
  ownedTruckLoading?: boolean;
}

export interface DeliveryInfo {
  loadedInfo: LoadingDetail;
  deliveryInfo: DeliveryDetail;
}

export interface DeliveryDetail {
  id: number;
  deliveryDate: Moment;
  deliveredBy: string;
  truck: Truck;
  status: string;
  startedDate: Moment;
  finishedDate: Moment?;
  freights: FreightDetail[];
}


export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  altitudeAccuracy?: number;
}

export interface GeoPosition {
  coords?: GeoCoordinate,
  timestamp: number,
  mocked?: boolean;
  provider?: string;
}


export interface CheckInRs {
  id: number;
  checkInDate: Moment;
  location?: GeoPosition;
  remarks?: string;
  images?: string[];
}



export interface CheckoutRs {
  id: number;
  checkoutDate: Moment;
  location?: GeoPosition;
  cashCollections?: cashCollectionRs[];
  remarks?: string;
}

export interface cashCollectionRs {
  id: number;
  paidAmount: number;
  paymentMethod: string;
  bank?: string;
  remarks?: string;
  ref?: string;
  validDate?: Moment;
  images?: string[];

}


export interface Freight {
  customerCode: string;
  customerName: string;
  shipToCode: string;
  address: string;
}

export interface FreightDetail {
  id: number;
  customerName: string;
  customerCode: string;
  shippingAddress: {
    shipToCode: string;
    address: string;
  };
  status: string;
  qty: number;
  amount: number;
  phone1: string?;
  phone2: string?;
  phone3: string?;

  shippingLocation: string?,
  paidAmount: number?,
  canceled: boolean?,
  resolved: boolean?,
  deliveryNotes: DeliveryNote[];
  invoices: CheckoutInvoice[];
  itemReturns: DeliveryNoteItem[];
  checkIn?: CheckInRs;
  checkout?: CheckoutRs;

}

export interface DeliveryNote {
  id: number;
  docNum: string;
  docDate: number;
  qty: number;
  shift: string;
  items: DeliveryNoteItem[];
}

export interface AssigningDocsResponse {
  loading: LoadingDetail;
  deliveryNotes: DeliveryNoteDetail[];
  invoices: InvoiceItem[];
}

export interface ResolvedDNResponse {
  deliveryNotes: DeliveryNoteDetail[];
  invoices: InvoiceItem[];
}

export interface DeliveryNoteDetail {
  id: number;
  docEntry: number;
  docNum: string;
  docDate: Instant;
  cardCode: string;
  cardName: string;
  paymentTerm?: string;
  shipToCode: string;
  address?: string;
  direction?: string;
  hotspot?: string;
  latitude?: string;
  longitude?: string;
  village?: string;
  commune?: string;
  district?: string;
  province: string;
  invDocNum?: string;
  qty: Int;
  invAmount?: Double;
  shift: string;
  status: string;
  truckNo: string;
  driverCode: string;
  driverName: string;
  items: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id: number;
  invDocEntry?: number;
  lineNum: number;
  itemCode: string;
  itemDescription: string;
  uomCode: string;
  qty: number;
  actualQty?: number;
}

export interface InvoiceItem {
  id: number;
  docEntry: number;
  docNum: string;
  docDate: Moment;
  vatAmount: number;
  amount: number;
  collected?: boolean;
  paymentTerm?: string;
  manualAdded?: boolean;
  amountAfterVat: Double;
  salesperson: string;
  sameTrip?: boolean
}

export interface DeliveryNoteListItem {
  docEntry: number;
  cardCode: string;
  cardName: string;
  docNum: string;
  invDocNum: string;
  docDate: moment.Moment;
  invDocDate: moment.Moment;
  shipToCode: string;
  province: string;
  district?: string;
  commune?: string;
  qty: number;
  invAmount: number;
  shift: string;
  paymentTerm?: string;
  selected?: boolean;
}

export interface PickingSlipItem {
  id: number;
  itemCode: string;
  itemDescription: string;
  uomCode: string;
  qty: number;
  shift: string;
  batchNum?: numstring;
  whsCode?: string;
  licensePlate: string;
  shift: string;
  selected?: boolean;
}

export interface SettlementDetail {
  id: number;
  settledBy: string;
  settledDate: Moment;
  settledAmount: number;
  remarks?: string;
  checkoutList: CheckoutListItem[];
}

export interface CheckoutListItem {
  id: number;
  customerCode: string;
  customerName: string;
  shipToCode: string;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  cashCollections: CashCollections[];
  invoices: CheckoutInvoice[];
}

export interface CashCollections {
  id: number;
  paymentMethod: string;
  bank?: string;
  paidAmount: number;
  localCurrency?: boolean;
  exchangeRate?: number;
  images?: string[];
  remarks?: string;
  validDate?: Moment;
  settled?: boolean;
  ref?: string;
}

export interface CheckoutInvoice {
  id: number;
  invoiceNum: string;
  invoiceAmount: number;
  paymentTerm?: string;
  manualAdded?: boolean;
}

export interface AddedInvoice {
  invoiceNum: string,
  invoiceAmount: number,
}

export interface AssignDocParam {
  deliveryId: number;
  deliveryDocEntry: number[];
  reassigned?: boolean;
  collectedInvoices: {
    docEntry: number;
    collected: boolean;
    included: boolean;
    remarks?: string;
  }[];
}

export interface SettlementParams {
  deliveryId: number;
  remarks?: string;
  items: SettlementItem[];
}

export interface SettlementItem {
  id: number;
  ref?: string;
  validDate?: Moment;
}

export interface ReviewerListItem {
  id: number;
  telegramId: number;
  registeredDate: Moment;
  registeredPhone: string;
  reviewer: string;
  customerCode?: string;
  customerName?: string;
  verified?: char;
  verifiedType?: string;
  verifiedBy?: string;
  verifiedDate?: Moment;
}

export interface ReviewListItem {
  id: number;
  dnNum: string;
  reviewer: string;
  deliveryDate?: moment;
  customerCode?: string;
  customerName?: string;
  shipToCode?: string;
  driver?: string;
  verified?: char;
  startedDate: Moment;
  endedDate: Moment;
  items: ReviewItem[];
  comment?: string;
}

export interface ReviewItem {
  id: number;
  question: string;
  answer: string;
  type: string;
  startedDate: Moment;
  endedDate: Moment;
}


export interface LoadingTeam {
  id: number;
  name: string
}

