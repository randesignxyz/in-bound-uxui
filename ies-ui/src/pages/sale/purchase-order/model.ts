import { CrmServiceAPI, InitCustomerParamsType } from '@/services/crm/services';
import { commmonActions } from '@/services/model';
import { InitSaleInvoiceParam, SaveRsmRequestMpu, TopupLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { message } from 'antd';
import { SortOrder } from 'antd/es/table/interface';
import { useReducer } from 'react';
import { State, reducer } from './reducer';

export const Model = (id?: number) => {
  const initState: State = {
    loading: false,
    id: id,
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const saleServices = SaleServiceAPI(requestActions);
  const crmServices = CrmServiceAPI(requestActions);

  const initData = async (id?: number) => {
    try {
      const initParams: InitCustomerParamsType[] = [
        { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
      ];
      let initSaleInvoiceParams: InitSaleInvoiceParam[] = [
        {
          actionName: 'look-up-data',
          responseKey: 'salesType',
          payload: {
            list: ['SALE_TYPE']
          }
        },
        {
          actionName: 'list-type-product-items',
          responseKey: 'typeProductItems',
          payload: {},
        },
        {
          actionName: 'list-stock-category',
          responseKey: 'types',
          payload: {},
        },
        {
          actionName: 'list-sales-team-work',
          responseKey: 'salespersonList',
          payload: {},
        },
      ];
      const result = await crmServices.initCustomerData(initParams);
      const rs = await saleServices.initSaleInvoiceData(initSaleInvoiceParams);
      dispatch({
        type: 'initialData',
        payload: { ...rs, ...result },
      });

      // if (id !== undefined) {
      //   const result = await saleServices.fetchStockStore({ id: id });
      //   dispatch({
      //     type: 'detailStockStore',
      //     payload: result,
      //   });
      //   const empNo = result.members?.find((it) => it.isRequester)?.salespersonCode;
      //   await fetchLastStockControl(empNo || '');
      // }
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const initializeStockControl = async (data: TopupLess) => {
    try {
      return await saleServices.initializeStockControl(data);
    } catch (err: any) {
      message.error(err.message);
      return;
    } 
  };


  const detailStockStore = async (id: number) => {
    const result = await saleServices.fetchStockStore({ id: id });
    dispatch({
      type: 'detailStockStore',
      payload: result
    })
  }

  const createStockControl = async (data: TopupLess) => {
    try {
      return await saleServices.createStockControl(data);
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };


  const fetchLastStockControl = async (salespersonCode: string) => {
    try {
      const result = await saleServices.fetchLastStockControl({ id: salespersonCode });
      dispatch({
        type: 'fetchLastStockControl',
        payload: result,
      });
    } catch (err: any) {
      dispatch({
        type: 'fetchLastStockControl',
        payload: [],
      });
      message.error(err.message);
    }
  };

  const listRsmRequest = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return saleServices.pageMpu(
      { searchValue: criteria ? criteria.searchValue || '' : '', sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const detail = async (id: number) => {
    try {
      const result = await saleServices.fetchMpu({ id: id });
      dispatch({
        type: 'detail',
        payload: result,
      });

      const rs = await saleServices.listMpuStockDetailItems({ id: id });
      dispatch({ 
        type: 'listMpuStockDetailItem', 
        payload: rs,
      });

    } catch (err) {
      return;
    }
  };

  const saveMpuStockRequest = (item: SaveRsmRequestMpu) => {
    return saleServices.saveMpuRequest(item);
  };

  const clearMember = async () => {
    dispatch({
      type: 'clearMember',
    });
  };

  const searchVehicleByPlateNumber = async (plateNumber: string) => {
    try {
      return await saleServices.searchVehicleByPlateNumber({ id: plateNumber });
    } catch (err: any) {
      message.error(err);
      return [];
    }
  };

  const searchSaleTeamworkByMpu = async (salespersonName: string) => {
    try {
      return await saleServices.searchSaleTeamworkByMpu({ searchValue: salespersonName });
    } catch (err: any) {
      message.error(err);
      return [];
    }
  };

  const searchDistributors = async (name: string) => {
    try {
      return await saleServices.searchDistributor({ searchValue: name });
    } catch (err: any) {
      message.error(err);
      return [];
    }
  }

  const listPosm = async (name: string) => {
    try {
      return await saleServices.fetchPosm({ searchValue: name });
    } catch (err: any) {
      message.error(err);
      return [];
    }
  }

  return {
    state: state,
    actions: {
      createStockControl,
      listRsmRequest,
      detail,
      saveMpuStockRequest,
      clearMember,
      searchVehicleByPlateNumber,
      searchSaleTeamworkByMpu,
      searchDistributors,
      initData,
      fetchLastStockControl,
      detailStockStore,
      initializeStockControl,
      listPosm
    },
    modals: {},
  };
};
