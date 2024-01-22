import { commmonActions } from '@/services/model';
import { SaleServiceAPI } from '@/services/sale/services';
import { SortOrder } from 'antd/lib/table/interface';
import { useReducer } from 'react';
import { reducer, State } from './reducer';

export const Model = (id?: number) => {
  const initState: State = {
    loading: false,
    id: id,
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const saleServices = SaleServiceAPI(requestActions);

  const listLead = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await saleServices.pageLead(
      { id: criteria ? criteria.searchValue || '' : '', sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  return {
    state: state,
    actions: {
      listLead,
    },
    modals: {},
  };
};
