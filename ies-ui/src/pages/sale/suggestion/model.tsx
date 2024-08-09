import { commmonActions } from '@/services/model';
import type {
  ApprovalStockControlDto,
  CountStockDto,
  SettlementModel,
  StockControlLess,
  StockStoreAdvanceSearchParams,
} from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { message } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { useReducer } from 'react';
import type { State } from './reducer';
import { reducer } from './reducer';
import { StatusActionForm } from '../mpu/settlement/data';

export const Model = (id?: number) => {
  const initState: State = {
    loading: false,
    id: id,
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const saleServices = SaleServiceAPI(requestActions);
  //const crmServices = CrmServiceAPI(requestActions);

  const initData = async () => {
    // const params: InitSuggestionParam[] = [
    //   {
    //     actionName: 'exchange-rate',
    //     payload: {},
    //     responseKey: 'exchangeRate',
    //   },
    //   {
    //     actionName: 'exchange-rate-dsd',
    //     payload: {},
    //     responseKey: 'dsdExchangeRate',
    //   },
    // ];
    // await saleServices.initSuggestionData(params);

    const result = await Promise.all([
      // saleServices.findDSDExchangeRate({}),
      // saleServices.findExchangeRate({}),
    ]);

    // dispatch({
    //   type: 'dsdExchangeRage',
    //   payload: result[0],
    // });
    // dispatch({
    //   type: 'exchangeRate',
    //   payload: result[1],
    // });

    // const rs1 = await saleServices.findDSDExchangeRate({});
    // dispatch({
    //   type: 'dsdExchangeRage',
    //   payload: rs1,
    // });
    // const rs = await saleServices.findExchangeRate({});
    // dispatch({
    //   type: 'exchangeRate',
    //   payload: rs,
    // });
  };

  const loadListItem = async (
    criteria: {
      role: string;
      searchValue?: string;
      advanceSearch?: StockStoreAdvanceSearchParams;
    },

    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await saleServices.listSuggestionStock(
      { ...criteria, sort: sort },
      //   { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const acceptRequest = async (item: StockControlLess) => {
    try {
      const rs = await saleServices.onAcceptStockRequest({ id: item.id });
      message.info(rs.message);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const reject = async (param:StatusActionForm) => {
    try {
      const rs = await saleServices.onRejectStockRequest(param);
      message.info(rs.message);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const approvalRequest = async (item: ApprovalStockControlDto) => {
    try {
      const rs = await saleServices.onApprovalStockRequest(item);
      message.info(rs.message);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const onSettledRequest = async (id: number) => {
    try {
      const rs = await saleServices.onSettleStockRequest({ id: id });
      message.info(rs.message);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const onClosedRequest = async (id: number) => {
    try {
      const rs = await saleServices.onClosedStockRequest({ id: id });
      message.info(rs.message);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const countStock = async (item: CountStockDto) => {
    try {
      const rs = await saleServices.countStock(item);
      message.info(rs.message);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const onSaveSettlementModel = async (item: SettlementModel) => {
    try {
      const rs = await saleServices.onSaveSettlementModel(item);
      message.info(rs.message);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return {
    state: state,
    actions: {
      loadListItem,
      acceptRequest,
      approvalRequest,
      reject,
      countStock,
      initData,
      onSaveSettlementModel,
      onSettledRequest,
      onClosedRequest,
    },
    isLoading: actions.isLoading,
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
