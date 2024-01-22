import { Locations } from '@/services/crm/data';
import { LookupDataItem } from '@/services/data';
import { BaseActionType, baseReducer, StateType } from '@/services/model';
import {
  SaleInvoiceLess,
  SalesTeamWorkLess,
  StockDetailLess,
  StockStoreDetail,
  TeamWorkLess,
} from '@/services/sale/data';

export interface InitData {
  teamWorks?: TeamWorkLess[];
  salespersonList?: SalesTeamWorkLess[];
  types?: LookupDataItem[];
  // salesType?: LookupDataItem[];
  regionList?: Locations[];
  saleInvoiceList?: SaleInvoiceLess[];
  typeProductItems?: { type: number; value: LookupDataItem[] }[];
}

export type ModalName = 'nothing' | 'advanceSearch';

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    detail?: StockStoreDetail;
    teamWorks?: TeamWorkLess[];
    members?: SalesTeamWorkLess[];
    lsitLastStockControl?: StockDetailLess[];
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
  | { type: 'listTeamWork'; payload?: TeamWorkLess[] }
  | { type: 'detail'; payload?: StockStoreDetail }
  | { type: 'addMember'; payload?: SalesTeamWorkLess[] }
  | { type: 'removeMember'; payload?: SalesTeamWorkLess }
  | { type: 'clearMember' }
  | { type: 'manualListSaleInvoice'; payload?: SaleInvoiceLess[] }
  | { type: 'fetchLastStockControl'; payload?: StockDetailLess[] }
  | { type: 'setProvinces'; payload?: Locations[] }
  | { type: 'setDistricts'; payload?: Locations[] }
  | { type: 'setCommunes'; payload?: Locations[] }
  | { type: 'setVillages'; payload?: Locations[] };

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
    case 'listTeamWork':
      return {
        ...state,
        data: {
          ...state.data,
          teamWorks: action.payload,
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
    case 'addMember':
      return {
        ...state,
        data: {
          ...state.data,
          members: action.payload,
        },
      };
    case 'removeMember':
      return {
        ...state,
        data: {
          ...state.data,
          members: state.data?.members?.filter(
            (it) => it.salespersonCode !== action.payload?.salespersonCode,
          ),
        },
      };
    case 'clearMember':
      return {
        ...state,
        data: {
          ...state.data,
          members: [],
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
    default:
      return baseReducer(state, action);
  }
};
