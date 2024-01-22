import { LookupDataItem } from '@/services/data';
import { BaseActionType, baseReducer, StateType } from '@/services/model';

export type ModalName = 'nothing';

export interface InitData {
  seList?: LookupDataItem[];
}

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    productItems?: LookupDataItem[];
    //   detail?: StockControlDetail;
    //   stockDetailByType?: StockDetailLess;
    //   listStockDetailItem?: StockDetailLess[];
  };
}

export type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'loadItems'; payload?: LookupDataItem[] };

//   | { type: 'detail'; payload?: StockControlDetail }
//   | { type: 'stockDetailWithType'; payload?: StockDetailLess }
//   | { type: 'listStockDetailItem'; payload?: StockDetailLess[] };

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
    case 'loadItems':
      return {
        ...state,
        data: {
          ...state.data,
          productItems: action.payload,
        },
      };
    // case 'detail':
    //   return {
    //     ...state,
    //     data: {
    //       ...state.data,
    //       detail: action.payload,
    //     },
    //   };
    //   case 'stockDetailWithType':
    //     return {
    //       ...state,
    //       data: {
    //         ...state.data,
    //         stockDetailByType: action.payload,
    //       },
    //     };
    //   case 'listStockDetailItem':
    //     return {
    //       ...state,
    //       data: {
    //         ...state.data,
    //         listStockDetailItem: action.payload,
    //       },
    //     };
    default:
      return baseReducer(state, action);
  }
};
