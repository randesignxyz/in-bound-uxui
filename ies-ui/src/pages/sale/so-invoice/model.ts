import { CrmServiceAPI, InitCustomerParamsType } from '@/services/crm/services';
import { commmonActions } from '@/services/model';
import { SaleServiceAPI } from '@/services/sale/services';
import { message } from 'antd';
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
  const crmServices = CrmServiceAPI(requestActions);
  const saleServices = SaleServiceAPI(requestActions);

  const loadSaleInvoice = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await saleServices.listSaleInvoice(
      { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const initilizeData = async () => {
    const initParams: InitCustomerParamsType[] = [
      { actionName: 'sale', responseKey: 'seList', payload: {} },
    ];

    try {
      const result = await crmServices.initCustomerData(initParams);

      // const rsType = await saleServices.listStockCategory();
      // const typeProductItems = await saleServices.listTypeProductItems();
      // types: rsType, typeProductItems: typeProductItems
      dispatch({
        type: 'initialData',
        payload: { ...result },
      });
    } catch (error) {
      return;
    }
  };

  const loadProductItems = async (empId: number) => {
    try {
      const result = await saleServices.loadProductItemBySE(empId);
      dispatch({
        type: 'loadItems',
        payload: result,
      });
    } catch (error: any) {
      message.error(error.message);
    }
  };

  return {
    state: state,
    actions: {
      loadSaleInvoice,
      initilizeData,
      loadProductItems,
    },
    isLoading: actions.isLoading,
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
