import { simpleRequestActions } from "@/services/model"
import { ModalForm, ModalFormProps, ProFormSelect } from "@ant-design/pro-components"
import { SalespersonOrgAPI } from "./service"
import { useForm } from "antd/lib/form/Form"
import { useEffect } from "react"

interface Props extends ModalFormProps {
    onSave: (data: AddSalesperonOrg) => void;
    data?: SalespersonOrg
}

const SalespersonHeirarchyForm: React.FC<Props> = ({ onSave, data, ...props }) => {
    const requestActions = simpleRequestActions()
    const [form] = useForm<AddSalesperonOrg>();

    useEffect(() => {
        props.open && form.resetFields();

    }, [props.open]);
    return <ModalForm
        {...props}
        width={600}
        title={"Set up Sales Organization"}
        form={form}
        onFinish={async () => {
            const dataForm = await form.validateFields();
            const entry = {
                ...dataForm,
                path:`${data?.path}${dataForm.saleId}-`,
                parentId:data?.saleId,
            }
            onSave(entry)
        }}
    >
        <ProFormSelect
            name={"saleId"}
            label={"Please Select Salesperson"}
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
            options={[
                {
                    value: "NSM",
                    label: "NSM"
                },
                {
                    value: "RSM",
                    label: "RSM"
                },
                {
                    value: "ASM",
                    label: "ASM"
                },
                {
                    value: "SE",
                    label: "SE"
                },
                {
                    value: "SA",
                    label: "SA"
                },
            ]}
        />
    </ModalForm>
}

export default SalespersonHeirarchyForm