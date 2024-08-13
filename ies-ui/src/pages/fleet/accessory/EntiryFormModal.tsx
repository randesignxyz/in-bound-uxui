import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Col, Row, Space, message } from 'antd';
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { VehicleServiceAPI } from "../vehicle/service";
import { CarOutlined } from "@ant-design/icons";
import UploadImagePreview from "../components/UploadImagePreview";
import { AccessoriesCreate, AccessoriesDTO } from "./data";
import { useGetState } from 'ahooks';
import { AccessoryServiceAPI } from "./service";
import { AccessoryServiceAPI } from "./service";

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
        props.open && truckLoadData();
        props.open && !data && form.resetFields();
        props.open && truckLoadData();
        props.open && !data && form.resetFields();
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
            ...data,
            category:data?.category?.id
            ...data,
            category:data?.category?.id
        });
    };
    return (
        <FormModalComp
            title="Create Accessory "
            title="Create Accessory "
            {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entity = {
                    ...dataForm,
                    id: data?.id,
                    imageId: imageId
                }
                onSave(entity);
                onSave(entity);
            }}
        >
            <ProForm
                form={form}
                submitter={false}
                onReset={() => form.resetFields()}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormText
                            name={"name"}
                            label="Name"
                            rules={[{ required: true }]}
                        />
                    </Col>
                    <Col span={5}>
                        <ProFormText
                            name={"partNumber"}
                            label="Part Number"
                            rules={[{ required: true }]}
                        />
                    </Col>
                    <Col span={7}>
                        <ProFormSelect
                            name={"category"}
                            label="Category"
                            showSearch
                            debounceTime={500}
                            request={async(k:{keyWords:string})=>{
                                const data = await AccessoryServiceAPI(requestActions).pageCategory({
                                    criteria:{
                                        searchValue:k.keyWords
                                    }
                                });
                                return data.items.map(o=>({value:o.id, label:o.name}));
                            }}
                        />
                    </Col>
                    <Col span={8}>
                        <ProFormText
                            name={"brand"}
                            label="Brand"
                        />
                    </Col>
                    <Col span={8}>
                        <ProFormText
                            name={"model"}
                            label="Model"
                        />
                    </Col>
                    <Col span={8}>
                        <ProFormText
                            name={"serialNumber"}
                            label="Serial Number"
                        />
                    </Col>
                </Row>
                <Row gutter={16} >
                    <Col span={18}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <ProFormDigit
                                    name={"qty"}
                                    label="Quantity"
                                    rules={[{ required: true }]}
                                    disabled={data?true:false}
                                    initialValue={1}
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormDigit
                                    name={"unitCost"}
                                    label="Unit Cost"
                                    rules={[{ required: true }]}
                                    disabled={data?true:false}
                                    initialValue={0.0}
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormSelect
                                    name={"unitType"}
                                    label="Unit Type"
                                    rules={[{ required: true }]}
                                    options={[
                                        {
                                            label: "Each",
                                            value: "each"
                                        },
                                        {
                                            label: "Foot",
                                            value: "fott"
                                        },
                                        {
                                            label: "Galon",
                                            value: "galon"
                                        },
                                        {
                                            label: "Inch",
                                            value: "inch"
                                        },
                                        {
                                            label: "Quart",
                                            value: "quart"
                                        },
                                        {
                                            label: "Set",
                                            value: "set"
                                        },
                                    ]}
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormText
                                    name={"warehouse"}
                                    label="Warehouse"
                                    name={"warehouse"}
                                    label="Warehouse"
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormText
                                    name={"vendor"}
                                    label="Vendor"
                                    name={"vendor"}
                                    label="Vendor"
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormText
                                    name={"manufacturer"}
                                    label="Manufacturer"
                                <ProFormText
                                    name={"manufacturer"}
                                    label="Manufacturer"
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col span={6} >
                        <div style={{
                            display: "block",
                        }}>
                            <UploadImagePreview
                                defualtImage="https://www.kindpng.com/picc/m/19-198905_car-accessories-icon-png-png-download-car-accessories.png"
                                style={{
                                    width: "100%"
                                }}
                                onSave={async (fileId) => {
                                    setImageId(fileId);
                                }}
                            />
                        </div>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <ProFormTextArea
                            name="description"
                            label="Description"
                        />
                    </Col>
                </Row>
            </ProForm >
        </FormModalComp >
    );
};
export default EntryModalForm;        
