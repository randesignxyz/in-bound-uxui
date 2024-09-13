import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProDescriptions, ProForm, ProFormTextArea } from "@ant-design/pro-components"
import { PurchaseRequestDTO, PurchaseRequestUpdateParam } from "./data"
import { useForm } from "antd/es/form/Form"


interface Props extends FormModalProps{
    onSave:(data:PurchaseRequestUpdateParam) =>void;
    data?: PurchaseRequestDTO
}

const ActionStatusModalForm :React.FC<Props> =({ onSave, data,...props })=>{
    const [form] = useForm<PurchaseRequestUpdateParam>(); 
    return <FormModalComp
        {...props}
        width="500px"
        title="Force Close"
        onSubmit={async()=>{
            const dataFrom = await form.validateFields();
            const entry ={
                ...dataFrom,
                status: "closed",
                id:data?.id ||0
            } 
            onSave(entry);
        }}
    >
        <ProForm
            submitter={false}
            form={form}
        >
            <ProDescriptions/>
                <ProFormTextArea
                    name={"remark"}
                    placeholder={"please input remark"}
                    // label="Remark "
                    allowClear
                    rules={[
                        {required:true}
                    ]}
                />
        </ProForm>
    </FormModalComp>
}


export default ActionStatusModalForm