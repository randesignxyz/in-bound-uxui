import { simpleRequestActions } from "@/services/model";
import { ActionType, ModalForm, ProDescriptions, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { Alert, Button, Card, Col, Flex, message, Row, Space, Spin, Tag, Timeline, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { CountStockServiceAPI } from "./service";
import numeral from 'numeral'
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import RemarkModalForm from "../../component/RemarkModal";
import { StockCountDto } from "./data";
import { formatDate } from "@/pages/utils";
import { StatusActionForm } from "../settlement/data";

const { Text } = Typography

interface Props {
    id?: number;
}

const CountStockDetail: React.FC<Props> = ({ id }) => {
    const requestActions = simpleRequestActions();
    const services = CountStockServiceAPI(requestActions);
    const [actionForm] = useForm<StatusActionForm>();
    const [dataSource, setDataSource] = useState<StockCountDto>();
    const actionRef = useRef<ActionType>();
    const [actionState, setActionState] = useState<{
        visible?: {
            open: true;
            status: "Completed" | "Pending" | "Rejected";
        }
    }>();
    const loadData = async () => {
        setDataSource(
            await services.detail(id)
        )
    };
    useEffect(() => {
        id && loadData();
    }, [id]);



    return (
        <Spin
            spinning={requestActions.request?.loading}
        >
            <Flex gap={16} vertical>
                <Row gutter={[ 16, 16 ]}>
                    <Col sm={24} lg={18}>
                        <Card
                            size="small"
                            title="General Information"
                            extra={[
                                dataSource?.status == "Pending" && <Button
                                    type="link"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        setActionState({
                                            visible: { open: true, status: "Rejected" }
                                        });
                                    }}
                                >Reject</Button>,
                            ]}
                        >
                            <ProDescriptions
                                dataSource={dataSource}
                                loading={requestActions.request?.loading}
                                actionRef={actionRef}
                                contentStyle={{
                                    fontWeight: 500
                                }}
                                columns={[
                                    {
                                        title: "Counted No",
                                        dataIndex: "countedNo"
                                    },
                                    {
                                        title: "Date Counted",
                                        dataIndex: "countedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Counted Invoices",
                                        dataIndex: "countedInvoices",
                                    },
                                    {
                                        title: "Salesperson Code",
                                        dataIndex: "salespersonCode"
                                    },
                                    {
                                        title: "Salesperson Name",
                                        dataIndex: "salespersonName"
                                    },
                                    {
                                        title: "Store Code",
                                        dataIndex: "storeCode"
                                    },
                                    {
                                        title: "Status",
                                        render: (_, r) => <Tag
                                            bordered={false}
                                            icon={
                                                r.status == "Pending" ? <SyncOutlined spin />
                                                    : r.status == "Rejected" ? <CloseCircleOutlined />
                                                        : <CheckCircleOutlined />
                                            }
                                            color={
                                                r.status == "Pending" ? "processing"
                                                    : r.status == "Rejected" ? "error"
                                                        : "success"
                                            }
                                        >{r.status}</Tag>
                                    },
                                    {
                                        title: "remark",
                                        dataIndex: "remark",
                                        span: 3,
                                        valueType: "text"
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col sm={24} xs={24} lg={6}>
                        <Card size="small" style={{height:"100%"}}>
                            {
                               dataSource?.comment?.length? dataSource?.comment?.map(p=>{
                                    return <Typography.Paragraph >
                                        <Flex vertical>
                                        <Space><Text type="success">{p.createdBy}</Text>
                                        <Text italic>{formatDate(p.createdDate)}</Text>
                                        <Tag bordered={false} color="error" icon={<CloseCircleOutlined/>}>{p.type}</Tag>
                                        </Space>
                                        <Space><Text type="secondary">remark:</Text><Text>{p.description}</Text></Space>
                                        </Flex>
                                    </Typography.Paragraph>
                                })
                                :<Flex justify="center"><Text type="secondary">no remark</Text></Flex>
                            }
                        </Card>
                    </Col>

                </Row>

                <Card size="small"
                >
                    <ProDescriptions
                        dataSource={dataSource}
                        contentStyle={{
                            fontWeight: 500
                        }}
                        columns={[
                            {
                                title: "Quantity",
                                dataIndex: "soldQuantity",
                                render: (_, r) => <Text type="danger">( {numeral(r.soldQuantity).format("0,000")} )</Text>
                            },
                            {
                                title: "Total Quantity",
                                dataIndex: "totalQuantity",
                                render: (_, r) => <Text type="success">{[r.totalQuantity, "CASE"].filter(o => o).join(" ")}</Text>
                            },
                            {
                                title: "Solae Amount",
                                dataIndex: "soldAmount",
                                valueType: "money",
                                render: (_, r) => <Text type="success">$ {numeral(r.soldAmount).format("0,000.00")}</Text>
                            },
                        ]}
                    />
                </Card>
                <Card size="small">
                    <ProTable
                        size="small"
                        options={false}
                        search={false}
                        dataSource={dataSource?.items}
                        columns={[
                            {
                                title: "Batch No",
                                dataIndex: "batchNo"
                            },
                            {
                                title: "Item Name",
                                dataIndex: "itemName",
                            },
                            {
                                title: "Item Type",
                                dataIndex: "itemType",
                            },
                            {
                                title: "Begin Quantity",
                                dataIndex: "beginQuantity",
                                valueType: "digit",
                                align: "right"
                            },
                            {
                                title: "Request Quantity",
                                dataIndex: "requestQuantity",
                                align: "right"
                            },
                            {
                                title: "Sole Volume",
                                dataIndex: "soldQuantity",
                                render: (_, r) => <Text type="danger">( {r.soldQuantity} )</Text>,
                                align: "right"
                            },
                            {
                                title: "System Quantity",
                                dataIndex: "systemQuantity",
                                align: "right"
                            },
                            {
                                title: "Actual  Quantity",
                                dataIndex: "actualQuantity",
                                render: (_, r) => <Text type="success">{r.actualQuantity}</Text>,
                                align: "right"
                            },
                        ]}
                    />
                </Card>
            </Flex>

            <RemarkModalForm
                showAlertInfo
                open={actionState?.visible?.open}
                status="reject"
                onCancel={() => setActionState({ visible: undefined })}
                onSave={(data) => {
                    const entry = {
                        ...data,
                        id: dataSource?.id
                    }
                    services.reject(entry).then(() => {
                        actionRef.current?.reload?.();
                        loadData();
                        message.info("Your rejection request was a success!")
                    });

                    setActionState({ visible: undefined });
                }}
            />
        </Spin>
    )
}

export default CountStockDetail