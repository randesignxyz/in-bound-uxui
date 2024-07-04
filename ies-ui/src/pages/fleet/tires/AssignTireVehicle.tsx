import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProDescriptions, ProForm, ProFormCheckbox, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { Alert, Button, Card, Col, Collapse, Modal, Row } from "antd"
import TiresInterface from "../components/Tires"
import { Flex, Space } from "antd/lib"
import { simpleRequestActions } from "@/services/model"
import { useForm } from "antd/es/form/Form"
import { SpecificationServiceAPI } from "../specification/service"
import { TireAssignCreate, TireVehicleDTO } from "../specification/data"
import { useEffect, useState } from "react"
import { TireServiceAPI } from "./service"

interface Props extends FormModalProps {
    vehicleId?: string;
    onSave: (data: TireAssignCreate) => void
}

interface TireDTO {
    position?: string;
    positionVal?: string;
    operation?: string;
}

const TireAssigntoVehicleModal: React.FC<Props> = ({ vehicleId, onSave, ...props }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<TireAssignCreate>();
    const [tireInfo, setTireInfo] = useState<TireDTO>();
    const [tireList, setTireList] = useState<TireVehicleDTO[]>();
    const onLoadData = async () => {
        const data = await TireServiceAPI(requestActions).page({
            criteria: {
                advanceSearch: {
                    vehicleId: vehicleId || ""
                }
            }
        })
        setTireList(data.items);
    }
    useEffect(() => {
        props.open && onLoadData();
        props.open && form.resetFields();
    }, [props.open]);
    return (
        <FormModalComp
            {...props}
            title="Tire Configuration"
            footer={
                <Space>
                    <Button type="default" onClick={() => props.onCancel?.()}>Cancel</Button>
                    <Button type="primary"
                        onClick={async () => {

                            const dataForm = await form.validateFields();
                            if (tireInfo) {
                                const entry = {
                                    ...dataForm,
                                    vehicleId: vehicleId,
                                    tirePosition: tireInfo?.positionVal
                                }
                                Modal.confirm({
                                    title: "Save tire for vehicle",
                                    content: "are your sure record your enter is correct?",
                                    onOk: async () => {
                                        SpecificationServiceAPI(requestActions).saveVehicleTire(entry)
                                        form.resetFields();
                                        onLoadData()
                                    }
                                })
                            }
                        }}
                    >Save & New</Button>
                    <Button
                        type="primary"
                        onClick={async () => {
                            const dataForm = await form.validateFields();
                            console.log(tireInfo);
                            
                            if (tireInfo) {
                                const entry = {
                                    ...dataForm,
                                    vehicleId: vehicleId,
                                    tirePosition: tireInfo?.positionVal
                                }
                                onSave(entry);
                            }
                        }}
                    >Save</Button>
                </Space>
            }
        >
            <ProForm
                submitter={false}
                labelWrap={true}
                layout="horizontal"
                labelCol={{ span: 10 }}
                labelAlign="left"
                form={form}
            >
                <Row gutter={12}>
                    <Col span={10}>
                        <Card >

                            <ProFormDigit
                                name="tireWidth"
                                label="Tire Width"
                            />
                            <ProFormDigit
                                name={"wheelDiameter"}
                                label="Diameter"
                            />
                            <ProFormText
                                name={"brand"}
                                label="Brand"
                            />
                            <ProFormText
                                name={"code"}
                                label="Code"
                            />
                            <ProFormText
                                name={"model"}
                                label="Model"
                            />
                            <ProFormText
                                name={"durability"}
                                label="Durability"
                            />
                            <ProFormDatePicker
                                name={"productionDate"}
                                rules={[{ required: true }]}
                                label="Production Date"
                            />
                            <ProFormDatePicker
                                name={"purchaseDate"}
                                rules={[{ required: true }]}
                                label="Purchase Date"
                            />
                            <ProFormSelect
                                name={"operation"}
                                label="Operation"
                                rules={[{ required: true }]}
                                onChange={(e) => {
                                    setTireInfo((v) => ({ ...v, operation: `${e}` }));
                                }}
                                initialValue={"repair"}
                                options={[
                                    {
                                        value: "change",
                                        label: "Change Position"
                                    },
                                    {
                                        value: "rotate",
                                        label: "Rotate"
                                    },
                                    {
                                        value: "repair",
                                        label: "Repair"
                                    },
                                    {
                                        value: "regroove",
                                        label: "Regroove"
                                    },
                                ]}
                            />
                            <Collapse
                                size="small"
                                bordered={false}
                                ghost
                                expandIconPosition="right"
                                items={[
                                    {
                                        label: "Tire Condiction",
                                        children: <>
                                            <ProFormCheckbox.Group
                                                label={"Tire Condition"}
                                                initialValue={"notif"}
                                                options={[
                                                    {
                                                        value: "notif",
                                                        label: "Notiffication"
                                                    },
                                                    {
                                                        value: "sms",
                                                        label: "SMS"
                                                    },
                                                ]}
                                            />
                                            <ProFormDatePicker
                                                label="Replacement Date"
                                                name={""}
                                            />
                                        </>
                                    }
                                ]}
                            />
                        </Card>
                    </Col>

                    <Col span={14}>
                        <Flex gap={8} vertical>
                            {tireInfo == undefined && <Alert message=" Please select tire Position for operation!" type="error" />}
                            <Card>
                                <ProDescriptions
                                    dataSource={tireInfo}
                                    columns={[
                                        {
                                            label: "Position",
                                            dataIndex: "position"
                                        },
                                        {
                                            label: "Operation",
                                            dataIndex: "operation"
                                        },
                                        // {
                                        //     label: "Odometer",
                                        //     dataIndex: "odometer",
                                        //     render: (_, r) => <Tag color="gold">{[vehicle?.currentMeter?.meterValue, 'km'].join(' ')}</Tag>
                                        // },
                                    ]}
                                />

                            </Card>
                            <Card
                                size="small"
                            >
                                <p>Tires Layout</p>
                                <TiresInterface
                                    onTireClick={(d) => {
                                        const f = tireList?.find(o => d?.value == o.tirePosition)
                                        if (f) {
                                            form.setFieldsValue(f)
                                        }
                                        else {
                                            form.resetFields()
                                        }
                                        setTireInfo({
                                            position: d?.label,
                                            positionVal: d?.value,
                                            operation: "repair"
                                        })
                                    }}
                                    dataSource={tireList?.map(it => ({
                                        value: it.tirePosition,
                                        key: it.tirePosition,
                                    }))}
                                    key={Math.random()}
                                />
                            </Card>
                        </Flex>
                    </Col>
                </Row>
            </ProForm>

        </FormModalComp>
    )
}



export default TireAssigntoVehicleModal