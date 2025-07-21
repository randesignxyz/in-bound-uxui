import { simpleRequestActions } from "@/services/model"
import { ModalForm, ModalFormProps, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { SalespersonOrgAPI } from "./service"
import { useForm } from "antd/lib/form/Form"
import { useEffect, useState } from "react"
import { CrmServices } from "../services"
import { LookupData } from "@/services/data"
import { Alert, Card, Flex, Space, Typography } from "antd"

interface Props extends ModalFormProps {
    onSave: (data: AddSalesperonOrg) => void;
    onMove: (data: { saleId: number; moveToId: number }) => void
    data?: SalespersonOrg;
    type: undefined | "ADD" | "MOVE"
}

const SalespersonHeirarchyForm: React.FC<Props> = ({ onSave, onMove, type, data, ...props }) => {
    const requestActions = simpleRequestActions()
    const [form] = useForm<any>();
    const [lookupData, setLookupData] = useState<LookupData[]>();
    const loadData = async () => {
        const data = await CrmServices.listLookupData(['SALESPERSON_POSITION']).query(requestActions);
        setLookupData(data);
    }
    useEffect(() => {
        props.open && form.resetFields();
        props.open && loadData()
    }, [props.open]);

    return <ModalForm
        {...props}
        width={600}
        title={type=="ADD"?"Add Salsperson Form":"Move Salsperson Form"}
        form={form}
        onFinish={async () => {
            if (type == "ADD") {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    path: `${data?.path}${dataForm.saleId}-`,
                    parentId: data?.saleId,
                }
                onSave(entry)
            }
            else {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                }
                onMove(entry)
            }
        }}
    >
        {
            type == "ADD" && (
                <>
                    <ProFormSelect
                        name={"saleId"}
                        label={"Select Salesperson"}
                        showSearch
                        rules={[{ required: true }]}
                        request={async () => {
                            const data = await SalespersonOrgAPI(requestActions).salespersonList()
                            return data.map(o => ({ value: o.id, label: o.name }))
                        }}
                    />
                    <ProFormSelect
                        label="Position"
                        name={"position"}
                        debounceTime={500}
                        rules={[{ required: true }]}
                        options={lookupData?.map(o => ({ label: o.name, value: o.code }))}
                    />
                </>
            ) ||
            (
                <>
                    <Card>
                        <Flex gap={20}>
                        <Space size={"middle"}>
                            <Typography.Text type="secondary">Name:</Typography.Text>
                            <Typography.Text >{data?.name}</Typography.Text>
                        </Space>
                        <Space size={"middle"}>
                            <Typography.Text type="secondary">Position:</Typography.Text>
                            <Typography.Text >{data?.position}</Typography.Text>
                        </Space>
                    </Flex>
                    </Card>
                    <br />
                    <ProFormText
                        name={"saleId"}
                        hidden={true}
                        initialValue={data?.saleId}
                    />
                    <ProFormSelect
                        name={"moveToId"}
                        label={"Move To"}
                        showSearch
                        debounceTime={500}
                        rules={[{ required: true }]}
                        request={async () => {
                            const data = await SalespersonOrgAPI(requestActions).salespersonList()
                            return data.map(o => ({ value: o.id, label: [o.code, o.name].filter(p => p).join(" ") }))
                        }}
                    />
                    <Typography.Text type="warning">
                        This action will move the salesperson to a new other salesperson.<br />
                        Please verify your selections. Click OK to confirm or Cancel to review again
                    </Typography.Text>
                </>
            )
        }
    </ModalForm>
}

export default SalespersonHeirarchyForm