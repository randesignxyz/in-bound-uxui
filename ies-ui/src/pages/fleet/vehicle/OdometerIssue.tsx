import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProDescriptions, ProForm, ProFormDigit, ProFormTextArea } from "@ant-design/pro-components";
import { VehicleListItem } from "./data";
import { Alert, Badge, Card, Flex, Tag } from "antd";
import { useForm } from "antd/lib/form/Form";

interface Props extends FormModalProps {
    data?: VehicleListItem;
    onSave: (data: {vId?:string, odometer: number; reason?: string }) => void
}

const OdometerIssue: React.FC<Props> = ({ onSave, data, ...props }) => {
    const [form] = useForm<{ odometer: number; reason?: string }>();
    return (
        <FormModalComp
            {...props}
            width="800px"
            title="Change New Odometer"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    vId:data?.id
                }
                onSave(entry)
            }}
        >
            <ProForm
                submitter={false}
                form={form}
            >
                <Flex vertical gap={12}>
                    <Card>
                        <ProDescriptions<VehicleListItem>
                            dataSource={data}
                            columns={[
                                {
                                    title: "Plate Number",
                                    dataIndex: "plateNumber"
                                },
                                {
                                    title: "model",
                                    dataIndex: "model"
                                },
                                {
                                    title: "Status",
                                    dataIndex: "status",
                                    render: (_, r) => <Badge
                                        status={
                                            r.status == 'Active' ? 'processing' : r.status == 'Inactive' ? 'error' : 'warning'
                                        }
                                        text={r.status}
                                    />
                                },
                                {
                                    title: "Current Operator",
                                    dataIndex: "status",
                                    render: (_, r) => r.driver ? [r.driver.firstName, r.driver.lastName].filter((it) => it).join(' ') : '-'
                                },
                                {
                                    title: "Current Odometer",
                                    dataIndex: "status",
                                    render: (_, r) => <Tag color="gold">{[r.currentMeter?.meterValue, 'km'].join(' ')}</Tag>
                                },
                            ]}
                        />
                    </Card>
                    <Alert message="You can now manually change odometer and odometer you change not effect to old data." type="info" showIcon />
                    <>
                        <ProFormDigit
                            name={"odometer"}
                            label="Odometer Change"
                            rules={[{ required: true }]}
                        />
                        <ProFormTextArea
                            name={"reason"}
                            label="Reason"
                            rules={[{ required: true }]}
                        />
                    </>
                </Flex>
            </ProForm>
        </FormModalComp>
    )
}

export default OdometerIssue