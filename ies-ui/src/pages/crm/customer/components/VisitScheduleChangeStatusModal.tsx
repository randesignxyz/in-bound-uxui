import ProForm, { ProFormTextArea } from "@ant-design/pro-form"
import { Card, Modal, ModalProps } from "antd"
import { useForm } from "antd/lib/form/Form"

interface Props extends Omit<ModalProps, 'onOk'> {
    onSubmit: (remarks: string) => void
}

const VisitScheduleChangeStatusModal: React.FC<Props> = ({ onSubmit, ...rest }) => {
    const [form] = useForm<{ remarks: string }>()
    return <Modal {...rest}
        onOk={async () => {
            const dataForm = await form.validateFields()
            onSubmit(dataForm.remarks)
        }}>
        <Card size='small'>
            <ProForm submitter={false} form={form}>
                <ProFormTextArea rules={[{ required: true }]} label="Remarks" name="remarks" />
            </ProForm>

        </Card>
    </Modal>
}

export default VisitScheduleChangeStatusModal