import { MultiRequest, downloadReport } from "@/services/apiGateway"
import { LookupData, LookupDataItem } from "@/services/data"
import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProFormSelect } from "@ant-design/pro-components"
import { Button } from "antd"
import { useEffect, useState } from "react"
import { CustomerServices } from "../../customer/services"
import { useForm } from "antd/es/form/Form"
import moment from "moment"
import { ContractServices } from "../../contract/services"
import { TermReportParams } from "../types"

type DataFormType = {
    tag?: string[]
}

export default ({ trigger }: { trigger?: JSX.Element}) => {
    const requestActions = simpleRequestActions()
    const [form] = useForm<DataFormType>()
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
    },[])

    return <ModalForm<DataFormType>  
        form={form}
        trigger={trigger}
        title = "Term List Export"
        submitter = {{
            render(_, dom) {
                return [dom[0], <Button onClick={()=>{form.resetFields()}}>Reset</Button> , dom[1]]
            }
        }}       
        onFinish={async(dataForm: DataFormType)=>{
            console.log(dataForm);
            await downloadReport<TermReportParams>(requestActions)({
                reportName: 'export-crm-term-list-report',
                fileName: `crm-term-list-report-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    tag: dataForm.tag
                }
            });        
            return true
        }}
    >
        <ProFormSelect showSearch allowClear mode="multiple" name={"tag"} label = "Tag" options={lookupData?.contractTypes?.map(it =>({label: it.name, value: it.name}))}/>
    </ModalForm>
}