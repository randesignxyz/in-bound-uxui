import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDateTimePicker, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useForm } from "antd/es/form/Form";
import { ReminderCreate, ReminderDTO } from "./data";
import { Row, Col } from "antd";
import { useEffect } from "react";


interface Props extends FormModalProps {
    onSave: (data: ReminderCreate) => void,
    documentId?:number;
    data?:ReminderDTO
}

const ReminderModalForm: React.FC<Props> = ({ onSave,documentId, data, ...props }) => {
    const [form] = useForm<ReminderCreate>();

    useEffect(()=>{
        props.open && form.resetFields();
        props.open && data && form.setFieldsValue({...data });
    
    },[props.open])
    return (<>
        <FormModalComp
            title="Document Reminder"
            {...props}
            width="600px"
            onSubmit={async()=>{
                const dataForm = await form.validateFields();
                const entry={
                    ...dataForm,
                    documentId:documentId || data?.id
                }
                onSave(entry);
                
            }}
        >
            <ProForm
                form={form}
                submitter={false}

            >
                <Row gutter={16}>
                    <Col span={24}>
                        <ProFormText
                            name={"title"}
                            label="Title"
                            rules={[{ required: true }]}
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormDateTimePicker
                            name={"reminderDate"}
                            label="Reminder Date"
                            width={"xl"}
                            fieldProps={{
                                format: "YYYY-M-D H:m"
                            }}
                            rules={[{ required: true }]}
                        />
                    </Col>
                    
                    <Col span={24}>
                        <ProFormSelect
                            name={"type"}
                            label="Reminder Type"
                            rules={[{required:true}]}
                            initialValue={"once"}
                            options={[
                                {
                                    label:"Only Once",
                                    value:"once"
                                },
                                {
                                    label:"Every hours",
                                    value:"hours"
                                },
                                {
                                    label:"Every Day",
                                    value:"day"
                                },
                            ]}
                        />
                    </Col>
                  
                    
                   
                    <Col span={24}>
                            <ProFormDigit
                                label="Expiration Notification Period "
                                name={"period"}
                                rules={[{
                                    required:true
                                }]}
                                initialValue={1}
                                addonAfter="/days"
                            />
                    </Col>
                </Row>

                <ProFormTextArea
                    label=" Message"
                    name={"command"}
                />


            </ProForm>
        </FormModalComp>
    </>)
}

export default ReminderModalForm