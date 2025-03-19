import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProTable } from "@ant-design/pro-components"
import { Button, Card, Col, Flex, Modal, Row, Space, Tag, Typography } from "antd"
import { useEffect, useState } from "react";
import { FOCServiceAPI } from "./service";
import { PurchaseOrderServiceAPI } from "../purchase_order/services";
import { EnvironmentOutlined, RotateRightOutlined } from "@ant-design/icons";
import { CustomerServiceAPI } from "../../retailer/customer/services";
import { CrmServiceAPI } from "@/services/crm/services";

interface Props {
    id?: number;
}

const FOCDetail: React.FC<Props> = ({ id }) => {
    const requestActions = simpleRequestActions();
    const [dataSource, setDataSource] = useState<any>();
    const [customerDetail, setCustomerDetail] = useState<any>();
    const loadData = async () => {
        const data = await PurchaseOrderServiceAPI(requestActions).detail(id)
        setDataSource(data);
        const dd = await CrmServiceAPI(requestActions).findAddress({ id: data.addressId || 0 })
        setCustomerDetail(dd);
    }

    useEffect(() => {
        loadData()
    }, []);

    return (
        <>
            <Flex gap={12} vertical>
                <Card
                    size="small"
                    styles={{
                        header: {
                            border: "none"
                        }
                    }}
                    extra={
                        <Button size="small"
                            hidden={dataSource?.foc?.[0]?.status == "Completed" ? true : false}
                            onClick={() => {
                                Modal.confirm({
                                    title: `Return FOC To ${dataSource.distributorCode}`,
                                    content: <Space direction="vertical">
                                        <Typography.Text>Make return stock to distrubutor for closed foc.</Typography.Text>
                                        <Typography.Text type="warning">are you sure?</Typography.Text>
                                    </Space>,
                                    onOk: async () => {
                                        FOCServiceAPI(requestActions).closedFOC({ id: dataSource.id });
                                        // actionRef.current?.reload?.();
                                    }
                                })
                            }}
                            type="link" icon={<RotateRightOutlined />}>Close</Button>
                    }
                >
                    <Row gutter={12} >
                        <Col md={12} xl={12} xxl={12} lg={12} sm={24}>
                            <ProDescriptions
                                loading={requestActions.request?.loading}
                                contentStyle={{
                                    fontWeight: 500
                                }}
                                dataSource={dataSource}
                                column={{ md: 2, sm: 1, xs: 1, lg: 2, xl: 2, xxl: 2 }}
                                columns={[
                                    {
                                        title: "Receiver Code",
                                        dataIndex: "assignedToCode"
                                    },
                                    {
                                        title: "Receiver Name",
                                        dataIndex: "assignedTo"
                                    },
                                    {
                                        title: "Received Date",
                                        dataIndex: "requestedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Status",
                                        render: (_, r) => <Tag color={r.foc?.[0]?.status == "Pending" ? "processing" : "success"} bordered={false} >{r.foc?.[0]?.status}</Tag>
                                    }

                                ]}
                            />
                        </Col>
                        <Col md={12} xl={12} xxl={12} lg={12} sm={24}>
                            <ProDescriptions
                                loading={requestActions.request?.loading}
                                column={{ md: 2, sm: 1, xs: 1, lg: 2, xl: 2, xxl: 2 }}
                                dataSource={dataSource}
                                contentStyle={{
                                    fontWeight: 500
                                }}
                                columns={[
                                    {
                                        title: "Distributor Code",
                                        dataIndex: "distributorCode"
                                    },
                                    {
                                        title: "Distributor Name",
                                        dataIndex: "distributorName"
                                    },
                                    // {
                                    //     title: "Distributor Phone",
                                    //     span: 2,
                                    //     dataIndex: "distributorPhone"
                                    // },
                                    {
                                        title: "Shiped Address",
                                        span: 2,
                                        render: (_, r) => {
                                            const aa = [
                                                { name: 'Street:', value: customerDetail?.streetNo },
                                                { name: 'House:', value: customerDetail?.houseNo },
                                                { name: 'Village:', value: customerDetail?.village },
                                                { name: 'Commune:', value: customerDetail?.commune },
                                                { name: 'District:', value: customerDetail?.district },
                                                { name: 'Province:', value: customerDetail?.province },
                                                { name: 'Latitude:', value: customerDetail?.latitude },
                                                { name: 'Longitude:', value: customerDetail?.longitude },
                                                { name: 'Direction:', value: customerDetail?.direction },
                                                { name: 'Hotspot:', value: customerDetail?.hotspot },
                                            ]
                                                .filter((it) => it.value)
                                                .map((it) => `${it.name} ${it.value}`)
                                                .join(', ')

                                            return aa
                                        }
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                </Card>
                <Card size="small">
                    <ProTable
                        options={false}
                        search={false}
                        pagination={false}
                        ghost
                        loading={requestActions.request?.loading}
                        size="small"
                        dataSource={dataSource?.foc?.filter((p: { source: string; })=>p.source =="OFL")}
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
                                dataIndex: "quantity",
                                render: (_, r) => <Typography.Text>{r.quantity}</Typography.Text>
                            },
                            {
                                title: "Used",
                                dataIndex: "usingQty",
                                render: (_, r) => <Typography.Text>{r.usingQty}</Typography.Text>
                            },
                            // {
                            //     title:"Remainder",
                            //     render:(_,r)=>
                            // },
                            {
                                title: "Return",
                                render: (_, r) => <Typography.Text>{0}</Typography.Text>
                            }
                        ]}
                    />
                </Card>
            </Flex>
        </>
    )
}

export default FOCDetail