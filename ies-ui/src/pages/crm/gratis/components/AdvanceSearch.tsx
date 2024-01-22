import { MultiRequest } from "@/services/apiGateway"
import { LookupData, LookupDataItem } from "@/services/data"
import { simpleRequestActions } from "@/services/model"
import { DrawerForm, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { useEffect, useState } from "react"
import { GratisServices } from "../services"
import { CustomerServices } from "../../customer/services"
import { Button, Spin, message } from "antd"

type DataFormType = {
    brandId?: number[],
    contractTypeId?: number[],
    termId?: number[]
}

export default ({ trigger, onSearch }: { trigger?: JSX.Element, onSearch?: (
    brandId?: number[],
    contractTypeId?: number[],
    termId?: number[]
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
                    GratisServices.listContractType().queryParams, 
                    GratisServices.listTerms().queryParams,
                    CustomerServices.listBrand.queryParams

                ]
            )(requestActions)
            setLookupData(rs)
        })()

    }, [])

    return <DrawerForm<DataFormType>
        trigger={trigger}
        form={form}
        title="Contract Advance Search"
        onFinish={async (values) => {
            
            try {
                await onSearch?.(values.brandId, values.contractTypeId, values.termId)
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
                    <Button onClick={()=> {props.form?.resetFields() }}>Reset</Button>,
                    doms[1]
                ]
            },
        }}
    >
        <Spin spinning = {requestActions.request?.loading || false}>
            <ProFormSelect showSearch allowClear mode="multiple" name={"brandId"} label = "Brand" options={lookupData?.brandList?.map(it => ({label: it.name, value: it.id}))}/>
            <ProFormSelect showSearch allowClear mode="multiple" name={"contractTypeId"} label = "Contract Tyoe" options={lookupData?.contractTypes?.map(it =>({label: it.name, value: it.id}))}/>
            <ProFormSelect showSearch allowClear mode="multiple" name = "termId" label ="Terms" options={lookupData?.terms?.map(it => ({label: it.name, value: it.id}))}/>
        </Spin>
    </DrawerForm>
}