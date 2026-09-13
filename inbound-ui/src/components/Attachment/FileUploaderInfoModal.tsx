import { ModalForm, ModalFormProps, ProFormField, ProFormTextArea } from "@ant-design/pro-components"
import { UploadFile } from "antd"
import { useForm } from "antd/lib/form/Form"
import { useEffect } from "react"

type DataForm = {
    fileId: string;
    fileName: string;
    title: string;
    description?: string;
}

export default ({ file, onCancel, onOk, ...rest }: ModalFormProps & {
    file: UploadFile<any> ; onCancel?: () => void;
    onOk: (title: string, description?: string) => Promise<boolean>
}) => {
    const [form] = useForm<DataForm>()
    useEffect(() => {
        if (!rest.open) return
        form.setFieldsValue({
            fileName: file.name
        })
    }, [rest.open])

    return <ModalForm
        onOpenChange={visible => visible == false && onCancel?.()}
        onFinish={async () => {
            const dataForm = await form.validateFields()
            return onOk(dataForm.title, dataForm.description)
        }}
        form={form}
        {...rest}
        initialValues={{ fileName: file.fileName }}
        title="File Info">
        <ProFormField label="File name" readonly name={'fileName'} />
        <ProFormField rules={[{ required: true }]} label="Title" name={'title'} />
        <ProFormTextArea label="Description" name={'description'} />

    </ModalForm>
}