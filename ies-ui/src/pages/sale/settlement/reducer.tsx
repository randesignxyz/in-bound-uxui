import { BaseActionType, baseReducer, StateType } from '@/services/model';
import { SalesTeamWorkLess, SettlementLess } from '@/services/sale/data';

export type ModalName = 'nothing';

export interface State extends StateType<ModalName> {
  initData?: InitData;
  data?: {
    detail: SettlementLess;
  };
}

export interface InitData {
  salespersonList?: SalesTeamWorkLess[];
}

export type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'detail'; payload: SettlementLess };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'initialData':
      return {
        ...state,
        initData: action.payload,
      };
    case 'detail':
      return {
        ...state,
        data: {
          ...state.data,
          detail: action.payload,
        },
      };
    default:
      return baseReducer(state, action);
  }
};
