import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormDigit } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { AccessoriesCreate, AccessoriesDTO } from "./data"

interface Props extends FormModalProps{
    data?:AccessoriesDTO;
    onSave:(data:AccessoriesCreate)=>void
}
const AccessoryDeductQTY:React.FC<Props> = ({data, onSave,...props}) =>{
    const [form] = useForm<AccessoriesDTO>();
    return (
        <>
            <FormModalComp
                {...props}
                width="500px"
                title="Deduct Quanity Accessory"
                onSubmit={async () =>{
                    const formData = await form.validateFields();
                    const entry ={
                        ...data,
                        qty: formData.qty,
                        unitCost:formData.unitCost,
                        category:data?.category?.id,
                    }
                    onSave(entry)
                }}
            >
                <ProForm
                    submitter={false}
                    form={form}
                >
                    <ProFormDigit
                        name={"qty"}
                        label="Quantity"
                    />
                    <ProFormDigit
                        name={"unitCost"}
                        label="Unit Cost"
                    />
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default AccessoryDeductQTY