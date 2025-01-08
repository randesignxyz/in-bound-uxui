import FormModalComp, { FormModalProps } from "@/components/FormModal"
import ProForm, { ProFormTextArea } from "@ant-design/pro-form"
import { useForm } from "antd/lib/form/Form"

interface Props extends FormModalProps {
    onPosting: (remarks?: string) => void;
}

const SapPosting: React.FC<Props> = ({onPosting, ...props}) => {
    const [form] = useForm<{remarks: string;}>()
    return <FormModalComp
        {...props}
        onResetForm = {() => {form.resetFields()}}
        onSubmit = {async () => {
            const rs = await form.validateFields()
            onPosting(rs.remarks)
        }}
    >
        <ProForm submitter = {false} >
            <ProFormTextArea label = 'Remarks' name = 'remarks'/>
        </ProForm>
    </FormModalComp>
  );
};

export default SapPosting;
