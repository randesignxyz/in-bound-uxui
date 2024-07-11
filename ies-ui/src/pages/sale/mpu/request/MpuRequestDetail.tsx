import { simpleRequestActions } from "@/services/model"
import { PageContainer, ProDescriptions, ProTable } from "@ant-design/pro-components"
import { Button, Card, Col, Flex, Row, Tag } from "antd"
import { PurchaseRequestDTO, PurchaseRequestItemCreate } from "./data"
import { useEffect, useState } from "react";
import { PurChaseRequestAPIService } from "./service";
import { formatter } from "@/pages/utils";
import { history } from "@umijs/max";
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, ExclamationCircleOutlined, SyncOutlined } from "@ant-design/icons";

interface Props {
    id?: number;
    onEdit: (id: number) => void
}
const MpuRequestDetail: React.FC<Props> = ({ id, onEdit }) => {
    const requestActions = simpleRequestActions();
    const [dataSources, setDataSources] = useState<PurchaseRequestDTO>();
    const service = PurChaseRequestAPIService(requestActions);
    const loadData = async () => {
        const data = await service.fetchData(id);
        setDataSources(data);
    }
    useEffect(() => {
        id && loadData();
    }, []);

    return <PageContainer
        loading={requestActions.request?.loading}
        title={"Pruchase Request"}
        onBack={() => history.push("/sale/mpu/list")}
        extra={<>
            <Button type="link" onClick={() => onEdit?.(dataSources?.id || 0)} icon={<EditOutlined />} >Edit</Button>
        </>}
    >
        {
            dataSources && (
                <Flex gap={18} vertical>
                    <Card size="small">
                        <ProDescriptions
                            dataSource={dataSources}
                            columns={[
                                {
                                    title: "Code",
                                    dataIndex: "purchaseRequestNo"
                                },
                                {
                                    title: "Request By",
                                    dataIndex: "requestedBy"
                                },
                                {
                                    title: "Request Date",
                                    dataIndex: "requestedDate",
                                    valueType: "dateTime"
                                },
                                {
                                    title: "Status",
                                    dataIndex: "status",
                                    render: (_, r) => <Tag
                                        icon={
                                            r.status == "pending" ? <SyncOutlined spin />
                                                : r.status == "closed" ? <CheckCircleOutlined />
                                                    : r.status == "rejected" ? <CloseCircleOutlined />
                                                        : <ExclamationCircleOutlined />
                                        }
                                        bordered={false}
                                        color={
                                            r.status == "pending"
                                                ? "processing"
                                                : r.status == "closed" ? "success"
                                                    : r.status == "rejected" ? "error"
                                                        : "warning"
                                        }>{r.status.toUpperCase()}</Tag>
                                },
                            ]}
                        />
                    </Card>
                    <Card
                        size="small"
                    >
                        <Row gutter={12}>
                            <Col span={12}>
                                <ProDescriptions
                                    column={1}
                                    title={"Saleperson Information"}
                                    dataSource={dataSources}
                                    columns={[
                                        {
                                            title: "Saleperson Code",
                                            dataIndex: "assignedToCode"
                                        },
                                        {
                                            title: "Saleperson Name",
                                            dataIndex: "assignedTo"
                                        },
                                    ]}
                                />
                            </Col>
                            <Col span={12}>
                                <ProDescriptions
                                    title={"Distributor"}
                                    dataSource={dataSources}
                                    column={2}
                                    columns={[
                                        {
                                            title: "Code",
                                            dataIndex: "distributorCode"
                                        },
                                        {
                                            title: "Name",
                                            dataIndex: "distributorName"
                                        },
                                        {
                                            title: "Phone number",
                                            dataIndex: "distributorPhone"
                                        },
                                        {
                                            title: "Distination Location",
                                            render: (_, r) => [r.latitude, r.longitude].join("-")
                                        },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Card>
                    <ProTable<PurchaseRequestItemCreate>
                        search={false}
                        options={false}
                        size="small"
                        headerTitle={"Items"}
                        pagination={false}
                        dataSource={dataSources.items}
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
                                title: "UOM",
                                dataIndex: "uom"
                            },
                            {
                                title: "Quantity",
                                dataIndex: "quantity"
                            },
                            {
                                title: "Unit Price",
                                dataIndex: "pricing"
                            },
                            {
                                title: "Total",
                                render: (_, r) => formatter.format(r.quantity * r.pricing,)
                            },
                        ]}
                    />
                    <Card size='small'>
                        <Flex
                            justify='space-between'
                        >
                            <div></div>
                            <ProDescriptions<PurchaseRequestDTO>
                                column={1}
                                style={{
                                    width: "300px",
                                }}
                                labelStyle={{
                                    width: 150
                                }}
                                contentStyle={{
                                    fontWeight: "bold"
                                }}
                                dataSource={dataSources}
                                columns={[
                                    {
                                        title: "Grand Amount",
                                        dataIndex: "grandAmount",
                                        valueType: "money",
                                        render: (_, r) => r.grantAmount ? formatter.format(r.grantAmount) : "$0.00"
                                    },
                                    {
                                        title: "Discount Amount",
                                        dataIndex: "discountAmount",
                                        valueType: "percent",
                                    },
                                    {
                                        title: "Total Amount",
                                        dataIndex: "totalAmount",
                                        valueType: "money",
                                        render: (_, r) => r.totalAmount ? formatter.format(r.totalAmount,) : "$0.00"
                                    },
                                ]}
                            />
                        </Flex>
                    </Card>
                </Flex>
            )
        }
    </PageContainer>
}
export default MpuRequestDetail