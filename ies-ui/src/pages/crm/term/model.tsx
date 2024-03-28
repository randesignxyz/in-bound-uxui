import { IProcessWorkflowModel } from "@/models/process-flow/data";
import { useReducer } from "react"
import { BaseActionType, baseReducer, commmonActions, StateType } from "@/services/model";
// import { CrmServiceAPI } from "@/services/crm/services";
export type ModalName = 'request'
export type TermType = 'DIRECT' | 'IN DIRECT' | 'OTHERS'

export type TermAdvanceSearchParams = {  
  status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
};


type Action =
    BaseActionType<ModalName>

interface State extends StateType<ModalName> {
  loading: boolean;
  // initialData?: InitData;
  // layoutConfig?: LayoutConfig;
  // data?: {
  //     contractTerm?: ContractTerm,
  //     detail?: ContractDetail,
  //     initialSponsor?: IntialSponsor
  // }
}
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    default:
      return baseReducer(state, action);

  }
}


export const Model = (worflowFlowModal?: IProcessWorkflowModel) => {
  const initState: State = {
    loading: false,
  }
  const [state, dispatch] = useReducer(reducer, initState)
  //Commons fun
  // const actions = commmonActions(dispatch, state)
  // const requestActions = actions.requestActions()
  // const crmServices =  CrmServiceAPI(requestActions)

  // const list = async (criteria?: { searchValue?: string }, pagination?: {
  //   pageSize?: number;
  //   current?: number;
  // }) => {
  //   return await crmServices.listContract(criteria, { page: (pagination?.current || 1) - 1, pageSize: pagination?.pageSize || 20 })
  // }

  return {
    state: state,
    actions: {
      // list: list,
    }
  }
}
