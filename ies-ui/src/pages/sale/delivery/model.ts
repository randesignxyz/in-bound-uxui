
import { CrmServiceAPI, InitVisitScheduleParamsType } from "@/services/crm/services";
import { commmonActions } from "@/services/model";
import { InitSoParamsType } from "@/services/sale/data";
import { SaleServiceAPI } from "@/services/sale/services";
import { SortOrder } from "antd/lib/table/interface";
import { useReducer } from "react";
import { State, reducer } from "./reducer";

export const Model = () => {
    const initState: State = {}
    const [state, dispatch] = useReducer(reducer, initState)

    /***************Services************* */
    const actions = commmonActions(dispatch, state)
    const requestActions = actions.requestActions()
    const saleServices = SaleServiceAPI(requestActions)
    const crmServices = CrmServiceAPI(requestActions)

    const listSoDeliveries = async (
        criteria?: { searchValue?: string }, pagination?: {
            pageSize?: number;
            current?: number;
        },
        sort?: Record<string, SortOrder>
    ) => {
        return await saleServices.listSoDelivery({ ...criteria, sort: sort }, { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 })
    }

    const doInitData = async () => {

        try {
            const params: InitVisitScheduleParamsType[] = [
                { actionName: 'listCustomer', responseKey: 'customers', payload: {} },
                { actionName: 'sale', responseKey: 'salespersons', payload: {} },
            ]

            const initParams: InitSoParamsType[] = [
                {
                    actionName: 'list-shipping-method',
                    responseKey: 'deliveryMethodList',
                    payload: {}
                }
            ]

            const crm = await crmServices.initVisitScheduleData(params)
            const sale = await saleServices.initSoData({ ...initParams })
            dispatch({ type: 'initialData', payload: { ...crm, ...sale } })
        } catch (error) {
            return
        }

    }

    return {
        state: state,
        actions: {
            listSoDeliveries,
            initData: doInitData
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        }
    }

}