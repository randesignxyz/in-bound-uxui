export interface allocateSearch {
  searchValue?: string;
  date?: moment.Moment;
}

export interface Allocate {
  id: string,
  so_entry?: string,
  so_num?: string,
  so_date?: string,
  customer_code?: string,
  customer_name?: string,
  total_amount?: string,
  total_order_qty?: string,
  so_status?: string,
  last_sync?: string,
  item_count?: number,
  percentage?: number
}

export interface SOList {
  id: string,
  soNo?: string,
  orderedDate: string,
  poNo?: string,
  province?: string,
  region?: string,
  customerId: string,
  customerCode: string,
  customerName: string,
  salespersonId: string,
  salespersonCode: string,
  salespersonName: string,
  shippingAddress: string,
  amount: string,
  vatAmount: string,
  discountAmount: string,
  totalAmount: string,
  status: string,
  source: string,
  postedBy?: string,
  postedDate?: string,
  docEntryNum: string,
  deliveries: DeliveryList[],
  totalItemQty?: number,
  totalDnQty?: number,
  dn_status?: string
}

export interface DeliveryList {
  id: string,
  soId: string,
  deliveryDate: string,
  shippingAddress?: string,
  priority?: string,
  remarks?: string,
  shift?: string,
  deliveryItems: DeliveryItemList[]
}

export interface DNList {
  key: any;
  id: number,
  soId: string,
  deliveryDate: string,
  shippingAddress?: string,
  priority?: string,
  remarks?: string,
  shift?: string,
  deliveryItems: DNPlan[]
  soNo?: string,
  soStatus?: string
  poNo?: string
  claimed_by?: string
  claimed_date?: string
  so_no?: string
  reserve_num?: string
  customer_code?: string,
  customer_name?: string,
  status?: string,
  mergeItems: mergeItems[]
}

interface mergeItems {
  allocateID?: string
  category?: string
  delItemName?: string
  deliveryId?: string
  dn?: string
  id?: string
  itemCode?: string
  itemName?: string
  lineNumber?: string
  qty?: string
  saleType?: string
  sku_id?: string
  sku_name: string
  sku_uom: string
  so_num?: string
  sequence?:string
}
interface DN {
  createdBy?: string
  createdDate?: string
  dn_date?: string
  dn_num?: string
  dn_qty?: string
  has_dn?: string
  id?: string
  item_code?: string
  item_name?: string
  lastModifiedBy?: string
  lastModifiedDate?: string
  line_number?: string
  order_qty?: string
  plan_delivery_date?: string
  remark?: string
  salesPlanID?: string
  so_allocate_id?: string
  so_entry?: string
  so_num?: string
  type?: string
}

// interface DNPlan {
//   allocateItemIds?: string
//   deliveryId?: string
//   id?: string
//   itemCode?: string
//   itemName?: string
//   lineNumber?: string
//   qty?: string
//   saleType?: string
//   soNum?: string
//   dn: DNDetail[]
//   attachment?: Attachment[];
// }

interface DNPlan {
  sku_id: string;
  sku_uom: string;
  allocateItemIds?: string;
  deliveryId?: string;
  id?: string;
  itemCode?: string;
  itemName?: string;
  lineNumber?: string;
  qty?: string;
  saleType?: string;
  soNum?: string;
  dn: DNDetail[];
  attachment?: Attachment[];
  so_status?: string
  delItemName?: string
}

export interface DeliveryItemList {
  id: string,
  deliveryId: string,
  itemName: string,
  itemCode: string,
  qty: number,
  saleType: string
  dn: DeliveryDnParams[]
}

export type AllocateAdvanceParams = {
  searchValue?: string;
  so_status: string;
  so_date?: string;
};

export type AllocateSOAdvanceParams = {
  searchValue?: string;
  status: string;
  ordered_date?: string;
  dnStatus?: string
  delivery_date?: string
};

export type DNDetail = {
  id: number;
  item_code: string;
  item_name: string;
  line_number: string;
  dn_date: string;    // ISO string
  dn_num: string;
  dn_qty: string;
  remark: string;
  salesPlanID: string;
  type: string;
  attachment?: Attachment[];
};


export type DNItemParams = {
  deliveryId: number,
  dn: DNDetail[],
  id: number,
  itemCode: string,
  itemName: string,
  qty: number,
  saleType: string,
  allocateID: string,
  lineNumber: string,
  so_num: string,
  isUnplan?: string,
  delItemName?: string
};

export type DNParams = {
  deliveryDate: string,
  deliveryItems: DNItemParams[]
  id: number;
  priority?: string | null;
  remarks?: string | null;
  shift?: string | null;
  shippingAddress?: string | null;
  soId?: number | string | null;
  claimed_by?: string
  claimed_date?: string
  unplannedItems: DNItemParams[]
}

export type UpdateRemarkParams = {
  id?: number,
  remark?: string,
  attachment?: Attachment[]
}

type Attachment = {
  attachment: string
}

export type DeliveryDnParams = {
  key: number,
  id: number,
  item_code: string,
  item_name: string,
  line_number: string,
  dn_num?: string,
  dn_qty?: string,
  dn_date?: string,
  type: string,
  total_plan_qty: string,
  attachment?: Attachment[],
  remark: string
}

export type SOAllocateActivities = {
  id: number,
  action: string,
  action_by: string,
  action_name: string,
  action_date: string,
  dnId: string
}

export type DnQuickView = {
  id: number,
  open_count: number
  complete_count: number
  in_progress_count: number
  total_count: number
}

export type SkuList = {
  id: number,
  sku_code: string,
  sku_name: string,
  item_category: number,
  sequence: number,
  item_code: string,
}

export type LocationList = {
  id: number,
  internal_name: string,
  name: string,
  parent: string,
  type: string,
}