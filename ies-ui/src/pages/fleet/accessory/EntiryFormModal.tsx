import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormDigit, ProFormText } from "@ant-design/pro-components"

import { Col, Row, Space, message } from 'antd';
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { VehicleServiceAPI } from "../vehicle/service";
import { CarOutlined } from "@ant-design/icons";
import UploadImagePreview from "../components/UploadImagePreview";
import { AccessoriesCreate, AccessoriesDTO } from "./data";
import { useGetState } from 'ahooks';

interface Props extends FormModalProps {
    data?: AccessoriesDTO;
    onSave: (data: AccessoriesCreate) => void;
    actionType?: String;

}



const EntryModalForm: React.FC<Props> = ({ onSave, data, actionType, ...props }) => {
    const [form] = useForm<AccessoriesCreate>();
    const requestActions = simpleRequestActions();
    const [imageId, setImageId] = useGetState("");

    useEffect(() => {
        props.open && initFormData();
        props.open && truckLoadData()
    }, [props.open]);



    const truckLoadData = async (value?: string) => {
        const response = await VehicleServiceAPI(requestActions).pageVehicle({
            criteria: { searchValue: value },
            pagination: { pageSize: 20 }
        });
        const data = response.items.map((obj) => ({
            value: obj.id,
            label: (
                <>
                    <Space>
                        <CarOutlined twoToneColor={"#eb2f96"} />
                        {`${obj.plateNumber}`}
                        {`${obj.make.name}`}-{`${obj.weight.name}`}
                    </Space>

                </>
            ),
            key: Math.random().toString()
        }))
    }



    const initFormData = () => {

        form.setFieldsValue({
            name: data?.name,
            status: data?.status || "Active",
            description: data?.description
        });
    };


    return (

        <FormModalComp
            title="Create Service Task"
            {...props}
            width={"700px"}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entity = {
                    ...dataForm,
                    id: data?.id,
                    imageId: imageId
                }
                onSave(entity)

            }}
        >

            <ProForm
                form={form}
                submitter={false}
                onReset={() => form.resetFields()}
            >

                <Row gutter={6}>
                    <Col span={18}>
                        <Row gutter={6}>
                            <Col span={24}>
                                <ProFormText
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, max: 255 }]}
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormText
                                    label="Brand"
                                    name="brand"
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormText
                                    name="code"
                                    label="Code"
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormDigit
                                    name={"quantity"}
                                    label="Quantity"
                                />
                            </Col>
                        </Row>

                    </Col>
                    <Col span={6}>
                        <UploadImagePreview
                            defualtImage="https://www.kindpng.com/picc/m/19-198905_car-accessories-icon-png-png-download-car-accessories.png"
                            style={{
                                width: "100%"
                            }}
                            onSave={async (fileId) => {
                                setImageId(fileId);
                                try {
                                    // profile && await ProfileServices.saveProfileImage({
                                    //     employeeId: profile.id,
                                    //     imageId: fileId
                                    // })(requestActions)
                                } catch (error: any) {
                                    message.error(error.message || 'failed to upload image.')
                                }
                            }}
                        />
                    </Col>
                </Row>
            </ProForm >


        </FormModalComp >
    );
};

export default EntryModalForm;        
