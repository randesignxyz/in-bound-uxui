import { simpleRequestActions } from "@/services/model";
import { MpuFleetStockReceiptItemLess, MpuStockControlItemLess, RsmRequestMpuDetail } from "@/services/sale/data";
import { ActionType, ProCard, ProDescriptions, ProTable, StatisticCard } from "@ant-design/pro-components";
import { Props } from "ahooks/lib/useControllableValue";
import { Col, Flex, Row, Space, Spin, Tabs, Tag } from "antd";
import { useEffect, useRef, useState } from "react";
import { MpuServiceApi } from "../services";
import TabPane from "antd/es/tabs/TabPane";
import { useSetState } from "ahooks";
import { formatter, moneyFormatter } from "@/pages/utils";

interface Amount {
    grandTotalAmount?: number;
    discountAmount?: number;
    totalAmount?: number;
  }


const StockReceiptDetail = ({ data }: { data: RsmRequestMpuDetail }) => {
    const request = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [amount, setAmount] = useState<Amount>({
        grandTotalAmount: 0,
        discountAmount: 0,
        totalAmount: 0 
    });

  return <Tabs>
        <Tabs.TabPane key="po" tab="Purchased Order">
        <ProTable<MpuStockControlItemLess[]>
            search={false}
            options={false}
            size="small"
            headerTitle={"Line Items"}
            pagination={false}
            dataSource={data.poItems}
            columns={[
                {
                    disable: true,
                    title: '',
                    search: false,
                    renderFormItem: (_, { defaultRender }) => {
                    return defaultRender(_);
                    },
                    render: (_, r) => {
                        if (r.haveBatchNo == 1) {
                            return <Space>
                                <Tag color="success" key={r.haveBatchNo}>
                                +
                                </Tag>
                            </Space>
                        } else {
                            return <Space>
                                <Tag color="error" key={r.haveBatchNo}>
                                -
                                </Tag>
                            </Space>
                        }
                    
                    },
                },
                {
                    title: "Product Name",
                    dataIndex: "itemName",
                },
                {
                    title: "Batch No",
                    dataIndex: "batchNo"
                },
                {
                    title: "UOM",
                    dataIndex: "uom"
                },
                {
                    title: "Unit Price",
                    dataIndex: "price"
                },
                {
                    title: "Quantity",
                    dataIndex: "poQuantity"
                }
            ]}
        />
        <Row gutter={12}>
            <Col span={12}>
                <ProCard
                    title={"Stock Balance"}
                    tooltip="Calculate of all Purchased Order Quantities"
                    size="small"
                >
                <StatisticCard.Group>
                
                <StatisticCard
                    statistic={{
                    title: 'Purchased Order',
                    value: data.balance.poAllQuantity
                    }}
                />
                <StatisticCard
                    statistic={{
                    title: 'Stock Receipt',
                    value: data.balance.receiptAllQuantity,
                    }}
                />
                <StatisticCard
                    statistic={{
                    title: 'Net Quantity',
                    value: data.balance.netAllQuantity,
                    }}
                />
            </StatisticCard.Group>
            </ProCard>
            </Col>
            <Col span={12}>
            <Flex
                justify='space-between'
            >
                <div></div>
                <ProDescriptions<MpuFleetStockReceiptItemLess[]>
                    column={1}
                    dataSource={data}
                    style={{
                        width: "300px",
                    }}
                    labelStyle={{
                        width: 150
                    }}
                    contentStyle={{
                        fontWeight: 500
                    }}
                    columns={[
                        {
                            title: "Grand Total",
                            valueType: "money",
                            render: (_, r) => r.grandTotalAmount ? moneyFormatter(6).format(r.grandTotalAmount,) : "$0.00"
                            
                        },
                        {
                            title: "Discount",
                            valueType: "percent",
                            render: (_, r) => `${data.discountPercent}%`
                        },
                        {
                            title: "Total",
                            dataIndex: "totalAmount",
                            valueType: "money",
                            render: (_, r) => r.totalAmount - (r.grandTotalAmount * ( data.discountPercent / 100 )) ? moneyFormatter(6).format(r.totalAmount - (r.grandTotalAmount * ( data.discountPercent / 100 )) ) : "$0.00"
                        },
                    ]}
                />
            </Flex>
            </Col>
        </Row>
    </Tabs.TabPane>
        {data.items.map((r, index) => (
            <Tabs.TabPane
                tab={"Stock Receipt :" + " " +r.receiptNumber}
                key={index}
            >
             <ProTable<MpuFleetStockReceiptItemLess[]>
             search={false}
            options={false}
            size="small"
            headerTitle={"Line Items"}
            pagination={false}
            dataSource={r.fleetReceiptPo}
            columns={[
                {
                    disable: true,
                    title: '',
                    search: false,
                    renderFormItem: (_, { defaultRender }) => {
                    return defaultRender(_);
                    },
                    render: (_, r) => {
                        if (r.haveBatchNo == 1) {
                            return <Space>
                                <Tag color="success" key={r.haveBatchNo}>
                                +
                                </Tag>
                            </Space>
                        } else {
                            return <Space>
                                <Tag color="error" key={r.haveBatchNo}>
                                -
                                </Tag>
                            </Space>
                        }
                    
                    },
                },
                {
                    title: "Product Name",
                    dataIndex: "itemName",
                },
                {
                    title: "Batch No",
                    dataIndex: "batchNo"
                },
                {
                    title: "UOM",
                    dataIndex: "uom"
                },
                {
                    title: "Unit Price",
                    dataIndex: "price"
                },
                {
                    title: "Received",
                    dataIndex: "quantity"
                },
                {
                    title: "Net Quantity",
                    render: (_, r) => {
                        if (r.haveBatchNo == 1) {
                            return r.totalQuantity
                        } else {
                            return r.poQuantity - r.quantity
                        }
                    }
                    
                },
                {
                    title: "Total Amount",
                    render: (_, r) => {
                        return "$ " + moneyFormatter(6).format(r.price * r.quantity);
                    }
                },
            ]}
        />
            <Flex
                justify='space-between'
            >
                <div></div>
                <ProDescriptions<MpuFleetStockReceiptItemLess[]>
                    column={1}
                    style={{
                        width: "300px",
                    }}
                    dataSource={r.balanceAmount}
                    labelStyle={{
                        width: 150
                    }}
                    contentStyle={{
                        fontWeight: 500
                    }}
                    columns={[
                        {
                            title: "Grand Total",
                            valueType: "money",
                            dataIndex: "grandTotalAmount",
                            render: (_, r) => "$ " + moneyFormatter(6).format(r.grandTotalAmount)
                            
                        },
                        {
                            title: "Total",
                            dataIndex: "totalAmount",
                            valueType: "money",
                            render: (_, r) => "$ " + moneyFormatter(6).format(r.totalAmount,)
                        },
                    ]}
                />
            </Flex>
            </Tabs.TabPane>    
        ))}
        
    </Tabs>

}

export default StockReceiptDetail