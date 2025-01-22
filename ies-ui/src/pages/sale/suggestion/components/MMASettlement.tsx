import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { StockControlLess } from "@/services/sale/data";
import { ProDescriptions, ProList, ProTable } from "@ant-design/pro-components";
import { Divider, Space, Typography } from "antd";
import { Card, Descriptions, Flex, Statistic } from "antd/lib";
import numeral from "numeral";
import { useEffect } from "react";
import { SuggestionServiceAPI } from "../services";
import { simpleRequestActions } from "@/services/model";
import { formatDate, formatDateTime } from "@/pages/utils";
import moment from "moment";
import { queryCurrent } from "@/services/user";

interface Props extends FormModalProps {
    data?: StockControlLess;
    onSave: (data: SettlementEntry) => void;
}

const MMASettlement: React.FC<Props> = ({ data, onSave, ...props }) => {
    const requestActions = simpleRequestActions();

    const loadFirstData = async () => {
        // const po = await SuggestionServiceAPI(requestActions).listPurchaseOrderStock(data?.items?.[0].stockControlId);
    }

    useEffect(() => {
        props.open && loadFirstData();
    }, [props.open]);

    return (
        <FormModalComp
            {...props}
            onSubmit={async () => {
                const cashierName = await queryCurrent();
                const entry: SettlementEntry = {
                    amount: 0.0,
                    amountKH: 0.0,
                    cashierId: -1,
                    cashierName: cashierName.login,
                    exchangeRate: 0.0,
                    isKeepForwarding: false,
                    salespersonCode: data?.owner.split("-")[0].trim(),
                    settlementDate: moment(),
                    stockControlId: data?.id,
                    stockCountId: data?.stockCountId,
                    storeId: data?.storeId,
                    items: [],
                    remark: ""
                }
                onSave(entry);
            }}
            title="Stock Review"
        >
            <Flex gap={12} vertical>
                <Card
                    size="small"
                >
                    <ProDescriptions<StockControlLess>
                        dataSource={data}
                        contentStyle={{
                            fontWeight: 500,
                        }}
                        size="small"
                        column={2}
                        columns={[
                            {
                                title: "Store Name",
                                dataIndex: "stockName"
                            },
                            {
                                title: "Distributor Name",
                                dataIndex: "Distributor Name"
                            },
                            {
                                title: "Received By",
                                dataIndex: "owner"
                            },
                            {
                                title: "Distributor Code",
                                dataIndex: "Distributor Code"
                            },
                           
                            // {
                            //     title: "Invoice Count",
                            //     render: (_, r) => <Typography.Text type='success'>{r.invoices?.length}</Typography.Text>
                            // },
                            // {
                            //     title: "Items Count",
                            //     render: (_, r) => <Typography.Text type='warning'>{r.items?.length}</Typography.Text>
                            // },
                            // {
                            //     title: "System Amount USD",
                            //     render: (_, r) => {
                            //         const invoiceAmount = data?.invoices?.reduce((acc, it) => acc + it.amount, 0) || 0;
                            //         const lostAmount = data?.adjustmentItems?.reduce((acc, it) => (acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!), 0) || 0;
                            //         const systemAmount = invoiceAmount + lostAmount;
                            //         return <Typography.Text type='success'>{numeral(systemAmount).format("$ 0,000.00")}</Typography.Text>
                            //     }
                            // },
                        ]}
                    />
                </Card>
                <Card
                    title="Item"
                    size="small"
                    styles={{
                        body: { padding: 0 }
                    }}
                >
                    <ProTable
                        search={false}
                        size="small"
                        style={{
                            paddingBlockStart: 0,
                        }}
                        ghost
                        options={false}
                        pagination={false}
                        dataSource={data?.items}
                        columns={[
                            {
                                title: "Item Name",
                                dataIndex: "itemName"
                            },
                            {
                                title:"Request Quantity",
                                dataIndex:"requestQuantity"
                            },
                            {
                                title: "Received Qunatity",
                                dataIndex: "quantity"
                            },
                            {
                                title: "Unit Price",
                                dataIndex: "price"
                            },
                            {
                                title: "Sold Quantity",
                                dataIndex: "soldQty"
                            }
                        ]}
                    />
                </Card>
                <Card
                    title="Free of Charge"
                    styles={{
                        body: { padding: 0 }
                    }}
                    size="small"
                >
                    <ProTable
                        search={false}
                        size="small"
                        ghost
                        options={false}
                        pagination={false}
                        dataSource={[
                            {
                                itemName:"Beef Stew Paste Original (24 Packs)",
                                quantity:12,
                                source :"Distributor",
                                borrowFrom :"Distributor"
                            },
                            {
                                itemName:"Shrimp Sour Soup (24 Packs)",
                                quantity:6,
                                source :"FOL",
                                borrowFrom :"Distributor"
                            },
                        ]}
                        columns={[
                            {
                                title: "Item Name",
                                dataIndex: "itemName"
                            },
                            {
                                title: "Actual Quantity",
                                dataIndex:"quantity"
                            },
                            {
                                title:"Usage Quantity",
                                dataIndex:"usageQuantity"
                            },
                            {
                                title: "Source",
                                dataIndex:"source"
                            },
                            // {
                            //     title:"From",
                            //     dataIndex:"borrowFrom"
                            // }
                        ]}
                    />
                </Card>

                {/* <ProList
                    size="small"
                    ghost={true}
                    itemCardProps={{
                        ghost: true
                    }}
                    request={async () => {
                        const po = await SuggestionServiceAPI(requestActions).listPurchaseOrderStock(data?.items?.[0].stockControlId);
                        return Promise.resolve({
                            data: po,
                            success: true
                        })
                    }}
                    grid={{ column: 1 }}
                    renderItem={(data) => {
                        return (
                            <Card size="small" style={{ marginBottom: 5 }}>
                                <Flex justify="space-between">
                                    <Space align="baseline">
                                        <Typography.Title level={5} >{data.distributorCode}</Typography.Title>
                                        <Typography.Text type="secondary">{data.distributorName}</Typography.Text>
                                    </Space>
                                    <Space>
                                        <Typography.Text type="warning">{formatDate(moment(data.purchaseOrderDate))}</Typography.Text>
                                        <Typography.Text type="secondary">Approved by: {data.requestedBy}</Typography.Text>
                                    </Space>
                                </Flex>
                                <Flex justify="space-between">
                                    <Descriptions column={1} size="small">
                                        <Typography.Text>Items Requested</Typography.Text>
                                        {data.items?.map(o => {
                                            return <Descriptions.Item label={o.itemName}>{o.quantity} / {numeral(o.pricing).format('$ 0,00.00')}</Descriptions.Item>
                                        })}
                                    </Descriptions>
                                    <Descriptions column={1} size="small">
                                        <Typography.Text>Free of Charge</Typography.Text>
                                        {data.foc?.map(o => {
                                            return <Descriptions.Item label={o.itemName}>{o.qty}</Descriptions.Item>
                                        })}
                                    </Descriptions>
                                </Flex>
                            </Card>
                        )
                    }}
                    metas={{
                        title: {
                            dataIndex: "distributorCode"
                        },
                        subTitle: {
                            dataIndex: "distributorName"
                        }
                    }}
                /> */}
                {/* </Card> */}
            </Flex>
        </FormModalComp >
    )
}

export default MMASettlement