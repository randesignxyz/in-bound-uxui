import ProForm, { ProFormTextArea } from "@ant-design/pro-form"
import { Modal, ModalProps } from "antd"
import { useForm } from "antd/lib/form/Form"

interface Props extends Omit<ModalProps, 'onOk'> {
    onSubmit: (remarks: string) => void
}

const ChangeStatusModal: React.FC<Props> = ({onSubmit, ...rest}) => {
    const  [form] = useForm<{remarks: string}>()
    return <Modal {...rest}
        onOk = {async ()=> {
            const dataForm = await form.validateFields()
            onSubmit(dataForm.remarks)
        }}>
        <ProForm submitter = {false} form = {form}>
            <ProFormTextArea rules = {[{required: true}]} label = "Remarks" name= "remarks"/>
        </ProForm>

    </Modal>
}

export default ChangeStatusModal