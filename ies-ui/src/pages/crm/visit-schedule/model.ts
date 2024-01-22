
import { CustomerItemLess, VisitScheduleDetail, VisitScheduleItem, } from "@/services/crm/data";
import { CrmServiceAPI, InitVisitScheduleParamsType } from "@/services/crm/services";
import { LookupDataItem } from "@/services/data";
import { BaseActionType, baseReducer, commmonActions, ModalController, StateType } from "@/services/model";
import { SoItemLess } from "@/services/sale/data";
import { SaleServiceAPI } from "@/services/sale/services";

import { message } from "antd";
import { SortOrder } from "antd/lib/table/interface";
import moment from "moment";
import { useReducer } from "react";

export type ModalName = 'changeStatus' | 'advanceSearch' | 'calender-view' | 'generate-schedule' | 'quick-view' |undefined

export type AccessList = 'SHOW-ACTION-MENU'

export interface InitData {
    seList?: LookupDataItem[];
    customerList?: CustomerItemLess[];
}

interface State extends StateType<ModalName> {
    initData?: InitData,
    data?: {
        detail?: VisitScheduleDetail;
        scheduleList?: VisitScheduleItem[];
        orderList?: SoItemLess[];
    }
}

type Action =
    BaseActionType<ModalName>
    | { type: 'initialData', payload: InitData }
    | { type: 'setDetail', payload: { detail: VisitScheduleDetail, orderList: SoItemLess[] } }
    | { type: 'setList', payload: VisitScheduleItem[] }

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'initialData': return { ...state, initData: action.payload }
        case 'setDetail': return { ...state, data: { ...state.data, detail: action.payload.detail, orderList: action.payload.orderList } }
        case 'setList': return { ...state, data: { ...state, scheduleList: action.payload } }
        default:
            return baseReducer(state, action);
    }
}

export const Model = () => {

    const initState: State = {
        loading: false,
    }

    const [state, dispatch] = useReducer(reducer, initState)

    //Commons fun
    const actions = commmonActions(dispatch, state)
    const requestActions = actions.requestActions()
    const crmServices = CrmServiceAPI(requestActions)
    const saleServices = SaleServiceAPI(requestActions)

    const loadListItem = async (criteria?: { searchValue?: string }, pagination?: {
        pageSize?: number;
        current?: number;
    }, sort?: Record<string, SortOrder>) => {

        return await crmServices.listVisitSchedule({ ...criteria, sort: sort }, {
            page: (pagination?.current || 1) - 1,
            pageSize: pagination?.pageSize || 20
        })
    }

    /****Moethods */
    const detail = async (id: number) => {
        const rs = await crmServices.getVisitSchedule({ id: id })
        const soList = (rs.visit?.id && (rs.visit?.id || 0) > 0) ? await saleServices.listSoByVisitId(rs.visit?.id) : []
        const items = await saleServices.getItemByIdList({ ids: rs.stockCountList.map(it => it.itemId) })

        dispatch({
            type: 'setDetail', payload: {
                detail: {
                    ...rs,

                    stockCountList: rs.stockCountList.map(it => {
                        return {
                            ...it,
                            item: items.find(i => i.id == it.itemId)
                        }
                    }),
                },
                orderList: soList

            }
        })
    }

    const cancelSchedule = async (id: number, remarks: string) => {
        await crmServices.cancelVisitSchedule({ id: id, remarks: remarks })
    }

    const canAccess = (access: AccessList) => {

        switch (access) {
            case 'SHOW-ACTION-MENU':
                //return state.data?.detail?.status !== 'CANCELED' && state.data?.detail?.status !== 'COMPLETED'
                return state.data?.detail?.status == 'PENDING'
            default:
                return false
        }
    }

    const loadByDate = async (date: moment.Moment) => {
        try {
            const rs = await crmServices.listVisitScheduleByDate({ date: date })
            dispatch({ type: 'setList', payload: rs })
        } catch (error: any) {
            message.error(error.message || "Failed to load data.")
        }

    }

    const initializationData = async () => {
        try {
            const params: InitVisitScheduleParamsType[] = [
                // { actionName: 'listCustomer', responseKey: 'customerList', payload: {} },
                { actionName: 'sale', responseKey: 'seList', payload: {} },
            ]
            const rs = await crmServices.initVisitScheduleData(params)
            dispatch({ type: 'initialData', payload: rs })
        } catch (error) {
            return
        }
    }

    const createSchedule = async (
        monthCreated: moment.Moment,
        effectiveDate?: moment.Moment,
        salespersonId?: number,
        overwritePending?: boolean,
        description?: string
    ) => {
        
        return await crmServices.createVisitSchedule({ 
            monthCreated: monthCreated, 
            effectiveDate: effectiveDate,
            salespersonId: salespersonId,
            overwritePending : overwritePending,
            description: description 
        })
    }

    return {
        state: state,
        actions: {
            initialData: initializationData,
            loadByDate,
            loadListItem,
            detail,
            cancelSchedule,
            createSchedule,
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        } as ModalController<ModalName>,

        canAccess: canAccess
    }
}