import { LookupDataItem3 } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import {
    ModalForm, ModalFormProps, ProCard,
    ProDescriptions, ProFormDependency, ProFormGroup,
    ProFormSelect, ProFormTextArea
} from "@ant-design/pro-components"
import { message, Modal, Space, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { ContractServices } from "../services";
import { ContractViewData } from "../types";
import { Moment } from "moment";

export default ({ 
    customerId,
    customerAddressId,
    visitId, checkingDate,
    onRefresh, ...rest 
}: ModalFormProps & {
        customerId: number; 
        visitId: number;
        customerAddressId?:number;
        checkingDate?: Moment, onRefresh?: () => void
    }) => {

    const requestActions = simpleRequestActions()
    const [contracts, setContracts] = useState<ContractViewData[]>([])
    const [complianceLookupList, setComplianceLookupList] = useState<LookupDataItem3[]>([])
    const [form] = useForm()
    useEffect(() => {
        (async () => {
            try {
                const rs = await ContractServices.listContractDataView(customerId,visitId , customerAddressId, checkingDate).query(requestActions)
                setContracts(rs)
                const list = await ContractServices.listComplianceStatus.query(requestActions)
                setComplianceLookupList(list)
            } catch (error: any) {
                message.error(error.message || "Failed to fetch data.")
            }
        })()
    }, [])

    return <ModalForm
        width={1000}
        form={form}
        title="Contract compliance check" {...rest}
        onFinish={async (dataForm) => {
            Modal.confirm({
                title: "Save Contract Check.",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        await ContractServices.saveContractChecked({
                            visitId: visitId,
                            items: contracts.map(it => ({
                                contractId: it.id,
                                compliance: dataForm[`${it.id}`]?.compliance || false,
                                status: dataForm[`${it.id}`]?.status,
                                remarks: dataForm[`${it.id}`]?.remarks,
                            }))

                        })(requestActions)
                        onRefresh?.()
                        rest.onOpenChange?.(false)
                    } catch (error: any) {
                        message.error(error.message || 'Failed to save.')
                    }
                }
            })
        }}
    >
        <Spin spinning={requestActions.request?.loading || false}>
            <Space direction="vertical" style={{ width: '100%' }}>
                {contracts.map(it => <ProCard
                    size="small"
                    headerBordered
                    bordered
                    key={`comtract-${it.id}`}
                    title={[it.contractNo, it.contractType.name].filter(it => it).join(" ")}>
                    <ProDescriptions>
                        <ProDescriptions.Item label="Terms"> {it.terms?.name} </ProDescriptions.Item>
                    </ProDescriptions>

                    <ProFormGroup>
                        <ProFormSelect
                            key={`compliance-check-${it.id}`}
                            rules={[{ required: true }]}
                            width='md'
                            name={[`${it.id}`, "compliance"]} label="Compliance Check"
                            options={complianceLookupList.filter(it => it.type == 'CONTRACT_COMPLIANCE_CHECK').map(it => ({ label: it.name, value: it.id }))} />
                        <ProFormDependency dependencies={[[`${it.id}`, "compliance"]]} name={[[`${it.id}`, "compliance"]]} >
                            {(data) => {
                                const { status } = form.getFieldValue([`${it.id}`]) || { status: 0 };
                                const { compliance } = data[`${it.id}`] || { compliance: 0 };
                                const statusList = complianceLookupList.filter(it => it.parentId == compliance)
                                complianceLookupList.find(it => it.id == status)?.parentId != compliance && form.resetFields([[`${it.id}`, "status"]])

                                return statusList.length > 0 && <ProFormSelect
                                    rules={[{ required: true }]} label="Status" width='md'
                                    name={[`${it.id}`, "status"]}
                                    options={statusList.map(it => ({ label: it.name, value: it.id }))} />
                            }}
                        </ProFormDependency>
                    </ProFormGroup>
                    <ProFormDependency key={`complianceRemarks-${it.id}`} dependencies={[[`${it.id}`, "compliance"]]} name={[`${it.id}`, "status"]} >
                        {(data) => {
                            const { status } = data[`${it.id}`] || { status: 0 };
                            return <ProFormTextArea name={[`${it.id}`, 'remarks']} rules={[{ required: (status == 17129 || status == 17139) }]} fieldProps={{ rows: 3 }} label="Remarks" />
                        }}
                    </ProFormDependency>
                </ProCard>
                )}
            </Space>
        </Spin>

    </ModalForm>
}