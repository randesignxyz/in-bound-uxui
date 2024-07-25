import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Button, Card, Flex, Modal, Tag } from "antd";
import { useEffect, useState } from "react";
import { SettlementMethodServicAPI } from "./service";
import { formatterKh, formatterQty } from "@/pages/utils";
import AttachmentView from "@/pages/dms/attachment/AttachmentView";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import ImagePreview from "@/components/ImagePreview";
import { formatCurrency } from "../../sale";
import { FormattedNumber } from "@umijs/max";


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
        <Flex vertical gap={16}>
            <Card
                size="small"
                title={"General Infomation"}
                extra={[
                    <Button
                        type="link"
                        icon={<CheckCircleOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: "Confirm Settlements ",
                                content: 'Please review thes details and confirm that everything is in order.',
                                onOk: async () => {
                                    services.confirm(dataSource?.id)
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
                            title: "Exchange Rate",
                            dataIndex: "exchangeRate",
                            render: (_, r) => formatCurrency(r.exchangeRate, '៛')
                        },
                        {
                            title: "Amount KH",
                            dataIndex: "amountKH",
                            render: (_, r) => formatCurrency(r.amountKH, '៛')
                        },
                    ]}
                />
            </Card>
            <Card size="small">
                <ProTable
                    size="small"
                    options={false}
                    search={false}
                    dataSource={dataSource?.items}
                    // dataSource={[
                    //     {
                    //         referenceNo: 1,
                    //         settlementMethod: "4",
                    //         exchangeRate: 1,
                    //         amount: 0
                    //     }
                    // ]}
                    columns={[
                        {
                            title: "Reference No",
                            dataIndex: "referenceNo"
                        },
                        {
                            title: "Settlement Method",
                            dataIndex: "settlementMethod"
                        },
                        {
                            title: "Bank Name",
                            dataIndex: "bankName"
                        },
                        {
                            title: "Currency",
                            dataIndex: "currency",

                        },
                        {
                            title: "Amount",
                            dataIndex: "amount",
                            align: "right",
                            render: (_, r) => formatterQty.format(r.amount)
                        },
                        {
                            title: "Exchange Rate",
                            dataIndex: "exchangeRate",
                            render: (_, r) => r.exchangeRate == 1 ? "-" : r.exchangeRate
                        },
                    ]}
                />
            </Card>
            <Card size="small" hidden={dataSource?.attachments?.length ? false : true}>
                <Flex wrap gap="small">
                    {
                        dataSource?.attachments?.map(p => {
                            return (<ImagePreview fileId={p} />)
                        })
                    }
                </Flex>
            </Card>
        </Flex>
    )
}


export default SettlementMethodDetail