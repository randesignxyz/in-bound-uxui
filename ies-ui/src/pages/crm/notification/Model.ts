import { NotificationLess, SaveNotification } from '@/services/crm/data';
import { CrmServiceAPI, InitCustomerParamsType } from '@/services/crm/services';
import { LookupDataItem } from '@/services/data';
import {
  BaseActionType,
  baseReducer,
  commmonActions,
  ModalController,
  StateType,
} from '@/services/model';
import { SortOrder } from 'antd/lib/table/interface';
import { useReducer } from 'react';

export type ModalName = 'quick_view' | undefined;

interface State extends StateType<ModalName> {
  initData?: InitData;
  data?: {
    detail?: NotificationLess;
    notifications?: NotificationLess[];
    // message?: string;
  };
}

export interface InitData {
  seList?: LookupDataItem[];
}

type Action =
  | BaseActionType<ModalName>
  | { type: 'initialData'; payload?: InitData }
  | { type: 'detail'; payload: { detail: NotificationLess } }
  | { type: 'list'; payload: { notifications: NotificationLess[] } };
// | { type: 'sent'; payload: { data: string; message: string } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'initialData':
      return { ...state, initData: { ...state.initData, ...action.payload } };
    case 'detail':
      return { ...state, data: { ...state.data, detail: action.payload.detail } };
    case 'list':
      return { ...state, data: { ...state.data, notifications: action.payload.notifications } };
    // case 'sent':
    //   return { ...state, data: { ...state.data, message: action.payload.data } };
    default:
      return baseReducer(state, action);
  }
};

export const Model = () => {
  const initState: State = {
    loading: false,
  };
  const [state, dispatch] = useReducer(reducer, initState);
  //Commons fun
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const crmServices = CrmServiceAPI(requestActions);

  //   const canAccess = (access: AccessList) => {
  //     switch (access) {
  //       case 'SHOW-ACTION-MENU':
  //         //return state.data?.detail?.status !== 'CANCELED' && state.data?.detail?.status !== 'COMPLETED'
  //         return state.data?.detail?.status == 'PENDING';
  //       default:
  //         return false;
  //     }
  //   };

  const initData = async () => {
    try {
      const params: InitCustomerParamsType[] = [
        { actionName: 'sale', responseKey: 'seList', payload: {} },
      ];
      const rs = await crmServices.initCustomerData(params);
      dispatch({ type: 'initialData', payload: rs });
      return rs;
    } catch (error) {
      return;
    }
  };

  const sentNotification = async (id: number) => {
    const rs = await crmServices.sendNotificationWithId({ id: id });
    return rs;
    // dispatch({
    //   type: 'sent',
    //   payload: {
    //     message: rs.data,
    //     data: rs.data,
    //   },
    // });
  };

  const detail = async (id: number) => {
    const rs = await crmServices.detailNotification({ id: id });

    dispatch({
      type: 'detail',
      payload: {
        detail: { ...rs },
      },
    });
  };

  //   const list = async function name(searchValue?: string) {
  //     const rs = await crmServices.findAllNotifications({ searchValue: searchValue });
  //     dispatch({
  //       type: 'list',
  //       payload: {
  //         notifications: { ...rs },
  //       },
  //     });
  //   };

  const save = async (param: SaveNotification) => {
    return await crmServices.saveNotification(param);
  };

  const list = async (
    searchValue?: string,
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await crmServices.findAllNotifications(
      { searchValue: searchValue, sort: sort },
      { page: (pagination?.current || 1) - 1, pageSize: pagination?.pageSize || 20 },
    );
  };

  return {
    state: state,
    actions: {
      initData,
      detail,
      list,
      save,
      sentNotification,
    },
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    } as ModalController<ModalName>,

    //canAccess: canAccess,
  };
};
