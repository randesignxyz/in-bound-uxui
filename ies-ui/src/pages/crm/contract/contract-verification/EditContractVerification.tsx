import { ModalForm, ProFormDependency, ProFormGroup, ProFormSelect, ProFormTextArea } from "@ant-design/pro-form"
import { ContractCheckedDataView, ContractViewData } from "../types"
import { simpleRequestActions } from "@/services/model"
import { useEffect, useState } from "react"
import { LookupDataItem3 } from "@/services/data"
import { Modal, Spin, message } from "antd"
import { ContractServices } from "../services"
import ProDescriptions from "@ant-design/pro-descriptions"
import { useForm } from "antd/lib/form/Form"
import { log } from "console"

export default ({ data, contract, trigger, refresh }: { data: ContractCheckedDataView, refresh?: ()=> void , contract: ContractViewData, trigger?: JSX.Element }) => {

    const requestActions = simpleRequestActions()
    const [complianceLookupList, setComplianceLookupList] = useState<LookupDataItem3[]>([])
    const [form] = useForm<{ compliance: number; status: number; remarks?: string }>()
    const [open, setOpen] = useState(false)
    useEffect(() => {
        if (!open) return
        (async () => {

            try {
                const list = await ContractServices.listComplianceStatus.query(requestActions)
                setComplianceLookupList(list)
                form.setFieldsValue({
                    compliance: data.compliance.id,
                    status: data.status?.id,
                    remarks: data.remarks

                })
            } catch (error: any) {
                message.error(error.message || "Failed to fetch data.")
            }
        })()
        return () => { form.resetFields() }
    }, [open])

    return <ModalForm 
        onOpenChange={setOpen} 
        open = {open}
        form={form} 
        onFinish={async()=> {
            const dataForm = await form.validateFields()
            Modal.confirm({
                title: "Edit Contract Verification",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        await ContractServices.editContractChecked({
                            id: data.id,
                            compliance: dataForm.compliance,
                            status: dataForm.status,
                            remarks: dataForm.remarks
                        }) (requestActions)
                        refresh?.()
                        setOpen(false)
                    } catch (error: any) {
                        message.error(error?.message || "Failed to edit")
                        
                    }
                }
            })
            
        }}
        trigger={trigger} title="Edit Contract Verification">
        <Spin spinning={requestActions.request?.loading}>

            <ProDescriptions column={1}>
                <ProDescriptions.Item label="Agreement No"> {contract.contractNo} </ProDescriptions.Item>
                <ProDescriptions.Item label="Agreement Type"> {contract.contractType.name} </ProDescriptions.Item>
                <ProDescriptions.Item label="Terms"> {contract.terms?.name} </ProDescriptions.Item>
            </ProDescriptions>

            <ProFormGroup>
                <ProFormSelect
                    rules={[{ required: true }]}
                    width='md'
                    name={"compliance"} label="Compliance Check"
                    options={complianceLookupList.filter(it => it.type == 'CONTRACT_COMPLIANCE_CHECK').map(it => ({ label: it.name, value: it.id }))} />
                <ProFormDependency dependencies={["compliance"]} name={["compliance"]} >
                    {({ compliance }) => {

                        const statusList = complianceLookupList.filter(it => it.parentId == compliance)
                        const selectedStatus = form.getFieldValue('status')
                        const status = complianceLookupList.find(it => it.id == selectedStatus)
                        if (status?.parentId != compliance) form.resetFields(["status"])

                        return statusList.length > 0 && <ProFormSelect
                            rules={[{ required: true }]} label="Status" width='md'
                            name={"status"}
                            options={statusList.map(it => ({ label: it.name, value: it.id }))} />
                    }}
                </ProFormDependency>
            </ProFormGroup>
            <ProFormDependency dependencies={["compliance"]} name={["status"]} >
                {(data) => {
                    log(" status : ", data)
                    const { status } = data
                    return <ProFormTextArea name={'remarks'} rules={[{ required: (status == 17129 || status == 17139) }]} fieldProps={{ rows: 3 }} label="Remarks" />
                }}
            </ProFormDependency>

        </Spin>
    </ModalForm>
}