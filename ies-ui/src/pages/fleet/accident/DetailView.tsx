import AttachedFileList from "@/components/Attachment/AttachedFileList";
import { formatter, formatDate } from "@/pages/utils";
import { ProDescriptions } from "@ant-design/pro-components";
import { Card, Divider, Drawer, DrawerProps, Space } from "antd";
import { AccidentDTO } from "./data";
import { useEffect } from "react";

interface Props extends DrawerProps {
    data?:AccidentDTO
}
const DetialView: React.FC<Props> = ({ data,...props}) => {
    useEffect(()=>{
    },[props.open]);
    return (
        <Drawer
            title="Detail"
            width={720}
            {...props}
            styles={{
                body: {
                    backgroundColor: "#fafafa"
                }
            }}
        >
            <Card>
                <ProDescriptions
                    dataSource={data}
                    contentStyle={{ fontWeight: 'bold' }}
                    column={2}
                    columns={[
                        {
                            title: "Employee Number",
                            key: "employeeNumber",
                            render: (_, r) => r.driverName?.employeeNumber,
                        },
                        {
                            title: "Driver Name",
                            key: "driverName",
                            render: (_, r) => [r.driverName?.firstName, r.driverName?.lastName].filter(it => it).join("")
                        },
                        {
                            title: "Phone Number",
                            key: "phoneNumber",
                            render: (_, r) => r.driverName?.phone,
                        },
                        {
                            title: "Resign",
                            key: "resign",
                            render: (_, r) => r.driverName?.resign,
                            span: 4
                        },

                    ]}
                />
                <Divider orientation='left'>Accident Infomation</Divider>
                <ProDescriptions
                    layout='vertical'
                    contentStyle={{ fontWeight: 'bold' }}
                    columns={[
                        {
                            title: "Date ",
                            key: "date",
                            valueType: "date",
                            dataIndex: "accidentDate"
                        },
                        {
                            title: "Police Report",
                            key: "policeReport",
                            dataIndex: "policeReport",
                            render: (_, r) => r.policeReport != false ? "YES" : "NO"
                        },
                        {
                            title: "Payment Out",
                            key: "payment",
                            dataIndex: "payment",
                            render: (_, r) => formatter.format(r.payment)
                        },
                        {
                            title: "Accident Type",
                            key: "accidentType",
                            render: (_, r) => r.accidentType?.name,
                        },
                        {
                            title: "Weather",
                            key: "weather",
                            render: (_, r) => r.weather?.name,
                        },
                        {
                            title: "Light Condition",
                            key: "lightCondition",
                            render: (_, r) => r.lightConditions?.name,
                        },
                        {
                            title: "Pre-Accident",
                            key: "preAccidnet",
                            render: (_, r) => r.preAccident?.name,
                        },
                        {
                            title: "Location",
                            key: "Address",
                            dataIndex: "locationAccident",
                            span: 3
                        },
                        {
                            title: "Description",
                            key: "description",
                            dataIndex: "description"
                        },
                    ]}
                    dataSource={data}
                />
            </Card>
            <AttachedFileList
                initFiles={data?.attacheFile}
                readonly
            />
            <hr />
            <Space direction='vertical' style={{ color: "#8c8c8c" }}>
                <span>created by : {data?.createdBy}</span>
                <span>created date : {formatDate(data?.createdDate)}</span>
                <span>last modified by : {data?.lastModifiedBy}</span>
            </Space>
        </Drawer>
    )
} 

export default DetialView