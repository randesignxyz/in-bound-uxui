import { AddressInfo, CustomerItemLess, SalePerson } from '@/services/crm/data';
import { BusinessUnit, LookupData, LookupDataItem } from '@/services/data';
import { BaseActionType, StateType, baseReducer } from '@/services/model';
import {
  BudgetCodeLess,
  CustomerSaleInfo,
  OfferCodeInfo,
  // CustomerTransportOfferDto,
  PackageOffer,
  ProductItem,
  ProductItemLess,
  SaveUoM,
  So,
  SoDeliveryMethod,
  SoDetail,
  SoItem,
  SoPaymentTerm,
  SoSummary,
  StatusLookup,
} from '@/services/sale/data';
import { uniqueId } from 'lodash';
import moment from 'moment';
export type ModalName =
  | 'nothing'
  | 'item-entry'
  | 'sap-posting'
  | 'cancel-so'
  | 'close-so'
  | 'advanceSearch'
  | 'quickView';
export type SoItemEntry = SoItem & { key: string; parentKey?: string; seq?: number };

export interface DeliveryEntry {
  id?: number;
  key?: string;
  deliveryMethodId?: number;
  deliveryDate?: moment.Moment;
  shippingAddressId?: number;
  shippingAddressCode?: string;
  remarks?: string;
  default?: boolean;
  itemList: DeliveryItemEntry[];
  line_num?:number
}

export interface DeliveryItemEntry {
  itemId: number;
  key?: string;
  itemCode: string;
  itemDesc: string;
  uomId: number;
  uomName?: string;
  type: string;
  qty: number;
  remarks?: string;
}

export interface DeliverySoItemEntry {
  id: number;
  key?: string;
  deliveryDate?: moment.Moment;
  shippingAddressId?: number;
  shippingAddressCode?: string;
  itemId: number;
  itemCode: string;
  description: string;
  type: string;
  qty: number;
  shippedQty?: number;
  uomId: number;
  uomName: string;
  remarks?: string;
  main?: boolean;
  default?: boolean;
  mainKey?: string;
}

export interface InitData {
  paymentTermList?: SoPaymentTerm[];
  deliveryMethodList?: SoDeliveryMethod[];
  salePersonList?: SalePerson[];
  buList?: BusinessUnit[];
  status?: StatusLookup[];
  // transportOffers?: CustomerTransportOfferDto[],
  itemList?: ProductItemLess[];
  addressList?: AddressInfo[];
  lookDataList?: LookupData[];
  customers?: CustomerItemLess[];
  salespersons?: LookupDataItem[];
  listBudget?: BudgetCodeLess[];
  uomList?: SaveUoM[];
}

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    so?: So;
    soDetail?: SoDetail;
    offerCodes?: OfferCodeInfo[];
    soItems?: SoItemEntry[];
    deliverySoItems?: DeliverySoItemEntry[];
    deliveryList?: DeliveryEntry[];
    customerSaleInfo?: CustomerSaleInfo;
    productItem?: ProductItem;
    packageOffer?: PackageOffer[];
    transportation?: PackageOffer[];
    soSummary?: SoSummary;
    attachments?: { id: number; imageId: string; status: string }[];
  };
}

export type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'saveSoItem'; payload: SoItemEntry[] }
  | { type: 'editSoItem'; payload: SoItemEntry[] }
  | { type: 'saveAllSoItem'; payload: SoItemEntry[] }
  | { type: 'setDeliverySoItems'; payload: DeliverySoItemEntry[] }
  | { type: 'removeSoItem'; payload: SoItemEntry[] }
  | { type: 'setSoDetail'; payload: SoDetail }
  | { type: 'fetchOfferCodes'; payload: OfferCodeInfo[] }
  | { type: 'clearSoItem' }
  | { type: 'resetSoItem' }
  | { type: 'newSo' }
  | { type: 'setProductItem'; payload: ProductItem }
  | { type: 'setPackageOffer'; payload: PackageOffer[] }
  | { type: 'setDeliveryList'; payload: DeliveryEntry[] }
  | { type: 'setCustomerSaleInfo'; payload: CustomerSaleInfo }
  | { type: 'setTransportations'; payload: PackageOffer[] }
  | { type: 'setSoSummary'; payload: SoSummary }
  // | { type: 'initUom'; payload: SaveUoM[] }
  | {
      type: 'setAttachments';
      payload: { id: number; imageId: string; status: string }[];
    };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'initialData':
      return {
        ...state,
        data: {
          ...state.data,
          initData: {
            ...state.data?.initData,
            ...action.payload,
          },
          // addressList: action.payload?.addressList,
        },
      };
    // case 'initUom':
    //   return {
    //     ...state,
    //     data: {
    //       ...state.data,
    //       ...action.payload,
    //     },
    //   };
    case 'saveSoItem': {
      return {
        ...state,
        data: {
          ...state.data,
          soItems: action.payload,
        },
      };
    }

    case 'editSoItem': {
      return {
        ...state,
        data: {
          ...state.data,
          soItems: action.payload,
        },
      };
    }

    case 'saveAllSoItem': {
      return {
        ...state,
        data: {
          ...state.data,
          soItems: action.payload,
        },
      };
    }

    case 'removeSoItem': {
      return {
        ...state,
        data: {
          ...state.data,
          soItems: action.payload,
        },
      };
    }
    case 'clearSoItem': {
      return {
        ...state,
        data: {
          ...state.data,
          soItems: [],
        },
      };
    }

    case 'resetSoItem':
      return {
        ...state,
        data: {
          ...state.data,
          soItems: [
            ...(state.data?.soDetail?.items || []).map((it) => {
              return {
                ...it,
                key: uniqueId(),
                uomId: it.uomId,
                itemId: it.itemId,
                itemCode: it.itemCode,
                qty: it.qty,
                amount: it.amount,
                discountAmount: it.discountAmount,
                totalAmount: it.totalAmount,
                type: it.type,

                associatedTo: {
                  uom: {
                    id: it.uomId,
                    code: '',
                    name: it.uom,
                  },
                },
              };
            }),
          ],
        },
      };
    case 'newSo': {
      return {
        ...state,
        data: {
          ...state.data,
          soItems: [],
          so: undefined,
        },
      };
    }

    case 'setSoDetail':
      return {
        ...state,
        data: {
          ...state.data,
          soDetail: action.payload,
        },
      };
    case 'setProductItem':
      return {
        ...state,
        data: {
          ...state.data,
          productItem: action.payload,
        },
      };
    case 'setPackageOffer':
      return {
        ...state,
        data: {
          ...state.data,
          packageOffer: action.payload,
        },
      };
    case 'setDeliverySoItems':
      return {
        ...state,
        data: {
          ...state.data,
          deliverySoItems: action.payload,
        },
      };
    case 'setDeliveryList':
      return {
        ...state,
        data: {
          ...state.data,
          deliveryList: action.payload,
        },
      };

    case 'setCustomerSaleInfo':
      return {
        ...state,
        data: {
          ...state.data,
          customerSaleInfo: action.payload,
        },
      };

    case 'setTransportations':
      return {
        ...state,
        data: {
          ...state.data,
          transportation: action.payload,
        },
      };
    case 'setSoSummary':
      return {
        ...state,
        data: {
          ...state.data,
          soSummary: action.payload,
        },
      };
    case 'setAttachments':
      return {
        ...state,
        data: {
          ...state.data,
          attachments: action.payload,
        },
      };
    case 'fetchOfferCodes':
      return {
        ...state,
        data: {
          ...state.data,
          offerCodes: action.payload,
        },
      };
    default:
      return baseReducer(state, action);
  }
};
