import { Paging } from "@/services/API";
import { ContactDetail, ContactListItem } from "@/services/crm/contact";
import { LookupData } from "@/services/data";
import { BaseActionType, baseReducer, StateType } from "@/services/model";

export type ModalNameType =  'add-new' | 'search' | undefined

interface State extends StateType<ModalNameType> {
    itemList?: Paging<ContactListItem>,
    detail?: ContactDetail
    initData?: {
        lookupdataList?: LookupData[]
    }

}

export type Action = BaseActionType<ModalNameType>
    | { type: 'setListItem', payload?: Paging<ContactListItem> }
    | {type: 'setDetail', payload: ContactDetail}
    | { type: 'initData', payload: LookupData[] }

export const reducer = (state: State,  action: Action): State => {

    switch (action.type) {
        case 'setListItem':
            return { ...state, itemList: action.payload }
        case 'setDetail': 
            return {...state, detail: action.payload}
        case 'initData': 
            return {...state, initData: {...state.initData, lookupdataList: action.payload}}
        default:
            return baseReducer(state, action)
    }
}