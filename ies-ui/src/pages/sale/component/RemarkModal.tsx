import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Alert, Modal, ModalProps } from "antd";
import { useForm } from "antd/es/form/Form";
import React from "react";

interface Props extends ModalProps {
    showAlertInfo: boolean | true;
    onSave: (data: StatusActionForm) => void;
    status?:string;
    
}
const RemarkModalForm: React.FC<Props> = ({ onSave,status, showAlertInfo, ...props }) => {
    const [form] = useForm<StatusActionForm>();
    return (
        <Modal
            {...props}
            title={"Remark "}
            onOk={async()=>{
                const data = await form.validateFields();
                onSave(data) 
            }}
        >
            <ProForm
                form={form}
                submitter={false}
            >
                <ProFormTextArea
                    rules={[
                        { required: true },
                        { message: "Please entry " }
                    ]}
                    name="remark"
                    placeholder="remark"
                />
                {showAlertInfo && <Alert
                    type="warning"
                    showIcon
                    message={`This is a message inform warning; be careful before clicking OK. You really want to ${status} the request?`}
                />}

            </ProForm>

        </Modal>
    )
} 

export default RemarkModalForm