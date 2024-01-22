import { BaseActionType, baseReducer, StateType } from '@/services/model';
import { SalesTeamWorkLess, TeamWorkDto } from '@/services/sale/data';

export type ModalName = 'nothing' | 'advanceSearch';

export interface InitData {
  salespersonList?: SalesTeamWorkLess[];
}

export interface State extends StateType<ModalName> {
  data?: {
    initData?: InitData;
    detail?: TeamWorkDto;
    members?: SalesTeamWorkLess[];
  };
}

export type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'detail'; payload?: TeamWorkDto }
  | { type: 'addMember'; payload?: SalesTeamWorkLess[] }
  | { type: 'removeMember'; payload?: SalesTeamWorkLess };

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
    default:
      return baseReducer(state, action);
  }
};
