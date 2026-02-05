import PageWrapper from "@/components/PageWrapper";
import IOSForm from "./IOSForm";
import { useQuery } from "@umijs/max";
import { IOSService } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import AdvancSearch from "./AdvancSearch";
import { Button } from "antd";
import { FileSearchOutlined, ImportOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProFormTextArea } from "@ant-design/pro-components";
import Status from "@/components/Status";
import BatchSubmitDrawer from "./BatchSubmitDrawer";


export default () => {
    const requestAction = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({});
    const [advanceSearchState, setAdvanceSearchState] = useState<{ visible?: { open: boolean, payload?: any } }>();
    const [batchSelectState, setBatchSelectState] = useState<{ visible?: { open?: boolean, ids?: number[], comment?: string, } }>();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['ipo-list', filter],
        queryFn: () => IOSService.page(filter).query(requestAction),
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 0,
        cacheTime: 0,
    })
    const [batchSubmitState, setBatchSubmitState] = useState<{ visible?: { open: boolean, ids?: number[] } }>();
    return (
        <>

            <PageWrapper
                tabRender={(item) => [
                    {
                        tabKey: item?.id?.toString(),
                        tabLabel: `${item?.empNo} - ${item?.empName}`,
                        action: "edit",
                        actionLabel: "Edit IOS",
                        panel: ({ }) => <IOSForm id={item?.id} key={Math?.random()?.toString()} />
                    },
                    {
                        tabKey: item?.id?.toString(),
                        tabLabel: `${item?.empNo} - ${item?.empName}`,
                        action: "view",
                        actionLabel: "Detail IOS",
                        panel: ({ onCloseTab, onUpdateTab, key }) => <IOSForm id={item?.id} onCancel={() => onCloseTab()} key={key} />
                    }
                ]}
                listView={{
                    type: "Table",
                    title: "IOS Performance Review",
                    onStatusRender: false,
                    statuses: [
                        { option: { value: "ALL", label: "All" } },
                        { option: { value: "PENDING", label: "Pending" } },
                        { option: { value: "IN_PROGRESS", label: "In Progress" } },
                        { option: { value: "COMPLETED", label: "Completed" } },
                    ],
                    onRefresh: refetch,
                    onFilter(params, page, sort) {
                        setFilter({
                            criteria: {
                                searchValue: params?.searchValue,
                                advanceSearch: {
                                    ...params
                                }
                            },
                            pagination: page,
                        })
                    },
                    advanceSearchButton: <Button icon={<FileSearchOutlined style={{ color: filter.criteria?.advanceSearch ? "red" : "" }} />}
                        onClick={() => setAdvanceSearchState({ visible: { open: true } })}
                    />,

                    actionButtons: [
                        <Button icon={<ImportOutlined />} type="link"
                            onClick={() => setBatchSubmitState({ visible: { open: true, ids: [] } })}
                        >Batch Submit</Button>,
                        <Button icon={<ImportOutlined />} type="link">Import</Button>
                    ],
                    props: {
                        // rowSelection: ["PENDING", "Batch Submitted", "Batch Endorsed"].includes(filter.criteria?.advanceSearch?.status) ? false : {
                        //     preserveSelectedRowKeys: true,
                        //     selectedRowKeys: batchSelectState?.visible?.ids,
                        //     onChange: (selectedRowKeys) => {
                        //         setBatchSelectState((o) => ({
                        //             ...o,
                        //             visible: {
                        //                 ...o?.visible,
                        //                 open: false,
                        //                 ids: selectedRowKeys as number[], // just set it
                        //             },
                        //         }));
                        //     },
                        // },
                        dataSource: data?.items,
                        loading: isLoading,

                        pagination: {
                            total: data?.total
                        },
                        columns: [
                            {
                                title: "Employee ID",
                                dataIndex: "empNo",
                                actionProps: (item) => ({
                                    label: item.empNo,
                                    action: "view",
                                    type: "view",

                                })
                            },
                            {
                                title: "Employee Name",
                                dataIndex: "empName"
                            },
                            {
                                title: "Position",
                                dataIndex: "jobTitle"
                            },
                            {
                                title: "Company",
                                dataIndex: "buName"
                            },

                            {
                                title: "Function",
                                dataIndex: "deptName"
                            },
                            {
                                title: "Sub Function",
                                dataIndex: "subDeptName"
                            },

                            {
                                title: "Status",
                                dataIndex: "status",
                                render: (_: any, r: any) => <Status text={r.status} />
                            },
                            {
                                title: "Action Required By",
                                dataIndex: "currentActionBy"
                            }
                        ]
                    }
                }}
            />
            <AdvancSearch {...advanceSearchState?.visible}
                onCancel={() => setAdvanceSearchState({ visible: { open: false } })}
                onFinish={async (param) => {
                    setFilter((p) => ({
                        criteria: {
                            ...p.criteria,
                            advanceSearch: { ...param }
                        }
                    }))
                }}
                onReset={() => {
                    setFilter((p) => ({
                        criteria: {
                            ...p.criteria,
                            advanceSearch: undefined
                        }
                    }))
                }}
            />

            {
                (batchSelectState?.visible?.ids?.length ?? 0 > 0) && (
                    <FooterToolbar portalDom={false} extra={<></>} >
                        <Button type="primary"
                            onClick={() => {
                                setBatchSelectState((o => ({
                                    visible: {
                                        ...o?.visible,
                                        open: true,
                                    }
                                })))
                            }}
                        >Submit</Button>
                    </FooterToolbar>
                )
            }

            <ModalForm
                open={batchSelectState?.visible?.open}
                title="Batch Submit Confirmation"
                modalProps={{
                    onCancel: () => {
                        setBatchSelectState({ visible: undefined })
                    },
                    okText: "Save",
                    cancelText: "Cancel"
                }}
                onFinish={async (param) => {
                    await IOSService.saveBatch({
                        ids: batchSelectState?.visible?.ids ?? [],
                        comment: param?.comment
                    })(requestAction);
                    setBatchSelectState({ visible: undefined })
                    refetch();
                }}
            >
                <ProFormTextArea
                    name="comment"
                    placeholder={"Comments"}
                />

            </ModalForm>

            <BatchSubmitDrawer
                open={batchSubmitState?.visible?.open}
                onOpenChange={(open) => {
                    setBatchSubmitState({ visible: { open, ids: batchSelectState?.visible?.ids } })
                }}
                width={"calc(100vw - 100px)"}
                drawerProps={{
                    onClose: () => {
                        setBatchSubmitState({ visible: undefined })
                    },
                }}
            />
        </>
    )
};
