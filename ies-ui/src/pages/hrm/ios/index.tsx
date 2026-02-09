import PageWrapper from "@/components/PageWrapper";
import IOSForm from "./IOSForm";
import { useQuery } from "@umijs/max";
import { IOSService } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import AdvancSearch from "./AdvancSearch";
import { Badge, Button, Radio, Segmented } from "antd";
import { DiffOutlined, FileSearchOutlined } from "@ant-design/icons";
import { ModalForm, ProFormTextArea } from "@ant-design/pro-components";
import Status from "@/components/Status";
import BatchSubmitDrawer from "./BatchSubmitDrawer";


export default () => {
    const requestAction = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({});
    const [advanceSearchState, setAdvanceSearchState] = useState<{ visible?: { open: boolean, payload?: any } }>();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['ipo-list', filter],
        queryFn: () => IOSService.page(filter),
        refetchOnWindowFocus: false,

    })

    const { data: fetchStatus, isLoading: isLoading2, refetch: refetch2 } = useQuery({
        queryKey: ['ipo-list'],
        queryFn: () => IOSService.fetchStatus({}).query(requestAction),
        refetchOnWindowFocus: false,

    })


    const [batchSubmitState, setBatchSubmitState] = useState<{ visible?: { open: boolean, ids?: number[] } }>();
    const [confirmSubmitState, setConfirmSubmitState] = useState<{ visible?: { open: boolean, ids?: number[], action?: string } }>();
    return (
        <>

            <PageWrapper
                tabRender={(item) => [
                    {
                        tabKey: item?.id?.toString(),
                        tabLabel: `${item?.empNo} - ${item?.empName}`,
                        action: "edit",
                        actionLabel: "Edit IOS",
                        panel: ({ }) => <IOSForm id={item?.id} />
                    },
                    {
                        tabKey: item?.id?.toString(),
                        tabLabel: `${item?.empNo} - ${item?.empName}`,
                        action: "view",
                        actionLabel: "Detail IOS",
                        panel: ({ onCloseTab }) => <IOSForm id={item?.id} onCancel={() => onCloseTab()} />
                    }
                ]}
                listView={{
                    type: "Table",
                    title: "IOS Performance Review",
                    onStatusRender: <Segmented
                        defaultValue={"ALL"}
                        style={{ overflow: 'unset !important' }}
                        onChange={(value) => {
                            setFilter((prev) => ({
                                ...prev,
                                criteria: {
                                    ...prev.criteria,
                                    status: value,
                                },
                            }));
                        }}
                        options={[
                            { value: "ALL", label: "All" },
                            {
                                value: "PENDING", label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    Pending
                                    <Badge count={fetchStatus?.pending ?? 0} size="small" />
                                </span>
                            },
                            {
                                value: "IN_PROGRESS", label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    In Progress
                                    <Badge count={fetchStatus?.inProgress ?? 0} size="small" showZero />
                                </span>
                            },
                            { value: "COMPLETED", label: "Completed" },
                        ]}
                    />,

                    // statuses: [
                    //     { option: { value: "ALL", label: "All", } },
                    //     { option: { value: "PENDING", label: "Pending" } },
                    //     { option: { value: "IN_PROGRESS", label: "In Progress" } },
                    //     { option: { value: "COMPLETED", label: "Completed" } },
                    // ],
                    onRefresh: refetch,
                    onFilter(params, page, sort) {
                        setFilter((prev) => ({
                            criteria: {
                                searchValue: params?.searchValue,
                                ...params
                            },
                            pagination: page,
                        }));
                    },
                    advanceSearchButton: <Button icon={<FileSearchOutlined style={{ color: (filter.criteria?.advanceSearch && Object.keys(filter.criteria?.advanceSearch).length > 0) ? "red" : "" }} />}
                        onClick={() => setAdvanceSearchState({ visible: { open: true } })}
                    />,

                    actionButtons: [
                        <Button icon={<DiffOutlined />} type="link"
                            onClick={() => setBatchSubmitState({ visible: { open: true, ids: [] } })}
                        >Batch Submit</Button>
                        // <Button icon={<ImportOutlined />} type="link">Import</Button>
                    ],
                    props: {

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
                param={filter.criteria?.advanceSearch}
                onCancel={() => setAdvanceSearchState({ visible: { open: false } })}
                onFinish={async (param) => {
                    setFilter((p) => ({
                        criteria: {
                            ...p.criteria,
                            advanceSearch: { ...param }
                        }
                    }))
                }}
            />

            <ModalForm
                open={confirmSubmitState?.visible?.open}
                title="Batch Submit Confirmation"
                modalProps={{
                    onCancel: () => {
                        setConfirmSubmitState({ visible: undefined })
                    },
                    okText: "Save",
                    cancelText: "Cancel"
                }}
                onFinish={async (param) => {
                    await IOSService.saveBatch({
                        ids: confirmSubmitState?.visible?.ids ?? [],
                        action: confirmSubmitState?.visible?.action ?? "",
                        comment: param?.comment
                    })(requestAction);
                    setConfirmSubmitState({ visible: undefined })
                }}
            >
                <ProFormTextArea
                    name="comment"
                    placeholder={"Comments"}
                />

            </ModalForm>
            <BatchSubmitDrawer
                open={batchSubmitState?.visible?.open}
                width={"calc(100vw - 100px)"}
                drawerProps={{
                    onClose: () => {
                        setBatchSubmitState({ visible: undefined })
                    },
                }}
                onSubmit={async (data) => {
                    setConfirmSubmitState({ visible: { open: true, ids: data.ids, action: data.action } })
                }}
            />
        </>
    )
};
