
import { ProForm, ProFormDatePicker, ProFormDigit, ProFormText } from "@ant-design/pro-components"

import { Button, Col, Modal, Row, message } from "antd"
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { BatteryVehicleDTO, BatteryVehicleCreate } from "./data.d";
import { simpleRequestActions } from "@/services/model";
import { SpecificationServiceAPI } from "./service";

interface Props extends FormModalProps {
    data?: BatteryVehicleDTO;
    id?: string;
    loadData: () => void,
    onSave:(data:BatteryVehicleCreate) => void

}


const BatteryModalForm: React.FC<Props> = ({ data, title, loadData: loadData, id, onSave, ...props }) => {
    const [form] = useForm();
    const requestActions = simpleRequestActions()


    useEffect(() => {
        props.open && initFormData();
        props.open && data ? data : form.resetFields(["timeInterval", "vehicleId", "serviceTask", "meterInterval"])
    }, [props.open]);



    const initFormData = () => {
        form.setFieldsValue({
            ...data
        });
    };

    return (

        <FormModalComp
            title={"Battery"}
            {...props}
            width={"600px"}
            footer={<>
                <Button onClick={()=>props.onCancel?.()}>Cancel</Button>
                <Button
                    type="primary"
                    onClick={async () => {
                        const dataForm = await form.validateFields();


                        Modal.confirm({
                            title: "Save Battery Record",
                            content: " are you sure?",

                            onOk: async() => {
                                const entry = {
                                    ...dataForm,
                                    vehicleId: id,
                                    id: data?.id
                                }

                                const response = await SpecificationServiceAPI(requestActions).saveBattery(entry) as ({
                                    data: string,
                                    message: string
                                });
                                loadData();
                                form.resetFields(["brand","code",'power'])
                                message.success(response.message);

                            }
                        })
                    }}
                >Save And New</Button>
                <Button
                    type="primary"
                    onClick={async () => {
                        const dataForm = await form.validateFields();


                        Modal.confirm({
                            title: "Are you Sure?",
                            content: "Save Record",

                            onOk: () => {
                                const entry = {
                                    ...dataForm,
                                    vehicleId: id,
                                    id: data?.id
                                }

                                onSave(entry);
                                loadData();

                            }
                        })
                    }}
                >Save</Button>
            </>}
        >

            <ProForm
                form={form}
                submitter={false}
                onReset={() => form.resetFields()}
            >
                
                <Row gutter={12} >
                  
                    <Col span={12}>
                        <ProFormText
                            name={"brand"}
                            label="Brand"
                            rules={[{required:true}]}
                        />
                        <ProFormText
                            name={"code"}
                            label="Code"
                            rules={[{required:true}]}

                        />
                        <ProFormText
                            name="power"
                            label="Power (Ah)"
                            rules={[{required:true}]}

                        />
                       
                    </Col>
                    <Col span={12}>
                        <ProFormDigit
                            max={6}
                            min={1}
                             rules={[{required:true}]}
                            name={"quantity"}
                            label="Quantity"
                        />
                        <ProFormText
                            name={"durability"}
                            label="Durability"
                        />
                        <ProFormDatePicker
                            width={"xl"}
                            name={"purchaseDate"}
                            label="Purchase Date"
                        />
                    </Col>
                </Row>
                
               
            </ProForm>

        </FormModalComp>
    );
};

export default BatteryModalForm;


