import { ModalForm, ModalFormProps, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { SalespersonOrgAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
interface Props extends ModalFormProps {
    data?: any;
    onSave: (data: { saleId: number; targetSaleId: number; remark?: string }) => void
}
const AuditorForm: React.FC<Props> = ({ data, onSave, ...props }) => {
    const requestAction = simpleRequestActions();
    const [form] = useForm<{ saleId: number; targetSaleId: number; remark?: string }>();
    useEffect(() => {
        props.open && form.resetFields();
    }, [props.open]);
    return (
        <>
            <ModalForm
                {...props}
                form={form}
                title="Set up Auditor"
                width={600}
                onFinish={async () => {
                    const dataForm = await form.validateFields();
                    const entry = {
                        ...dataForm,
                        targetSaleId: data.saleId
                    }
                    onSave(entry);
                }}
            >
                <ProFormSelect
                    name={"saleId"}
                    rules={[{ required: true }]}
                    label={"Auditor"}
                    showSearch
                    request={async () => {
                        const data = await SalespersonOrgAPI(requestAction).salespersonList();
                        return data.map(o => ({
                            label: o.name,
                            value: o.id
                        }))
                    }}
                />
                <ProFormTextArea
                    name="remark"
                    label="Remark"
                />
            </ModalForm>
        </>
    )
}

export default AuditorForm