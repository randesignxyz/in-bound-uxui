import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProTable } from "@ant-design/pro-components"
import { Button, Card, Col, Flex, message, Row, Tag, Typography } from "antd"
import { useEffect, useState } from "react";
import { FOCServiceAPI } from "./service";
import { RotateRightOutlined } from "@ant-design/icons";
import UpdateStatusModal from "./UpdateStatusModal";

interface Props {
    id?: number;
}

const FOCDetail: React.FC<Props> = ({ id }) => {
    const requestActions = simpleRequestActions();
    const [dataSource, setDataSource] = useState<any>();
    const [focData, setFocData] = useState<FreeOfChargeTrackingDTO>();
    const [updateModalState, setUpdateModalState] = useState<{ visible?: { name: "MODAL", payloads?: FreeOfChargeTrackingDTO } }>();
    const loadData = async () => {
        const foc = await FOCServiceAPI(requestActions).fetch({ id: id });
        setFocData(foc);

    }

    useEffect(() => {
        loadData()
    }, []);
    return (
        <>
            <Flex gap={12} vertical>
                <Card
                    size="small"
                    title={"General Information"}
                    styles={{
                        header: {
                            border: "none"
                        }
                    }}
                    extra={
                        <Button size="small"
                            hidden={focData?.status == "Completed" ? true : false}
                            onClick={() =>setUpdateModalState({visible:{name:"MODAL",payloads:focData}})}
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
                                dataSource={focData}
                                column={{ md: 2, sm: 1, xs: 1, lg: 2, xl: 2, xxl: 2 }}
                                columns={[
                                    {
                                        title: "Receiver Code",
                                        dataIndex: "salespersonCode"
                                    },
                                    {
                                        title: "Receiver Name",
                                        dataIndex: "salespersonName"
                                    },
                                    {
                                        title: "Received Date",
                                        dataIndex: "receivedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Status",
                                        render: (_, r) => <Tag color={r?.status == "Pending" ? "processing" : "success"} bordered={false} >{r?.status}</Tag>
                                    }
                                ]}
                            />
                        </Col>
                        <Col md={12} xl={12} xxl={12} lg={12} sm={24}>
                            <ProDescriptions
                                loading={requestActions.request?.loading}
                                column={{ md: 2, sm: 1, xs: 1, lg: 2, xl: 2, xxl: 2 }}
                                dataSource={focData}
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
                                ]}
                            />
                        </Col>
                    </Row>
                </Card>
                <Card size="small" title={"Item "}>
                    <ProTable
                        options={false}
                        search={false}
                        pagination={false}
                        ghost
                        loading={requestActions.request?.loading}
                        size="small"
                        dataSource={focData?.items}
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
                                render: (_, r) => <Typography.Text type="warning">{r.quantity}</Typography.Text>
                            },
                            {
                                title: "UoM",
                                dataIndex: "uom",

                            },
                            // {
                            //     title: "Used",
                            //     dataIndex: "usingQty",
                            //     render: (_, r) => <Typography.Text>{r.usingQty}</Typography.Text>
                            // },
                            // {
                            //     title:"Remainder",
                            //     render:(_,r)=>
                            // },
                            // {
                            //     title: "Return",
                            //     render: (_, r) => <Typography.Text>{0}</Typography.Text>
                            // }
                        ]}
                    />
                </Card>
            </Flex>

            <UpdateStatusModal
                open={updateModalState?.visible?.name == "MODAL"}
                data={updateModalState?.visible?.payloads}
                onCancel={()=>setUpdateModalState({visible:undefined})}
                onSave={async (data) => {
                    await FOCServiceAPI(requestActions).updateStatus(data);
                    loadData?.();
                    setUpdateModalState({visible:undefined});
                    message.success("Done!")
                }}
            />
        </>
    )
}

export default FOCDetail