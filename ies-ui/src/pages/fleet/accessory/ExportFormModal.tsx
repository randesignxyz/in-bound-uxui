import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"


interface Props extends FormModalProps{

}

const ExposeAccessoryFormModal:React.FC<Props> =({...props})=>{
    const [form] = useForm();
    return (
        <FormModalComp
            {...props}
        >
            <ProForm 
                form={form}
                submitter={false}
            >
                <ProFormSelect
                    name={""}
                />
                
            </ProForm>
        </FormModalComp>
    )
} 

export default ExposeAccessoryFormModal