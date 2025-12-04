import { EmployeeServices } from "@/pages/hrm/services"
import { AccountServiceAPI } from "@/services/account/services"
import { simpleRequestActions } from "@/services/model"
import { CloseCircleOutlined, IssuesCloseOutlined, SaveOutlined } from "@ant-design/icons"
import { FooterToolbar, ProDescriptions, ProForm, ProFormDatePicker, ProFormDateTimePicker, ProFormDependency, ProFormDigit, ProFormSelect, ProFormText, ProFormTimePicker } from "@ant-design/pro-components"
import { Button, Card, Flex } from "antd"
import { useForm } from "antd/es/form/Form"

interface Props {
    id?: number
}


const RequestForm: React.FC<Props> = ({ id }) => {
    const [form] = useForm<any>();
    const requestActions = simpleRequestActions();

    return (
        <>
            <ProForm

                form={form}
                layout="horizontal"
                labelCol={{ span: 4 }}
                labelAlign="left"
                submitter={{
                    render: () => {
                        return (
                            <FooterToolbar>
                                <Button icon={<CloseCircleOutlined />} danger>
                                    Cancel
                                </Button>
                                <Button icon={<IssuesCloseOutlined />} >
                                    Save Draft
                                </Button>
                                <Button icon={<SaveOutlined />} type="primary" >
                                    Submit
                                </Button>
                            </FooterToolbar>
                        );
                    },
                }}
            >
                <Flex gap={12} justify="space-between">
                    {/* <Flex vertical gap={12} > */}
                    {/* <Card title={"Requestor Infomation"} size="small">
                            <ProDescriptions

                                columns={[
                                    {
                                        title: "Employee Number",
                                        dataIndex: "Employee Name"
                                    },
                                    {
                                        title: ""
                                    }
                                ]}
                            />
                        </Card> */}
                    <Card size="small" title={"Driver Infomation"} style={{ width: "100%" }}>
                        <ProFormSelect
                            name={"empNo"}
                            label={"Employee Number"}
                            showSearch
                            request={async()=>{
                                const record =await AccountServiceAPI(requestActions).findUserOrGroupList({
                                    approveOnly:false,
                                    type:"user",
                                    searchValue:"reach.pheun"
                                })
                                return record.map((it)=>({
                                    label:it.id,
                                    value:it.name
                                }))
                            }}
                            placeholder={"Please Type Your Employee Number"}
                        />
                        <ProFormText
                            name={"name"}
                            label="Name"
                        />
                        <ProFormText
                            name={"email"}
                            label="Email"
                        />
                        <ProFormText
                            name={"phone"}
                            label="Phone "
                        />
                        <ProFormText
                            name={"Company Name"}
                            label="Company Name "
                        />
                        <ProFormText
                            name={"Department "}
                            label="Department"
                        />
                        <ProFormText
                            name={"Driving License No"}
                            label="Driving License No"
                        />
                    </Card>

                    {/* </Flex>
                    <Flex > */}
                    <Card title={"Booking Infomation"} size="small" style={{ width: "100%" }}>
                        <ProFormDateTimePicker
                            name={"fromDate"}
                            label={"From Date"}
                            fieldProps={{
                                format: "DD-MM-YYYY HH:mm",
                                disabledMinutes: () => {
                                    const allowed = [15, 20, 25, 30, 35, 40, 45, 50, 55];
                                    return Array.from({ length: 60 }, (_, i) => i).filter(
                                        (m) => !allowed.includes(m)
                                    );
                                },
                            }}
                        />

                        <ProFormDateTimePicker
                            name={"toDate"}
                            label={"To Date"}
                            fieldProps={{
                                format: "DD-MM-YYYY HH:mm",
                                disabledMinutes: () => {
                                    const allowed = [15, 20, 25, 30, 35, 40, 45, 50, 55];
                                    return Array.from({ length: 60 }, (_, i) => i).filter(
                                        (m) => !allowed.includes(m)
                                    );
                                },
                            }}
                        />
                        <ProFormText
                            name={"destination"}
                            label={"Destination"}
                        />
                        <ProFormText
                            name={"Purpose "}
                            label={"Purpose"}
                        />
                        <ProFormDigit
                            name={"estimated"}
                            label={"Estimated.Km "}
                        />

                        <ProFormDigit
                            name={"passengerCount"}
                            label={"Passenger Count"}
                        />

                    </Card>
                    {/* </Flex> */}

                </Flex>
            </ProForm>
        </>
    )
}


export default RequestForm