import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Button, Card, Flex, message, Modal, Typography } from "antd"
import { ShareCustomerAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

interface Props {
    data: any,
    onBack: () => void;
    isGroup: Boolean
}

function getRemainingWithDayJS(end: string): string {
  const now = dayjs();
  const endDate = dayjs(end);

  const diffMs = endDate.diff(now);

  if (diffMs <= 0) return 'Expired';

  const dur = dayjs.duration(diffMs);
  return `${dur.days()}d ${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
}

const ShareDetailView: React.FC<Props> = ({ data, onBack, isGroup }) => {

    const requestActions = simpleRequestActions();
    
    return (
        <>
            <Flex vertical gap={24}>
                <Card title={"Recipient"} size="small"
                    extra={
                        <>
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                type="link"
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Delete Confirmation",
                                        content: (
                                            <>
                                                This action is permanent and cannot be undone.<br />
                                                Are you sure you want to proceed?
                                            </>
                                        ),
                                        onOk: async () => {
                                            if (isGroup) {
                                                await ShareCustomerAPI(requestActions).delete({ sessionId: data.sessionId, mode: "Group" });
                                                message.success("Success!")
                                                onBack()
                                            }
                                            else {
                                                await ShareCustomerAPI(requestActions).delete({ ids: [data.id], mode: "Detail" });
                                                message.success("Success!")
                                                onBack()
                                            }

                                        }
                                    })
                                }}
                            />
                        </>
                    }
                >
                    <ProDescriptions
                        dataSource={data}
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
                            // {
                            //     title: "Expired",
                            //     render: (_, r) => getRemainingWithDayJS(r.endedDate)
                            // },
                        ]}
                    />
                </Card>
                {isGroup == false && <Card size="small" title={"Customer Infomation"}>
                    <ProDescriptions
                        dataSource={data}
                        columns={[
                            {
                                title: "Code",
                                render: (_, r) => r.customer?.code
                            },
                            {
                                title: "Name",
                                render: (_, r) => r.customer?.name
                            },
                            {
                                title: "Salesperson",
                                render: (_, r) => [r.owner?.code,r.owner?.name].filter(p=>p).join(" - ")
                            },
                        ]}
                    />
                </Card>}

                {isGroup == true && <Card size="small" title={"Customer"}>
                    <ProTable
                        dataSource={data?.entries}
                        search={false}
                        size="small"
                        options={false}
                        columns={[
                            {
                                title: "Customer Code",
                                dataIndex: "code",
                                render:(_,r)=>[r.customer?.code,r.customer?.name ].filter(p=>p).join(" - ")
                            },
                            {
                                title: "Internal Name",
                                dataIndex: "internalName",
                                render:(_,r)=>r.customer?.internalName,
                            },
                             {
                                title: "SalePerson",
                                dataIndex: "internalName",
                                  render:(_,r)=>[r.salesperson?.code,r.salesperson?.name ].filter(p=>p).join(" - ")
                            },
                            {
                                title: "Status",
                                dataIndex: "internalName",
                                render: (_, r) => r.customer?.active == "Y" ? "Active" : "Inactive"
                            },
                        ]}
                    />
                </Card>}
                <Card size="small" title={"Share Title"}>
                    <ProDescriptions
                        dataSource={data}
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
                                span: 2,
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