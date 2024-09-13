import { commmonActions } from '@/services/model';
import type { InitSaleInvoiceParam } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { message } from 'antd';
import { useReducer } from 'react';
import type { State } from './reducer';
import { reducer } from './reducer';

export const Model = (id?: number) => {
  const initState: State = {
    loading: false,
    id: id,
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const saleServices = SaleServiceAPI(requestActions);

  const initialData = async (id?: number) => {
    try {
      const initSaleInvoiceParams: InitSaleInvoiceParam[] = [
        // {
        //   actionName: 'look-up-data',
        //   responseKey: 'salesType',
        //   payload: {
        //     list: ['SALE_TYPE'],
        //   },
        // },
        // {
        //   actionName: 'list-type-product-items',
        //   responseKey: 'typeProductItems',
        //   payload: {},
        // },
        // {
        //   actionName: 'list-stock-category',
        //   responseKey: 'types',
        //   payload: {},
        // },
        {
          actionName: 'list-sales-team-work',
          responseKey: 'salespersonList',
          payload: {},
        },
      ];

      const rs = await saleServices.initSaleInvoiceData(initSaleInvoiceParams);
      dispatch({
        type: 'initialData',
        payload: { ...rs },
      });
    } catch (e: any) {
      message.error(e.message);
    }
  };

  // const loadListItem = async (
  //   criteria?: { searchValue?: string },
  //   pagination?: {
  //     pageSize?: number;
  //     current?: number;
  //   },
  //   sort?: Record<string, SortOrder>,
  // ) => {
  //   return await saleServices.listSettlements(
  //     { ...criteria, sort: sort },
  //     //   { ...criteria, sort: sort },
  //     { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
  //   );
  // };

  const detail = async (id: number) => {
    try {
      const result = await saleServices.findSettlement({ id: id });
      dispatch({ type: 'detail', payload: result });
      // const rs = await saleServices.listStockDetailItems({ id: id });
      // dispatch({ type: 'listStockDetailItem', payload: rs });
    } catch (err) {
      return;
    }
  };

  return {
    state: state,
    actions: {
      initialData,
      // loadListItem,
      detail,
    },
    isLoading: actions.isLoading,
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
