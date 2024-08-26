import { formatDate } from "@/pages/utils";
import { SaleInvoiceLess, StockControlLess, StockDetailItemLess } from "@/services/sale/data"
import { ProTable } from "@ant-design/pro-components"
import { Button, Card, Flex, message, Modal, Space, Table, Typography } from "antd"
import React, { useState } from "react"
import numeral from "numeral";
import { SuggestionServiceAPI } from "./services";
import { simpleRequestActions } from "@/services/model";
import RemarkModalForm from "../component/RemarkModal";
interface Props {
    data?: StockControlLess;
    source: "ADMIN" | "WAREHHOUSE" | "CASHIER";
    actionButton?: boolean;
    onReload?: () => void;
    onSettlement:(data?:StockControlLess)=>void;
}

const ExpendableTable: React.FC<Props> = ({ data, source, onReload, onSettlement }) => {
    const requestActions = simpleRequestActions();
    const services = SuggestionServiceAPI(requestActions);

    const [remarkState, setRemarkState] = useState<{
        visible?: {
            open: boolean;
            carryData?: StockControlLess;
        }
    }>();
    const [countModal, setCountModal] = useState<{
        open?: boolean;
        record?: StockControlLess;
      }>({});
    const [settleModal, setSettleModal] = useState<{
        open?: boolean;
        record?: StockControlLess;
    }>({});

    return (
        <>
            {
                source === "ADMIN" && (
                    <ProTable
                        search={false}
                        options={false}
                        pagination={false}
                        dataSource={data?.items as StockDetailItemLess[]}
                        size="small"
                        footer={() => {
                            return (<Flex justify="flex-end">
                                <Space>
                                    {
                                        <Button
                                            danger
                                            onClick={async () => {
                                                // setRemarkState({ visible: { open: true, carryData: parent } });
                                                Modal.confirm({
                                                    title: 'Reject Suggestion.',
                                                    content: 'Are you sure?',
                                                    onOk: async () => {
                                                        services.reject(data?.id).then(p => {
                                                            message.success("The stock request was rejected.");
                                                            onReload?.();
                                                        }).catch(p => {
                                                            message.error(p.message)
                                                        });
                                                    },
                                                });
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    }
                                    <Button
                                        type="primary"
                                        onClick={async () => {
                                            Modal.confirm({
                                                title: 'Accept Suggestion.',
                                                content: 'Are you sure?',
                                                onOk: async () => {
                                                    await services.aceptRequestStock(data?.id).then(o => {
                                                        message.success("The stock request was accepted.")
                                                    }).catch(p => {
                                                        message.error(p.message)
                                                    });

                                                    onReload?.();
                                                },
                                            });
                                        }}
                                    >
                                        Approve
                                    </Button>
                                </Space>
                            </Flex>)
                        }}
                        summary={(data) => {
                            const beginningQty = data.reduce((p, c) => {
                                return p + c.beginningQty
                            }, 0);
                            const requestQty = data.reduce((p, c) => {
                                return p + c.quantity
                            }, 0);
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} align="right" colSpan={5}><Typography.Text type="secondary">Total</Typography.Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {beginningQty} )</Typography.Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {requestQty} )</Typography.Text></Table.Summary.Cell>
                                </Table.Summary.Row>
                            )
                        }}
                        columns={[
                            {
                                title: "Batch No",
                                dataIndex: "batchNo"
                            },
                            {
                                title: "Expired Date",
                                dataIndex: "expiredDate",
                                valueType: "date"
                            },
                            {
                                title: "Description",
                                dataIndex: "",
                                render: (_, r) => `${r.itemCode} - ${r.itemName} (${r.description})`
                            },
                            {
                                title: "UOM",
                                dataIndex: "uom"
                            },
                            {
                                title: "Type",
                                dataIndex: "",
                                render: (_, r) => {
                                    if ('expiredDate' in r) {
                                        return r.itemType === 131
                                            ? 'Vital'
                                            : r.itemType === 132
                                                ? 'Mee Chiet'
                                                : 'Merchandise';
                                    } else return '-';
                                },
                            },
                            {
                                title: "Beginning Qty",
                                dataIndex: "beginningQty",
                                align: "right",
                            },
                            {
                                title: "Request Qty",
                                dataIndex: "quantity",
                                align: "right",
                                render: (_, r) => {
                                    return <Typography.Text type="warning">{r.quantity}</Typography.Text>
                                }
                            },
                        ]}
                    />
                )
                || source === "CASHIER" && (<ProTable<SaleInvoiceLess>
                    search={false}
                    options={false}
                    dataSource={data?.invoices as SaleInvoiceLess[]}
                    pagination={false}
                    size="small"
                    footer={() => {
                        return <Flex justify="flex-end" gap={12}>
                            {data?.invoices?.length ? <Button onClick={() => onSettlement( data )} type="primary">Settlement</Button> : ""}
                            {data?.invoices?.length ? "" : <Button onClick={() => {
                                Modal.confirm({
                                    title: 'Settlement has no invoice.',
                                    content: 'Are you sure?',
                                    onOk: async () => {
                                      await services.onClosedRequest(data.id);
                                      onReload?.();
                                    },
                                  });
                            }} type="primary">Submit</Button>}
                        </Flex>
                    }}
                    summary={(data) => {
                        const total = data.reduce((p, c) => p = c.amount, 0);
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} align="right" colSpan={4}><Typography.Text type="secondary">Total</Typography.Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {numeral(total).format("$ 0,000.00")} )</Typography.Text></Table.Summary.Cell>
                                {/* <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {requestQty} )</Typography.Text></Table.Summary.Cell> */}
                            </Table.Summary.Row>
                        )
                    }}
                    columns={[
                        {
                            title: 'Invoice #',
                            dataIndex: 'invoiceNo',
                        },
                        {
                            title: 'Reference #',
                            dataIndex: 'referenceNo',
                        },
                        {
                            title: 'Invoice Date',
                            //dataIndex: 'invoiceNo'
                            render: (_, r) => {
                                if ('invoiceDate' in r) {
                                    return formatDate(r.invoiceDate);
                                } else return '-';
                            },
                        },
                        {
                            title: 'Salesperson',
                            render: (_, r) => {
                                if ('invoiceDate' in r) {
                                    return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
                                } else return '-';
                            },
                        },
                        {
                            title: 'Amount',
                            align: 'right',
                            render: (_, r) => {
                                if ('invoiceDate' in r) {
                                    // const amount = (dsdExchangeRate?.target_amount ?? 0) * r.amount;
                                    return `$ ${numeral(r.amount).format('0,000.00')}`;
                                } else return '-';
                            },
                        },
                    ]}
                />)

                || source === "WAREHHOUSE" && (
                    <ProTable<StockDetailItemLess>
                        search={false}
                        options={false}
                        size="small"
                        dataSource={data?.items as StockDetailItemLess[]}
                        pagination={false}
                        footer={() => {
                            return data?.comments?.length && <Card size="small">
                                {
                                    data?.comments?.map(p => {
                                        return <Typography.Text type="secondary">{p?.description}</Typography.Text>
                                    })
                                }
                            </Card>
                        }}
                        summary={(childData) => {
                            const beginningQty = childData.reduce((p, c) => {
                                return p + c.beginningQty
                            }, 0);
                            const requestQty = childData.reduce((p, c) => {
                                return p + c.quantity
                            }, 0);
                            const solQty = childData.reduce((p, c) => p + c.soldQty, 0)
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} align="right" colSpan={5}><Typography.Text type="secondary">Total :</Typography.Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {beginningQty} )</Typography.Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {requestQty} )</Typography.Text></Table.Summary.Cell>
                                    {data?.status == "count stock" && <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {solQty} )</Typography.Text></Table.Summary.Cell>}
                                </Table.Summary.Row>
                            )
                        }}
                        columns={[
                            {
                                title: "Batch No",
                                dataIndex: "batchNo"
                            },
                            {
                                title: "Expired Date",
                                dataIndex: "expiredDate",
                                valueType: "date"
                            },
                            {
                                title: "Description",
                                dataIndex: "",
                                render: (_, r) => `${r.itemCode} - ${r.itemName} (${r.description})`
                            },
                            {
                                title: "UOM",
                                dataIndex: "uom"
                            },
                            {
                                title: "Type",
                                dataIndex: "",
                                render: (_, r) => {
                                    if ('expiredDate' in r) {
                                        return r.itemType === 131
                                            ? 'Vital'
                                            : r.itemType === 132
                                                ? 'Mee Chiet'
                                                : 'Merchandise';
                                    } else return '-';
                                },
                            },
                            {
                                title: "Beginning Qty",
                                dataIndex: "beginningQty",
                                align: "right",
                            },
                            {
                                title: "Request Qty",
                                dataIndex: "quantity",
                                align: "right",
                                render: (_, r) => {
                                    return <Typography.Text type="warning">{r.quantity}</Typography.Text>
                                }
                            },
                            data?.status == "count stock" ? {
                                title: "sold Qty",
                                dataIndex: "soldQty",
                                align: "right",
                            }
                                : {},
                        ]}
                    />
                )

            }

            <RemarkModalForm
                open={remarkState?.visible?.open}
                showAlertInfo
                onCancel={() => setRemarkState({ visible: undefined })}
                status='reject'
                onSave={async (data) => {
                    services.reject({
                        id: remarkState?.visible?.carryData?.id,
                        ...data
                    }).then(o => {
                        message.success("Your rejection request was a success!")
                    });
                    setRemarkState({ visible: undefined });
                    // actionRef.current?.reload?.();
                }}
            />
            
        </>

    )
}


export default ExpendableTable


/// ================ invoice ================= 

