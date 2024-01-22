import { ContractData } from "@/services/crm/contract"
import ProForm from "@ant-design/pro-form"
import { FormInstance } from "antd"
import { UploadFile } from "antd/lib/upload/interface"
import { head } from "lodash"
import { useEffect } from "react"
import { useState } from "react"
import { ContactType } from "../model"
import { ContractEntryForm, ContractEntryFormProps } from "./ContractEntryForm"
// import 'moment-precise-range-plugin'
import moment from "moment"
import { ContractDetail } from "@/services/crm/data"
import { duration } from "@/pages/utils"

const layout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 13 },
};

interface Props extends ContractEntryFormProps {
    forceUpdate?: number;
    data?: ContractDetail,
    form: FormInstance<ContractData>;
    uploadFiles?: UploadFile[];
    applyLayoutConfig?: (contactType: ContactType, incentive?: boolean) => void;
    listSubContract?: (contractId: number) => void;
    enableIncentiveEntry?: (enabled: boolean) => void;
}

const ContractEntryWrapper: React.FC<Props> = ({
    forceUpdate,
    data,
    form,
    applyLayoutConfig,
    listSubContract,
    enableIncentiveEntry,
    initData,
    actionHandlers,
    ...rest
}) => {

    const [termVisible, setTermVisible] = useState<boolean>(false)

    useEffect(() => {
        reset()
    }, [forceUpdate])

    const reset = () => {
        setTermVisible(!!data)
        enableIncentiveEntry?.(data?.subContractType.incentive == 'Y')
    }
    const onValuesChangeHandler = (changedValues: any, values: ContractData) => {

        const { includedIncentive, contractTypeId, incentiveSchemeId, subContractTypeId, effectiveDate, expiryDate } = changedValues
        if (contractTypeId && 'contractTypeId' in changedValues) {
            form.resetFields(['subContractTypeId'])
            setTermVisible(false)
            listSubContract?.(contractTypeId)
        }

        if ('includedIncentive' in changedValues) {
            enableIncentiveEntry?.(includedIncentive)
        }

        if ('incentiveSchemeId' in changedValues) {
            const scheme = initData?.incentiveSchemeList?.find(it => it.id == incentiveSchemeId)
            form.setFieldsValue({
                incentiveSchemeTier1: scheme?.tier1,
                incentiveSchemeTier2: scheme?.tier2,
                incentiveSchemeTier3: scheme?.tier3,
            })
        }

        if ('effectiveDate' in changedValues || 'expiryDate' in changedValues) {

            const start: moment.Moment | undefined = moment(effectiveDate) || moment(values.effectiveDate)
            const end: moment.Moment | undefined = moment(expiryDate) || moment(values.expiryDate)
            form.setFieldsValue({
                contractDuration: duration(start, end)
            })
        }

        if ('subContractTypeId' in changedValues) {
            setTermVisible(true)
            const subC = initData?.subContractTypeList?.find(it => it.id == subContractTypeId)
            applyLayoutConfig?.(
                initData?.lookupDataList?.find(it => it.type == 'CONTRACT_TYPE' && it.id == values.contractTypeId)?.code as ContactType || 'EXCLUSIVE',
                subC?.incentive == 'Y'
            )
        }
    }

    useEffect(() => {
        rest.layoutConfig && form.setFieldsValue({
            settlementPlanId: head(initData?.lookupDataList?.filter(it => it.type == 'SETTLEMENT_PLAN' && (!rest.layoutConfig?.postSettlementOnly || it.id !== 1501)))?.id || 1501
        })
    }, [rest.layoutConfig?.postSettlementOnly])

    const initDataValue = ({
        contractTypeId: data?.contractType.id || 2531,
        subContractTypeId: data?.subContractType.id,
        effectiveDate: (data?.effectiveDate && moment(data?.effectiveDate)) || moment(),
        expiryDate: (data?.expireDate && moment(data?.expireDate)) || moment(),
        contractDuration: data && duration(moment(data.effectiveDate), moment(data.expireDate)),
        exclusiveProductIds: data?.options.filter(it => it.type == 'EXCLUSIVE_PRODUCT').map(it => it.id),
        customerDisplays: data?.options.filter(it => it.type == 'CUSTOMER_DISPLAY').map(it => it.id),
        displayOfferIds: data?.options.filter(it => it.type == 'OFL_OFFER').map(it => it.id),
        displayProducts: data?.productDisplay.map(it => ({ productId: it.id, qty: it.amount })) || [{}],
        sponsorItems: data?.itemSponsor.map(it => ({ itemId: it.id, qty: it.amount })) || [{}],
        offerFrequencyId: data?.frequencySettlement.id || 1511,
        settlementPlanId: data?.settlementPlan.id || 1501,
        remarks: data?.remarks,
        incentiveSchemeTier1: data?.incentiveScheme?.incentiveSchemeTier1,
        incentiveSchemeTier2: data?.incentiveScheme?.incentiveSchemeTier2,
        incentiveSchemeTier3: data?.incentiveScheme?.incentiveSchemeTier3,
        incentiveSchemeRemarks: data?.incentiveScheme?.incentiveSchemeRemarks,
    })
    return (
        <ProForm
            {...layout}
            form={form}
            layout='horizontal'
            onValuesChange={onValuesChangeHandler}
            onReset={reset}
            submitter={false}
            initialValues={initDataValue}>

            <ContractEntryForm
                initData={initData}
                termVisible={termVisible}
                actionHandlers={{
                    ...actionHandlers, onClearScheme: () => {
                        form.resetFields(['incentiveSchemeId'])
                    }
                }} {...rest} />
        </ProForm>
    )
}

export default ContractEntryWrapper