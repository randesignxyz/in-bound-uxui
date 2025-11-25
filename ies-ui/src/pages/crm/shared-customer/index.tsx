import PageWrapper from "@/components/PageWrapper"
import { useAccess, useQuery } from "@umijs/max"
import FormShare from "./FormShare"
import { ShareCustomerAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Button, message, Modal, Segmented, Typography } from "antd"
import { AppstoreOutlined, BarsOutlined, DeleteOutlined } from "@ant-design/icons"
import ChangeStatusForm from "./ChangeStatus"
import ShareDetailView from "./Detail"
import moment from "moment"
import _ from "lodash"

export default () => {
    const requestActions = simpleRequestActions();
    const [filter, setFilter] = useState<FetchPagingParams<any>>({
        criteria: { advanceSearch: { mode: "Group" } }
    });
    const access = useAccess();
    const [statusState, setStatusState] = useState<{
        visible?: { name: "MODAL", paylod?: any, status: string }
    }>();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['share', filter],
        queryFn: () => ShareCustomerAPI(requestActions).page({
            criteria: filter?.criteria,
            pagination: filter?.pagination
        }),
        refetchOnWindowFocus: false,
        cacheTime: 0
    });

    return (
        <>
            <PageWrapper
                tabRender={(item) => [
                    access.crmReadOnly ? {} :
                        {
                            tabLabel: "New",
                            action: "add",
                            hiden: true,
                            panel: ({ onCloseTab, key }) => <FormShare
                                onBack={() => {
                                    onCloseTab()
                                    refetch()
                                }}
                                onView={() => { }}
                                type="new"
                            />
                        },
                    {
                        tabLabel: (item?.id != 0) ? item?.entityCode : moment(item?.createdDate).format("YYYY-M-D"),
                        action: "view",
                        tabKey: item?.id + item?.sessionId,
                        panel: ({ onCloseTab, key }) => <ShareDetailView
                            isGroup={(item?.entries?.length || 0) > 0}
                            onBack={() => {
                                onCloseTab();
                                refetch();
                            }}
                            data={item}
                        />
                    }
                ]}

                listView={{
                    type: "Table",
                    title: "Share Customer List",
                    onRefresh: refetch,
                    onFilter: (filterParams, page, sort) => {
                        setFilter(v => ({
                            ...v,
                            criteria: {
                                ...v?.criteria,
                                searchValue: filterParams?.searchValue,
                                advanceSearch: {
                                    ...v.criteria.advanceSearch,
                                    status: filterParams?.status == "ALL" ? undefined : filterParams?.status
                                },
                            },
                            pagination: { ...page, current: (page?.current || 1) - 1 },
                            sort: sort
                        }))
                    },
                    statuses: [
                        { option: { value: "ALL", label: "All" } },
                        { option: { value: "Active", label: "Active" } },
                        { option: { value: "Expired", label: "Expired" } },
                    ],
                    actionButtons: [
                        <Segmented
                            onChange={(vl) => {
                                setFilter(s => ({
                                    ...s, criteria: {
                                        ...s?.criteria,
                                        advanceSearch: { ...s?.criteria?.advanceSearch, mode: vl }
                                    }
                                }))
                            }}
                            options={[
                                { value: 'Group', icon: <AppstoreOutlined />, label: "Group" },
                                { value: 'Detail', icon: <BarsOutlined />, label: "Detail" },
                            ]}
                        />
                    ],
                    actions: [],
                    props: {
                        dataSource: data?.items,
                        loading: isFetching,
                        pagination: {
                            total: data?.total,
                        },
                        columns:
                            filter?.criteria?.advanceSearch?.mode == "Group" ? [
                                {
                                    title: "Shared From",
                                    dataIndex: "createdDate",
                                    valueType: "date",
                                    actionProps: ({ entries }) => {
                                        return ({
                                            label: [entries?.[0]?.salesperson?.code, entries?.[0]?.salesperson?.name].filter(o => o).join(" "),
                                            type: "view",
                                        })
                                    }
                                },
                                {
                                    title: "Recipient",
                                    render: (_, r) => [r.salesperson?.code, r.salesperson?.name].filter(o => o).join(" ")
                                },
                                {
                                    title: "#Customers",
                                    render: (_, r) => r?.entries?.length,
                                },
                                {
                                    title: "From Date",
                                    dataIndex: "statedDate",
                                    valueType: "date"
                                },
                                {
                                    title: "To Date",
                                    dataIndex: "endedDate",
                                    valueType: "date"
                                },
                                {
                                    title: "Created By",
                                    dataIndex: "createdBy",
                                },
                                {
                                    title: "Created Date",
                                    dataIndex: "createdDate",
                                    valueType: "date",
                                },
                                {
                                    title: "Status",
                                    dataIndex: "status",
                                    render: (_, r) => <Typography.Text
                                        style={{
                                            color: r.status == "Pending" ? "#faad14"
                                                : r.status == "Active" ? "#52c41a"
                                                    : r.status == "Accepted" ? "#1890ff"
                                                        : r.status == "Rejected" ? "#ff4d4f"
                                                            : r.status == "Revoked" ? "#d4380d"
                                                                : "#d4b106"
                                        }}
                                    >{r.status}</Typography.Text>
                                },
                                {
                                    title: "Action",
                                    hidden: access.crmReadOnly,
                                    render: (_, r) => {
                                        return <Button
                                            icon={<DeleteOutlined />}
                                            type="link"
                                            danger
                                            onClick={async () => {
                                                Modal.confirm({
                                                    title: "Delete Confirmation",
                                                    content: (
                                                        <>
                                                            This action is permanent and cannot be undone.<br />
                                                            Are you sure you want to proceed?
                                                        </>
                                                    ),
                                                    onOk: async () => {
                                                        await ShareCustomerAPI(requestActions).delete(
                                                            { sessionId: r.sessionId, mode: "Group" });
                                                        message.success("Success!")
                                                        refetch()
                                                    }
                                                })
                                            }}
                                        />
                                    }
                                }
                            ] :
                                [
                                    {
                                        title: "Shared From",
                                        dataIndex: "createdDate",
                                        valueType: "date",
                                        actionProps: (item) => ({
                                            label: [item.owner?.code, item.owner?.name].filter(o => o).join(" "),
                                            type: "view",
                                        })
                                    },
                                    {
                                        title: "Recipient",
                                        render: (_, r) => [r.salesperson?.code, r.salesperson?.name].filter(o => o).join(" ")
                                    },
                                    {
                                        title: "Customer Code",
                                        dataIndex: "entityCode",
                                    },
                                    {
                                        title: "Customer Name",
                                        render: (_, r) => r?.customer?.name
                                    },
                                    {
                                        title: "From Date",
                                        dataIndex: "statedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "To Date",
                                        dataIndex: "endedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Created By",
                                        dataIndex: "createdBy",
                                    },
                                    {
                                        title: "Created Date",
                                        dataIndex: "createdDate",
                                        valueType: "date",
                                    },
                                    {
                                        title: "Status",
                                        dataIndex: "status",
                                        render: (_, r) => <Typography.Text
                                            style={{
                                                color: r.status == "Pending" ? "#faad14"
                                                    : r.status == "Active" ? "#52c41a"
                                                        : r.status == "Accepted" ? "#1890ff"
                                                            : r.status == "Rejected" ? "#ff4d4f"
                                                                : r.status == "Revoked" ? "#d4380d"
                                                                    : "#d4b106"
                                            }}
                                        >{r.status}</Typography.Text>
                                    },

                                    {
                                        title: "Action",
                                        hidden: access.crmReadOnly,
                                        render: (_, r) => {
                                            return <Button
                                                icon={<DeleteOutlined />}
                                                type="link"
                                                danger
                                                onClick={async () => {
                                                    Modal.confirm({
                                                        title: "Delete Confirmation",
                                                        content: (
                                                            <>
                                                                This action is permanent and cannot be undone.<br />
                                                                Are you sure you want to proceed?
                                                            </>
                                                        ),
                                                        onOk: async () => {
                                                            await ShareCustomerAPI(requestActions).delete({ ids: [r.id], mode: "Detail" });
                                                            message.success("Success!")
                                                            refetch()
                                                        }
                                                    })
                                                }}
                                            />
                                        }
                                    }

                                ]
                    }
                }}
            />
            <ChangeStatusForm
                open={statusState?.visible?.name == "MODAL"}
                status={statusState?.visible?.status}
                onSave={async (data) => {
                    await ShareCustomerAPI(requestActions).changeStatus({
                        ...data,
                        ids: [statusState?.visible?.paylod.id]
                    });
                    message.success("Success!")
                    setStatusState({ visible: undefined });
                    refetch();
                }}
                onCancel={() => setStatusState({ visible: undefined })}
            />
        </>
    )
}