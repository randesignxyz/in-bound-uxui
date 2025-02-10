import { simpleRequestActions } from "@/services/model"
import { ActionType, ProCard, ProDescriptions, ProLayout, ProTable, StatisticCard } from "@ant-design/pro-components"
import { Button, Card, Col, Divider, Flex, Modal, Row, Space, Tabs, Tag, Typography } from "antd"
import { useEffect, useRef, useState } from "react";
import { formatDate, formatter, moneyFormatter } from "@/pages/utils";
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EnvironmentOutlined, ExclamationCircleOutlined, ExportOutlined, IssuesCloseOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons";
import { MpuServiceApi } from "../services";
import { MpuFleetStockReceiptItemLess, MpuStockControlItemLess, RsmRequestMpuDetail, StockReceiptBalance } from "@/services/sale/data";
import PageWrapper from "@/components/PageWrapper";
import { reduce } from "lodash";
import TabPane from "antd/es/tabs/TabPane";
import StockReceiptDetail from "./StockReceiptDetail";
const { Operation } = StatisticCard;
const { Text } = Typography;

interface Props {
    id?: number;
    onEdit: (id?: number) => void;
    openInTab?: true;
    onAdd: () => void;
}

interface Amount {
    grandTotalAmount?: number;
    discountAmount?: number;
    totalAmount?: number;
  }

const PurchaseOrderDetail: React.FC<Props> = ({ id, openInTab, onAdd, onEdit, }) => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [dataSources, setDataSources] = useState<RsmRequestMpuDetail>();
    const service = MpuServiceApi(requestActions);
    const loadData = async () => {
        const data = await service.detailRequest(id);
        setDataSources(data);
    }

    ///////////////////////////////////
    const [amount, setAmount] = useState<Amount>({
        grandTotalAmount: 0,
        discountAmount: 0,
        totalAmount: 0 
    });

    const calTotalAmount = async () => {
        const result = dataSources?.poItems
        ?.map((o) => ({
            totalAmoun1: o.price * o.poQuantity
        }))
        .reduce((p, c) => ({ totalAmoun1: p.totalAmoun1 + c.totalAmoun1 }));
        result ? setAmount((t => ({
        ...t,
        totalAmount: result.totalAmoun1,
        grandTotalAmount: result.totalAmoun1,
        discountAmount: 0
        }))
        ) : { totalAmount: 0, discountAmount: 0, grandTotalAmount: 0 }
    }

    useEffect(() => {
        id && calTotalAmount();
    });

    ///////////////////////////////////

    useEffect(() => {
        id && loadData();
    }, []);

    const renderForceCloseBtn = (status: string) => {
        if (status == "open") {
            return <Button icon={<IssuesCloseOutlined/>} size="small" type="link" onClick={()=> forceClosePo(dataSources.id)} >Force Close</Button>
        } else {
            return <Button icon={<IssuesCloseOutlined/>} disabled size="small" type="link" onClick={()=> forceClosePo(dataSources.id)} >Force Close</Button>
        }
    }

    const forceClosePo = async (id: number) => {
        return Modal.confirm({
            title:"Force Close Purchase Order",
            content:"Are you sure?",
            onOk: async () => {
                await service.forceCloseRequest(id);
                actionRef.current?.reload?.();
                loadData();
            }
            }
        )
        
    }

    // const [fleetReceiptPoData, setFleetReceiptPoData] = useState<MpuFleetStockReceiptItemLess>();
    

    // const fleetReceiptPoTab = async () => {
    //     const rfp = await dataSources?.items.map (
    //         (res) => (
    //              setFleetReceiptPoData((r => ({
    //                 ...r,
    //                 receiptNumber: res.receiptNumber,
    //                 fleetReceiptPo: res.fleetReceiptPo
    //             })))
    //         )
    //     )
    //     console.log("TESING HERE : ",rfp);
    // }

    // useEffect(() => {
    //     fleetReceiptPoTab();
    // }, [])

    // const DynamicTabPanes = (staticPanes, data) => {
    //     return staticPanes.concat(
    //       data.fleetReceiptPo.map((tab, index) => (
    //         <TabPane tab={tab.receiptNumber} key={index}>
    //           {tab.fleetReceiptPo}
    //         </TabPane>
    //       ))
    //     );
    //   };

    // const staticPanes = [
    //     <TabPane key="static-1" tab="Static Tab">
    //       Some static content
    //     </TabPane>,
    //   ];
  

    return <>
        {dataSources && (
            <Flex gap={18} vertical>
                <Card size="small"
                    extra={
                        <Space>
                            <Button icon={<EditOutlined />} size="small" type="link" onClick={() => onEdit?.(dataSources.id)} >Edit</Button>
                            {renderForceCloseBtn(dataSources.status)}
                        </Space>
                    }
                >
                    <ProDescriptions
                        dataSource={dataSources}
                        columns={[
                            {
                                title: "Code",
                                dataIndex: "referenceNo"
                            },
                            {
                                title: "Plate Number",
                                dataIndex: "plateNumber"
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
                            {
                                title: "Remark",
                                dataIndex: "description",
                                span: 3
                            },
                            {
                                span: 3,
                                render: (_, r) => {
                                    return <Space direction="vertical" size={"small"}>
                                        <div>
                                            <Text  type="secondary">created by: {r.createdBy} / </Text>
                                            <Text type="secondary">created date: {formatDate(r.createdDate)} </Text>
                                        </div>
                                        <div>
                                            <Text type="secondary">last modified by: {r.lastModifiedBy} / </Text>
                                            <Text type="secondary">last modified date: {formatDate(r.lastModifiedDate)}</Text>
                                        </div>
                                    </Space>
                                }
                            }
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
                                dataSource={dataSources.owner}
                                columns={[
                                    {
                                        title: "Saleperson Code",
                                        dataIndex: "salespersonCode"
                                    },
                                    {
                                        title: "Saleperson Name",
                                        dataIndex: "salespersonName"
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
                                        render: (_, r) => 
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${r.latitude.replace(/[&\/[\]\#,+()$~%'":*?<>{}]/g, "")}%2C${r.longitude.replace(/[&\/[\]\#,+()$~%'":*?<>{}]/g, "")}`} target="_blank" ><EnvironmentOutlined style={{ fontSize: '150%'}}/></a>
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                </Card>

                <Card size="small">
                    <StockReceiptDetail data={dataSources}/>
                </Card>
            </Flex>
        )
        }
    </>
}
export default PurchaseOrderDetail