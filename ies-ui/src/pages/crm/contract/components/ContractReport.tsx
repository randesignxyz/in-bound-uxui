import { MultiRequest, downloadReport } from "@/services/apiGateway"
import { LookupData, LookupDataItem } from "@/services/data"
import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProFormSelect } from "@ant-design/pro-components"
import { Button } from "antd"
import { useEffect, useState } from "react"
import { ContractServices } from "../services"
import { CustomerServices } from "../../customer/services"
import { useForm } from "antd/es/form/Form"
import moment from "moment"
import { ContractReportParams } from "../types"

type DataFormType = {
    status?: string[],
    brandId?: number[],
    contractTypeId?: number[],
    termId?: number[]
}

export default ({ trigger }: { trigger?: JSX.Element }) => {


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

    }, [])


    return <ModalForm<DataFormType>
        form={form}
        trigger={trigger}
        title="Contract List Export"
        submitter={{
            render(_, dom) {
                return [dom[0], <Button onClick={() => { form.resetFields() }}>Reset</Button>, dom[1]]
            }
        }}
        onFinish={async (dataForm: DataFormType) => {
            console.log(dataForm);
            await downloadReport<ContractReportParams>(requestActions)({
                reportName: 'export-crm-contract-list-report',
                fileName: `crm-contract-list-report-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    status: dataForm.status,
                    brandId: dataForm.brandId,
                    contractTypeId: dataForm.contractTypeId,
                    termId: dataForm.termId
                }
            });

            return true
        }}
    >
<<<<<<< HEAD
        <ProFormSelect showSearch allowClear mode="multiple" name={"status"} label="Status" options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Expired", value: "EXPIRED" },
            { label: "Terminated", value: "TERMINATED" },
        ]} />
        <ProFormSelect showSearch allowClear mode="multiple" name={"brandId"} label="Brand" options={lookupData?.brandList?.map(it => ({ label: it.name, value: it.id }))} />
        <ProFormSelect showSearch allowClear mode="multiple" name={"contractTypeId"} label="Contract Type" options={lookupData?.contractTypes?.map(it => ({ label: it.name, value: it.id }))} />
        <ProFormSelect showSearch allowClear mode="multiple" name="termId" label="Terms" options={lookupData?.terms?.map(it => ({ label: it.name, value: it.id }))} />
=======
        <ProFormSelect showSearch allowClear mode="multiple" name={"status"} label = "Status" options={[
            {label: "Active", value: "ACTIVE"},
            {label: "Expired", value: "EXPIRED"},
            {label: "Terminated", value: "TERMINATED"},
        ]}/>
        <ProFormSelect showSearch allowClear mode="multiple" name={"brandId"} label = "Brand" options={lookupData?.brandList?.map(it => ({label: it.name, value: it.id}))}/>
        <ProFormSelect showSearch allowClear mode="multiple" name={"contractTypeId"} label = "Contract Type" options={lookupData?.contractTypes?.map(it =>({label: it.name, value: it.id}))}/>
        <ProFormSelect showSearch allowClear mode="multiple" name = "termId" label ="Terms" options={lookupData?.terms?.map(it => ({label: it.name, value: it.id}))}/>
>>>>>>> origin/skh-01

    </ModalForm>
}