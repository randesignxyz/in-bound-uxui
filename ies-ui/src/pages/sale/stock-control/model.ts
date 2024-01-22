import { CrmServiceAPI, InitCustomerParamsType, LocationType } from '@/services/crm/services';
import { commmonActions } from '@/services/model';
import {
  InitSaleInvoiceParam,
  LeadLess,
  SaleInvoiceLess,
  SettlementLess,
  TopupLess,
  UpdateStockControlDto,
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

  const initilizeData = async (stockControlId?: number) => {
    const initParams: InitCustomerParamsType[] = [
      // { actionName: 'sale', responseKey: 'seList', payload: {} },
      { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
    ];

    try {
      const result = await crmServices.initCustomerData(initParams);

      // const rsType = await saleServices.listStockCategory();
      // const typeProductItems = await saleServices.listTypeProductItems();

      let initSaleInvoiceParams: InitSaleInvoiceParam[] = [
        {
          actionName: 'look-up-data',
          responseKey: 'lookDataList',
          payload: {
            list: ['SALE_TYPE'],
          },
        },
        {
          actionName: 'list-stock-category',
          responseKey: 'types',
          payload: {},
        },
        {
          actionName: 'list-type-product-items',
          responseKey: 'typeProductItems',
          payload: {},
        },
        {
          actionName: 'list-sales-team-work',
          responseKey: 'salespersonList',
          payload: {},
        },
      ];
      // if (stockControlId) {
      //   initSaleInvoiceParams = initSaleInvoiceParams.concat({
      //     actionName: 'list-sale-invoices',
      //     responseKey: 'saleInvoiceList',
      //     payload: { id: stockControlId },
      //   });
      // }
      const rs = await saleServices.initSaleInvoiceData(initSaleInvoiceParams);

      dispatch({
        type: 'initialData',
        payload: { ...result, ...rs },
      });
    } catch (error) {
      return;
    }
  };

  const detail = async (id: number) => {
    try {
      const result = await saleServices.findStock({ id: id });
      dispatch({ type: 'detail', payload: result });
      const rs = await saleServices.listStockDetailItems({ id: id });
      dispatch({ type: 'listStockDetailItem', payload: rs });
    } catch (err) {
      return;
    }
  };

  const stockDetailWithType = async (stockControlId: number, typeId: number) => {
    try {
      const result = await saleServices.stockDetailItems({
        stockControlId: stockControlId,
        typeId: typeId,
      });
      dispatch({ type: 'stockDetailWithType', payload: result });
    } catch (err) {
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

  const loadTransaction = async (
    criteria?: { stockControlId: number; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await saleServices.listTransactions(
      { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const loadListItem = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await saleServices.listStock(
      { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const loadSaleInvoiceWithStockControl = async (
    criteria?: { stockControlId: number; searchValue?: string },
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

  const fetchInvoiceNo = async (): Promise<string> => {
    try {
      const result = await saleServices.fetchInvoiceNo();
      return Promise.resolve(result.refNo);
    } catch (err: any) {
      return Promise.reject(err.message);
    }
  };

  const searchLeadByPhone = async (phone: string) => {
    try {
      return await (
        await saleServices.searchLeadByPhone({ id: phone })
      ).items;
    } catch (err: any) {
      message.error(err);
      return [];
    }

    // return [];
  };

  const saveLead = async (item: LeadLess) => {
    try {
      return await saleServices.onSaveLead(item);
    } catch (err: any) {
      message.error(err.message);
      return;
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

  const updateStockControl = async (item: UpdateStockControlDto) => {
    try {
      return await saleServices.onUpdateStockControl(item);
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

  const clearLastStockControl = () => {
    dispatch({
      type: 'fetchLastStockControl',
      payload: [],
    });
    dispatch({
      type: 'isInitialManual',
      payload: { noneData: false },
    });
  };

  const saveSettlement = async (item: SettlementLess) => {
    try {
      return await saleServices.onSaveSettlement(item);
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  const searchVehicleByPlateNumber = async (plateNumber: string) => {
    try {
      return await saleServices.searchVehicleByPlateNumber({ id: plateNumber });
    } catch (err: any) {
      message.error(err);
      return [];
    }

    // return [];
  };

  const saveVehicle = async (item: VehicleLess) => {
    try {
      return await saleServices.onSaveVehicle(item);
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  const importSalesStock = async (id: string) => {
    try {
      return await saleServices.importSalesStockFile({ id: id }); //importSalesStockFile({ id: id });
    } catch (err: any) {
      message.error(err.message);
      return;
    }
  };

  const checkInitailManual = async (id: string) => {
    const result = await saleServices.isInitialManual({ id: id });
    dispatch({
      type: 'isInitialManual',
      payload: { noneData: result.noneData }, //result,
    });
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

  return {
    state: state,
    actions: {
      updateStockControl,
      initilizeData,
      loadListItem,
      loadTransaction,
      initializeStockControl,
      detail,
      stockDetailWithType,
      loadSaleInvoiceWithStockControl,
      fetchInvoiceNo,
      searchLeadByPhone,
      searchVehicleByPlateNumber,
      loadLocations,
      saveLead,
      saveSaleInvoice,
      saveSettlement,
      fetchLastStockControl,
      clearLastStockControl,
      saveVehicle,
      importSalesStock,
      checkInitailManual,
      createStockControl,
    },
    isLoading: actions.isLoading,
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
