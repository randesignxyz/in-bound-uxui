import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ContactData } from "@/services/crm/contact";
import { LookupData } from "@/services/data";
import ProForm from "@ant-design/pro-form"
import { message } from "antd"
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";
import ContactEntryForm from "./ContactEntryForm";

export interface ContractFormProps extends FormModalProps {
    data?: ContactData;
    lookupDataList?: LookupData[]; 
    actionHandlers?: {
        onSave?: (data: ContactData) => void;
        onLoadInitData?: () => void;
    }
}

const ContactEntryModal: React.FC<ContractFormProps> = ({ actionHandlers, data, lookupDataList, ...rest }) => {

    const [form] = useForm<ContactData>()

    useEffect(() => {
        if (!rest.open) return
        actionHandlers?.onLoadInitData?.()
        form.setFieldsValue({ ...data })
    }, [rest.open])

    return <FormModalComp {...rest}
        width='600px'
        onSubmit={async () => {
            try {
                const dataForm = await form.validateFields()
                actionHandlers?.onSave?.({ ...data, ...dataForm })
            } catch (errors) {
                message.error('Invalid data.')
            }
        }}
        onResetForm={() => form.resetFields()}>

        <ProForm form={form} 
            //{...layout} //layout='horizontal'
            submitter={false}>
            <ContactEntryForm  lookupDataList = {lookupDataList}/>
        </ProForm>

    </FormModalComp >
}

export default ContactEntryModal