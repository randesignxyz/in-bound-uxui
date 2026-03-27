import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import moment from 'moment';
import type {
  ActivitiesItem as RequestActivity,
  AddSupplierParams,
  BomItem,
  BomItemSearch,
  Item,
  ItemSearch,
  ItemGroup,
  ProductionLine,
  Provided,
  ProvidedItem,
  ProvidedList,
  SAPTransferRequest,
  Supplier,
  SupplierSearch,
  TotalProvideParams,
  TransferRequest,
  TransferRequestItem,
  TransferRequestSearch,
  TransferRequestStatusChange,
  Warehouse as RequestWarehouse,
  closeParams,
} from './request/data';
import type {
  ActivitiesItem as TransferActivity,
  GetReceive,
  ReceiveStatusChange,
  SAPCloseDoc,
  Transfer,
  TransferCreate,
  TransferItem,
  TransferSearch,
  Warehouse as TransferWarehouse,
  getItemforCloseParams,
  updateProvidedParams,
} from './transfer/data';

type WarehouseCode = string;

type SeedItem = {
  code: string;
  name: string;
  uom: string;
  quantity: string;
  received?: string;
  isReceive?: string;
  remark: string;
  supplier: string;
};

type RequestSeed = {
  id: string;
  transferId: string;
  line: string;
  shift: string;
  transferType: 'FG' | 'PM/RM';
  status:
    | 'transfer-request'
    | 'request-production-approve'
    | 'request-warehouse-approve'
    | 'transferring'
    | 'received';
  state: 'in-progress' | 'completed' | 'rejected';
  fromWarehouse: WarehouseCode;
  toWarehouse: WarehouseCode;
  businessUnit: string;
  postingDate: string;
  dueDate: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  remark: string;
  items: SeedItem[];
};

type TransferSeed = {
  id: number;
  transferId: string;
  transferRequestId: string;
  line: string;
  shift: string;
  transferType: 'FG' | 'PM/RM';
  status: 'pending' | 'completed';
  fromWarehouse: WarehouseCode;
  toWarehouse: WarehouseCode;
  businessUnit: string;
  postingDate: string;
  dueDate: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  remark: string;
  items: Array<SeedItem & { total: string }>;
};

type ProvidedSeed = {
  id: number;
  provided: string;
  transferRequestId: string;
  status: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  items: SeedItem[];
};

const warehouseCatalog: Record<WarehouseCode, RequestWarehouse> = {
  'W02-PDFG': {
    id: 1,
    whsCode: 'W02-PDFG',
    whsName: 'Production FG Warehouse',
    building: 'W02',
    tendency: 'NVC',
    active: '1',
  },
  'W02-WHFG': {
    id: 2,
    whsCode: 'W02-WHFG',
    whsName: 'Main FG Warehouse',
    building: 'W02',
    tendency: 'NVC',
    active: '1',
  },
  'W02-WHPM': {
    id: 3,
    whsCode: 'W02-WHPM',
    whsName: 'Main PM/RM Warehouse',
    building: 'W02',
    tendency: 'NVC',
    active: '1',
  },
  'W02-PDPM': {
    id: 4,
    whsCode: 'W02-PDPM',
    whsName: 'Production PM/RM Warehouse',
    building: 'W02',
    tendency: 'NVC',
    active: '1',
  },
  'W02-PDFG-OMM': {
    id: 5,
    whsCode: 'W02-PDFG-OMM',
    whsName: 'Production FG Warehouse - OMM',
    building: 'W02',
    tendency: 'OMM',
    active: '1',
  },
  'W02-WHFG-OMM': {
    id: 6,
    whsCode: 'W02-WHFG-OMM',
    whsName: 'Main FG Warehouse - OMM',
    building: 'W02',
    tendency: 'OMM',
    active: '1',
  },
  'W02-WHPM-OMM': {
    id: 7,
    whsCode: 'W02-WHPM-OMM',
    whsName: 'Main PM/RM Warehouse - OMM',
    building: 'W02',
    tendency: 'OMM',
    active: '1',
  },
  'W02-PDPM-OMM': {
    id: 8,
    whsCode: 'W02-PDPM-OMM',
    whsName: 'Production PM/RM Warehouse - OMM',
    building: 'W02',
    tendency: 'OMM',
    active: '1',
  },
  'W02-PDFG-OMC': {
    id: 9,
    whsCode: 'W02-PDFG-OMC',
    whsName: 'Production FG Warehouse - OMC',
    building: 'W02',
    tendency: 'OMC',
    active: '1',
  },
  'W02-WHFG-OMC': {
    id: 10,
    whsCode: 'W02-WHFG-OMC',
    whsName: 'Main FG Warehouse - OMC',
    building: 'W02',
    tendency: 'OMC',
    active: '1',
  },
  'W02-WHPM-OMC': {
    id: 11,
    whsCode: 'W02-WHPM-OMC',
    whsName: 'Main PM/RM Warehouse - OMC',
    building: 'W02',
    tendency: 'OMC',
    active: '1',
  },
  'W02-PDFG-OMK': {
    id: 12,
    whsCode: 'W02-PDFG-OMK',
    whsName: 'Production FG Warehouse - OMK',
    building: 'W02',
    tendency: 'OMK',
    active: '1',
  },
  'W02-WHFG-OMK': {
    id: 13,
    whsCode: 'W02-WHFG-OMK',
    whsName: 'Main FG Warehouse - OMK',
    building: 'W02',
    tendency: 'OMK',
    active: '1',
  },
  'W02-WHPM-OMK': {
    id: 14,
    whsCode: 'W02-WHPM-OMK',
    whsName: 'Main PM/RM Warehouse - OMK',
    building: 'W02',
    tendency: 'OMK',
    active: '1',
  },
};

const itemGroups: ItemGroup[] = [
  { id: 1, itemGroupName: 'Finished Goods' },
  { id: 2, itemGroupName: 'Packaging Material' },
  { id: 3, itemGroupName: 'Raw Material' },
];

const itemCatalog: Item[] = [
  {
    id: 101,
    key: '101',
    itemCode: 'FG000002',
    itemName: 'FG - 350ML Product',
    inventoryUoM: 'Ea',
    tendency: 'NVC',
    item_group_id: 1,
    item_group: [itemGroups[0]],
    childItem: [],
    active: '1',
  },
  {
    id: 102,
    key: '102',
    itemCode: 'FG000003',
    itemName: 'FG - 1500ML Product',
    inventoryUoM: 'Ea',
    tendency: 'NVC',
    item_group_id: 1,
    item_group: [itemGroups[0]],
    childItem: [],
    active: '1',
  },
  {
    id: 103,
    key: '103',
    itemCode: 'PM000023',
    itemName: 'PM - Preform 500ML',
    inventoryUoM: 'Ea',
    tendency: 'NVC',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 104,
    key: '104',
    itemCode: 'PM000004',
    itemName: 'PM - CAP-Normal',
    inventoryUoM: 'Ea',
    tendency: 'NVC',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 105,
    key: '105',
    itemCode: 'RM000003',
    itemName: 'Raw Material - Citric Acid',
    inventoryUoM: 'KG',
    tendency: 'NVC',
    item_group_id: 3,
    item_group: [itemGroups[2]],
    childItem: [],
    active: '1',
  },
  {
    id: 106,
    key: '106',
    itemCode: 'FG100002',
    itemName: 'FG - OMM 350ML Product',
    inventoryUoM: 'Ea',
    tendency: 'OMM',
    item_group_id: 1,
    item_group: [itemGroups[0]],
    childItem: [],
    active: '1',
  },
  {
    id: 107,
    key: '107',
    itemCode: 'PM100023',
    itemName: 'PM - OMM Preform 500ML',
    inventoryUoM: 'Ea',
    tendency: 'OMM',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 112,
    key: '112',
    itemCode: 'RM100003',
    itemName: 'RM - OMM Citric Acid',
    inventoryUoM: 'KG',
    tendency: 'OMM',
    item_group_id: 3,
    item_group: [itemGroups[2]],
    childItem: [],
    active: '1',
  },
  {
    id: 113,
    key: '113',
    itemCode: 'PM100004',
    itemName: 'PM - OMM CAP-Normal',
    inventoryUoM: 'Ea',
    tendency: 'OMM',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 108,
    key: '108',
    itemCode: 'FG200002',
    itemName: 'FG - OMC 350ML Product',
    inventoryUoM: 'Ea',
    tendency: 'OMC',
    item_group_id: 1,
    item_group: [itemGroups[0]],
    childItem: [],
    active: '1',
  },
  {
    id: 109,
    key: '109',
    itemCode: 'PM200023',
    itemName: 'PM - OMC Preform 500ML',
    inventoryUoM: 'Ea',
    tendency: 'OMC',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 114,
    key: '114',
    itemCode: 'RM200003',
    itemName: 'RM - OMC Citric Acid',
    inventoryUoM: 'KG',
    tendency: 'OMC',
    item_group_id: 3,
    item_group: [itemGroups[2]],
    childItem: [],
    active: '1',
  },
  {
    id: 115,
    key: '115',
    itemCode: 'PM200004',
    itemName: 'PM - OMC CAP-Normal',
    inventoryUoM: 'Ea',
    tendency: 'OMC',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 110,
    key: '110',
    itemCode: 'FG300002',
    itemName: 'FG - OMK 350ML Product',
    inventoryUoM: 'Ea',
    tendency: 'OMK',
    item_group_id: 1,
    item_group: [itemGroups[0]],
    childItem: [],
    active: '1',
  },
  {
    id: 111,
    key: '111',
    itemCode: 'PM300023',
    itemName: 'PM - OMK Preform 500ML',
    inventoryUoM: 'Ea',
    tendency: 'OMK',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
  {
    id: 116,
    key: '116',
    itemCode: 'RM300003',
    itemName: 'RM - OMK Citric Acid',
    inventoryUoM: 'KG',
    tendency: 'OMK',
    item_group_id: 3,
    item_group: [itemGroups[2]],
    childItem: [],
    active: '1',
  },
  {
    id: 117,
    key: '117',
    itemCode: 'PM300004',
    itemName: 'PM - OMK CAP-Normal',
    inventoryUoM: 'Ea',
    tendency: 'OMK',
    item_group_id: 2,
    item_group: [itemGroups[1]],
    childItem: [],
    active: '1',
  },
];

const bomCatalog: Array<
  BomItem & {
    children: Array<{ code: string; quantity: string }>;
  }
> = [
  {
    product_code: 5001,
    product_name: 'FG 350ML Product BOM',
    tendency: 'NVC',
    active: '1',
    children: [
      { code: 'PM000023', quantity: '1' },
      { code: 'PM000004', quantity: '1' },
    ],
  },
  {
    product_code: 5002,
    product_name: 'FG OMM 350ML Product BOM',
    tendency: 'OMM',
    active: '1',
    children: [
      { code: 'PM100023', quantity: '1' },
      { code: 'PM100004', quantity: '1' },
    ],
  },
  {
    product_code: 5003,
    product_name: 'FG OMC 350ML Product BOM',
    tendency: 'OMC',
    active: '1',
    children: [
      { code: 'PM200023', quantity: '1' },
      { code: 'PM200004', quantity: '1' },
    ],
  },
  {
    product_code: 5004,
    product_name: 'FG OMK 350ML Product BOM',
    tendency: 'OMK',
    active: '1',
    children: [
      { code: 'PM300023', quantity: '1' },
      { code: 'PM300004', quantity: '1' },
    ],
  },
];

let supplierCatalog: Supplier[] = [
  { card_code: 'SUP-NVC-001', card_name: 'NVC Supplier', tendency: 'NVC', active: '1' },
  { card_code: 'SUP-NVC-002', card_name: 'OMCam Co. Ltd', tendency: 'NVC', active: '1' },
  { card_code: 'SUP-NVC-003', card_name: 'Local Supplier', tendency: 'NVC', active: '1' },
  { card_code: 'SUP-OMM-001', card_name: 'OMM Supplier', tendency: 'OMM', active: '1' },
  { card_code: 'SUP-OMM-002', card_name: 'OMM Packaging Supplier', tendency: 'OMM', active: '1' },
  { card_code: 'SUP-OMC-001', card_name: 'OMC Supplier', tendency: 'OMC', active: '1' },
  { card_code: 'SUP-OMC-002', card_name: 'OMC Packaging Supplier', tendency: 'OMC', active: '1' },
  { card_code: 'SUP-OMK-001', card_name: 'OMK Supplier', tendency: 'OMK', active: '1' },
  { card_code: 'SUP-OMK-002', card_name: 'OMK Packaging Supplier', tendency: 'OMK', active: '1' },
];

const requestSeeds: RequestSeed[] = [
  {
    id: '13465',
    transferId: 'IIO-PDR-013465',
    line: 'Production Line 04',
    shift: 'S1',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-02-13',
    dueDate: '2026-02-13',
    createdBy: 'vannak.rann',
    createdDate: '2026-02-13T07:30:00',
    lastModifiedBy: 'vannak.rann',
    lastModifiedDate: '2026-02-13T07:30:00',
    remark: 'Bulk seed - new FG request',
    items: [
      {
        code: 'FG000002',
        name: 'FG - 350ML Product',
        uom: 'Ea',
        quantity: '1800',
        remark: 'Bulk seed',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: '13466',
    transferId: 'IIO-PDR-013466',
    line: 'Production Line 07',
    shift: 'S2',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-02-13',
    dueDate: '2026-02-13',
    createdBy: 'ratha.toerng',
    createdDate: '2026-02-13T07:45:00',
    lastModifiedBy: 'ratha.toerng',
    lastModifiedDate: '2026-02-13T07:45:00',
    remark: 'Bulk seed - new FG request',
    items: [
      {
        code: 'FG000003',
        name: 'FG - 1500ML Product',
        uom: 'Ea',
        quantity: '750',
        remark: 'Bulk seed',
        supplier: 'NVC Supplier',
      },
      {
        code: 'FG000005',
        name: 'FG - 750ML Product',
        uom: 'Ea',
        quantity: '600',
        remark: 'Bulk seed',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: '13467',
    transferId: 'IIO-PDR-013467',
    line: 'Production Line 08',
    shift: 'S1',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-02-14',
    dueDate: '2026-02-14',
    createdBy: 'nimith.yin',
    createdDate: '2026-02-14T08:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-02-14T08:00:00',
    remark: 'Bulk seed - new FG request',
    items: [
      {
        code: 'FG000004',
        name: 'FG - 250ML Product',
        uom: 'Ea',
        quantity: '2400',
        remark: 'Bulk seed',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: '13469',
    transferId: 'IIO-PDR-013469',
    line: 'Production Line 06',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-02-14',
    dueDate: '2026-02-14',
    createdBy: 'nimith.yin',
    createdDate: '2026-02-14T08:30:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-02-14T08:30:00',
    remark: 'Bulk seed - new PM/RM request',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '250000',
        remark: 'Bulk seed',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '245000',
        remark: 'Bulk seed',
        supplier: 'OMCam Co., Ltd',
      },
    ],
  },
  {
    id: '13470',
    transferId: 'IIO-PDR-013470',
    line: 'Production Line 04',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'request-production-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-02-10',
    dueDate: '2026-02-10',
    createdBy: 'ratha.toerng',
    createdDate: '2026-02-10T09:00:00',
    lastModifiedBy: 'ratha.toerng',
    lastModifiedDate: '2026-02-10T09:00:00',
    remark: 'Bulk seed - awaiting prod approval',
    items: [
      {
        code: 'PM000029',
        name: 'PM - Wrap Paper Carton 500ML',
        uom: 'Ea',
        quantity: '8000',
        remark: 'Bulk seed',
        supplier: 'Dong Guan City Finstar Printing Co.,Ltd',
      },
    ],
  },
  {
    id: '13471',
    transferId: 'IIO-PDR-013471',
    line: 'Production Line 05',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'request-production-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-02-10',
    dueDate: '2026-02-10',
    createdBy: 'vannak.rann',
    createdDate: '2026-02-10T09:20:00',
    lastModifiedBy: 'vannak.rann',
    lastModifiedDate: '2026-02-10T09:20:00',
    remark: 'Bulk seed - awaiting prod approval',
    items: [
      {
        code: 'PM000024',
        name: 'PM - Shrink Film',
        uom: 'Kg',
        quantity: '3200',
        remark: 'Bulk seed',
        supplier: 'NVC Supplier',
      },
      {
        code: 'PM000030',
        name: 'PM - Wrap Label 500ML',
        uom: 'Ea',
        quantity: '200000',
        remark: 'Bulk seed',
        supplier: 'Sichuan HX Printing Co., Ltd',
      },
    ],
  },
  {
    id: '13474',
    transferId: 'IIO-PDR-013474',
    line: 'Production Line 06',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'request-warehouse-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-02-08',
    dueDate: '2026-02-08',
    createdBy: 'vannak.rann',
    createdDate: '2026-02-08T07:00:00',
    lastModifiedBy: 'sarin.mean',
    lastModifiedDate: '2026-02-08T09:15:00',
    remark: 'Bulk seed - awaiting warehouse approval',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '300000',
        remark: 'L6 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '290000',
        remark: 'L6 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000030',
        name: 'PM - Wrap Label 500ML',
        uom: 'Ea',
        quantity: '310000',
        remark: 'L6 S2',
        supplier: 'Sichuan HX Printing Co., Ltd',
      },
    ],
  },
  {
    id: '13477',
    transferId: 'IIO-PDR-013477',
    line: 'Production Line 05',
    shift: 'S1',
    transferType: 'FG',
    status: 'transferring',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-02-06',
    dueDate: '2026-02-06',
    createdBy: 'vannak.rann',
    createdDate: '2026-02-06T07:00:00',
    lastModifiedBy: 'vannak.sambath',
    lastModifiedDate: '2026-02-06T13:00:00',
    remark: 'Bulk seed - goods in transit',
    items: [
      {
        code: 'FG000005',
        name: 'FG - 750ML Product',
        uom: 'Ea',
        quantity: '950',
        remark: 'L5 S1',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: '11578',
    transferId: 'IIO-PDR-011578',
    line: 'Production Line 06',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'received',
    state: 'completed',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-01-22',
    dueDate: '2026-01-22',
    createdBy: 'nimith.yin',
    createdDate: '2026-01-22T15:43:31',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-23T13:44:13',
    remark: '[IIO] Seed completed request for transfer detail',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '361984',
        received: '361984',
        isReceive: 'True',
        remark: 'L6 S1',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '353500',
        received: '353500',
        isReceive: 'True',
        remark: '-',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000030',
        name: 'PM - Wrap Label 500ML',
        uom: 'Ea',
        quantity: '416664',
        received: '416664',
        isReceive: 'True',
        remark: '-',
        supplier: 'Sichuan HX Printing Co., Ltd',
      },
      {
        code: 'PM000029',
        name: 'PM - Wrap Paper Carton 500ML',
        uom: 'Ea',
        quantity: '14400',
        received: '14400',
        isReceive: 'True',
        remark: '-',
        supplier: 'Dong Guan City Finstar Printing Co.,Ltd',
      },
    ],
  },
  {
    id: '13480',
    transferId: 'IIO-PDR-013480',
    line: 'Production Line 04',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'received',
    state: 'completed',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-01-28',
    dueDate: '2026-01-28',
    createdBy: 'vannak.rann',
    createdDate: '2026-01-28T07:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-28T16:00:00',
    remark: 'Bulk seed - completed PM/RM transfer',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '280000',
        received: '280000',
        isReceive: 'True',
        remark: 'L4 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '275000',
        received: '275000',
        isReceive: 'True',
        remark: 'L4 S2',
        supplier: 'OMCam Co., Ltd',
      },
    ],
  },
  {
    id: '13481',
    transferId: 'IIO-PDR-013481',
    line: 'Production Line 08',
    shift: 'S1',
    transferType: 'FG',
    status: 'received',
    state: 'completed',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-01-25',
    dueDate: '2026-01-25',
    createdBy: 'ratha.toerng',
    createdDate: '2026-01-25T08:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-25T17:00:00',
    remark: 'Bulk seed - completed FG transfer',
    items: [
      {
        code: 'FG000001',
        name: 'FG - 500ML Product',
        uom: 'Ea',
        quantity: '1400',
        received: '1400',
        isReceive: 'True',
        remark: 'L8 S1',
        supplier: 'NVC Supplier',
      },
      {
        code: 'FG000003',
        name: 'FG - 1500ML Product',
        uom: 'Ea',
        quantity: '680',
        received: '680',
        isReceive: 'True',
        remark: 'L8 S1',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: '13482',
    transferId: 'IIO-PDR-013482',
    line: 'Production Line 05',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'received',
    state: 'completed',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-01-20',
    dueDate: '2026-01-20',
    createdBy: 'nimith.yin',
    createdDate: '2026-01-20T07:00:00',
    lastModifiedBy: 'vannak.rann',
    lastModifiedDate: '2026-01-20T15:30:00',
    remark: 'Bulk seed - completed PM/RM transfer',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '500000',
        received: '500000',
        isReceive: 'True',
        remark: 'L5 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '490000',
        received: '490000',
        isReceive: 'True',
        remark: 'L5 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000030',
        name: 'PM - Wrap Label 500ML',
        uom: 'Ea',
        quantity: '520000',
        received: '520000',
        isReceive: 'True',
        remark: 'L5 S2',
        supplier: 'Sichuan HX Printing Co., Ltd',
      },
    ],
  },
  {
    id: '13483',
    transferId: 'IIO-PDR-013483',
    line: 'Production Line 03',
    shift: 'S1',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG-OMM',
    toWarehouse: 'W02-WHFG-OMM',
    businessUnit: 'OMM',
    postingDate: '2026-02-15',
    dueDate: '2026-02-15',
    createdBy: 'sok.om',
    createdDate: '2026-02-15T07:25:00',
    lastModifiedBy: 'sok.om',
    lastModifiedDate: '2026-02-15T07:25:00',
    remark: 'OMM FG request for demo flow',
    items: [
      {
        code: 'FG100002',
        name: 'FG - OMM 350ML Product',
        uom: 'Ea',
        quantity: '1250',
        remark: 'OMM line replenishment',
        supplier: 'OMM Supplier',
      },
    ],
  },
  {
    id: '13484',
    transferId: 'IIO-PDR-013484',
    line: 'Production Line 02',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'request-production-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMC',
    toWarehouse: 'W02-PDPM-OMM',
    businessUnit: 'OMC',
    postingDate: '2026-02-15',
    dueDate: '2026-02-15',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-15T08:10:00',
    lastModifiedBy: 'bopha.chea',
    lastModifiedDate: '2026-02-15T08:10:00',
    remark: 'OMC PM/RM request awaiting production approval',
    items: [
      {
        code: 'PM200023',
        name: 'PM - OMC Preform 500ML',
        uom: 'Ea',
        quantity: '180000',
        remark: 'OMC packaging run',
        supplier: 'OMC Packaging Supplier',
      },
      {
        code: 'PM200004',
        name: 'PM - OMC CAP-Normal',
        uom: 'Ea',
        quantity: '175000',
        remark: 'OMC packaging run',
        supplier: 'OMC Packaging Supplier',
      },
    ],
  },
  {
    id: '13485',
    transferId: 'IIO-PDR-013485',
    line: 'Production Line 01',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'request-warehouse-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMK',
    toWarehouse: 'W02-PDPM-OMM',
    businessUnit: 'OMK',
    postingDate: '2026-02-16',
    dueDate: '2026-02-16',
    createdBy: 'kanha.oun',
    createdDate: '2026-02-16T06:55:00',
    lastModifiedBy: 'sarin.mean',
    lastModifiedDate: '2026-02-16T08:00:00',
    remark: 'OMK PM/RM request awaiting warehouse approval',
    items: [
      {
        code: 'RM300003',
        name: 'RM - OMK Citric Acid',
        uom: 'KG',
        quantity: '900',
        remark: 'OMK blend preparation',
        supplier: 'OMK Supplier',
      },
      {
        code: 'PM300023',
        name: 'PM - OMK Preform 500ML',
        uom: 'Ea',
        quantity: '150000',
        remark: 'OMK bottle run',
        supplier: 'OMK Packaging Supplier',
      },
    ],
  },
  {
    id: '13486',
    transferId: 'IIO-PDR-013486',
    line: 'Production Line 03',
    shift: 'S2',
    transferType: 'FG',
    status: 'received',
    state: 'completed',
    fromWarehouse: 'W02-PDFG-OMC',
    toWarehouse: 'W02-WHFG-OMC',
    businessUnit: 'OMC',
    postingDate: '2026-02-11',
    dueDate: '2026-02-11',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-11T07:40:00',
    lastModifiedBy: 'bopha.chea',
    lastModifiedDate: '2026-02-11T16:20:00',
    remark: 'OMC completed FG transfer',
    items: [
      {
        code: 'FG200002',
        name: 'FG - OMC 350ML Product',
        uom: 'Ea',
        quantity: '980',
        received: '980',
        isReceive: 'True',
        remark: 'OMC finished goods move',
        supplier: 'OMC Supplier',
      },
    ],
  },
  {
    id: '13487',
    transferId: 'IIO-PDR-013487',
    line: 'Production Line 02',
    shift: 'S1',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG-OMM',
    toWarehouse: 'W02-WHFG-OMM',
    businessUnit: 'OMM',
    postingDate: '2026-02-17',
    dueDate: '2026-02-17',
    createdBy: 'sok.om',
    createdDate: '2026-02-17T07:10:00',
    lastModifiedBy: 'sok.om',
    lastModifiedDate: '2026-02-17T07:10:00',
    remark: 'OMM FG request batch 2',
    items: [
      {
        code: 'FG100002',
        name: 'FG - OMM 350ML Product',
        uom: 'Ea',
        quantity: '1430',
        remark: 'OMM daily replenishment',
        supplier: 'OMM Supplier',
      },
    ],
  },
  {
    id: '13488',
    transferId: 'IIO-PDR-013488',
    line: 'Production Line 02',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMM',
    toWarehouse: 'W02-PDPM-OMM',
    businessUnit: 'OMM',
    postingDate: '2026-02-17',
    dueDate: '2026-02-17',
    createdBy: 'sok.om',
    createdDate: '2026-02-17T08:05:00',
    lastModifiedBy: 'sok.om',
    lastModifiedDate: '2026-02-17T08:05:00',
    remark: 'OMM PM request batch 2',
    items: [
      {
        code: 'PM100023',
        name: 'PM - OMM Preform 500ML',
        uom: 'Ea',
        quantity: '165000',
        remark: 'OMM bottle preparation',
        supplier: 'OMM Packaging Supplier',
      },
      {
        code: 'PM100004',
        name: 'PM - OMM CAP-Normal',
        uom: 'Ea',
        quantity: '160000',
        remark: 'OMM bottle preparation',
        supplier: 'OMM Packaging Supplier',
      },
    ],
  },
  {
    id: '13489',
    transferId: 'IIO-PDR-013489',
    line: 'Production Line 01',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'request-production-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMM',
    toWarehouse: 'W02-PDPM-OMM',
    businessUnit: 'OMM',
    postingDate: '2026-02-18',
    dueDate: '2026-02-18',
    createdBy: 'sok.om',
    createdDate: '2026-02-18T07:20:00',
    lastModifiedBy: 'sok.om',
    lastModifiedDate: '2026-02-18T07:20:00',
    remark: 'OMM RM request awaiting production approval',
    items: [
      {
        code: 'RM100003',
        name: 'RM - OMM Citric Acid',
        uom: 'KG',
        quantity: '780',
        remark: 'OMM syrup batch',
        supplier: 'OMM Supplier',
      },
    ],
  },
  {
    id: '13490',
    transferId: 'IIO-PDR-013490',
    line: 'Production Line 03',
    shift: 'S1',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG-OMC',
    toWarehouse: 'W02-WHFG-OMC',
    businessUnit: 'OMC',
    postingDate: '2026-02-18',
    dueDate: '2026-02-18',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-18T09:00:00',
    lastModifiedBy: 'bopha.chea',
    lastModifiedDate: '2026-02-18T09:00:00',
    remark: 'OMC FG request batch 2',
    items: [
      {
        code: 'FG200002',
        name: 'FG - OMC 350ML Product',
        uom: 'Ea',
        quantity: '1120',
        remark: 'OMC finished goods dispatch',
        supplier: 'OMC Supplier',
      },
    ],
  },
  {
    id: '13491',
    transferId: 'IIO-PDR-013491',
    line: 'Production Line 04',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMC',
    toWarehouse: 'W02-PDPM-OMC',
    businessUnit: 'OMC',
    postingDate: '2026-02-18',
    dueDate: '2026-02-18',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-18T09:35:00',
    lastModifiedBy: 'bopha.chea',
    lastModifiedDate: '2026-02-18T09:35:00',
    remark: 'OMC PM request batch 2',
    items: [
      {
        code: 'PM200023',
        name: 'PM - OMC Preform 500ML',
        uom: 'Ea',
        quantity: '172000',
        remark: 'OMC bottle preparation',
        supplier: 'OMC Packaging Supplier',
      },
      {
        code: 'PM200004',
        name: 'PM - OMC CAP-Normal',
        uom: 'Ea',
        quantity: '168000',
        remark: 'OMC bottle preparation',
        supplier: 'OMC Packaging Supplier',
      },
    ],
  },
  {
    id: '13492',
    transferId: 'IIO-PDR-013492',
    line: 'Production Line 05',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'request-warehouse-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMC',
    toWarehouse: 'W02-PDPM-OMC',
    businessUnit: 'OMC',
    postingDate: '2026-02-19',
    dueDate: '2026-02-19',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-19T06:55:00',
    lastModifiedBy: 'sarin.mean',
    lastModifiedDate: '2026-02-19T08:05:00',
    remark: 'OMC RM request awaiting warehouse approval',
    items: [
      {
        code: 'RM200003',
        name: 'RM - OMC Citric Acid',
        uom: 'KG',
        quantity: '860',
        remark: 'OMC syrup batch',
        supplier: 'OMC Supplier',
      },
    ],
  },
  {
    id: '13493',
    transferId: 'IIO-PDR-013493',
    line: 'Production Line 01',
    shift: 'S1',
    transferType: 'FG',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG-OMK',
    toWarehouse: 'W02-WHFG-OMK',
    businessUnit: 'OMK',
    postingDate: '2026-02-19',
    dueDate: '2026-02-19',
    createdBy: 'kanha.oun',
    createdDate: '2026-02-19T07:30:00',
    lastModifiedBy: 'kanha.oun',
    lastModifiedDate: '2026-02-19T07:30:00',
    remark: 'OMK FG request batch 2',
    items: [
      {
        code: 'FG300002',
        name: 'FG - OMK 350ML Product',
        uom: 'Ea',
        quantity: '1010',
        remark: 'OMK finished goods dispatch',
        supplier: 'OMK Supplier',
      },
    ],
  },
  {
    id: '13494',
    transferId: 'IIO-PDR-013494',
    line: 'Production Line 01',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'transfer-request',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMK',
    toWarehouse: 'W02-PDPM-OMK',
    businessUnit: 'OMK',
    postingDate: '2026-02-19',
    dueDate: '2026-02-19',
    createdBy: 'kanha.oun',
    createdDate: '2026-02-19T08:15:00',
    lastModifiedBy: 'kanha.oun',
    lastModifiedDate: '2026-02-19T08:15:00',
    remark: 'OMK PM request batch 2',
    items: [
      {
        code: 'PM300023',
        name: 'PM - OMK Preform 500ML',
        uom: 'Ea',
        quantity: '158000',
        remark: 'OMK bottle preparation',
        supplier: 'OMK Packaging Supplier',
      },
      {
        code: 'PM300004',
        name: 'PM - OMK CAP-Normal',
        uom: 'Ea',
        quantity: '154000',
        remark: 'OMK bottle preparation',
        supplier: 'OMK Packaging Supplier',
      },
    ],
  },
  {
    id: '13495',
    transferId: 'IIO-PDR-013495',
    line: 'Production Line 06',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'request-production-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-WHPM-OMK',
    toWarehouse: 'W02-PDPM-OMK',
    businessUnit: 'OMK',
    postingDate: '2026-02-20',
    dueDate: '2026-02-20',
    createdBy: 'kanha.oun',
    createdDate: '2026-02-20T07:05:00',
    lastModifiedBy: 'kanha.oun',
    lastModifiedDate: '2026-02-20T07:05:00',
    remark: 'OMK RM request awaiting production approval',
    items: [
      {
        code: 'RM300003',
        name: 'RM - OMK Citric Acid',
        uom: 'KG',
        quantity: '820',
        remark: 'OMK syrup batch',
        supplier: 'OMK Supplier',
      },
    ],
  },
  {
    id: '13496',
    transferId: 'IIO-PDR-013496',
    line: 'Production Line 07',
    shift: 'S2',
    transferType: 'FG',
    status: 'request-warehouse-approve',
    state: 'in-progress',
    fromWarehouse: 'W02-PDFG-OMM',
    toWarehouse: 'W02-WHFG-OMM',
    businessUnit: 'OMM',
    postingDate: '2026-02-20',
    dueDate: '2026-02-20',
    createdBy: 'sok.om',
    createdDate: '2026-02-20T08:40:00',
    lastModifiedBy: 'sarin.mean',
    lastModifiedDate: '2026-02-20T10:00:00',
    remark: 'OMM FG request awaiting warehouse approval',
    items: [
      {
        code: 'FG100002',
        name: 'FG - OMM 350ML Product',
        uom: 'Ea',
        quantity: '1380',
        remark: 'OMM dispatch queue',
        supplier: 'OMM Supplier',
      },
    ],
  },
];

const transferSeeds: TransferSeed[] = [
  {
    id: 13477,
    transferId: 'IIO-PDT-013477',
    transferRequestId: '13477',
    line: 'Production Line 05',
    shift: 'S1',
    transferType: 'FG',
    status: 'pending',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-02-06',
    dueDate: '2026-02-06',
    createdBy: 'vannak.sambath',
    createdDate: '2026-02-06T13:00:00',
    lastModifiedBy: 'vannak.sambath',
    lastModifiedDate: '2026-02-06T13:00:00',
    remark: 'Derived from bulk seed transferring request',
    items: [
      {
        code: 'FG000005',
        name: 'FG - 750ML Product',
        uom: 'Ea',
        quantity: '950',
        received: '0',
        isReceive: 'False',
        total: '0',
        remark: 'L5 S1',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: 11578,
    transferId: 'IIO-PDT-011578',
    transferRequestId: '11578',
    line: 'Production Line 06',
    shift: 'S1',
    transferType: 'PM/RM',
    status: 'completed',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-01-22',
    dueDate: '2026-01-22',
    createdBy: 'nimith.yin',
    createdDate: '2026-01-23T13:04:13',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-23T13:44:13',
    remark: '[IIO] Seed transfer detail',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '361984',
        received: '361984',
        isReceive: 'True',
        total: '361984',
        remark: 'L6 S1',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '353500',
        received: '353500',
        isReceive: 'True',
        total: '353500',
        remark: '-',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000030',
        name: 'PM - Wrap Label 500ML',
        uom: 'Ea',
        quantity: '416664',
        received: '416664',
        isReceive: 'True',
        total: '416664',
        remark: '-',
        supplier: 'Sichuan HX Printing Co., Ltd',
      },
      {
        code: 'PM000029',
        name: 'PM - Wrap Paper Carton 500ML',
        uom: 'Ea',
        quantity: '14400',
        received: '14400',
        isReceive: 'True',
        total: '14400',
        remark: '-',
        supplier: 'Dong Guan City Finstar Printing Co.,Ltd',
      },
    ],
  },
  {
    id: 13480,
    transferId: 'IIO-PDT-013480',
    transferRequestId: '13480',
    line: 'Production Line 04',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'completed',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-01-28',
    dueDate: '2026-01-28',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-28T13:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-28T16:00:00',
    remark: 'Bulk seed transfer',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '280000',
        received: '280000',
        isReceive: 'True',
        total: '280000',
        remark: 'L4 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '275000',
        received: '275000',
        isReceive: 'True',
        total: '275000',
        remark: 'L4 S2',
        supplier: 'OMCam Co., Ltd',
      },
    ],
  },
  {
    id: 13481,
    transferId: 'IIO-PDT-013481',
    transferRequestId: '13481',
    line: 'Production Line 08',
    shift: 'S1',
    transferType: 'FG',
    status: 'completed',
    fromWarehouse: 'W02-PDFG',
    toWarehouse: 'W02-WHFG',
    businessUnit: 'NVC',
    postingDate: '2026-01-25',
    dueDate: '2026-01-25',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-25T14:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-25T17:00:00',
    remark: 'Bulk seed transfer',
    items: [
      {
        code: 'FG000001',
        name: 'FG - 500ML Product',
        uom: 'Ea',
        quantity: '1400',
        received: '1400',
        isReceive: 'True',
        total: '1400',
        remark: 'L8 S1',
        supplier: 'NVC Supplier',
      },
      {
        code: 'FG000003',
        name: 'FG - 1500ML Product',
        uom: 'Ea',
        quantity: '680',
        received: '680',
        isReceive: 'True',
        total: '680',
        remark: 'L8 S1',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: 13482,
    transferId: 'IIO-PDT-013482',
    transferRequestId: '13482',
    line: 'Production Line 05',
    shift: 'S2',
    transferType: 'PM/RM',
    status: 'completed',
    fromWarehouse: 'W02-WHPM',
    toWarehouse: 'W02-PDPM',
    businessUnit: 'NVC',
    postingDate: '2026-01-20',
    dueDate: '2026-01-20',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-20T13:00:00',
    lastModifiedBy: 'vannak.rann',
    lastModifiedDate: '2026-01-20T15:30:00',
    remark: 'Bulk seed transfer',
    items: [
      {
        code: 'PM000023',
        name: 'PM - Preform 500ML',
        uom: 'Ea',
        quantity: '500000',
        received: '500000',
        isReceive: 'True',
        total: '500000',
        remark: 'L5 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000004',
        name: 'PM - CAP Normal',
        uom: 'Ea',
        quantity: '490000',
        received: '490000',
        isReceive: 'True',
        total: '490000',
        remark: 'L5 S2',
        supplier: 'OMCam Co., Ltd',
      },
      {
        code: 'PM000030',
        name: 'PM - Wrap Label 500ML',
        uom: 'Ea',
        quantity: '520000',
        received: '520000',
        isReceive: 'True',
        total: '520000',
        remark: 'L5 S2',
        supplier: 'Sichuan HX Printing Co., Ltd',
      },
    ],
  },
  {
    id: 13486,
    transferId: 'IIO-PDT-013486',
    transferRequestId: '13486',
    line: 'Production Line 03',
    shift: 'S2',
    transferType: 'FG',
    status: 'completed',
    fromWarehouse: 'W02-PDFG-OMC',
    toWarehouse: 'W02-WHFG-OMC',
    businessUnit: 'OMC',
    postingDate: '2026-02-11',
    dueDate: '2026-02-11',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-11T14:10:00',
    lastModifiedBy: 'bopha.chea',
    lastModifiedDate: '2026-02-11T16:20:00',
    remark: 'Derived OMC completed FG transfer',
    items: [
      {
        code: 'FG200002',
        name: 'FG - OMC 350ML Product',
        uom: 'Ea',
        quantity: '980',
        received: '980',
        isReceive: 'True',
        total: '980',
        remark: 'OMC finished goods move',
        supplier: 'OMC Supplier',
      },
    ],
  },
];

const providedSeeds: ProvidedSeed[] = [
  {
    id: 1,
    provided: 'IIO-PRV-013477-01',
    transferRequestId: '13477',
    status: 'pending',
    createdBy: 'vannak.sambath',
    createdDate: '2026-02-06T13:00:00',
    items: [
      {
        code: 'FG000005',
        name: 'FG - 750ML Product',
        uom: 'Ea',
        quantity: '950',
        received: '0',
        isReceive: 'False',
        remark: 'L5 S1',
        supplier: 'NVC Supplier',
      },
    ],
  },
  {
    id: 2,
    provided: 'IIO-PRV-011578-01',
    transferRequestId: '11578',
    status: 'done',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-23T10:26:12',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-23T13:44:13',
    items: requestSeeds.find((seed) => seed.id === '11578')!.items,
  },
  {
    id: 3,
    provided: 'IIO-PRV-013480-01',
    transferRequestId: '13480',
    status: 'done',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-28T13:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-28T16:00:00',
    items: requestSeeds.find((seed) => seed.id === '13480')!.items,
  },
  {
    id: 4,
    provided: 'IIO-PRV-013481-01',
    transferRequestId: '13481',
    status: 'done',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-25T14:00:00',
    lastModifiedBy: 'nimith.yin',
    lastModifiedDate: '2026-01-25T17:00:00',
    items: requestSeeds.find((seed) => seed.id === '13481')!.items,
  },
  {
    id: 5,
    provided: 'IIO-PRV-013482-01',
    transferRequestId: '13482',
    status: 'done',
    createdBy: 'vannak.sambath',
    createdDate: '2026-01-20T13:00:00',
    lastModifiedBy: 'vannak.rann',
    lastModifiedDate: '2026-01-20T15:30:00',
    items: requestSeeds.find((seed) => seed.id === '13482')!.items,
  },
  {
    id: 6,
    provided: 'IIO-PRV-013486-01',
    transferRequestId: '13486',
    status: 'done',
    createdBy: 'bopha.chea',
    createdDate: '2026-02-11T15:00:00',
    lastModifiedBy: 'bopha.chea',
    lastModifiedDate: '2026-02-11T16:20:00',
    items: requestSeeds.find((seed) => seed.id === '13486')!.items,
  },
];

let requestItemId = 1000;
let transferItemId = 2000;

const nextRequestItemId = () => {
  requestItemId += 1;
  return requestItemId;
};

const nextTransferItemId = () => {
  transferItemId += 1;
  return transferItemId;
};

const cloneWarehouse = <T extends RequestWarehouse | TransferWarehouse>(warehouse: T): T =>
  ({ ...warehouse });

const buildRequestActivities = (seed: RequestSeed): RequestActivity[] => {
  const startAt = moment(seed.createdDate);
  const activities: RequestActivity[] = [
    {
      transfer_request: seed.transferId,
      activities_name: 'Start',
      action: 'Start Request',
      remark: seed.status === 'transfer-request' ? 'Initial request' : undefined,
      actionBy: seed.createdBy,
      actionDate: startAt,
      id: Number(seed.id) * 10 + 1,
    },
  ];

  if (
    ['request-warehouse-approve', 'transferring', 'received'].includes(seed.status)
  ) {
    activities.push({
      transfer_request: seed.transferId,
      activities_name: 'Production Approval',
      action: 'Approved',
      actionBy: 'sarin.mean',
      actionDate: startAt.clone().add(2, 'hours'),
      id: Number(seed.id) * 10 + 2,
    });
  }

  if (['transferring', 'received'].includes(seed.status)) {
    activities.push({
      transfer_request: seed.transferId,
      activities_name: 'Warehouse Approval',
      action: 'Approved',
      actionBy: seed.lastModifiedBy || 'vannak.sambath',
      actionDate: startAt.clone().add(4, 'hours'),
      id: Number(seed.id) * 10 + 3,
    });
    activities.push({
      transfer_request: seed.transferId,
      activities_name: 'Transfer',
      action: 'Add Transfer 1',
      actionBy: 'vannak.sambath',
      actionDate: startAt.clone().add(5, 'hours'),
      id: Number(seed.id) * 10 + 4,
    });
  }

  if (seed.status === 'received') {
    activities.push({
      transfer_request: seed.transferId,
      activities_name: 'Receive',
      action: 'Receive Transfer 1 - Correct',
      actionBy: seed.lastModifiedBy || seed.createdBy,
      actionDate: moment(seed.lastModifiedDate || seed.createdDate),
      id: Number(seed.id) * 10 + 5,
    });
  }

  return activities;
};

const toRequestItem = (
  seed: RequestSeed,
  item: SeedItem,
  index: number,
): TransferRequestItem => ({
  childItem: [],
  item: item.name,
  quantity: item.quantity,
  remark: item.remark,
  id: nextRequestItemId(),
  itemId: index + 1,
  item_code: item.code,
  item_name: item.name,
  key: `${seed.id}-${item.code}`,
  uom: item.uom,
  received: item.received || '0',
  itemReceive: Number(item.received || 0),
  is_receive: item.isReceive || 'False',
  transfer_request: seed.transferId,
  supplier: item.supplier,
  oldtotal: item.received || '0',
});

const toTransferItem = (
  seed: TransferSeed,
  item: SeedItem & { total: string },
  index: number,
): TransferItem => ({
  item: item.name,
  quantity: item.quantity,
  remark: item.remark,
  id: nextTransferItemId(),
  itemId: index + 1,
  item_code: item.code,
  item_name: item.name,
  key: `${seed.id}-${item.code}`,
  uom: item.uom,
  received: item.received || '0',
  itemReceive: Number(item.received || 0),
  is_receive: item.isReceive || 'False',
  transfer_request: Number(seed.transferRequestId),
  total: item.total,
  oldtotal: item.total,
  supplier: item.supplier,
});

const toProvidedItem = (item: SeedItem): ProvidedItem => ({
  item_name: item.name,
  item_code: item.code,
  uom: item.uom,
  quantity: item.quantity,
  remark: item.remark,
  itemReceive: item.received || '0',
  is_receive: item.isReceive || 'False',
  total: item.received || '0',
  supplier: item.supplier,
  received: item.received || '0',
});

const createRequestStore = (): TransferRequest[] =>
  requestSeeds.map((seed) => ({
    transfer_id: seed.transferId,
    id: seed.id,
    key: seed.id,
    item: seed.items.map((item, index) => toRequestItem(seed, item, index)),
    from_warehouse: [cloneWarehouse(warehouseCatalog[seed.fromWarehouse])],
    to_warehouse: [cloneWarehouse(warehouseCatalog[seed.toWarehouse])],
    transfer_type: seed.transferType,
    status: seed.status,
    createdBy: seed.createdBy,
    createdDate: moment(seed.createdDate),
    lastModifiedBy: seed.lastModifiedBy || seed.createdBy,
    lastModifiedDate: moment(seed.lastModifiedDate || seed.createdDate),
    remark: seed.remark,
    posting_date: moment(seed.postingDate),
    taxDate: moment(seed.postingDate),
    due_date: moment(seed.dueDate),
    business_unit: seed.businessUnit,
    line: seed.line,
    shift: seed.shift,
    activities: buildRequestActivities(seed),
    state: seed.state,
    sapDocNo: '',
    sapDocEntry: undefined,
  }));

const buildTransferActivities = (transfer: TransferSeed): TransferActivity[] => {
  const request = requestStore.find((item) => item.id === transfer.transferRequestId);
  const baseActivities = request?.activities || [];
  return baseActivities.map((activity, index) => ({
    ...activity,
    actionDate: activity.actionDate?.toISOString(),
    id: Number(`${transfer.id}${index + 1}`),
  }));
};

const createTransferStore = (): Transfer[] =>
  transferSeeds.map((seed) => ({
    id: seed.id,
    items: `${seed.items.length}`,
    quantity: seed.items.reduce((sum, item) => sum + Number(item.quantity), 0).toString(),
    transfer_type: seed.transferType,
    status: seed.status,
    createdBy: seed.createdBy,
    createdDate: moment(seed.createdDate),
    lastModifiedBy: seed.lastModifiedBy || seed.createdBy,
    lastModifiedDate: moment(seed.lastModifiedDate || seed.createdDate),
    received: seed.items.reduce((sum, item) => sum + Number(item.received || 0), 0).toString(),
    item: seed.items.map((item, index) => toTransferItem(seed, item, index)),
    from_warehouse: [cloneWarehouse(warehouseCatalog[seed.fromWarehouse])],
    to_warehouse: [cloneWarehouse(warehouseCatalog[seed.toWarehouse])],
    business_unit: seed.businessUnit,
    remark: seed.remark,
    posting_date: moment(seed.postingDate),
    due_date: moment(seed.dueDate),
    key: `${seed.id}`,
    transfer_request: Number(seed.transferRequestId),
    line: seed.line,
    shift: seed.shift,
    activities: buildTransferActivities(seed),
    transfer_id: seed.transferId,
    sapDocNo: undefined,
    sapDocEntry: undefined,
    transferRequests: [
      {
        transferRequestDetails: seed.items.map((item) => ({
          itemCode: item.code,
          itemName: item.name,
          quantity: Number(item.quantity),
          remark: item.remark,
          fromWarehouse: warehouseCatalog[seed.fromWarehouse].whsCode,
          toWarehouse: warehouseCatalog[seed.toWarehouse].whsCode,
        })),
      },
    ] as any,
  }));

const createProvidedListStore = (): ProvidedList[] =>
  providedSeeds.map((seed) => ({
    id: seed.id,
    transfer_request_id: Number(seed.transferRequestId),
    provided: seed.provided,
    status: seed.status,
    createdBy: seed.createdBy,
    createdDate: seed.createdDate,
    lastModifiedBy: seed.lastModifiedBy || '',
    lastModifiedDate: seed.lastModifiedDate || '',
  }));

const createProvidedItemStore = (): Record<string, ProvidedItem[]> =>
  Object.fromEntries(
    providedSeeds.map((seed) => [seed.provided, seed.items.map((item) => toProvidedItem(item))]),
  );

let requestStore = createRequestStore();
let transferStore = createTransferStore();
let providedListStore = createProvidedListStore();
let providedItemStore = createProvidedItemStore();

const cloneRequestItem = (item: TransferRequestItem): TransferRequestItem => ({ ...item });
const cloneRequestActivity = (activity: RequestActivity): RequestActivity => ({
  ...activity,
  actionDate: activity.actionDate ? moment(activity.actionDate) : undefined,
});
const cloneRequest = (item: TransferRequest): TransferRequest => ({
  ...item,
  item: item.item.map(cloneRequestItem),
  from_warehouse: item.from_warehouse.map(cloneWarehouse),
  to_warehouse: item.to_warehouse.map(cloneWarehouse),
  createdDate: item.createdDate ? moment(item.createdDate) : undefined,
  lastModifiedDate: item.lastModifiedDate ? moment(item.lastModifiedDate) : undefined,
  posting_date: moment(item.posting_date),
  taxDate: moment(item.taxDate),
  due_date: moment(item.due_date),
  activities: item.activities.map(cloneRequestActivity),
});

const cloneTransferItem = (item: TransferItem): TransferItem => ({ ...item });
const cloneTransferActivity = (activity: TransferActivity): TransferActivity => ({ ...activity });
const cloneTransfer = (item: Transfer): Transfer => ({
  ...item,
  item: item.item.map(cloneTransferItem),
  from_warehouse: item.from_warehouse.map(cloneWarehouse),
  to_warehouse: item.to_warehouse.map(cloneWarehouse),
  createdDate: item.createdDate ? moment(item.createdDate) : undefined,
  lastModifiedDate: item.lastModifiedDate ? moment(item.lastModifiedDate) : undefined,
  posting_date: moment(item.posting_date),
  due_date: moment(item.due_date),
  activities: item.activities.map(cloneTransferActivity),
  transferRequests: item.transferRequests,
});

const cloneProvidedList = (item: ProvidedList): ProvidedList => ({ ...item });
const cloneProvidedItem = (item: ProvidedItem): ProvidedItem => ({ ...item });

const matchSearch = (value: string, terms: string[]) =>
  !value ||
  terms.some((term) => term.toLowerCase().includes(value));

const paginate = <T>(items: T[], current?: number, pageSize?: number): Paging<T> => {
  const safePageSize = pageSize || items.length || 10;
  const page = current || 1;
  const start = (page - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    total: items.length,
    pageSize: safePageSize,
  };
};

const filterRequests = (
  scope: 'production' | 'warehouse',
  params: TableViewSearchParams<TransferRequestSearch>,
) => {
  const advanceSearch = (params.criteria as any)?.advanceSearch || {};
  const searchValue = `${(params.criteria as any)?.searchValue || ''}`.trim().toLowerCase();

  return requestStore.filter((item) => {
    if (scope === 'production' && item.status !== 'transfer-request') {
      return false;
    }
    if (advanceSearch.transfer_type && advanceSearch.transfer_type !== 'ALL') {
      if (item.transfer_type !== advanceSearch.transfer_type) {
        return false;
      }
    }
    if (advanceSearch.business_unit && !['ALL', 'None', 'none'].includes(advanceSearch.business_unit)) {
      if (item.business_unit !== advanceSearch.business_unit) {
        return false;
      }
    }
    if (advanceSearch.state && !['ALL', ''].includes(advanceSearch.state)) {
      if (item.state !== advanceSearch.state) {
        return false;
      }
    }
    if (
      advanceSearch.postingDate &&
      item.posting_date.format('YYYY-MM-DD') !== advanceSearch.postingDate
    ) {
      return false;
    }
    if (advanceSearch.docDueDate && item.due_date.format('YYYY-MM-DD') !== advanceSearch.docDueDate) {
      return false;
    }

    const requestTerms = [
      item.id,
      item.transfer_id,
      item.line,
      item.shift,
      item.createdBy || '',
      item.status,
      item.state,
      ...item.item.flatMap((row) => [row.item_code, row.item_name, row.supplier]),
    ];
    return matchSearch(searchValue, requestTerms);
  });
};

const filterTransfers = (params: TableViewSearchParams<TransferSearch>) => {
  const advanceSearch = (params.criteria as any)?.advanceSearch || {};
  const searchValue = `${(params.criteria as any)?.searchValue || ''}`.trim().toLowerCase();

  return transferStore.filter((item) => {
    if (advanceSearch.transfer_type && advanceSearch.transfer_type !== 'ALL') {
      if (item.transfer_type !== advanceSearch.transfer_type) {
        return false;
      }
    }
    if (advanceSearch.status && advanceSearch.status !== 'ALL') {
      if (item.status !== advanceSearch.status) {
        return false;
      }
    }
    if (
      advanceSearch.transfer_request &&
      String(item.transfer_request) !== String(advanceSearch.transfer_request)
    ) {
      return false;
    }
    if (
      advanceSearch.postingDate &&
      item.posting_date.format('YYYY-MM-DD') !== advanceSearch.postingDate
    ) {
      return false;
    }
    if (advanceSearch.docDueDate && item.due_date.format('YYYY-MM-DD') !== advanceSearch.docDueDate) {
      return false;
    }
    const terms = [
      `${item.id}`,
      item.transfer_id,
      `${item.transfer_request}`,
      item.line,
      item.shift,
      item.createdBy || '',
      item.status,
      ...item.item.flatMap((row) => [row.item_code, row.item_name, row.supplier || '']),
    ];
    return matchSearch(searchValue, terms);
  });
};

const filterWarehouses = (
  params: TableViewSearchParams<{ searchValue?: string; tendency?: string }>,
) => {
  const searchValue = `${(params.criteria as any)?.searchValue || ''}`.trim().toLowerCase();
  const tendency = `${(params.criteria as any)?.tendency || (params.criteria as any)?.advanceSearch?.tendency || ''}`
    .trim()
    .toUpperCase();

  return Object.values(warehouseCatalog).filter((item) => {
    if (tendency && tendency !== 'ALL' && item.tendency.toUpperCase() !== tendency) {
      return false;
    }

    return matchSearch(searchValue, [
      item.whsCode,
      item.whsName,
      item.tendency,
      item.building || '',
    ]);
  });
};

const filterItems = (params: TableViewSearchParams<ItemSearch>) => {
  const searchValue = `${(params.criteria as any)?.searchValue || ''}`.trim().toLowerCase();
  const tendency = `${(params.criteria as any)?.tendency || (params.criteria as any)?.advanceSearch?.tendency || ''}`
    .trim()
    .toUpperCase();

  return itemCatalog.filter((item) => {
    if (tendency && tendency !== 'ALL' && item.tendency.toUpperCase() !== tendency) {
      return false;
    }

    return matchSearch(searchValue, [
      item.itemCode,
      item.itemName,
      item.inventoryUoM,
      item.tendency,
      ...item.item_group.map((group) => group.itemGroupName),
    ]);
  });
};

const filterBomItems = (params: TableViewSearchParams<BomItemSearch>) => {
  const searchValue = `${(params.criteria as any)?.searchValue || ''}`.trim().toLowerCase();
  const tendency = `${(params.criteria as any)?.tendency || (params.criteria as any)?.advanceSearch?.tendency || ''}`
    .trim()
    .toUpperCase();

  return bomCatalog.filter((item) => {
    if (tendency && tendency !== 'ALL' && item.tendency.toUpperCase() !== tendency) {
      return false;
    }

    return matchSearch(searchValue, [String(item.product_code), item.product_name, item.tendency]);
  });
};

const filterSuppliers = (params: TableViewSearchParams<SupplierSearch>) => {
  const searchValue = `${(params.criteria as any)?.searchValue || ''}`.trim().toLowerCase();
  const tendency = `${(params.criteria as any)?.tendency || (params.criteria as any)?.advanceSearch?.tendency || ''}`
    .trim()
    .toUpperCase();

  return supplierCatalog.filter((supplier) => {
    if (tendency && tendency !== 'ALL' && supplier.tendency.toUpperCase() !== tendency) {
      return false;
    }

    return matchSearch(searchValue, [supplier.card_code, supplier.card_name, supplier.tendency]);
  });
};

const updateRequestAudit = (request: TransferRequest, actionBy = 'frontend.mock') => {
  request.lastModifiedBy = actionBy;
  request.lastModifiedDate = moment();
};

const updateTransferAudit = (transfer: Transfer, actionBy = 'frontend.mock') => {
  transfer.lastModifiedBy = actionBy;
  transfer.lastModifiedDate = moment();
};

const success = (message: string) => ({ data: message, message });

export const warehouseMockApi = {
  page: (params: TableViewSearchParams<{ searchValue?: string; tendency?: string }>) =>
    Promise.resolve(
      paginate(
        filterWarehouses(params).map(cloneWarehouse),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  detail: (id: number) =>
    Promise.resolve(
      cloneWarehouse(
        Object.values(warehouseCatalog).find((item) => item.id === Number(id)) ||
          warehouseCatalog['W02-WHPM'],
      ),
    ),
};

export const itemMockApi = {
  page: (params: TableViewSearchParams<ItemSearch>) =>
    Promise.resolve(
      paginate(
        filterItems(params).map((item) => ({ ...item })),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  listItemGroup: () => Promise.resolve(itemGroups.map((group) => ({ ...group }))),
  detail: (id: number) =>
    Promise.resolve({ ...(itemCatalog.find((item) => item.id === Number(id)) || itemCatalog[0]) }),
  pageBom: (params: TableViewSearchParams<BomItemSearch>) =>
    Promise.resolve(
      paginate(
        filterBomItems(params).map(({ children, ...item }) => ({ ...item })),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  listChildItem: (father: string, tendency: string) => {
    const bom = bomCatalog.find(
      (item) =>
        String(item.product_code) === String(father) &&
        (!tendency || item.tendency.toUpperCase() === tendency.toUpperCase()),
    );

    return Promise.resolve(
      (bom?.children || [])
        .map((child, index) => {
          const matchedItem = itemCatalog.find(
            (item) =>
              item.itemCode === child.code &&
              (!tendency || item.tendency.toUpperCase() === tendency.toUpperCase()),
          );
          if (!matchedItem) return null;
          return {
            ...matchedItem,
            key: `${father}-${matchedItem.id}`,
            childItem: [
              {
                id: Number(`${father}${index + 1}`),
                father: Number(father),
                child_num: index + 1,
                code: child.code,
                quantity: child.quantity,
                active: '1',
              },
            ],
          };
        })
        .filter(Boolean) as Item[],
    );
  },
  detailByCode: (father: string, code: string, tendency: string) => {
    const matchedItem =
      itemCatalog.find(
        (item) =>
          item.itemCode === code && (!tendency || item.tendency.toUpperCase() === tendency.toUpperCase()),
      ) || itemCatalog[0];
    const bom = bomCatalog.find((item) => String(item.product_code) === String(father));
    const child = bom?.children.find((entry) => entry.code === code);

    return Promise.resolve({
      ...matchedItem,
      childItem: child
        ? [
            {
              id: Number(`${father}${matchedItem.id}`),
              father: Number(father),
              child_num: 1,
              code,
              quantity: child.quantity,
              active: '1',
            },
          ]
        : matchedItem.childItem,
    });
  },
  pageSupplier: (params: TableViewSearchParams<SupplierSearch>) =>
    Promise.resolve(
      paginate(
        filterSuppliers(params).map((supplier) => ({ ...supplier })),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  addSupplier: (data: AddSupplierParams) => {
    const exists = supplierCatalog.some(
      (supplier) => supplier.card_name.toUpperCase() === data.supplier.toUpperCase(),
    );
    if (!exists) {
      supplierCatalog = [
        ...supplierCatalog,
        {
          card_code: `SUP-MOCK-${supplierCatalog.length + 1}`,
          card_name: data.supplier,
          tendency: 'NVC',
          active: '1',
        },
      ];
    }
    return Promise.resolve(success('Supplier saved'));
  },
};

export const requestMockApi = {
  page: (params: TableViewSearchParams<TransferRequestSearch>) =>
    Promise.resolve(
      paginate(
        filterRequests('production', params).map(cloneRequest),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  pageWarehouse: (params: TableViewSearchParams<TransferRequestSearch>) =>
    Promise.resolve(
      paginate(
        filterRequests('warehouse', params).map(cloneRequest),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  detail: (id: string) =>
    Promise.resolve(cloneRequest(requestStore.find((item) => item.id === String(id)) || requestStore[0])),
  save: (data: any) => {
    const nextId = `${Math.max(...requestStore.map((item) => Number(item.id))) + 1}`;
    const fromWarehouse =
      Object.values(warehouseCatalog).find((item) => item.id === Number(data.from_warehouse)) ||
      warehouseCatalog['W02-PDFG'];
    const toWarehouse =
      Object.values(warehouseCatalog).find((item) => item.id === Number(data.to_warehouse)) ||
      warehouseCatalog['W02-WHFG'];
    const postingDate = data.postingDate || data.posting_date || data.taxDate;
    const dueDate = data.docDueDate || data.due_date || postingDate;
    const record: TransferRequest = {
      transfer_id: `IIO-PDR-${nextId.padStart(6, '0')}`,
      id: nextId,
      key: nextId,
      item: (data.items || []).map((item: any, index: number) => ({
        childItem: [],
        item: item.item_name || item.item || '',
        quantity: item.quantity || '0',
        remark: item.remark || '',
        id: nextRequestItemId(),
        itemId: index + 1,
        item_code: item.item_code || '',
        item_name: item.item_name || item.item || '',
        key: `${nextId}-${index + 1}`,
        uom: item.uom || 'Ea',
        received: item.received || '0',
        itemReceive: Number(item.received || 0),
        is_receive: item.is_receive || 'False',
        transfer_request: `IIO-PDR-${nextId.padStart(6, '0')}`,
        supplier: item.supplier || '',
        oldtotal: item.received || '0',
      })),
      from_warehouse: [cloneWarehouse(fromWarehouse)],
      to_warehouse: [cloneWarehouse(toWarehouse)],
      transfer_type: data.transfer_type || 'FG',
      status: 'transfer-request',
      createdBy: 'frontend.mock',
      createdDate: moment(),
      lastModifiedBy: 'frontend.mock',
      lastModifiedDate: moment(),
      remark: data.remark || '',
      posting_date: postingDate ? moment(postingDate) : moment(),
      taxDate: postingDate ? moment(postingDate) : moment(),
      due_date: dueDate ? moment(dueDate) : moment(),
      business_unit: data.business_unit || fromWarehouse.tendency || 'NVC',
      line: data.line || 'Production Line 04',
      shift: data.shift || 'S1',
      activities: [
        {
          transfer_request: `IIO-PDR-${nextId.padStart(6, '0')}`,
          activities_name: 'Start',
          action: 'Start Request',
          actionBy: 'frontend.mock',
          actionDate: moment(),
          id: Number(nextId) * 10 + 1,
        },
      ],
      state: 'in-progress',
      sapDocNo: '',
      sapDocEntry: undefined,
    };
    requestStore = [record, ...requestStore];
    return Promise.resolve(success('Transfer request saved'));
  },
  statusChange: (data: TransferRequestStatusChange) => {
    const request = requestStore.find((item) => item.id === String(data.id));
    if (request) {
      if (data.statusChange === 'transfer-request-reject' || data.statusChange === 'transfer-request-warehouse-reject') {
        request.state = 'rejected';
      }
      if (data.statusChange === 'request-warehouse-approve') {
        request.status = 'request-warehouse-approve';
        request.state = data.state as TransferRequest['state'];
      }
      if (data.statusChange === 'received') {
        request.status = 'received';
        request.state = 'completed';
      }
      updateRequestAudit(request);
    }
    return Promise.resolve(success('Transfer request status updated'));
  },
  saveActivities: (data: RequestActivity) => {
    const request = requestStore.find((item) => item.transfer_id === data.transfer_request);
    if (request) {
      request.activities = [
        ...request.activities,
        {
          ...data,
          actionBy: data.actionBy || 'frontend.mock',
          actionDate: data.actionDate || moment(),
          id: Number(request.id) * 10 + request.activities.length + 1,
        },
      ];
      updateRequestAudit(request, data.actionBy || 'frontend.mock');
    }
    return Promise.resolve(success('Activity saved'));
  },
  getCount: (data: { status?: string }) => {
    const count = requestStore.filter((item) => !data.status || item.status === data.status).length;
    return Promise.resolve({ data: `${count}`, message: 'Count loaded' });
  },
  provided: (data: Provided) => {
    const requestId = String(data.transfer_request_id || '');
    const nextId = Math.max(...providedListStore.map((item) => item.id), 0) + 1;
    const provided = `IIO-PRV-${requestId.padStart(6, '0')}-${String(nextId).padStart(2, '0')}`;
    providedListStore = [
      ...providedListStore,
      {
        id: nextId,
        transfer_request_id: Number(requestId),
        provided,
        status: data.status || 'pending',
        createdBy: 'frontend.mock',
        createdDate: moment().toISOString(),
        lastModifiedBy: '',
        lastModifiedDate: '',
      },
    ];
    providedItemStore[provided] = (data.item || []).map(cloneProvidedItem);
    const request = requestStore.find((item) => item.id === requestId);
    if (request) {
      request.status = 'transferring';
      request.state = 'in-progress';
      request.activities = [
        ...request.activities,
        {
          transfer_request: request.transfer_id,
          activities_name: data.activities_name || 'Transfer',
          action: data.action || `Add Transfer ${providedListStore.length}`,
          actionBy: 'frontend.mock',
          actionDate: moment(),
          id: Number(request.id) * 10 + request.activities.length + 1,
        },
      ];
      updateRequestAudit(request);
    }
    return Promise.resolve(success('Transfer batch saved'));
  },
  getToExcel: () => Promise.resolve(cloneRequest(requestStore[0])),
  saveToSap: (data: SAPTransferRequest) => {
    const request = requestStore.find((item) => item.id === String(data.id));
    if (request) {
      request.status = 'request-production-approve';
      request.state = (data.state as TransferRequest['state']) || 'in-progress';
      request.sapDocEntry = Number(request.id);
      request.sapDocNo = `SAP-${request.id}`;
      request.activities = [
        ...request.activities,
        {
          transfer_request: request.transfer_id,
          activities_name: data.activities_name || 'Production Approval',
          action: data.action || 'Approved',
          actionBy: 'frontend.mock',
          actionDate: moment(),
          id: Number(request.id) * 10 + request.activities.length + 1,
        },
      ];
      updateRequestAudit(request);
    }
    return Promise.resolve(success('SAP request simulated'));
  },
  getTotalProvide: (data: TotalProvideParams) =>
    Promise.resolve(
      providedListStore
        .filter(
          (item) =>
            item.transfer_request_id ===
            Number((data as TotalProvideParams & { transfer_request?: string }).transfer_request_id || (data as any).transfer_request),
        )
        .flatMap((item) => providedItemStore[item.provided] || [])
        .filter((item) => item.item_code === data.item_code)
        .map(cloneProvidedItem),
    ),
  getProvidedList: (transferRequestId: string) =>
    Promise.resolve(
      providedListStore
        .filter((item) => item.transfer_request_id === Number(transferRequestId))
        .map(cloneProvidedList),
    ),
  getProvidedItem: (provided: string) =>
    Promise.resolve((providedItemStore[provided] || []).map(cloneProvidedItem)),
  closeTransfer: (data: closeParams) => {
    const request = requestStore.find((item) => item.id === String(data.id));
    if (request) {
      request.state = data.state as TransferRequest['state'];
      if (data.statusChange === 'transfer-request-warehouse-reject') {
        request.status = 'request-production-approve';
      }
      request.activities = [
        ...request.activities,
        {
          transfer_request: data.transfer_request || request.transfer_id,
          activities_name: data.activities_name,
          action: data.action,
          remark: data.remark,
          actionBy: data.actionBy || 'frontend.mock',
          actionDate: data.actionDate || moment(),
          id: Number(request.id) * 10 + request.activities.length + 1,
        },
      ];
      updateRequestAudit(request);
    }
    return Promise.resolve(success('Transfer request updated'));
  },
  getLine: () =>
    Promise.resolve<ProductionLine[]>([
      { id: 4, prdcode: 'L04', prdname: 'Production Line 04', active: 1 },
      { id: 5, prdcode: 'L05', prdname: 'Production Line 05', active: 1 },
      { id: 6, prdcode: 'L06', prdname: 'Production Line 06', active: 1 },
      { id: 7, prdcode: 'L07', prdname: 'Production Line 07', active: 1 },
      { id: 8, prdcode: 'L08', prdname: 'Production Line 08', active: 1 },
    ]),
};

export const transferMockApi = {
  page: (params: TableViewSearchParams<TransferSearch>) =>
    Promise.resolve(
      paginate(
        filterTransfers(params).map(cloneTransfer),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  pageFinal: (params: TableViewSearchParams<TransferSearch>) =>
    Promise.resolve(
      paginate(
        filterTransfers(params).map(cloneTransfer),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  pageFG: (params: TableViewSearchParams<TransferSearch>) =>
    Promise.resolve(
      paginate(
        filterTransfers(params).map(cloneTransfer),
        params.pagination?.current,
        params.pagination?.pageSize,
      ),
    ),
  detail: (id: number) =>
    Promise.resolve(cloneTransfer(transferStore.find((item) => item.id === Number(id)) || transferStore[0])),
  detailList: (id: number) =>
    Promise.resolve(cloneTransfer(transferStore.find((item) => item.id === Number(id)) || transferStore[0])),
  receive: () => Promise.resolve(success('Item receive simulated')),
  receiveChange: (data: ReceiveStatusChange) => {
    const request = requestStore.find((item) => item.id === String(data.transfer_request));
    if (request) {
      request.status = 'received';
      request.state = 'completed';
      updateRequestAudit(request);
    }
    return Promise.resolve(success('Receive status updated'));
  },
  save: (data: TransferCreate) => {
    const idFromTransfer = Number(String(data.transfer_id || '').replace(/\D/g, '').slice(-6)) || Math.max(...transferStore.map((item) => item.id), 0) + 1;
    const record: Transfer = {
      id: idFromTransfer,
      items: `${(data.items || []).length}`,
      quantity: (data.items || [])
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        .toString(),
      transfer_type: data.transfer_type,
      status: data.status || 'pending',
      createdBy: 'frontend.mock',
      createdDate: moment(),
      lastModifiedBy: 'frontend.mock',
      lastModifiedDate: moment(),
      received: '0',
      item: (data.items || []).map((item, index) => ({
        ...item,
        id: item.id || nextTransferItemId(),
        itemId: item.itemId || index + 1,
        key: item.key || `${idFromTransfer}-${index + 1}`,
        received: item.received || '0',
        total: item.total || '0',
        oldtotal: item.oldtotal || '0',
      })),
      from_warehouse: [
        cloneWarehouse(
          Object.values(warehouseCatalog).find((item) => item.id === data.from_warehouse) ||
            warehouseCatalog['W02-WHPM'],
        ),
      ],
      to_warehouse: [
        cloneWarehouse(
          Object.values(warehouseCatalog).find((item) => item.id === data.to_warehouse) ||
            warehouseCatalog['W02-PDPM'],
        ),
      ],
      business_unit: data.business_unit || 'NVC',
      remark: '',
      posting_date: data.posting_date ? moment(data.posting_date) : moment(),
      due_date: data.due_date ? moment(data.due_date) : moment(),
      key: `${idFromTransfer}`,
      transfer_request: Number(data.transfer_request || 0),
      line: data.line,
      shift: data.shift,
      activities: [],
      transfer_id: data.transfer_id,
      sapDocNo: undefined,
      sapDocEntry: undefined,
      transferRequests: [] as any,
    };
    transferStore = [record, ...transferStore];
    return Promise.resolve(success('Transfer saved'));
  },
  getReceive: (data: GetReceive) =>
    Promise.resolve(
      transferStore
        .filter((item) => item.transfer_request === Number(data.transfer_request))
        .flatMap((item) => item.item)
        .filter((item) => item.item_code === data.item_code)
        .map(cloneTransferItem),
    ),
  closeRequest: (data: SAPCloseDoc) => {
    const transfer = transferStore.find((item) => item.transfer_id === data.transfer_id);
    if (transfer) {
      transfer.status = 'completed';
      transfer.item = transfer.item.map((item) => ({
        ...item,
        received: item.quantity,
        total: item.quantity,
        oldtotal: item.quantity,
      }));
      updateTransferAudit(transfer);
    }
    const request = requestStore.find((item) => item.id === String(data.transfer_request));
    if (request) {
      request.status = 'received';
      request.state = 'completed';
      updateRequestAudit(request);
    }
    return Promise.resolve(success('Transfer closed'));
  },
  updateProvidedStatus: (data: updateProvidedParams) => {
    const provided = providedListStore.find((item) => item.provided === data.provided);
    if (provided) {
      provided.status = data.status;
      provided.lastModifiedBy = 'frontend.mock';
      provided.lastModifiedDate = moment().toISOString();
    }
    return Promise.resolve(success('Provided status updated'));
  },
  getItemForClose: (data: getItemforCloseParams) =>
    Promise.resolve(
      providedListStore
        .filter(
          (item) =>
            item.transfer_request_id === Number(data.transfer_request_id) &&
            (!data.status || item.status === data.status),
        )
        .flatMap((item) => providedItemStore[item.provided] || [])
        .filter((item) => !data.item_code || item.item_code === data.item_code)
        .map(cloneProvidedItem),
    ),
  detailSap: (docEntry: number) =>
    Promise.resolve(
      cloneTransfer(transferStore.find((item) => item.id === Number(docEntry)) || transferStore[0]),
    ),
  listTransfer: (docEntity: number) =>
    Promise.resolve(
      cloneTransfer(transferStore.find((item) => item.id === Number(docEntity)) || transferStore[0]),
    ),
};
