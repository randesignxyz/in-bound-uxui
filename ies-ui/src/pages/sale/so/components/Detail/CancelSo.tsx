import FormModalComp, { FormModalProps } from "@/components/FormModal"
import ProForm, { ProFormTextArea } from "@ant-design/pro-form"
import { message } from "antd"
import { useForm } from "antd/lib/form/Form"

interface Props extends FormModalProps  {
    onCacelSo: (remarks: string)=> void;
}

const CancelSo: React.FC<Props> = ({ onCacelSo, ...props}) => {
    const [form] = useForm<{remarks: string;}>()
    return <FormModalComp
        {...props}
        onResetForm = {() => {form.resetFields()}}
        onSubmit = {async () => {
            try {
                const rs = await form.validateFields()
                onCacelSo(rs.remarks)    
            } catch (error: any) {
                message.error(error.message || "Invalid data.")
            }
            
        }}
    >
        <ProForm submitter = {false} form = {form} >
            <ProFormTextArea rules = {[{required: true}]} label = 'Remarks' name = 'remarks'/>
        </ProForm>
    </FormModalComp>
}
export default CancelSo