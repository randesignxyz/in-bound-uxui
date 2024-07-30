import { CrmServiceAPI, InitCustomerParamsType, LocationType } from '@/services/crm/services';
import { commmonActions } from '@/services/model';
import {
  InitSaleInvoiceParam,
  SaleInvoiceLess,
  SalesTeamWorkLess,
  SaveStockStore,
  SettlementLess,
  TopupLess,
  VehicleLess,
} from '@/services/sale/data';
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
  const saleServices = SaleServiceAPI(requestActions);
  const crmServices = CrmServiceAPI(requestActions);

  const initData = async (id?: number, stockControlId?: number) => {
    try {
      const initParams: InitCustomerParamsType[] = [
        // { actionName: 'sale', responseKey: 'seList', payload: {} },
        { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
      ];
      //   const rs = await saleServices.listTeamWork();
      //   dispatch({
      //     type: 'listTeamWork',
      //     payload: rs,
      //   });
      let initSaleInvoiceParams: InitSaleInvoiceParam[] = [
        // {
        //   actionName: 'look-up-data',
        //   responseKey: 'salesType',
        //   payload: {
        //     list: ['SALE_TYPE'],
        //   },
        // },
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

      if (id !== undefined) {
        const result = await saleServices.fetchStockStore({ id: id });
        dispatch({
          type: 'detail',
          payload: result,
        });
        dispatch({
          type: 'addMember',
          payload: result.members,
        });
        const empNo = result.members?.find((it) => it.isRequester)?.salespersonCode;
        await fetchLastStockControl(empNo || '');
      } else {
        dispatch({
          type: 'addMember',
          payload: [],
        });
      }
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const detail = async (id: number) => {
    const result = await saleServices.fetchStockStore({ id: id });
    dispatch({
      type: 'detail',
      payload: result,
    });
  };

  const saveData = async (item: SaveStockStore) => {
    // try {
    return await saleServices.saveStockStore(item);
    // } catch (e: any) {
    //   message.error(e.message);
    //   return;
    // }
  };

  const loadListItem = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await saleServices.pageStockStore(
      { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const addMember = async (item: SalesTeamWorkLess) => {
    dispatch({
      type: 'addMember',
      payload: state.data?.members?.concat(item),
    });
  };

  const removeMember = async (item: SalesTeamWorkLess) => {
    dispatch({
      type: 'removeMember',
      payload: item,
    });
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

  const pageVehicleByPlateNumber = async (plateNumber: string) => {
    try {
      return await saleServices.pageVehicleByPlateNumber({ id: plateNumber });
    } catch (err: any) {
      message.error(err);
      return [];
    }
  };
  const saveVehicle = async (item: VehicleLess) => {
    try {
      return await saleServices.onSaveVehicle(item);
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  const history = async (
    id: number,
    pagination?: {
      pageSize?: number;
      current?: number;
    },
  ) => {
    try {
      return saleServices.pageHistory(
        { id: id },
        { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
      );
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  const loadSaleInvoiceWithSalesperson = async (
    criteria?: { stockStoreId: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    try {
      return saleServices.listSaleInvoiceWithSalesperson(
        { ...criteria, sort: sort },
        {
          pageSize: pagination?.pageSize || 20,
          page: (pagination?.current || 1) - 1,
        },
      );
    } catch (err: any) {
      message.error(err.message);
      return;
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
      // const result = await saleServices.fetchLastStockControl({ id: salespersonCode });
      dispatch({
        type: 'fetchLastStockControl',
        // payload: result,
      });
    } catch (err: any) {
      dispatch({
        type: 'fetchLastStockControl',
        payload: [],
      });
      message.error(err.message);
    }
  };

  const loadLocations = async (type: LocationType, parentId?: number, loadOnly?: boolean) => {
    if (type === 'PROVINCE') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setProvinces', payload: rs });
      !loadOnly && dispatch({ type: 'setDistricts', payload: undefined });
      !loadOnly && dispatch({ type: 'setCommunes', payload: undefined });
      !loadOnly && dispatch({ type: 'setVillages', payload: undefined });
    } else if (type === 'DISTRICT') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setDistricts', payload: rs });
      !loadOnly && dispatch({ type: 'setCommunes', payload: undefined });
      !loadOnly && dispatch({ type: 'setVillages', payload: undefined });
    } else if (type === 'COMMUNE') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setCommunes', payload: rs });
      !loadOnly && dispatch({ type: 'setVillages', payload: undefined });
    } else if (type === 'VILLAGE') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setVillages', payload: rs });
    }
  };

  const saveSaleInvoice = async (item: SaleInvoiceLess) => {
    try {
      return await saleServices.onSaveSaleInvoice(item);
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  const loadSaleInvoiceWithStockControl = async (
    criteria?: { stockControlId?: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    const result = await saleServices.listSaleInvoiceWithStockControl(
      { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );

    dispatch({
      type: 'manualListSaleInvoice',
      payload: result.items,
    });
    return result;
  };

  const saveSettlement = async (item: SettlementLess) => {
    try {
      return await saleServices.onSaveSettlement(item);
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  return {
    state: state,
    actions: {
      createStockControl,
      initData,
      loadListItem,
      saveData,
      removeMember,
      clearMember,
      addMember,
      searchVehicleByPlateNumber,
      pageVehicleByPlateNumber,
      saveVehicle,
      history,
      loadSaleInvoiceWithSalesperson,
      loadLocations,
      saveSaleInvoice,
      detail,
      loadSaleInvoiceWithStockControl,
      saveSettlement,
      initializeStockControl,
    },
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
