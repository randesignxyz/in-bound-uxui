import { simpleRequestActions } from "@/services/model";
import { ActionType, ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Button, Card, Col, Flex, message, Row, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { SettlementMethodServicAPI } from "./service";
import { formatDate, formatterQty } from "@/pages/utils";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import ImagePreview from "@/components/ImagePreview";
import { formatCurrency } from "../../sale";
import RemarkModalForm from "../../component/RemarkModal";
import { SettlementMethodDetailDTO } from "./data";
const { Text } = Typography;
interface Props {
    id?: number;
}

const SettlementMethodDetail: React.FC<Props> = ({ id }) => {
    const requestActions = simpleRequestActions();
    const [dataSource, setDataSource] = useState<SettlementMethodDetailDTO>();
    const actionRef = useRef<ActionType>();
    const services = SettlementMethodServicAPI(requestActions);
    const [actionState, setActionState] = useState<{
        visible?: {
            open: true;
            status: "Completed" | "Pending" | "Rejected";
            carryData?: SettlementMethodDetailDTO
        }
    }>();
    const loadData = async () => {
        setDataSource(
            await services.detail(id)
        )
    }
    useEffect(() => {
        id && loadData();
    }, [id]);
    return (
        <Spin spinning={requestActions.request?.loading}>
            <Flex vertical gap={16}>
                <Row gutter={[16, 16]}>
                    <Col sm={24} lg={18}>
                        <Card
                            size="small"
                            title={"General Infomation"}
                            extra={[
                                dataSource?.status == "Pending" && <Button
                                    type="link"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        setActionState({
                                            visible: { open: true, status: "Completed", carryData: dataSource }
                                        });
                                    }}
                                >Confirm</Button>,
                                dataSource?.status == "Pending" && <Button
                                    type="link"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        setActionState({
                                            visible: { open: true, status: "Rejected", carryData: dataSource }
                                        });
                                    }}
                                >Reject</Button>,
                            ]}
                        >
                            <ProDescriptions
                                dataSource={dataSource}
                                actionRef={actionRef}
                                loading={requestActions.request?.loading}
                                columns={[
                                    {
                                        title: "Salesperson Code",
                                        dataIndex: "salespersonCode"
                                    },
                                    {
                                        title: "Cashier Name",
                                        dataIndex: "cashierName",
                                    },
                                    {
                                        title: "Satus",
                                        render: (_, r) => <Tag
                                            bordered={false}
                                            icon={
                                                r.status == "Pending" ? <SyncOutlined spin />
                                                    : r.status == "Completed" ? <CheckCircleOutlined />
                                                        : <CloseCircleOutlined />
                                            }
                                            color={
                                                r.status == "Pending" ? "processing"
                                                    : r.status == "Completed" ? "success"
                                                        : "error"
                                            }

                                        >{r.status}</Tag>
                                    },
                                    {
                                        title: "Amount (USD)",
                                        dataIndex: "amount",
                                        valueType: "money",
                                        render: (_, r) => <Text type="success">{formatCurrency(r.amount, "$")}</Text>
                                    },
                                    {
                                        title: "Amount (KHR)",
                                        dataIndex: "amountKH",
                                        render: (_, r) => <Text type="success">{formatterQty.format(r.amountKH)}</Text>
                                    },
                                    {
                                        title: "Remark",
                                        dataIndex: "remark",
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col sm={24} xs={24} lg={6}>
                        <Card size="small" style={{ height: "100%" }}>
                            {
                                dataSource?.comment?.length ? dataSource?.comment?.map(p => {
                                    return <Typography.Paragraph>
                                        <Flex vertical>
                                            <Space><Text type="success">{p.createdBy}</Text>
                                                <Text italic>{formatDate(p.createdDate)}</Text></Space>
                                            <Space><Text type="secondary">remark:</Text><Text>{p.description}</Text></Space>
                                        </Flex>
                                    </Typography.Paragraph>
                                })
                                    : <Flex justify="center"><Text type="secondary">no remark</Text></Flex>
                            }
                        </Card>
                    </Col>
                </Row>
                <Card size="small">
                    <ProTable
                        size="small"
                        options={false}
                        search={false}
                        dataSource={dataSource?.items}
                        pagination={false}
                        footer={item => {
                            let total = 0;
                            item.forEach((t) => {
                                if (t.currency != "USD") {
                                    total += (t.amount / t.exchangeRate)
                                }
                                else {
                                    total += t.amount
                                }
                            });
                            return <Flex justify="flex-end">
                                <Space>
                                    <Text>Total:</Text>
                                    <Text type="success" strong> {formatCurrency(total, "$")}</Text>
                                </Space>
                            </Flex>
                        }}
                        columns={[
                            {
                                title: "Settlement Method",
                                dataIndex: "settlementMethod"
                            },
                            {
                                title: "Bank Name",
                                dataIndex: "bankName"
                            },
                            {
                                title: "Reference No",
                                dataIndex: "referenceNo"
                            },
                            {
                                title: "Currency",
                                dataIndex: "currency",
                            },
                            {
                                title: "Amount (KHR)",
                                dataIndex: "amount",
                                align: "right",
                                render: (_, r) => r.currency === "KHR" ? formatterQty.format(r.amount) : "-"
                            },
                            {
                                title: "Amount (USD)",
                                dataIndex: "amount",
                                align: "right",
                                render: (_, r) => r.currency !== "KHR" ? formatCurrency(r.amount, "") : "-"
                            },
                            {
                                title: "Exchange Rate",
                                align: "right",
                                render: (_, r) => r.exchangeRate == 1 ? "-" : r.exchangeRate
                            },
                            {
                                title: "Amount",
                                align: "right",
                                render: (_, r) => <Text type="success">{
                                    r.currency !== "USD" ?
                                        formatCurrency((r.amount / r.exchangeRate), "$")
                                        : formatCurrency(r.amount, "$")
                                }</Text>
                            },
                        ]}
                    />
                </Card>
                <Card size="small" hidden={dataSource?.attachments?.length ? false : true}>
                    <Flex wrap gap="small">
                        {
                            dataSource?.attachments?.map(p => {
                                return (<ImagePreview fileId={p} width={150} version={1} />)
                            })
                        }
                    </Flex>
                </Card>
            </Flex>
            <RemarkModalForm
                open={actionState?.visible?.open}
                showAlertInfo={false}
                onSave={async (data) => {
                    const entry = {
                        ...data,
                        id: dataSource?.id
                    }
                    if (actionState?.visible?.status == "Completed") {
                        services.confirm(entry).then(() => {
                            actionRef.current?.reload?.()
                            loadData?.();
                            message.success("Your confirmation request was a success!");
                        });
                    }
                    else {
                        services.reject(entry).then(() => {
                            actionRef.current?.reload?.()
                            loadData?.();
                            message.success("Your rejection request was a success!");
                        });
                    }
                    setActionState({ visible: undefined });
                }}
                status={actionState?.visible?.status}
            />
        </Spin>
    )
}


export default SettlementMethodDetail