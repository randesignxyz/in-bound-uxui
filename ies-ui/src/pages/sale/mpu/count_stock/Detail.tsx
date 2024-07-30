import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Card, Flex, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { CountStockServiceAPI } from "./service";

const { Text } = Typography 

interface Props {
    id?: number;
}

const CountStockDetail: React.FC<Props> = ({ id }) => {
    const requestActions = simpleRequestActions();
    const services = CountStockServiceAPI(requestActions);
    const [dataSource, setDataSource] = useState<StockCountDto>();
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
                <Card
                    size="small"
                    title="General Information"
                >
                    <ProDescriptions
                        dataSource={dataSource}
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
                                title: "remark",
                                dataIndex: "remark",
                                span: 3,
                                valueType: "text"
                            },
                        ]}
                    />
                </Card>
                <Card size="small" title="Sold Volume">
                    <ProDescriptions
                        dataSource={dataSource}
                        columns={[
                            {
                                title: "Quantity",
                                dataIndex: "soldQuantity"
                            },
                            {
                                title: "Useless Quantity",
                                dataIndex: "uselessQuantity",
                            },
                            {
                                title: "Total",
                                dataIndex: "totalQuantity",
                            },
                            {
                                title: "Solae Amount",
                                dataIndex: "soldAmount",
                                valueType: "money"
                            },
                            // {
                            //     title: "Exchange Rete",
                            //     dataIndex: "exchangeRete",
                            //     valueType: "money"
                            // },
                            // {
                            //     title: "Amount KH",
                            //     render: (_, r) => formatterKh.format((r.totalQuantity * r.exchangeRete)),
                            // },
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
                                title: "Begin Quantity",
                                dataIndex: "beginQuantity",
                                valueType:"digit",
                                
                            },
                            {
                                title: "Request Quantity",
                                dataIndex: "requestQuantity",
                            },
                            {
                                title: "Sole Volume",
                                dataIndex: "soldQuantity",
                                render:(_,r)=><Text  type="danger">({r.soldQuantity})</Text>
                            },
                            {
                                title: "System Quantity",
                                dataIndex: "systemQuantity"
                            },
                            {
                                title: "Actual  Quantity",
                                dataIndex: "actualQuantity",
                                render:(_,r)=><Text  type="success">{r.actualQuantity}</Text>
                            },
                           
                            
                        ]}
                    />
                </Card>
            </Flex>
        </Spin>
    )
}

export default CountStockDetail