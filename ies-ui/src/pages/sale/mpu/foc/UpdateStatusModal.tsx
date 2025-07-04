import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Alert, Modal, ModalProps, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect } from "react";


interface Props extends ModalProps {
    data?:FreeOfChargeTrackingDTO;
    onSave:(data:{id:number; remark?:string}) =>void
}

const UpdateStatusModal: React.FC<Props> = ({ onSave, data,...props }) => {
    const [form] = useForm<any>();
    useEffect(()=>{
        props.open && form.resetFields();
    },[props.open])
    return (
        <Modal
            {...props}
            onOk={async()=>{
                const dataForm = await form.validateFields();
                const entry ={
                    ...dataForm,
                    id:data?.id
                }
                onSave(entry);
            }}
            title={"Confirm Free of Charge Settlement"}
        >
            <ProForm
                submitter={false}
                form={form}
            >
                <Alert
                    type="info"
                     banner
                    description={
                        <>
                            <Typography.Text>Make return stock to distrubutor for closed foc.</Typography.Text>
                            <Typography.Text type="warning">are you sure?</Typography.Text>
                        </>
                    }
                />
                <ProFormTextArea
                    name={"remark"}
                    label={"remark"}
                />
            </ProForm>
        </Modal>
    )
}

export default UpdateStatusModal