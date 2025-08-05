import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Modal, ModalProps } from "antd";
import { useForm } from "antd/es/form/Form";
import React from "react";

interface Props extends ModalProps {
    status?: string;
    onSave: (data: any) => void
}

const ChangeStatusForm: React.FC<Props> = ({ status, onSave, ...props }) => {
    const [form] = useForm();

    return (
        <Modal
            title={"Confirmation"}
            {...props}
            width={400}
            onOk={async () => {
                const dd = await form.validateFields();
                const entry = {
                    ...dd,
                    status: status
                }
                onSave(entry)
            }}
        >
            <ProForm
                form={form}
                submitter={false}
            >
                <ProFormTextArea
                    rules={[{ required: true }]}
                    name="remark"
                />
            </ProForm>
        </Modal>

    )

}


export default ChangeStatusForm