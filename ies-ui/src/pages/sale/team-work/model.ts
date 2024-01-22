import { CrmServiceAPI } from '@/services/crm/services';
import { commmonActions } from '@/services/model';
import {
  InitSaleInvoiceParam,
  SalesTeamWorkLess,
  SaveTeamWork,
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

  const loadListItem = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    try {
      return await saleServices.listSaleTeamWork(
        { ...criteria, sort: sort },
        { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
      );
    } catch (e: any) {
      message.error(e.message);
      return;
    }
  };

  const initData = async (id?: number) => {
    try {
      let initSaleInvoiceParams: InitSaleInvoiceParam[] = [
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

      if (id !== undefined) {
        const result = await saleServices.detailTeamWork({ id });
        dispatch({
          type: 'detail',
          payload: { ...result },
        });
        dispatch({
          type: 'addMember',
          payload: result.members,
        });
      } else {
        dispatch({
          type: 'addMember',
          payload: [],
        });
      }
    } catch (e: any) {
      message.error(e.message);
      return;
    }
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

  const saveTeamWork = async (item: SaveTeamWork) => {
    try {
      return await saleServices.saveTeamwork(item);
    } catch (e: any) {
      message.error(e.message);
      return;
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

  const searchVehicleByPlateNumber = async (plateNumber: string) => {
    try {
      return await saleServices.searchVehicleByPlateNumber({ id: plateNumber });
    } catch (err: any) {
      message.error(err);
      return [];
    }

    // return [];
  };

  return {
    state: state,
    actions: {
      initData,
      loadListItem,
      saveTeamWork,
      searchVehicleByPlateNumber,
      saveVehicle,
      addMember,
      removeMember,
    },
    isLoading: actions.isLoading,
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
