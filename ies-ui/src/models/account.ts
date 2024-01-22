import { AccountType, SearchAccount } from "@/services/account/data"
import { AccountServiceAPI } from "@/services/account/services"
import { BaseActionType, baseReducer, commmonActions, StateType } from "@/services/model"
import { useReducer } from "react"
import { WorkflowModalName } from "./process-flow/data"

export type AccountModalName = undefined

export type Action =
    BaseActionType<WorkflowModalName>
    | {type: 'setSearchAccount', payload: SearchAccount[]}
    
export interface State extends StateType<AccountModalName> {
    searchAccountList?: SearchAccount[]
}

const initState: State = {
}

export function reducer() {
    return (state: State, action: Action): State => {
        switch (action.type) {
            case 'setSearchAccount': return {
                ...state,
                searchAccountList: action.payload
            }
            default:
                return baseReducer(state, action);
        }
    }
}

export default () => {

    const [state, dispatch] = useReducer(reducer(), initState)
    const actions = commmonActions(dispatch, state)

    const  requestActions = actions.requestActions()

    const accountServices = AccountServiceAPI(requestActions)

    // const listUserOrGroupSrv = AccountServiceAPI.findUserOrGroupList(requestActions)

    const loadUserOrGroup = async (type: AccountType, searchValue?: string, approveOnly?: boolean) => {
        const rs = await accountServices.findUserOrGroupList({
            type: type,
            searchValue: searchValue,
            approveOnly: !!approveOnly
        })

        dispatch({type: 'setSearchAccount', payload: rs})
    }
    return {

        state: state,
        actions: {
            loadUserOrGroup: loadUserOrGroup
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        }
    }
}