import { MultiRequest } from "@/services/apiGateway"
import { LookupData, LookupDataItem } from "@/services/data"
import { simpleRequestActions } from "@/services/model"
import { DrawerForm, ProForm, ProFormDatePicker, ProFormDateRangePicker, ProFormGroup, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { useEffect, useState } from "react"
import { ContractServices } from "../services"
import { CustomerServices } from "../../customer/services"
import { Button, Spin, message } from "antd"
import moment from "moment"

type DataFormType = {
    brandId?: number[],
    contractTypeId?: number[],
    termId?: number[],
    startedDateRange?: moment.Moment[],
    endedDateRange?: moment.Moment[]
}

export default ({ trigger, onSearch }: { trigger?: JSX.Element, onSearch?: (
    brandId?: number[],
    contractTypeId?: number[],
    termId?: number[],
    startedDateFrom?: moment.Moment,
    startedDateTo?: moment.Moment,
    endedDateFrom?: moment.Moment,
    endedDateTo?: moment.Moment
) => Promise<void> }) => {
    const [form] = useForm<DataFormType>()
    const requestActions = simpleRequestActions()

    const [lookupData, setLookupData] = useState<{
        contractTypes?: LookupData[],
        terms?: LookupData[],
        brandList?: LookupDataItem[]
    }>()
    
    useEffect(() => {
        (async () => {
            const rs = await MultiRequest<{
                contractTypes: LookupData[],
                terms: LookupData[],
                brandList: LookupDataItem[]
            }>(
                [
                    ContractServices.listContractType().queryParams, 
                    ContractServices.listTerms().queryParams,
                    CustomerServices.listBrand.queryParams

                ]
            )(requestActions)
            setLookupData(rs)
        })()

    }, [])

    return <DrawerForm
        trigger={trigger}
        // form={form}
        title="Contract Advance Search"
        onFinish={async (values) => {
            
            try {
                var dataForm = await form.validateFields()
                var startedDateFrom = (dataForm?.startedDateRange||[undefined,undefined])[0]
                var startedDateTo = (dataForm?.startedDateRange||[undefined,undefined])[1]
                var endedDateFrom = (dataForm?.endedDateRange||[undefined,undefined])[0]
                var endedDateTo = (dataForm?.endedDateRange||[undefined,undefined])[1]
                await onSearch?.(dataForm.brandId, dataForm.contractTypeId, dataForm.termId,startedDateFrom,startedDateTo,endedDateFrom,endedDateTo)
                return true
            } catch (error: any) {
                message.error(error.message || 'Failed to search')
                return false
            }
            // await onDowloadReportHandler()
        }}
        submitter = {{
            render(props, doms) {
                
                return [
                    doms[0],
                    <Button onClick={()=> {form?.resetFields() }}>Reset</Button>,
                    doms[1]
                ]
            },
        }}
    >
        <Spin spinning = {requestActions.request?.loading || false}>     
        <ProForm<DataFormType> form={form} submitter={false}>     
            <ProFormSelect showSearch allowClear mode="multiple" name={"brandId"} label = "Brand" options={lookupData?.brandList?.map(it => ({label: it.name, value: it.id}))}/>
            <ProFormSelect showSearch allowClear mode="multiple" name={"contractTypeId"} label = "Contract Tyoe" options={lookupData?.contractTypes?.map(it =>({label: it.name, value: it.id}))}/>
            <ProFormSelect showSearch allowClear mode="multiple" name = "termId" label ="Terms" options={lookupData?.terms?.map(it => ({label: it.name, value: it.id}))}/>        
            <ProFormDateRangePicker  name={"startedDateRange"} label={"Start Date"} />
            <ProFormDateRangePicker name={"endedDateRange"} label={"End Date"}  />      
        </ProForm>  
        </Spin>
    </DrawerForm>
}