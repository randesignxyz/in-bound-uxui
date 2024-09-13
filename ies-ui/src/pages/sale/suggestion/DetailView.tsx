import { StockControlLess } from "@/services/sale/data"
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { Button, Card, Flex, message, Space, Tag, Typography } from "antd"
import ExpendableTable from "./ExpendableTable"
import { useAccess } from "@umijs/max"
import { useState } from "react"
import EditItemEntryModal from "./components/EditItemEntryModal"
import useSetState from "ahooks/lib/useSetState"
import { simpleRequestActions } from "@/services/model"
import { SuggestionServiceAPI } from "./services"

interface Props {
    data?: StockControlLess;
    onView: () => void;
    onCountStock: (r?: StockControlLess) => void
}

const TaskListDetailView: React.FC<Props> = ({ data, onView, onCountStock }) => {
    const access = useAccess();
    const requestActions = simpleRequestActions();
    const services = SuggestionServiceAPI(requestActions);
    const [addNewModal, setAddNewModal] = useState<{
        open?: boolean;
        record?: StockControlLess;
    }>({});
    const [force, setForce] = useState<{ update: number }>({ update: 0 });

    return (
        <>
            <Flex gap={24} vertical>
                <Card size="small"
                    title={"Sumary Request"}
                    extra={[
                        <Space>
                            {
                                access.canAccessTabWarehouse && data?.status != "count stock" && <Button onClick={() => setAddNewModal({ open: true, record: data })} type="primary" >Set Batch Number</Button>
                            }
                            {
                                access.canAccessTabWarehouse && data?.status == "count stock" && <Button onClick={() => onCountStock(data)} type="primary" >Approved Count Stock</Button>
                            }
                        </Space>
                    ]}
                >
                    <ProDescriptions
                        dataSource={data}
                        contentStyle={{ fontWeight: 500 }}
                        columns={[
                            {
                                title: "Stock Name",
                                dataIndex: "stockName",
                                render: (_, r) => <Typography.Text type="success">{r.stockName}</Typography.Text>
                            },
                            {
                                title: "Referent No",
                                dataIndex: "referenceNo"
                            },
                            {
                                title: "Received By",
                                dataIndex: "receivedBy"
                            },
                            {
                                title: "Plate Number",
                                dataIndex: "plateNumber"
                            },
                            {
                                title: "Requested Date",
                                valueType: "date",
                                dataIndex: "requestedDate"
                            },
                            {
                                title: "Request From",
                                dataIndex: "description"
                            },
                            {
                                title: "Approved By",
                                dataIndex: "approvedBy"
                            },
                            {
                                title: "Approved Date",
                                valueType: "date",
                                dataIndex: "approvedDate",
                                span: 2,
                            },
                            {
                                title: "Items Count",
                                dataIndex: "requestedDate",
                                render: (_, r) => <Typography.Text type="warning">{data?.items?.length}</Typography.Text>
                            },
                            {
                                title: "QuastityCount ",
                                dataIndex: "requestedDate",
                                render: (_, r) => <Typography.Text type="warning">{data?.items?.reduce((p, c) => p + c.quantity, 0)}</Typography.Text>
                            },
                            {
                                title: "Status",
                                render: (_, r) => {
                                    const color =
                                        r.status === 'pending'
                                            ? 'processing'
                                            : r.status === 'open'
                                                ? 'success'
                                                : r.status === 'canceled' || r.status === 'closed'
                                                    ? 'magenta'
                                                    : 'warning';
                                    const icon = r.status === "pending" ? <SyncOutlined spin />
                                        : r.status == "open" ? <CheckCircleOutlined />
                                            : r.status == "canceled" || r.status === "closed" ? <CloseCircleOutlined />
                                                : <ExclamationCircleOutlined />
                                    return (
                                        <span>
                                            <Tag color={color}
                                                bordered={false}
                                                icon={icon}
                                            >{r.status}</Tag>
                                        </span>
                                    );
                                },
                            }
                        ]}
                    />
                </Card>

                <ExpendableTable
                    data={data}
                    onReload={() => onView()}
                    source={access.canAccessTabCashier ? "CASHIER"
                        : access.canAccessTabWarehouse ? "WAREHHOUSE"
                            : "ADMIN"}
                    onSettlement={function (data?: StockControlLess): void {
                        throw new Error("Function not implemented.")
                    }} />
            </Flex>


            <EditItemEntryModal
                key={`EditItemEntryModal`}
                open={addNewModal.open}
                onCancel={() => setAddNewModal({ open: false, record: undefined })}
                // loading={loading}
                data={addNewModal.record}
                actionHandlers={{
                    onRejectItem: async (id: number, remark: string) => {
                        try {
                            // const result = await suggestionService.doReject(id, remark);
                            // message.success(result.message);
                        } catch (e: any) {
                            message.error(e.toString());
                        }
                        if (addNewModal.record?.items?.length === 1) {
                            setAddNewModal({
                                open: false,
                                record: undefined,
                            });
                        }
                        setForce({ update: force.update + 1 });
                    },
                    onReload: () => {
                        setAddNewModal({
                            open: false,
                            record: undefined,
                        });
                        setForce({ update: force.update + 1 });
                    },
                    onAddItem: async (item) => {
                        await services.approveStockRequest(item).then(p => {
                            message.success("batch number was set to success.");
                            onView();
                        })
                        // setAddNewModal({
                        //     open: false,
                        //     record: undefined,
                        // });
                        // setForce({ update: force.update + 1 });
                    },
                }}
            />
        </>
    )
}

export default TaskListDetailView