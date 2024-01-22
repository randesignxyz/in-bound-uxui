import { BaseActionType, baseReducer, StateType } from '@/services/model';

export type ModalName = 'nothing' | 'advanceSearch';

export interface State extends StateType<ModalName> {
  data?: {
    //leads?: LeadInfo[];
  };
}

export type Action = BaseActionType<ModalName>;
// | { type: 'listLead'; payload?: LeadInfo[] };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    // case 'listLead':
    //   return {
    //     ...state,
    //     data: {
    //       ...state.data,
    //       leads: action.payload,
    //     },
    //   };
    default:
      return baseReducer(state, action);
  }
};
