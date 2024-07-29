import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Button, Card, Flex, Modal, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { SettlementMethodServicAPI } from "./service";
import { formatterQty } from "@/pages/utils";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import ImagePreview from "@/components/ImagePreview";
import { formatCurrency } from "../../sale";
const { Text, Link } = Typography;

interface Props {
    id?: number;
}

const SettlementMethodDetail: React.FC<Props> = ({ id }) => {
    const requestActions = simpleRequestActions();
    const [dataSource, setDataSource] = useState<SettlementMethodDetailDTO>();
    const services = SettlementMethodServicAPI(requestActions);
    const loadData = async () => {
        setDataSource(
            await services.detail(id)
        )
    }
    useEffect(() => {
        id && loadData();
    }, [id]);

    return (
        <Spin spinning={requestActions.request?.loading}>
        <Flex vertical gap={16}>
            <Card
                size="small"
                title={"General Infomation"}
                extra={[
                    <Button
                        type="link"
                        icon={<CheckCircleOutlined />}
                        disabled={dataSource?.status=="Pending"?false:true}
                        onClick={() => {
                            Modal.confirm({
                                title: "Confirm Settlements ",
                                content: 'Please review thes details and confirm that everything is in order.',
                                onOk: async () => {
                                    services.confirm(dataSource?.id);
                                    loadData();
                                }
                            })
                        }}
                    >Confirm</Button>,
                    // <Button
                    //     type="link"
                    //     danger
                    //     icon={<CheckCircleOutlined />}
                    //     onClick={()=>{
                    //         Modal.confirm({
                    //             title:"Reject Settlements ",
                    //             content:'We regret to inform you that the following settlements have been reviewed and subsequently rejected',
                    //             onOk:async()=>{
                    //                 // services.confirm(dataSource?.id)
                    //             }
                    //         })
                    //     }}
                    // >Reject</Button>,
                ]}
            >
                <ProDescriptions
                    dataSource={dataSource}
                    columns={[
                        {
                            title: "Salesperson Code",
                            dataIndex: "salespersonCode"
                        },
                        {
                            title: "Cashier Name",
                            dataIndex: "cashierName",
                        },
                        {
                            title: "Satus",
                            render: (_, r) => <Tag
                                bordered={false}
                                icon={
                                    r.status == "Pending" ? <SyncOutlined spin />
                                        : r.status == "Completed" ? <CheckCircleOutlined />
                                            : <CloseCircleOutlined />
                                }
                                color={
                                    r.status == "Pending" ? "processing"
                                        : r.status == "Completed" ? "success"
                                            : "error"
                                }

                            >{r.status}</Tag>
                        },
                        // {
                        //     title: "Keep Forwarding",
                        //     render: (_, r) => <Tag bordered={false} color={r.isKeepForwarding ? "success" : "error"} >{r.isKeepForwarding ? "YES" : "NO"}</Tag>
                        // },
                        {
                            title: "Amount",
                            dataIndex: "amount",
                            valueType: "money"
                        },
                        {
                            title: "Amount (KHR)",
                            dataIndex: "amountKH",
                            render:(_,r)=>formatterQty.format(r.amountKH)
                        },
                        // {
                        //     title: "Exchange Rate",
                        //     dataIndex: "exchangeRate",
                        //     render: (_, r) => formatCurrency(r.exchangeRate, '៛')
                        // },
                        // {
                        //     title: "Amount KH",
                        //     dataIndex: "amountKH",
                        //     render: (_, r) => formatCurrency(r.amountKH, '៛')
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
                    pagination={false}
                    footer={item=>{
                        let total =0;
                        item.forEach((t)=>{
                            if(t.currency !="USD"){
                                total += (t.amount/t.exchangeRate)
                            }
                            else{
                                total +=t.amount
                            }
                        });
                        return <Flex justify="flex-end">
                                <Space>
                                    <Text>Total:</Text>
                                    <Text  type="success" strong> {formatCurrency(total, "$")}</Text>
                                </Space>
                        </Flex>
                    }}
                    columns={[
                        
                        {
                            title: "Settlement Method",
                            dataIndex: "settlementMethod"
                        },
                        {
                            title: "Bank Name",
                            dataIndex: "bankName"
                        },
                        {
                            title: "Reference No",
                            dataIndex: "referenceNo"
                        },
                        {
                            title: "Currency",
                            dataIndex: "currency",

                        },
                        {
                            title: "Amount (KHR)",
                            dataIndex: "amount",
                            align: "right",
                            render: (_, r) => r.currency === "KHR" ? formatterQty.format(r.amount) : "-"
                        },
                        {
                            title: "Amount (USD)",
                            dataIndex: "amount",
                            align: "right",
                            render: (_, r) =>  r.currency !== "KHR" ? formatCurrency(r.amount,"") : "-"
                        },
                        {
                            title: "Exchange Rate",
                            align: "right",
                            render: (_, r) => r.exchangeRate == 1 ? "-" : r.exchangeRate
                        },
                        {
                            title: "Amount",
                            align: "right",
                            render: (_, r) =>
                                r.currency !== "USD"?
                                formatCurrency((r.amount/r.exchangeRate), "$")
                                :formatCurrency(r.amount,"$")
                        },
                    ]}
                />
            </Card>
            <Card size="small" hidden={dataSource?.attachments?.length ? false : true}>
                <Flex wrap gap="small">
                    {
                        dataSource?.attachments?.map(p => {
                            return (<ImagePreview fileId={p} width={150} version={1} />)
                        })
                    }
                </Flex>
            </Card>
        </Flex>
        </Spin>
    )
}


export default SettlementMethodDetail