import { Pagination } from '@/services/API';
import { ContactData } from '@/services/crm/contact';
import { CrmServiceAPI } from '@/services/crm/services';
import { commmonActions, StateType } from '@/services/model';
import { useReducer } from 'react';
import { ModalNameType, reducer } from './reducer';

export const Model = () => {
  const initState: StateType<ModalNameType> = {};

  const [state, dispatch] = useReducer(reducer, initState);
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const crmServices = CrmServiceAPI(requestActions);

  const list = async (searchValue?: string, pagination?: Pagination) => {
    const rs = await crmServices.listContact(searchValue, pagination);
    dispatch({ type: 'setListItem', payload: rs });
  };

  const save = async (params: ContactData) => {
    await crmServices.saveContact(params);
  };

  const loadDetail = async (id: number) => {
    const rs = await crmServices.fetchContact(id);
    dispatch({ type: 'setDetail', payload: rs });
  };
  const fetch = async (id: number) => {
    return await crmServices.fetchContact(id);
  }

  const assignToCustomer = async (id: number, customerId: number) => {
    await crmServices.assignContactToCustomer({ id: id, customerId: customerId });
  };
  const unassignToCustomer = async (id: number, customerId: number) => {
    await crmServices.unassignContactToCustomer({ id: id, customerId: customerId });
  };
  const newAndAssignToCustomer = async (data: ContactData, customerId: number) => {
    await crmServices.newContactAndAssignToCustomer({ contact: data, customerId: customerId });
  };

  const initData = async () => {
    if (state.initData?.lookupdataList !== null) return;

    const rs = await crmServices.listLookupData(['GENDER']);
    dispatch({ type: 'initData', payload: rs });
  };

  return {
    state: state,
    actions: {
      initData: initData,
      laodDetail: loadDetail,
      fetch: fetch,
      list: list,
      save: save,
      assignToCustomer: assignToCustomer,
      unassignToCustomer: unassignToCustomer,
      newAndAssignToCustomer: newAndAssignToCustomer,
    },
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
