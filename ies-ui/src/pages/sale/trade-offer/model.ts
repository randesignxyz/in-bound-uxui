import { commmonActions } from "@/services/model";
import { SaleServiceAPI } from "@/services/sale/services";
import { useReducer } from "react";
import { reducer, State } from "./reducer";



export const Model = () => {
    const initState: State = {}
    const [state, dispatch] = useReducer(reducer, initState)

    /***************Services************* */
    const actions = commmonActions(dispatch, state)
    const requestActions = actions.requestActions()
    const saleServices = SaleServiceAPI(requestActions)
    // const crmServices = CrmServiceAPI(requestActions)

    const listPackages = async (criteria?: { searchValue?: string }, pagination?: {
        pageSize?: number;
        current?: number;
    }) => {
        return await saleServices.listPackages(criteria, { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 })
    }

    const doInitData = async () => {

        // try {
        //     const params : InitVisitScheduleParamsType[] = [
        //         { actionName: 'listCustomer', responseKey: 'customers', payload: {} },
        //         { actionName: 'sale', responseKey: 'salespersons', payload: {} },
        //     ]

        //     const initParams: InitSoParamsType[] = [
        //         {
        //             actionName: 'list-shipping-method',
        //             responseKey: 'deliveryMethodList',
        //             payload: {}
        //         }
        //     ]

        //     const crm = await crmServices.initVisitScheduleData(params)
        //     const sale = await saleServices.initSoData({...initParams})
        //     dispatch({ type: 'initialData', payload: {...crm, ...sale} })
        // } catch (error) {
        //     return 
        // }

    }

    return {
        state: state,
        actions: {
            listPackages,
            // initData: doInitData
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        }
    }

}