import { CustomerItemLess } from "@/services/crm/data";
import { LookupDataItem } from "@/services/data";
import { BaseActionType, baseReducer, StateType } from "@/services/model";
import { SoDeliveryMethod } from "@/services/sale/data";

export type ModalName = 'nothing' | 'advanceSearch'

export interface InitData {
    customers?: CustomerItemLess[],
    deliveryMethodList?: SoDeliveryMethod[];
    salespersons?: LookupDataItem[],
}


export type Action = BaseActionType<ModalName> 
| {
    type: 'initialData', payload?: InitData
}

//extends StateType<ModalName>
export interface State extends StateType<ModalName> {
    data?: {
        initData?: InitData;
    }
}



export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "initialData": 
            return {
                ...state,
                data: {
                    ...state.data,
                    initData: action.payload
                }
            }
        default:
            return baseReducer(state, action)

    }

}