import type { BaseActionType, StateType } from '@/services/model';
import { baseReducer } from '@/services/model';
import type { ExchangeRate } from '@/services/sale/data';

export type ModalName = 'nothing';

export interface InitData {
  exchangeRate?: ExchangeRate;
  dsdExchangeRate?: ExchangeRate;
}

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    exchangeRate?: ExchangeRate;
    dsdExchangeRate?: ExchangeRate;
  };
}
export type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'exchangeRate'; payload?: ExchangeRate }
  | { type: 'dsdExchangeRage'; payload?: ExchangeRate };
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
        },
      };
    case 'dsdExchangeRage':
      return {
        ...state,
        data: {
          ...state.data,
          exchangeRate: action.payload,
        },
      };
    case 'exchangeRate':
      return {
        ...state,
        data: {
          ...state.data,
          exchangeRate: action.payload,
        },
      };
    default:
      return baseReducer(state, action);
  }
};
