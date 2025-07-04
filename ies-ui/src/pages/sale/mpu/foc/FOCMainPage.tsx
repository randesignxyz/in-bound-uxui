import PageWrapper from "@/components/PageWrapper"
import { useQuery } from "@umijs/max";
import { Button, message, Tag } from "antd"
import { useRef, useState } from "react";
import { FOCServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ActionType, LightFilter, ProFormSegmented, ProTable } from "@ant-design/pro-components";
import { RetweetOutlined, RotateRightOutlined } from "@ant-design/icons";
import FOCDetail from "./Detail";
import UpdateStatusModal from "./UpdateStatusModal";


const FOCMainPage: React.FC<{}> = () => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [filter, setFilter] = useState<TableViewSearchParams<FreeOfChargeTrackingAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const [updateModalState, setUpdateModalState] = useState<{ visible?: { name: "MODAL", payloads?: FreeOfChargeTrackingDTO } }>();
    const { data, isFetching, refetch } = useQuery(['free-of-charge-tracking', filter], () => FOCServiceAPI(requestActions).page(filter), {
        refetchOnWindowFocus: false,
        keepPreviousData: false
    });
    const expendableRender = (parent: any) => {
        return (
            <ProTable
                search={false}
                options={false}
                ghost
                dataSource={parent.items}
                pagination={false}
                columns={[
                    {
                        title: "Item Code",
                        dataIndex: "itemCode"
                    },
                    {
                        title: "Item Name",
                        dataIndex: "itemName"
                    },
                    {
                        title: "Quantity",
                        dataIndex: "quantity"
                    },
                    {
                        title: "Used",
                        dataIndex: "usingQty"
                    },
                    {
                        title: "Remaining",
                        dataIndex: "usingQty"
                    },

                ]}
            />
        );
    };
    return (
        <>
            <PageWrapper
                tabRender={(item) => [
                    {
                        action: "view",
                        tabLabel: [item?.salespersonCode, item?.salespersonName].filter(p => p).join("-"),
                        tabKey: item?.id,
                        panel: ({ onCloseTab, onUpdateTab, key }) => <FOCDetail
                            id={item?.id}
                        />
                    }
                ]}
                listView={{
                    type: "Table",
                    title: "Free of Charge List",
                    statuses: [
                        { option: { label: "All", value: "ALL" } },
                        { option: { label: "Pending", value: "Pending" } },
                        { option: { label: "Completed", value: "Completed" } },
                    ],
                    onExtraFilterRender: () => {

                        return (
                            <>
                                <LightFilter
                                    onFinish={(value) => {
                                        setFilter((v) => ({
                                            criteria: {
                                                advanceSearch: {
                                                    ...v.criteria?.advanceSearch,
                                                    sourceSupply: value.sourceSupply
                                                }
                                            }
                                        }));
                                    }}
                                >
                                    <ProFormSegmented
                                        name="sourceSupply"
                                        initialValue={"ALL"}
                                        fieldProps={{
                                            options: [
                                                { value: "ALL", label: "All" },
                                                { value: "L911154", label: "Warehouse OFL" },
                                                { value: "distributor", label: "Distributor" },
                                            ]
                                        }}
                                    />


                                </LightFilter>
                            </>
                        )
                    },
                    onRefresh: refetch,
                    onFilter(params, page, sort) {
                        setFilter(v => ({
                            criteria: {
                                searchValue: params?.searchValue,
                                advanceSearch: {
                                    status: params?.status
                                },
                                sort: sort
                            },
                            pagination: { ...page },
                            sort: sort
                        }))
                    },
                    props: {
                        dataSource: data?.items,
                        actionRef: actionRef,
                        loading: isFetching,
                        pagination: {
                            total: data?.total
                        },
                        expandable: { expandedRowRender: expendableRender },
                        columns: [
                            {
                                title: "Received By",
                                sorter: "salespersonCode",
                                actionProps: (r) => ({
                                    type: 'view',
                                    label: [r.salespersonCode, r.salespersonName].filter(p => p).join("-") || 'n/a',
                                }),
                            },
                            {
                                title: "Distributor",
                                sorter: "distributorCode",
                                render: (_, r) => [r.distributorCode, r.distributorName].filter(p => p).join("-")
                            },
                            {
                                title: "Received Date",
                                dataIndex: "receivedDate",
                                valueType: "date",
                                sorter: "receivedDate"
                            },
                            {
                                title: "Status",
                                render: (_, r) => <Tag bordered={false} color={r.status == "Completed" ? "success" : "processing"} >{r.status}</Tag>
                            },
                            {
                                title: "Action",
                                render: (_, r) => <Button size="small"
                                    hidden={r?.status == "Completed" ? true : false}
                                    onClick={() => setUpdateModalState({ visible: { name: "MODAL", payloads: r } })}
                                    type="link"
                                 icon={<RetweetOutlined />}
                                >Settle</Button>
                            }
                        ]
                    }
                }}
            />

            <UpdateStatusModal
                open={updateModalState?.visible?.name == "MODAL"}
                data={updateModalState?.visible?.payloads}
                onCancel={() => setUpdateModalState({ visible: undefined })}
                onSave={async (data) => {
                    await FOCServiceAPI(requestActions).updateStatus(data);
                    actionRef.current?.reload?.();
                    setUpdateModalState({ visible: undefined });
                    message.success("Done!")
                }}
            />
        </>
    )
}


export default FOCMainPage