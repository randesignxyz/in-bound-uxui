import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { LookupDataItem } from "@/services/data";
import ProForm, { ProFormCheckbox, ProFormDatePicker, ProFormSelect, ProFormTextArea } from "@ant-design/pro-form"
import { useForm } from "antd/lib/form/Form";
import moment from "moment";

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

interface Props extends FormModalProps {
    seList: LookupDataItem[];
    actionHandlers?: {
        onSubmit: (
            generatedMonth: moment.Moment,
            effectiveDate?: moment.Moment,
            salespersonId?: number,
            overwritePending?: boolean,
            remarks?: string
        ) => void
    }
}
const GenerateScheduleModal: React.FC<Props> = ({ seList, actionHandlers, ...rest }) => {

    const [form] = useForm<{ 
        generatedMonth: moment.Moment; 
        effectiveDate?: moment.Moment;
        salespersonId?: number;
        overwritePending?: boolean;
        description?: string;
    }>()

    return <FormModalComp title='Generate Visit Schedule' {...rest}
        onResetForm={() => form.resetFields()}
        onSubmit={async () => {
            const dataForm = await form.validateFields()
            actionHandlers?.onSubmit(
                dataForm.generatedMonth,
                dataForm.effectiveDate,
                dataForm.salespersonId,
                dataForm.overwritePending,
                dataForm.description
            )
        }}>
        <ProForm form={form} submitter={false} {...layout} layout='horizontal'>

        <ProFormDatePicker name={"effectiveDate"} rules={[{ required: true }]} label={"Effective Date"} />
            {/* <ProFormDatePicker.Month rules={[{ required: true }]} label='Create schedule for' name='generatedMonth' /> */}
            <ProFormSelect
                label="Salesperson"
                name="salespersonId"
                width='md'
                showSearch
                allowClear
                options={seList.map((it) => {
                    return { value: it.id, label: it.code?.concat(' - ', it.name) };
                })}
            />
            <ProFormCheckbox name={"overwritePending"} label="Overwrite Pending Schedule" />
            <ProFormTextArea label='Remarks' name='remarks' />

        </ProForm>
    </FormModalComp>
}
export default GenerateScheduleModal