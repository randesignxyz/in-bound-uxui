import { Locations } from '@/services/crm/data';
import { LookupData, LookupDataItem } from '@/services/data';
import { BaseActionType, baseReducer, StateType } from '@/services/model';
import {
  SaleInvoiceLess,
  SalesTeamWorkLess,
  StockControlDetail,
  StockDetailLess,
} from '@/services/sale/data';

export type ModalName = 'nothing' | 'advanceSearch';

export interface InitData {
  //seList?: LookupDataItem[];
  salespersonList?: SalesTeamWorkLess[];
  regionList?: Locations[];
  types?: LookupDataItem[];
  typeProductItems?: { type: number; value: LookupDataItem[] }[];
  lookDataList?: LookupData[];
  saleInvoiceList?: SaleInvoiceLess[];
}

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    detail?: StockControlDetail;
    stockDetailByType?: StockDetailLess;
    listStockDetailItem?: StockDetailLess[];
    lsitLastStockControl?: StockDetailLess[];
    isBeginningManual?: boolean;
    locations?: {
      provinceList?: Locations[];
      districtList?: Locations[];
      communeList?: Locations[];
      villageList?: Locations[];
    };
  };
}

export type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'detail'; payload?: StockControlDetail }
  | { type: 'stockDetailWithType'; payload?: StockDetailLess }
  | { type: 'listStockDetailItem'; payload?: StockDetailLess[] }
  | { type: 'setProvinces'; payload?: Locations[] }
  | { type: 'setDistricts'; payload?: Locations[] }
  | { type: 'setCommunes'; payload?: Locations[] }
  | { type: 'setVillages'; payload?: Locations[] }
  | { type: 'manualListSaleInvoice'; payload?: SaleInvoiceLess[] }
  | { type: 'fetchLastStockControl'; payload?: StockDetailLess[] }
  | { type: 'isInitialManual'; payload?: { noneData: boolean } };
// | { type: 'invoiceNo'; payload?: { refNo: string } };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'isInitialManual':
      return {
        ...state,
        data: {
          ...state.data,
          isBeginningManual: action.payload?.noneData,
        },
      };
    case 'fetchLastStockControl':
      return {
        ...state,
        data: {
          ...state.data,
          lsitLastStockControl: action.payload,
        },
      };
    case 'manualListSaleInvoice':
      return {
        ...state,
        data: {
          ...state.data,
          initData: {
            ...state.data?.initData,
            saleInvoiceList: action.payload,
          },
        },
      };

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
    case 'detail':
      return {
        ...state,
        data: {
          ...state.data,
          detail: action.payload,
        },
      };
    case 'stockDetailWithType':
      return {
        ...state,
        data: {
          ...state.data,
          stockDetailByType: action.payload,
        },
      };
    case 'listStockDetailItem':
      return {
        ...state,
        data: {
          ...state.data,
          listStockDetailItem: action.payload,
        },
      };
    // case 'invoiceNo':
    //   return {
    //     ...state,
    //     data: {
    //       ...state.data,
    //       invoiceNo: action.payload,
    //     },
    //   };
    case 'setProvinces':
      return {
        ...state,
        data: {
          ...state.data,
          locations: {
            ...state.data?.locations,
            provinceList: action.payload,
          },
        },
      };
    case 'setDistricts':
      return {
        ...state,
        data: {
          ...state.data,
          locations: {
            ...state.data?.locations,
            districtList: action.payload,
          },
        },
      };
    case 'setCommunes':
      return {
        ...state,
        data: {
          ...state.data,
          locations: {
            ...state.data?.locations,
            communeList: action.payload,
          },
        },
      };
    case 'setVillages':
      return {
        ...state,
        data: {
          ...state.data,
          locations: {
            ...state.data?.locations,
            villageList: action.payload,
          },
        },
      };
    default:
      return baseReducer(state, action);
  }
};
