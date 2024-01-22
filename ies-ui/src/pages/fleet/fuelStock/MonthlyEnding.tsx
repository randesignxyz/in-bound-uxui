

import { ProForm, ProFormDigit, ProFormTextArea, ProDescriptions, ProFormDatePicker, ProFormDependency } from '@ant-design/pro-components';

import { Col, Row } from 'antd';
import { useEffect } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { useForm } from "antd/lib/form/Form";
import { TankDTO , TankMonthlyEndingCreate } from "./data";

interface Props extends FormModalProps {
    data?: TankDTO;
    onSave: (data: TankMonthlyEndingCreate) => void;
    actionType?: number;
    id?: string;
    type?: string | "ADDNEW" | "STOCKIN",
    title?: string;
}



const MonthlyEndingFormModal: React.FC<Props> = ({ onSave, data, title, actionType, type, id, ...props }) => {
    const [form] = useForm<TankMonthlyEndingCreate>();

    useEffect(() => {
        props.open && initFormData();
    }, [props.open]);

    const initFormData = () => {
        form.setFieldsValue({
            currentBalance:data?.currentInventory,
            actualBalance:undefined,
            adjustment:undefined,
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
                    tankId:data?.id
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
                        render:(_,r)=>r.tankCapacity?.toFixed(2)
                    },
                ]}
            />
            <ProForm
                form={form}
                submitter={false}
            >
                        <Row gutter={6}>
                        <Col span={6}>
                                <ProFormDigit
                                    name={"currentBalance"}
                                    label="Current Balance"
                                    rules={[{ required: true }]}

                                />
                            </Col>
                            <Col span={6}>
                                <ProFormDigit
                                    name={"actualBalance"}
                                    label="Actual Balance"
                                    rules={[{ required: true }]}
                                />
                            </Col>
                           
                            <ProFormDependency dependencies={['currentBalance', 'actualBalance']} name={["currentBalance", "actualBalance"]}>
                                {({ currentBalance, actualBalance }) => {
                                    const require = currentBalance != actualBalance ? true : false;
                                    const overTotal = actualBalance - currentBalance
                                    return <Col span={6}>
                                        <ProFormDigit
                                            label="adjustment"
                                            name="adjustment"
                                            rules={[{ required: require }]}
                                            fieldProps={{
                                                value: overTotal | 0
                                            }}
                                        />
                                    </Col>
                                }}

                            </ProFormDependency>
                            <Col span={6}>
                                <ProFormDatePicker
                                    name={"endingDate"}
                                    label="Closing Date"
                                    rules={[{ required: true }]}
                                />
                            </Col>
                            <Col span={24}>
                                <ProFormDependency dependencies={['currentBalance', 'actualBalance']} name={["currentBalance", "actualBalance"]}>
                                    {({ currentBalance, actualBalance }) => {
                                        const require = currentBalance != actualBalance ? true : false;
                                        return (<ProFormTextArea
                                            name={"remark"}
                                            label="Remark"
                                            width={"lg"}
                                            rules={[{ required: require }]}
                                        />)
                                    }}

                                </ProFormDependency>

                            </Col>
                        </Row>

                  

            </ProForm>



        </FormModalComp>

    );
};

export default MonthlyEndingFormModal;        
