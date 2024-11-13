import { formatter } from "@/pages/utils";
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Flex, Card, Tag, Typography, Row } from "antd";
import { PurchaseRequestItemCreate } from "../request/data";
import { PurchaseOrderDTO } from "./data";
import { simpleRequestActions } from "@/services/model";
import { useState, useEffect } from "react";
import { PurchaseOrderServiceAPI } from "./services";
import { Col } from "antd/lib";

interface Props {
    id?: number;
    onEdit?: () => void;
    onAdd?: () => void;
}

const MpuPoDetail: React.FC<Props> = ({ id, onEdit, onAdd }) => {
    const requestActions = simpleRequestActions();
    const services = PurchaseOrderServiceAPI(requestActions);
    const [dataSource, setDataSource] = useState<PurchaseOrderDTO>();

    const onLoad = async () => {
        const data = await services.detail(id);
        setDataSource(data);
    }
    useEffect(() => {
        id && onLoad();
    }, [id]);

    return (
        <>
            <Flex vertical gap={18}>
                <Card size="small" title="Information">
                    <Row gutter={12} style={{marginLeft:20}}>
                        <Col md={8} xs={24}>
                            <ProDescriptions
                                column={1}
                                contentStyle={{fontWeight:500}}
                                dataSource={dataSource}
                                loading={requestActions.request?.loading}
                                columns={[
                                    {
                                        title: "Purchase Order",
                                        dataIndex: "purchaseOrderCode"
                                    },
                                    {
                                        title: "Purchase Order Date",
                                        dataIndex: "purchaseOrderDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Requester",
                                        render: (_, r) => [r.requestedCode, r.requestedBy].filter(p => p).join(" - ")
                                    },
                                    {
                                        title: "Status",
                                        dataIndex: "status",
                                        render: (_, r) => <Tag
                                            icon={
                                                r.status == "pending" ? <SyncOutlined spin />
                                                    : r.status == "paid" ? <CheckCircleOutlined />
                                                        : r.status == "rejected" ? <CloseCircleOutlined />
                                                            : <ExclamationCircleOutlined />
                                            }
                                            bordered={false}
                                            color={
                                                r.status == "pending"
                                                    ? "processing"
                                                    : r.status == "paid" ? "success"
                                                        : r.status == "rejected" ? "error"
                                                            : "warning"
                                            }>{r.status?.toUpperCase()}</Tag>
                                    },
                                ]}
                            />
                        </Col>
                        <Col md={8} xs={24}>
                            <ProDescriptions
                                dataSource={dataSource}
                                loading={requestActions.request?.loading}
                                contentStyle={{fontWeight:500}}
                                column={1}
                                columns={[
                                    {
                                        title: "Distibutor Code",
                                        dataIndex: "distributorCode"
                                    },
                                    {
                                        title: "Distributor Name",
                                        dataIndex: "distributorName"
                                    },
                                    {
                                        title: "Distributor Phone",
                                        dataIndex: "distributorPhone",
                                    },
                                    {
                                        title: 'Checked In Location',
                                        render:(_,r)=><a href={`https://www.google.com/maps/search/?api=1&query=${r.latitude?.replace(/[&\/[\]\#,+()$~%'":*?<>{}]/g, "")}%2C${r.longitude?.replace(/[&\/[\]\#,+()$~%'":*?<>{}]/g, "")}`} target="_blank" ><EnvironmentOutlined  /></a>
                                        // render: (_, r) => <Typography.Paragraph copyable>{[r.latitude, r.longitude].filter(p => p).join(",")}</Typography.Paragraph>
                                    },
                                ]}
                            />
                        </Col>
                        <Col md={8} xs={24}>
                            <ProDescriptions
                                dataSource={dataSource}
                                contentStyle={{fontWeight:500}}
                                loading={requestActions.request?.loading}
                                column={1}
                                columns={[
                                    {
                                        title: "Assigned To Code",
                                        dataIndex: "assignedToCode"
                                    },
                                    {
                                        title: "Assign To ",
                                        dataIndex: "assignedTo"
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                </Card>
                <Card title="Items" size="small">
                    <ProTable<PurchaseRequestItemCreate>
                        search={false}
                        options={false}
                        size="small"
                        pagination={false}
                        dataSource={dataSource?.items}
                        columns={[
                            {
                                title: "Product Name",
                                dataIndex: "itemName",
                            },
                            {
                                title: "Category",
                                dataIndex: "stockCategoryName"
                            },
                            {
                                title: "Quantity",
                                dataIndex: "quantity",
                                render: (_, r) => <Typography.Text type="warning">{[r.quantity, r.uom?.toLowerCase()].filter(o => o).join(" ")}</Typography.Text>
                            },
                            {
                                title: "Unit Price",
                                dataIndex: "pricing",
                                valueType:"money"
                            },
                            {
                                title: "Total",
                                render: (_, r) => <Typography.Text type="success">{formatter.format(r.quantity * r.pricing,)}</Typography.Text>
                            },
                        ]}
                    />
                </Card>
              
                    {
                        (dataSource?.foc?.length || 0) > 0 && (
                            <>
                              <Card size="small" title="Free of Charge">
                                <ProTable
                                    search={false}
                                    options={false}
                                    pagination={false}
                                    size="small"
                                    dataSource={dataSource?.foc || []}
                                    columns={[
                                        {
                                            title: "Item Code",
                                            dataIndex: "itemCode"
                                        },
                                        {
                                            title: "Item Name",
                                            dataIndex: "itemName"
                                        },
                                        {
                                            title: "Quantity",
                                            dataIndex: "qty",
                                            render: (_, r) => <Typography.Text type="warning">{r.qty}</Typography.Text>
                                        },
                                        {
                                            title: "Uom",
                                            dataIndex: "uom",
                                            render:(_,r)=>r.uom?.toLowerCase()
                                        }
                                    ]}
                                />
                                </Card>
                            </>
                            
                        )
                    }
                <Card size='small'>
                    <Flex
                        justify='space-between'
                    >
                        <div></div>
                        <ProDescriptions<PurchaseOrderDTO>
                            column={1}
                            style={{
                                width: "300px",
                            }}
                            labelStyle={{
                                width: 150
                            }}
                            contentStyle={{
                                fontWeight: 500
                            }}
                            dataSource={dataSource}
                            columns={[
                                {
                                    title: "Grand Amount",
                                    dataIndex: "grandAmount",
                                    valueType: "money",
                                    render: (_, r) =><Typography.Text type="warning">{ r.grantAmount ? formatter.format(r.grantAmount) : "$0.00"}</Typography.Text>
                                },
                                {
                                    title: "Discount Amount",
                                    dataIndex: "discountAmount",
                                    valueType: "percent",
                                    render:(_,r)=> <Typography.Text type="warning">{r.discountAmount ? formatter.format(r.discountAmount) : "%0.00"}</Typography.Text>
                              
                                },
                                {
                                    title: "Total Amount",
                                    dataIndex: "totalAmount",
                                    valueType: "money",
                                    render: (_, r) => <Typography.Text type="warning">{r.totalAmount ? formatter.format(r.totalAmount,) : "$0.00"}</Typography.Text>
                                },
                            ]}
                        />
                    </Flex>
                </Card>
            </Flex>
        </>
    )
}

export default MpuPoDetail