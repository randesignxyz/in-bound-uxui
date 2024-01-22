
import { useReducer, useState } from "react"
import { ModalName, reducer, State } from "./reducer"
import { commmonActions } from "@/services/shared/model";

import { Pagination } from "@/services/shared/data";
import { RequestData } from "@ant-design/pro-table";
import { DeliveryServiceAPI } from "@/services/del-expense/deliveryServices";
import { DeliveryCost, SaveInvoiceItem, domain } from "@/services/del-expense/data";

export const DeliveryModel = () => {

    const initState: State = {

    }

    const [state, dispatch] = useReducer(reducer, initState)
    const [params, setParams] = useState();

    /*******************Services******************************/

    const actions = commmonActions(dispatch, state)
    const findDeliveryNotes = DeliveryServiceAPI.findDeliveryNotes(actions.requestActions())
    const claimDeliveryNote = DeliveryServiceAPI.deliveryClaimed(actions.requestActions())
    const claimMultiDelivery = DeliveryServiceAPI.deliveryMultiClaimed(actions.requestActions())
    const deliveryClaimedAll = DeliveryServiceAPI.deliveryClaimedAll(actions.requestActions())
    const getClaimed = DeliveryServiceAPI.getClaimed(actions.requestActions());


    /*******************Actions /Methods**********************/

    const showModal = async (modalName: ModalName) => {
        // if(modalName == 'claimedByProvince') {
        //     const rs = (await getClaimed(params)).data
        //     if(!rs) return 
        //     dispatch({type: 'setClaimedList', payload: rs})
        // }
        actions.showModalAction(modalName)
    }

    const doFindDeliveryNotes = async (params: any, isRemote: boolean, pagination?: Pagination) => {
        
        if (!isRemote) {
        return state.data?.deliveryNoteList || { data: [] }
        }
        setParams(params);
        const rs = await findDeliveryNotes(params, pagination);
        const payload: RequestData< DeliveryCost> = { ...rs }
        dispatch({ type: 'setDeliveryList', payload: payload })
        return payload as any
    }

    const doClaimed = async (invoiceId: number, data: SaveInvoiceItem) => {
        await claimDeliveryNote(invoiceId, data)
        dispatch({type: 'claimed', payload: data.docEntry})
        
    }

    const doSomeClaimed = async (invoiceId: number, data: number[]) => {
        await claimMultiDelivery(invoiceId, data)
        
    }

    const doClaimAll = async(invoiceId: number) => {
        if((state.data?.claimedList || []).length ==0) {
            throw Error("Not DN found for claim process")
        }
        await deliveryClaimedAll(invoiceId, state.data?.claimedList?.map(it => it.docEntry) || [])
    }
    return {
        state: state,
        actions: {
            findDeliveryNotes: doFindDeliveryNotes,
            claimed: doClaimed,
            multiClaimed: doSomeClaimed,
            claimAll: doClaimAll
        },

        modals: {
            isVisible: actions.isVisible,
            showModal: showModal,
            hideModal: actions.hideModalAction
        }
    }


}

function Paging<T>() {
    throw new Error("Function not implemented.");
}
