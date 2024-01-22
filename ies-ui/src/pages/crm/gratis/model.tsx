import { IProcessWorkflowModel } from "@/models/process-flow/data";
import { downloadReport } from "@/services/apiGateway";
import { CompleteContractData, ContractData, SubContractType } from "@/services/crm/contract";
import { AddressInfo, ContractDetail, ContractTerm, ContractTermData, CustomerItemLess, IncentiveScheme, IntialSponsor } from "@/services/crm/data";
import { CrmServiceAPI, InitCustomerParamsType } from "@/services/crm/services";
import { LookupData, LookupDataItem } from "@/services/data";
import { BaseActionType, baseReducer, commmonActions, StateType } from "@/services/model";
import { message } from "antd";
import { useReducer } from "react"

export type ModalName = 'request' | 'editContract' | 'modifyContractDoc' | 'viewDoc'
    | 'pdfPreview' | 'renewContract' | 'amendContract' | 'attachment'| 'verifyContractByMonthQuickView' | 'verifyContractQuickView' | undefined

export interface InitData {
    customer?: CustomerItemLess;
    address?: AddressInfo;
    shippingChannelList?: LookupDataItem[];
    lookupDataList?: LookupData[];
    productList?: LookupDataItem[];
    itemList?: LookupDataItem[];
    subContractTypeList?: SubContractType[],
    incentiveSchemeList?: IncentiveScheme[]
}

export interface LayoutConfig {
    showSponsor?: true;
    showExclusiveProduct?: true;
    displayProduct?: true;
    incentiveScheme?: true;
    requestIncentive?: true;
    postSettlementOnly?: true;
    pos?: true
}

// 2531	EXCLUSIVE
// 2532	MACHANDISING
// 2533	INCENTIVE
export type ContactType = 'EXCLUSIVE' | 'MACHANDISING' | 'INCENTIVE'

interface State extends StateType<ModalName> {
    loading: boolean;
    initialData?: InitData;
    layoutConfig?: LayoutConfig;
    data?: {
        contractTerm?: ContractTerm,
        detail?: ContractDetail,
        initialSponsor?: IntialSponsor
    }
}

type Action =
    BaseActionType<ModalName>
    | { type: 'setLayoutConfig', payload?: LayoutConfig }
    | { type: 'initData', payload: InitData }
    | { type: 'setDetail', payload: ContractDetail }
    | { type: 'initialSponsor', payload: IntialSponsor }
    | { type: 'setSubcontract', payload: SubContractType[] }
    | { type: 'setContractTerm', payload: ContractTerm }
    | { type: 'savedContractTerm' }
    | { type: 'addFiles', payload: string[] }

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'initData': return { ...state, initialData: { ...state.initialData, ...action.payload } }
        case 'setLayoutConfig': return { ...state, layoutConfig: action.payload }
        case 'setDetail': return { ...state, data: { ...state.data, detail: action.payload } }
        case 'initialSponsor': return { ...state, data: { ...state.data, initialSponsor: action.payload } }
        case 'setSubcontract': return {
            ...state,
            initialData: {
                ...state.initialData,
                subContractTypeList: action.payload
            }
        }
        case 'setContractTerm': return {
            ...state,
            data: {
                ...state.data,
                contractTerm: action.payload
            }
        }
        case 'savedContractTerm': return {
            ...state,
            data: {
                ...state.data,
                detail: state.data?.detail ? {
                    ...state.data?.detail,
                    contractDocPrepared: true,
                } : undefined
            }
        }
        case 'addFiles': return { ...state, data: { ...state.data, detail: state.data?.detail ? { ...state.data?.detail, attachmentFileIds: action.payload } : undefined } }
        default:
            return baseReducer(state, action);
    }
}


const getLayoutConfig = (contactType: ContactType, showIncentive?: boolean): LayoutConfig | undefined => {
    switch (contactType) {
        case 'EXCLUSIVE':
            return {
                requestIncentive: true,
                showExclusiveProduct: true,
                // displayProduct: true,
                pos: true,
                showSponsor: true,
            }
        case 'MACHANDISING': return {
            displayProduct: true,
            showSponsor: true,
            requestIncentive: true,
            pos: true,
        }
        case 'INCENTIVE': return {
            incentiveScheme: true,
            postSettlementOnly: true
        }
        default: return undefined
    }
}

export const Model = (worflowFlowModal?: IProcessWorkflowModel) => {
    const initState: State = {
        loading: false,
        layoutConfig: getLayoutConfig('EXCLUSIVE')
    }

    const [state, dispatch] = useReducer(reducer, initState)

    //Commons fun
    const actions = commmonActions(dispatch, state)
    const requestActions = actions.requestActions()
    //services declaration

    const crmServices =  CrmServiceAPI(requestActions)

    const doLoadtData = async (id: number) => {
        try {
            const rs = await crmServices.findContract({ id: id })
            applyLayoutConfig(rs.contractType.code as ContactType)
            dispatch({ type: 'setDetail', payload: rs })
        } catch (error) {
            message.error('Failed to load contract')
        }

    }

    const applyLayoutConfig = (contactType: ContactType, showIncentive?: boolean) => {

        const configInfo = getLayoutConfig(contactType, showIncentive)
        dispatch({ type: 'setLayoutConfig', payload: showIncentive ? { ...configInfo, incentiveScheme: true } : configInfo })
    }

    const loadInitData = async (customerId?: number) => {

        const parmList: (InitCustomerParamsType)[] = [
            customerId ? { actionName: 'customer', type: 'Single', payload: { id: customerId } } : undefined,
            customerId ? { actionName: 'get-address-by-customer-id', responseKey: 'address', type: 'Single', payload: { id: customerId } } : undefined,
            customerId ? { actionName: 'shippingChannelList', payload: { id: customerId } } : undefined,
            { actionName: 'list-incentive-scheme', responseKey: 'incentiveSchemeList', payload: {} },
            { actionName: 'product', responseKey: 'productList', payload: {} },

            { actionName: 'item', responseKey: 'itemList', payload: {} },
            {
                actionName: 'lookupDataList', payload: {
                    list: ['CONTRACT_TYPE', 'SETTLEMENT_PLAN', 'OFFER_FREQUENCY', 'CUSTOMER_DISPLAY', 'OFL_OFFER', 'CONTRACT_STATUS']
                }
            }
        ]
        await doListSubContract(2531)
        const rs = await crmServices.initCustomerData(parmList.filter(it => it))
        dispatch({ type: 'initData', payload: rs })
    }

    const doCheckInitialSponsor = async (contractId: number) => {
        const rs = await crmServices.checkInitialSponsor({ id: contractId })
        dispatch({ type: 'initialSponsor', payload: rs })
    }

    const doCreateContract = async (data: ContractData) => {

        return await crmServices.createContract(data)

    }

    const doListSubContract = async (contractId: number) => {
        const rs = await crmServices.listSubContract({ id: contractId })
        dispatch({ type: 'setSubcontract', payload: rs })
    }

    const doSaveContract = async (data: ContractData) => {
        return await crmServices.saveContract(data)
    }

    const doGetcontractTerm = async (contractId: number) => {
        const rs = await crmServices.findContractTerm({ id: contractId })
        dispatch({ type: 'setContractTerm', payload: rs })
    }

    const doSaveContractTermTemp = async (data: ContractTermData) => {
        return await crmServices.saveContractTermTemp(data)
    }

    const doSaveContractTerm = async (data: ContractTermData) => {
        await crmServices.saveContractTerm(data)
        dispatch({ type: 'savedContractTerm' })

    }

    const doRenewContract = async (currentContractId: number, expiryDate: moment.Moment, remarks?: string) => {
        return await crmServices.renewContract({
            currentContractId: currentContractId,
            expiryDate: expiryDate,
            remarks: remarks
        })
    }

    const doCancelContract = async (contractId: number) => {
        await crmServices.cancelContract({ id: contractId })
    }

    const enableIncentiveEntry = (enabled: boolean) => {
        dispatch({ type: 'setLayoutConfig', payload: { ...state.layoutConfig, incentiveScheme: enabled || undefined } })
    }

    const doAttachFiles = async (fileIdList: string[], toId: number) => {
        await crmServices.attachFiles({ fileIdList: fileIdList, attachToId: toId, attachTo: 'CONTRACT' })
        dispatch({ type: 'addFiles', payload: [...(state.data?.detail?.attachmentFileIds || []), ...fileIdList] })
    }

    const downloadContractDoc = async (contractId: number, tempId?: string) => {
       
        try {
            await downloadReport(requestActions)({
                fileName: 'contract',
                reportName: 'contract-doc',
                data: {
                    id: contractId,
                    tempId: tempId
                },
                type: 'PDF',
                target: '_blank'
            })    
        } catch (error) {
            message.error(('Failed to download.'))
        }
    }

    const doViewContractRequestForm = async (contractId: number) => {
        
        // viewContractRequestForm({
        //     fileName: 'contract request form',
        //     reportName: 'contract-request-form',
        //     data: {
        //         id: contractId
        //     },
        //     type: 'PDF',
        //     target: '_blank'
        // })
    }

    const list = async (criteria?: { searchValue?: string }, pagination?: {
        pageSize?: number;
        current?: number;
    }) => {
        return await crmServices.listContract(criteria, { page: (pagination?.current || 1) - 1, pageSize: pagination?.pageSize || 20 })
    }

    const showEditContract = async () => {
        await loadInitData(state.data?.detail?.customer.id)
        actions.showModalAction('editContract')
    }

    const doLoadInitData1 = async () => {
        const rs = await crmServices.initCustomerData([{actionName: 'item', responseKey: 'itemList', payload: {} }])
        dispatch({ type: 'initData', payload: rs })
    }

    const comlpetedContractProcess = async (data: CompleteContractData) => {
        await crmServices.completeContract(data)
    }

    return {
        state: state,
        actions: {
            list: list,
            loadData: doLoadtData,
            loadInitData: loadInitData,
            createContract: doCreateContract,
            saveContract: doSaveContract,
            checkInitialSponsor: doCheckInitialSponsor,
            applyLayoutConfig: applyLayoutConfig,
            enableIncentiveEntry: enableIncentiveEntry,
            listSubContract: doListSubContract,
            getContractTerm: doGetcontractTerm,
            saveContractTermTemp: doSaveContractTermTemp,
            saveContractTerm: doSaveContractTerm,
            renewContract: doRenewContract,
            cancelContract: doCancelContract,
            attachFiles: doAttachFiles,
            viewContractDoc: downloadContractDoc,
            viewContractRequestForm: doViewContractRequestForm,
            doLoadInitData1: doLoadInitData1,
            comlpetedContractProcess: comlpetedContractProcess
        },
        modals: {
            isVisible: actions.isVisible,
            showEditContract: showEditContract,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        }
    }

}
