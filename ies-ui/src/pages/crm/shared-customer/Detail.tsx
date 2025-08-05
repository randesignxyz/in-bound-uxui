import { ProDescriptions } from "@ant-design/pro-components";
import { Card, Flex, Typography } from "antd"

interface Props {
    data: any,
    onBack: () => void
}

const ShareDetailView: React.FC<Props> = (data, onBack) => {


    return (
        <>
            <Flex vertical gap={24}>
                <Card title={"Recipient"} size="small">
                    <ProDescriptions
                        dataSource={data.data}
                        columns={[
                            {
                                title: "Code",
                                render: (_, r) => r.salesperson?.code
                            },
                            {
                                title: "Name",
                                render: (_, r) => r.salesperson?.name
                            },
                            {
                                title: "Status",
                                render: (_, r) => <Typography.Text
                                    style={{
                                        color: r.status == "Pending" ? "#faad14"
                                            : r.status == "Active" ? "#52c41a"
                                                : r.status == "Accepted" ? "#1890ff"
                                                    : r.status == "Rejected" ? "#ff4d4f"
                                                        : r.status == "Revoked" ? "#d4380d"
                                                            : "#d4b106"
                                    }}
                                >{r.status}</Typography.Text>
                            },
                        ]}
                    />
                </Card>
                <Card size="small" title={"Customer Infomation"}>
                    <ProDescriptions
                        dataSource={data.data}
                        columns={[
                            {
                                title: "Code",
                                render: (_, r) => r.customer?.code
                            },
                            {
                                title: "Name",
                                render: (_, r) => r.customer?.name
                            },
                        ]}
                    />
                </Card>
                <Card size="small" title={"Share Title"}>
                    <ProDescriptions
                        dataSource={data.data}
                        columns={[
                            {
                                title: "Session Code",
                                dataIndex: "sessionId"
                            },
                            {
                                title: "From Date",
                                dataIndex: "statedDate",
                                valueType: "date"
                            },
                            {
                                title: "To Date",
                                dataIndex: "endedDate",
                                valueType: "date"
                            },

                            {
                                title: "Shared By",
                                dataIndex: "createdBy"
                            },
                            {
                                title: "Shared Date",
                                dataIndex: "createdDate",
                                valueType: "date",
                                span:2,
                            },
                            {
                                title: "Remarks",
                                dataIndex: "remark"
                            },
                        ]}
                    />
                </Card>
            </Flex>
        </>
    )
}


export default ShareDetailView