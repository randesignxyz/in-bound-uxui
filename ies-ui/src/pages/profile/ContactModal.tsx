import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProFormCheckbox, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { ContactData, SaveContract } from "./data"

interface Props extends ModalFormProps<SaveContract> {
    lookupList: LookupDataItem2[],
    data?: ContactData,
}

export default ({ lookupList, data, ...rest }: Props) => {

    const [form] = useForm<SaveContract>()

    return <ModalForm  {...rest} form={form} width={500} title="Save Contact"
        onOpenChange={visible => {
            !!visible && form.resetFields()
            
            if(visible) {
                form.setFieldsValue({
                    id: data?.id,
                    typeId: data?.type.id,
                    contact: data?.value,
                    isMain: data?.isMain
                })
            }

            rest.onOpenChange?.(visible)
        }}

        submitter={{
            searchConfig: {
                submitText: 'Submit',
                resetText: 'Cancel',
            },
        }} 
        >
        <ProFormSelect
            rules={[{ required: true }]} 
            label="Type"
            disabled = {!!data}
            name={'typeId'}
            options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
        />
        <ProFormText rules={[{ required: true }]} label="Contact" name={'contact'} />
        <ProFormCheckbox label="Main Contact" name={'isMain'} />
    </ModalForm>
}