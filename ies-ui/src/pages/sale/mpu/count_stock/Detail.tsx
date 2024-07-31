import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Card, Flex, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { CountStockServiceAPI } from "./service";
import numeral from 'numeral'

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
                        contentStyle={{
                            fontWeight:500
                        }}
                        columns={[
                            {
                                title: "Quantity",
                                dataIndex: "soldQuantity",
                                render:(_,r)=><Text type="danger">({numeral(r.soldQuantity).format("0,000")})</Text>
                            },
                            // {
                            //     title: "Useless Quantity",
                            //     dataIndex: "uselessQuantity",
                            // },
                            {
                                title: "Total Quantity",
                                dataIndex: "totalQuantity",
                                render:(_,r)=><Text type="success">{[r.totalQuantity, "CASE"].filter(o=>o).join(" ")}</Text>
                            },
                            {
                                title: "Solae Amount",
                                dataIndex: "soldAmount",
                                valueType: "money",
                                render:(_,r)=><Text type="success">$ {numeral(r.soldAmount).format("0,000.00")}</Text>
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
                                title: "Item Type",
                                dataIndex: "itemType",
                            },
                            {
                                title: "Begin Quantity",
                                dataIndex: "beginQuantity",
                                valueType:"digit",
                                align:"right"
                            },
                            {
                                title: "Request Quantity",
                                dataIndex: "requestQuantity",
                                align:"right"
                            },
                            {
                                title: "Sole Volume",
                                dataIndex: "soldQuantity",
                                render:(_,r)=><Text  type="danger">({r.soldQuantity})</Text>,
                                align:"right"
                            },
                            {
                                title: "System Quantity",
                                dataIndex: "systemQuantity",
                                align:"right"
                            },
                            {
                                title: "Actual  Quantity",
                                dataIndex: "actualQuantity",
                                render:(_,r)=><Text  type="success">{r.actualQuantity}</Text>,
                                align:"right"
                            },
                        ]}
                    />
                </Card>
            </Flex>
        </Spin>
    )
}

export default CountStockDetail