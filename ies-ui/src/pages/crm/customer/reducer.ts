import { Paging } from "@/services/API"
import { AddressData, AddresssView, BasicData, CustomerAdvanceSearchParams, CustomerItemLess, CustomerView, Locations, outletType, PurchaseEstData, VisitPlanDataView, VisitScheduleItem } from "@/services/crm/data"
import { LookupData, LookupDataItem } from "@/services/data"
import { BaseActionType, baseReducer, StateType } from "@/services/model"
import { ProcessInstanceDef } from "@/services/process-workflow/data"
import { uniqueId } from "lodash"


export type ModalName = 'requestContract' | 'editBasicInfo' |
    'editAddress' | 'editVisitPlan' | 'purchaseEst' |
    'createContract' | 'attachments' |
    'visitScheduleGen' | 'scheduleStatus' | 'advanceSearch' |
    'export-customer' | 'transfer-customer' | 'transfer-customers' | 
    'promote-customer' | 'code-tracking'
export type SaveActionType = 'saveAndNew' | 'saveAndView'

export interface InitData {
    regionList?: Locations[]
    provinceList?: Locations[];
    outletTypeList?: outletType[];
    lookupDataList?: LookupData[]; 
    shippingChannelList?: LookupData[];
    seList?: LookupDataItem[];
    itemList?: LookupDataItem[];
    supplySources?: LookupDataItem[];
    currentSalesperson?: LookupDataItem;

}

export interface State extends StateType<ModalName> {
    data?: {
        detail?: CustomerView,
        list?: Paging<CustomerItemLess>
        visitSchedule?: Paging<VisitScheduleItem>;
        locations?: {
            districtList?: Locations[];
            communeList?: Locations[];
            villageList?: Locations[];
        },
    };
    initData?: InitData;
    layout?: {
        customerStep?: number
    },
    draftData?: {
        basic?: BasicData;
        address?: AddressData;
        addressList?: AddresssView[];
        visitPlans?: VisitPlanDataView[];
        forcasting?: PurchaseEstData[];
        processDef?: ProcessInstanceDef;
        advanceSearchParams?: CustomerAdvanceSearchParams;

    }
}


export type Action = BaseActionType<ModalName> |
{ type: 'initialData', payload?: InitData } |
{ type: 'setList', payload?: Paging<CustomerItemLess> } |
{ type: 'setDetail', payload: CustomerView } |
{ type: 'setCustomerStep', payload?: number } |
{ type: 'saveBasicData', payload: BasicData, submit?: true } |
{ type: 'saveAddressData', payload: AddresssView, isNew: boolean } |
{ type: 'removeAddress', payload: AddresssView } |
{ type: 'saveAddressList', payload: AddresssView[] } |
{ type: 'savePlanData', payload: VisitPlanDataView, addNew: boolean } |
{ type: 'removeVisitPlan', payload: number } |
{ type: 'saveForcasting', payload?: PurchaseEstData[], submit?: true } |
{ type: 'setDistrict', payload?: Locations[] } |
{ type: 'setCommune', payload?: Locations[] } |
{ type: 'setVillage', payload?: Locations[] } |
{ type: 'setProcessDef', payload: ProcessInstanceDef } |
{ type: 'new' } |
{ type: 'addFiles', payload: string[] } |
{ type: 'setVisitSchedule', payload: Paging<VisitScheduleItem> } |
{ type: 'setAdvanceSearchParams', payload: CustomerAdvanceSearchParams }

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'initialData':
            return { ...state, initData: { ...state.initData, ...action.payload } }
        case 'setList':
            return { ...state, data: { ...state.data, list: action.payload } }
        case 'setDetail': {

            if (action.payload) {
                const data: CustomerView = {
                    ...action.payload, contacts: (action.payload.contacts || []).map(it => {
                        return { ...it, key: it.key || uniqueId(), }
                    })
                }
                return { ...state, data: { ...state.data, detail: data } }
            }
            return state
        }
        case 'setCustomerStep': {
            return { ...state, layout: { ...state.layout, customerStep: action.payload } }
        }
        case 'saveBasicData': {

            if (action.submit) {

                if (!state.initData || !state.initData?.lookupDataList) {
                    return { ...state }
                }
                const sh = state.initData.supplySources?.find(it => it.id == action.payload.supplySourceId)
                const sale = state.initData.seList?.find(it => it.id == action.payload.saleId)
                const outlet = state.initData.outletTypeList?.find(it => it.id == action.payload.outletTypeId)
                const type = state.initData.lookupDataList.find(it => it.id == action.payload.typeId)


                return {
                    ...state, data: {
                        ...state.data,
                        detail: state.data?.detail && {
                            ...state.data?.detail,
                            internalName: action.payload.internalName,
                            name: action.payload.name,
                            type: type,
                            sale: sale,
                            ownerName: action.payload.ownerName,
                            outletType: outlet,
                            supplySource: sh
                        }
                    }
                }
            } else {

                const outletType = state.initData?.outletTypeList?.find(it => it.id == action.payload.outletTypeId)
                const basicData = {
                    ...action.payload,
                    mainChannel: outletType?.mainChannel,
                    subChannel: outletType?.subChannel,
                }
                return { ...state, draftData: { ...state.draftData, basic: basicData } }
            }
        }

        case 'saveAddressData': {
            if (!state.data?.detail) { return { ...state } }
            if (!action.isNew) {
                return {
                    ...state, data: {
                        ...state.data,
                        detail: {
                            ...state.data.detail,
                            addressList: state.data.detail.addressList.map(it => {
                                if (it.id == action.payload.id) {
                                    return action.payload
                                } else {
                                    return it
                                }
                            })
                        }
                    }
                }
            } else {
                return {
                    ...state, data: {
                        ...state.data,
                        detail: {
                            ...state.data.detail,
                            addressList: [
                                ...state.data.detail.addressList,
                                action.payload
                            ]
                        }
                    }
                }
            }
        }

        case 'removeAddress':
            if (!state.data?.detail) { return { ...state } }
            return {
                ...state, data: {
                    ...state.data,
                    detail: {
                        ...state.data.detail,
                        addressList: state.data.detail.addressList.filter(it => it.id !== action.payload.id)
                    }
                }
            }


        case 'savePlanData': {

            if (action.addNew) {
                return {
                    ...state,
                    data: {
                        ...state.data,
                        detail: state.data?.detail ? {
                            ...state.data?.detail,
                            visitPlans: [... (state.data?.detail.visitPlans || []), action.payload,]
                        } : undefined
                    }
                }
            } else {
                return {
                    ...state,
                    data: {
                        ...state.data,
                        detail: state.data?.detail ? {
                            ...state.data?.detail,
                            visitPlans: [... (state.data?.detail.visitPlans || []).map(it => {
                                return it.id == action.payload.id ? action.payload : it
                            })]
                        } : undefined
                    }
                }
            }
        }

        case 'removeVisitPlan': {
            return {
                ...state,
                data: {
                    ...state.data,
                    detail: state.data?.detail ? {
                        ...state.data?.detail,
                        visitPlans: state.data.detail.visitPlans?.filter(it => it.id !== action.payload)
                    } : undefined
                }
            }
        }
        case 'saveForcasting': {
            if (action.submit) {
                return {
                    ...state,
                    data: {
                        ...state.data,
                        detail: state.data?.detail ? {
                            ...state.data?.detail,
                            purchaseEstList: action.payload
                        } : undefined
                    }
                }
            }
            return { ...state, draftData: { ...state.draftData, forcasting: action.payload } }
        }
        case 'setProcessDef': {
            return {
                ...state,
                draftData: {
                    ...state.draftData,
                    processDef: action.payload
                }
            }
        }

        case 'setDistrict': {
            return {
                ...state, data: {
                    ...state.data, locations: {
                        ...state.data?.locations, districtList: action.payload
                    }
                }
            }
        }
        case 'new': {
            return { ...state, draftData: undefined, layout: { customerStep: 0 } }
        }
        case 'setCommune': {
            return {
                ...state, data: {
                    ...state.data, locations: {
                        ...state.data?.locations, communeList: action.payload
                    }
                }
            }
        }

        case 'setVillage': {
            return {
                ...state, data: {
                    ...state.data, locations: {
                        ...state.data?.locations, villageList: action.payload
                    }
                }
            }
        }

        case 'addFiles': return { ...state, data: { ...state.data, detail: state.data?.detail ? { ...state.data?.detail, attachmentFileIds: action.payload } : undefined } }
        case 'setVisitSchedule': return { ...state, data: { ...state.data, visitSchedule: action.payload } }
        case 'saveAddressList': return { ...state, draftData: { ...state.draftData, addressList: action.payload } }
        case 'setAdvanceSearchParams': return { ...state, draftData: { ...state.draftData, advanceSearchParams: action.payload } }
        default:
            return baseReducer(state, action)
    }
}