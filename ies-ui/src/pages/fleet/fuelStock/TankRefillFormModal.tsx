import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormDigit, ProFormTextArea, ProDescriptions, ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { useEffect } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { useForm } from "antd/lib/form/Form";
import { TankTransactionCreate, TankDTO } from "./data";
import moment from "moment";
import { FleetServiceAPI } from "../service";

interface Props extends FormModalProps {
    data?: TankDTO;
    onSave: (data: TankTransactionCreate) => void;
    actionType?: number;
    id?: string;
    type?: string | "ADDNEW" | "STOCKIN",
    title?: string;
}
const TankRefileFormModal: React.FC<Props> = ({ onSave, data, title, actionType, type, id, ...props }) => {
    const [form] = useForm<TankTransactionCreate>();
    const requestActions = simpleRequestActions();
    useEffect(() => {
        props.open && initFormData();
    }, [props.open]);
    const initFormData = () => {
        form.setFieldsValue({
            quantity: undefined,
            unitPrice: undefined,
            source: undefined,
            transactionName: undefined,
            transactionType: undefined,
        });
    };
    return (
        <FormModalComp
            title={title}
            {...props}
            width={"800px"}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    tankId: data?.id || 0,
                    currentBalance: data?.currentInventory,
                    beginningBalance: data?.beginningInventory,
                }
                onSave(entry);
            }}
            onResetForm={() => {
                form.resetFields();
            }}
        >
            <ProDescriptions<TankDTO>
                dataSource={data}
                contentStyle={{ fontWeight: "bold" }}
                columns={[
                    {
                        title: "Tank Capacity",
                        key: 1,
                        dataIndex: "tankCapacity",
                        render:(_,r)=>r.tankCapacity?.toFixed(2)
                    },
                    {
                        title: "Fuel Type",
                        key: 1,
                        dataIndex: "tankUsages",
                        render: (_, r) => r.fuelType?.name
                    },
                    {
                        title: "Current Inventory",
                        key: 1,
                        dataIndex: "currentInventory",
                        render:(_,r)=>r.currentInventory?.toFixed(2)
                    },
                ]}
            />
            <ProForm
                form={form}
                submitter={false}
            >
                {actionType === 1 && (
                    <Row gutter={8}>
                        <ProFormText
                            name={"source"}
                            initialValue={"TANKFUEL"}
                            hidden
                        />
                        <ProFormText
                            name={"transactionType"}
                            initialValue={"PLUS"}
                            hidden
                        />
                        <ProFormText
                            name={"transactionName"}
                            initialValue={"Trank Refuel"}
                            hidden
                        />
                        <Col span={12}>
                            <ProFormDigit
                                name={"quantity"}
                                label="Quantity(L)"
                                rules={[{ required: true,max:(data!!.tankCapacity - data!!.currentInventory), type:"number"}]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormDatePicker
                                name={"dateRefill"}
                                label="Date Refill"
                                width={"lg"}
                                initialValue={moment()}
                                rules={[{ required: true }]}
                            />
                        </Col>
                        <Col span={24}>
                            <ProFormTextArea
                                name={"remark"}
                                label="Remark"
                            />
                        </Col>
                    </Row>
                )|| actionType === 3 && (
                        <Row gutter={6}>
                            <Col span={8}>
                                <ProFormText
                                    name={"source"}
                                    initialValue={"DEDUCTION"}
                                    hidden
                                />
                                <ProFormText
                                    name={"transactionType"}
                                    initialValue={"MINUS"}
                                    hidden
                                />
                                <ProFormDigit
                                    name={"quantity"}
                                    label="Quantity"
                                    rules={[{ 
                                        required: true,
                                    }]}
                                />
                            </Col>
                            <Col span={8}>
                                <ProFormSelect
                                    name={"transactionName"}
                                    label="Source"
                                    request={async () => {
                                        const data = await FleetServiceAPI(requestActions).lookupData({ type: "VEHICLE" });
                                        return data.filter(it => it.code === "COMPANY").map((it) => ({ value: it.name.toString(), label: it.name, key: it.id }));
                                    }}
                                />
                            </Col>
                            <Col span={6}>
                                <ProFormDatePicker
                                    name={"dateRefill"}
                                    label="Date"
                                    rules={[{ required: true }]}
                                    initialValue={moment()}
                                />
                            </Col>
                            <Col span={24}>
                                <ProFormTextArea
                                    name={"remark"}
                                    label="Remark"
                                />
                            </Col>
                        </Row>
                    )
                }
            </ProForm>
        </FormModalComp>
    );
};

export default TankRefileFormModal;        
