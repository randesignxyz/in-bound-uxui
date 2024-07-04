import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProForm, ProFormCheckbox, ProFormDatePicker, ProFormMoney, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { Col, Divider, Row, Space } from "antd"
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { VehicleServiceAPI } from "../vehicle/service";
import { CarOutlined } from "@ant-design/icons";
import { AccidentCreate, AccidentDTO } from "./data";
import { DriverServiceAPI } from "../driver/service";
import { VehicleListItem } from "../vehicle/data";
import FileUploader from "@/components/Attachment/FileUploader";
import { FleetServiceAPI } from "../service";
import { LookUpDataDTO } from "../data";
interface Props extends FormModalProps {
    data?: AccidentDTO;
    onSave: (data: AccidentCreate) => void;
    vehicleId:string;
}
const AccidentModalForm: React.FC<Props> = ({ onSave,vehicleId, data, ...props }) => {
    const [form] = useForm<AccidentCreate>();
    const requestActions = simpleRequestActions();
    const [vehicleBasicinfo, setVehicleBasicInfo] = useState<VehicleListItem>();
    const [lookupData, setLookupData] = useState<LookUpDataDTO[]>([]);
    const [uploadFileIds, setUploadFileIds] = useState<string[]>([]);
    useEffect(() => {
        props.open && initFormData();
        props.open && dataLoad()
        props.open && truckLoadData()
    }, [props.open]);
    const dataLoad = async () => {
        setLookupData(
            await FleetServiceAPI(requestActions).lookupData({ type: "ACCIDENT" })
        )
        setVehicleBasicInfo(
            await VehicleServiceAPI(requestActions).fetchVehicle(vehicleId)
        )
    }
    const accidentType = lookupData.filter(it => it.code === "ACCIDENTTYPE").map((it) => ({ value: it.id, label: it.name }));
    const weather = lookupData.filter(it => it.code === "WEATHER").map((it) => ({ value: it.id, label: it.name }));
    const lightCondition = lookupData.filter(it => it.code === "LIGHT").map((it) => ({ value: it.id, label: it.name }));
    const preAccident = lookupData.filter(it => it.code === "PREACCIDENT").map((it) => ({ value: it.id, label: it.name }));
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
            accidentType:data?.accidentType?.id,
            weather:data?.weather?.id,
            lightConditions: data?.lightConditions?.id,
            preAccident: data?.preAccident?.id,
            driverName:data?.driverName?.id,
        });
    };
    return (
        <FormModalComp
            title="Create Service Task"
            {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entity = {
                    ...dataForm,
                    vehicleId: vehicleId,
                    id: data?.id,
                    attacheFile: uploadFileIds
                }
                onSave(entity)
            }}
        >
            <ProForm
                form={form}
                submitter={false}
                onReset={() => form.resetFields()}
            >
                <ProDescriptions
                    column={4}
                    contentStyle={{ fontWeight:"bold" }}
                    columns={[
                        {
                            title: "Plate Number",
                            dataIndex: "plateNumber"
                        },
                        {
                            title: "Make",
                            render: (_, r) => r?.make?.name
                        },
                        {
                            title: "Model",
                            dataIndex: "model"
                        },
                        {
                            title: "Year",
                            dataIndex: "year"
                        },
                    ]}
                    dataSource={vehicleBasicinfo}
                />
                <Divider plain orientation={"left"}>Accident Infomation</Divider>
                <Row gutter={6}>
                    <Col span={24}>
                        <ProFormSelect
                            label="Driver"
                            name={"driverName"}
                            showSearch={true}
                            debounceTime={500}
                            request={async (k:{keyWord:string}) => {
                                const response = await DriverServiceAPI(requestActions).list({searchValue:k.keyWord});
                                return response.map((it) => ({
                                    value: it.id,
                                    label: [it.firstName, it.lastName, it.phone].filter(it => it).join("-")
                                }))
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={6}>
                    <Col span={6}>
                        <ProFormSelect
                            name="accidentType"
                            label="Type of Accident"
                            options={accidentType}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormSelect
                            name="weather"
                            label="Weather"
                            options={weather}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormSelect
                            name="lightConditions"
                            label="Light Conditions"
                            options={lightCondition}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormSelect
                            name="preAccident"
                            label="Pre-Accident Vehicle Action"
                            options={preAccident}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormDatePicker
                            name="accidentDate"
                            label="Accident Date Time"
                            width={"lg"}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormMoney
                            label="Cost of Maintenance"
                            name="payment"
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormCheckbox
                            name={"policeReport"}
                            label="Police Report"
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormTextArea
                            label="Location of Accident"
                            name="locationAccident"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormTextArea
                            label="Describe What Happened"
                            name="description"
                        />
                    </Col>
                    <Col
                        span={24}
                    >
                        <FileUploader service="FILE" title="Attachment file" multiple
                          onSetFiles={files => setUploadFileIds(files.map(it => it.response))} 
                        />
                    </Col>
                </Row>
            </ProForm>
        </FormModalComp>
    );
};

export default AccidentModalForm;        
