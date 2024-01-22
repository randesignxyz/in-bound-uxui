
import { DeliveryCost } from "@/services/del-expense/data";
import { BaseActionType, baseReducer, StateType } from "@/services/shared/model";
import { RequestData } from "@ant-design/pro-components";

export type ModalName = 'claimedByProvince' | 'dn-finder' | 'dn-claim-all' | 'changeLocationAddDNs'

export interface InitData {

}

export interface State extends StateType<ModalName> {
    data?: {
        deliveryNoteList?: RequestData<DeliveryCost> ;
        claimedList?: DeliveryCost[]
       
    };
    initData?: InitData;
}

export type Actions = BaseActionType<ModalName> |
{ type: 'initialData', payload?: InitData } | 
{ type: 'setDeliveryList', payload:  RequestData<DeliveryCost> } |
{ type: 'setClaimedList', payload: DeliveryCost[]} |
{ type: 'claimed', payload: number}


export const reducer = (state: State, action: Actions): State => {
    switch(action.type) {
        case 'initialData':
            return {...state}
        case 'setDeliveryList':
            return {...state, data: {...state.data, deliveryNoteList: action.payload}}
        case 'setClaimedList':
            return { ...state, data: {...state.data, claimedList: action.payload} }
        case 'claimed': 
        return {...state, data: {...state.data, deliveryNoteList: {...state.data?.deliveryNoteList, data: state.data?.deliveryNoteList?.data?.filter(item => item.docEntry !== action.payload) } }}
        default:
            return baseReducer(state, action)
    }
}