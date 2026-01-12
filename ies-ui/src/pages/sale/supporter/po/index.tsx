import { useAccess, useQuery } from "@umijs/max"
import { SupporterServiceAPI } from "../services"
import { simpleRequestActions } from "@/services/model"
import { PageContainer, ProColumns, ProTable } from "@ant-design/pro-components"
import { useState } from "react"
import { renderDiffOnly } from "./dynamic_render"
import { Button, Card, Col, Descriptions, Flex, Input, Radio, Row, Space } from "antd"
import moment from "moment"
import InvoiceCorrectForm from "../component/InvoiceCorrectForm"
import POAdjustForm from "../component/POAdjustForm"
import { ReloadOutlined } from "@ant-design/icons"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"

type ActionType =
    | "PO_ROLLBACK"
    | "PO_CHANGE_ITEM"
    | "INVOICE"
    | undefined;

interface ActionState {
    open: boolean;
    action?: ActionType;
}

const DetailList: React.FC<{ data: any }> = ({ data }) => {

    const columns: ProColumns<any>[] = [
        {
            title: "Changed Data",
            render: (_, record) =>
                renderDiffOnly(record.oldValue, record.newValue),
        },
    ];
    return (
        <Space direction="vertical" >
            <Card size="small" >
                <Descriptions>
                    <Descriptions.Item label="Created Date">{moment(data?.createdDate).format("YYYY-MM-DD H:mm")}</Descriptions.Item>
                    <Descriptions.Item label="Reason">{data?.remark}</Descriptions.Item>
                </Descriptions>
            </Card>

            <ProTable
                size="small"
                headerTitle={moment(data?.createdDate).format("DD-MM-YYYY")}
                columns={columns}
                dataSource={data ? [data] : []}
                pagination={false}
                rowKey="id"
                toolBarRender={false}
                search={false}
            />
        </Space>

    );
};


export default () => {
    const requestActions = simpleRequestActions();
    const access = useAccess()
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({})
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["As", filter],
        queryFn: () => SupporterServiceAPI(requestActions).page(filter),
        refetchOnWindowFocus: false,
        retry: 2
    })
    const [ip, setIp] = useState<any>();
    const [actionState, setActionState] = useState<ActionState>({
        open: false,
    });
    return (
        <PageContainer
            breadcrumbRender={false}
            title="PO Correction"
            pageHeaderRender={(prop) => {
                return <Card
                    bordered={false}
                    style={{
                        margin: "15px 40px",
                    }}
                    size="small"
                >
                    <Flex justify="space-between">
                        <Space size={12}>
                            <Input.Search placeholder="Search"
                                onSearch={(value) => {
                                    setFilter((prev) => ({
                                        criteria: {
                                            ...prev.criteria,
                                            searchValue: value,
                                        }
                                    }))
                                }}
                            />
                            <Radio.Group
                                optionType="button"
                                defaultValue={"all"}
                                onChange={(e) => {
                                    setFilter((prev) => ({
                                        criteria: {
                                            ...prev.criteria,
                                            type: e.target.value,
                                        }
                                    }))
                                }}
                                options={[
                                    { label: "All", value: "all" },
                                    { label: "PO", value: "PurchaseOrder" },
                                    { label: "Invoice", value: "Invoice" },
                                    // { label: "Lead", value: "Lead" },
                                ]}
                            />
                        </Space>
                        <Space>
                            <Button hidden={!access.can("SALE_SUPPORTER", "PO_ROLLBACK")}
                                type="link"
                                onClick={() => {
                                    setActionState({
                                        open: true,
                                        action: "PO_ROLLBACK",
                                    })
                                }}
                            >PO</Button>
                            <Button hidden={!access.can("SALE_SUPPORTER", "PO_CHANGE_ITEM")}
                                type="link"
                                onClick={() => {
                                    setActionState({
                                        open: true,
                                        action: "PO_CHANGE_ITEM",
                                    })
                                }}
                            >PO Items</Button>
                            <Button hidden={!access.can("SALE_SUPPORTER", "INVOICE_CORRECTION")}
                                type="link"
                                onClick={() => {
                                    setActionState({
                                        open: true,
                                        action: "INVOICE",
                                    })
                                }}
                            >Invoice</Button>
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                            />
                        </Space>
                    </Flex>
                </Card>
            }}
        >
            <Row gutter={6} style={{ overflow: "hidden" }}>
                <Col span={10}><ProTable
                    options={false}
                    dataSource={data?.items}
                    search={false}
                    rowSelection={{
                        type: "radio",
                        selections: ["SELECT_INVERT"],
                        selectedRowKeys: [ip?.id || data?.items[0]?.id]
                    }}
                    tableAlertRender={false}
                    pagination={{
                        pageSize: data?.pageSize,
                        total: data?.total,
                        current: (data?.page || 0) + 1,
                        onChange: (page, pageSize) => {
                            setFilter((filter) => ({
                                criteria: {
                                    ...filter.criteria,
                                },
                                pagination: {
                                    page: page,
                                    pageSize: pageSize
                                },
                            }))
                        }
                    }}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                setIp(record)
                            }
                        }
                    }}
                    rowKey={"id"}
                    columns={[
                        {
                            title: "Entity Code",
                            dataIndex: "entityCode"
                            // render: (_, r) => {
                            //     switch (r.type) {
                            //         case "PurchaseOrder":
                            //             return r.entry?.purchaseOrderCode;
                            //         case "Invoice":
                            //             return r.entry?.invoiceNo;
                            //         case "Lead":
                            //             return r.entry?.leadCode;
                            //         default:
                            //             return "";
                            //     }
                            // }
                        },
                        {
                            title: "Action",
                            dataIndex: "changeType",
                            render: (_, r) => r?.changeType === "PO_ROLLBACK" ? "Update Purchase Order Into"
                                : r.changeType === "PO_CHANGE_ITEM" ? "Update Item"
                                    : r.changeType === "LEAD_TRANSFER" ? "Transfer"
                                        : "Update Invoice"
                        },
                        {
                            title: "Issue By",
                            dataIndex: "createdBy"
                        },
                    ]}
                />
                </Col>
                <Col span={14}>
                    <Card
                        size="small"
                        bodyStyle={{
                            maxHeight: '1027px',
                            overflowY: 'auto',
                            scrollbarWidth: "thin",
                            margin: 0,
                            backgroundColor: "transparent"
                        }}
                    >
                        <DetailList data={ip || data?.items?.[0]} />
                    </Card>
                </Col>
            </Row>

            <POAdjustForm
                open={
                    actionState.open &&
                    actionState.action !== "INVOICE"
                }
                onFinish={async () => {
                    refetch?.()
                }}
                actionType={actionState.action}
                modalProps={{
                    width:
                        actionState.action === "PO_ROLLBACK" ? "80%" : "60%",
                    onCancel: () => setActionState({ open: false }),
                }}
            />

            {/* Invoice Modal */}
            <InvoiceCorrectForm
                open={
                    actionState.open && actionState.action === "INVOICE"
                }
                actionType={actionState.action}
                onFinish={async () => {
                    refetch?.()
                }}
                modalProps={{
                    width: "80%",
                    onCancel: () => setActionState({ open: false }),
                }}
            />
        </PageContainer>
    )
}