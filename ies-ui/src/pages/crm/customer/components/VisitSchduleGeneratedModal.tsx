import FormModalComp, { FormModalProps } from "@/components/FormModal"
import ProForm, { ProFormCheckbox, ProFormDatePicker, ProFormTextArea } from "@ant-design/pro-form"
import { Card } from "antd";
import { useForm } from "antd/lib/form/Form";
import moment from "moment";

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

interface Props extends FormModalProps {
    actionHandlers?: {
        onSubmit: (
            generatedMonth: moment.Moment,
            effectiveDate?: moment.Moment,
            overwritePending?: boolean,
            remarks?: string
        ) => void
    }
}
const VisitSchduleGeneratedModal: React.FC<Props> = ({ actionHandlers, ...rest }) => {


    const [form] = useForm<{
        generatedMonth: moment.Moment,
        effectiveDate?: moment.Moment;
        overwritePending?: boolean;
        description?: string,
    }>()

    return <FormModalComp title='Generate Visit Schedule' {...rest}
        onResetForm={() => form.resetFields()}
        
        onSubmit={async () => {
            const dataForm = await form.validateFields()
            actionHandlers?.onSubmit(
                dataForm.generatedMonth,
                dataForm.effectiveDate,
                dataForm.overwritePending,
                dataForm.description)
        }}>
        <Card size='small'>
            <ProForm form={form} submitter={false} {...layout} layout='horizontal'>

                <ProFormDatePicker name={"effectiveDate"} rules={[{ required: true }]} label={"Effective Date"} />

                <ProFormCheckbox name={"overwritePending"} label="Overwrite Pending Schedule" />
                <ProFormTextArea label='Remarks' name='remarks' />

            </ProForm>
        </Card>
    </FormModalComp>
}
export default VisitSchduleGeneratedModal