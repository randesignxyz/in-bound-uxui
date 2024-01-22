import { Locations, UploadedVisitPlan, UploadVisitPlanResponse, VisitPlanListItem } from "@/services/crm/data";
import { CrmServiceAPI, InitCustomerParamsType } from "@/services/crm/services";
import { LookupData, LookupDataItem } from "@/services/data";
import { BaseActionType, baseReducer, commmonActions, StateType } from "@/services/model";
import { message } from "antd";
import { SortOrder } from "antd/lib/table/interface";
import { useReducer } from "react";

export type ModalName = 'attachments'
    | 'visitPlan'
    | 'generateSchedule'
    | 'advanceSearch'
    | 'delete-visi-plan'
    | 'export-visit-plan'
    | undefined

export interface InitData {
    seList?: LookupDataItem[];
    lookupDataList?: LookupData[];
    // outletTypeList?: outletType[];
    provinceList?: Locations[];
    regionList?: Locations[]
}

interface State extends StateType<ModalName> {
    initData?: InitData,
    data?: {
        selectedItem?: VisitPlanListItem,
        uploadedVisitPlan?: UploadedVisitPlan[],
    },
    uploadVisitPlanResponse?: UploadVisitPlanResponse,
    filter?: {
        customer?: { label: string, value: string }[],
        salesperson?: { label: string, value: string }[]
    }
}

type Action =
    BaseActionType<ModalName>
    | { type: 'initialData', payload: InitData }
    | { type: 'setSelectedItem', payload?: VisitPlanListItem }
    | { type: 'initialModal', payload: UploadVisitPlanResponse }
    | { type: 'setDatasourceModal', payload: UploadedVisitPlan[] }
    | { type: 'setCustomerFilter', payload: { label: string, value: string }[] }
    | { type: 'setSalespersonFilter', payload: { label: string, value: string }[] }

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'initialData': return { ...state, initData: { ...state?.initData, ...action.payload } }
        case 'setSelectedItem': return { ...state, data: { ...state?.data, selectedItem: action.payload } }
        case 'initialModal':
            return { ...state, uploadVisitPlanResponse: { ...state?.uploadVisitPlanResponse, ...action.payload } }
        case 'setDatasourceModal':
            return { ...state, data: { ...state?.data, uploadedVisitPlan: action.payload } }

        case 'setCustomerFilter':
            return { ...state, filter: { ...state.filter, customer: action.payload } }

        case 'setSalespersonFilter':
            return { ...state, filter: { ...state.filter, salesperson: action.payload } }
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

    const loadListItem = async (criteria?: { searchValue?: string }, pagination?: {
        pageSize?: number;
        current?: number;
    }, sort?: Record<string, SortOrder>) => {
        return await crmServices.listVisitPlan({ ...criteria, sort: sort }, { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 })
    }

    const showAddVisitPlanModal = async () => {
        dispatch({ type: 'setSelectedItem', payload: undefined })
        actions.showModalAction('visitPlan')
    }

    const showVisitPlanModal = async (data: VisitPlanListItem) => {
        const rs = await crmServices.getVisitPlanItem({ id: data.id })
        dispatch({ type: 'setSelectedItem', payload: rs })
        actions.showModalAction('visitPlan')
    }

    const showDeleteVisitPlanModal = (data: VisitPlanListItem) => {
        dispatch({ type: 'setSelectedItem', payload: data })
        actions.showModalAction('delete-visi-plan')
    }

    const initializationData = async () => {
        try {
            const params: InitCustomerParamsType[] = [
                // { actionName: 'outletTypeList', payload: {} },
                { actionName: 'sale', responseKey: 'seList', payload: {} },
                { actionName: 'lookupDataList', payload: { list: ['WEEK_OF_MONTH', 'DAY_OF_WEEK'] } },
                { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
                { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } }
            ]
            const rs = await crmServices.initCustomerData(params)
            dispatch({ type: 'initialData', payload: rs })
        } catch (error) {
            return
        }
    }

    // const getCustomerCodes = async(rs: UploadVisitPlanResponse) => {
    //     return rs.items.map(it => ({label: it.customerCode, value: it.customerCode}))
    // }

    const initiailizeModal = async (id: string) => {
        const rs = await crmServices.initialModalData({ id: id })
        // const t = await getCustomerCodes(rs)
        dispatch({ type: 'setCustomerFilter', payload: rs.customerCodes?.map(it => ({ label: it, value: it })) || [] })
        dispatch({ type: 'setSalespersonFilter', payload: rs.salespersonCodes?.map(it => ({ label: it, value: it })) || [] })
        dispatch({ type: 'initialModal', payload: rs })
        dispatch({ type: 'setDatasourceModal', payload: rs?.items || [] })

        const params: InitCustomerParamsType[] = [
            { actionName: 'lookupDataList', payload: { list: ['WEEK_OF_MONTH', 'DAY_OF_WEEK'] } }
        ]
        const rs1 = await crmServices.initCustomerData(params)
        dispatch({ type: 'initialData', payload: rs1 })
    }

    const clearUploadedItems = () => {
        dispatch({ type: 'setDatasourceModal', payload: [] })
    }

    const modalSubmit = async (id: string,) => {
        const rs = await crmServices.saveModalData({ id: id })
        return rs.message
    }

    const saveVisitPlan = async (
        customerAddressId: number,
        weekOfTheMonths: number[],
        dayOfTheWeeks: number[],
        data?: VisitPlanListItem,
        // autoCreateSchedule: boolean,
        numDaysBefore?: number,
        remarks?: string
    ) => {
        await crmServices.saveVisitPlan({
            id: data?.id, 
            customerAddressId, 
            visitPlan: [...weekOfTheMonths, ...dayOfTheWeeks],
            numDaysBefore,
            remarks
        })
    }

    const loadVisitScheduleGen = async () => {
        await crmServices.listVisitScheduleGen()
    }

    const loadVisitSchedule = async () => {
        await crmServices.listVisitSchedule()
    }

    const deleteVisitPlan = async (remarks: string) => {
        if (!state.data?.selectedItem) {
            message.error("No selected data found.")
            return
        }
        await crmServices.deleteVisitPlan({
            id: state.data.selectedItem.id,
            remarks: remarks
        })

        dispatch({ type: "setSelectedItem", payload: undefined })

    }

    const deleteVisitPlanByItem = async (item:VisitPlanListItem, remarks: string) => {
        await crmServices.deleteVisitPlan({
            id: item.id,
            remarks: remarks
        })

        dispatch({ type: "setSelectedItem", payload: undefined })

    }

    const downloadVisitPlan = async (regionId?: number[], provinceId?: number[], salespersonId?: number[]) => {
        await crmServices.downloadVisitPlan({
            fileName: 'visit-plan',
            reportName: 'visit-plan',
            data: {
                regionId: regionId,
                provinceId: provinceId,
                salespersonId: salespersonId
            },
            type: 'EXCEL',
        })
    }
    return {
        state: state,
        actions: {
            modalSubmit: modalSubmit,
            initialModal: initiailizeModal,
            initialData: initializationData,
            loadListItem: loadListItem,
            loadVisitScheduleGen: loadVisitScheduleGen,
            loadVisitSchedule: loadVisitSchedule,
            saveVisitPlan: saveVisitPlan,
            deleteVisitPlan: deleteVisitPlan,
            downloadVisitPlan: downloadVisitPlan,
            clearUploadedItems: clearUploadedItems,
            deleteVisitPlanByItem
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            showVisitPlanModal: showVisitPlanModal,
            showAddVisitPlanModal,
            showDeleteVisitPlanModal: showDeleteVisitPlanModal,
            hideModal: actions.hideModalAction
        }
    }
}