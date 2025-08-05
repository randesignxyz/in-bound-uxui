import PageWrapper from "@/components/PageWrapper"
import { useQuery } from "@umijs/max"
import { CustomerServices } from "../customer/services"
import FormShare from "./FormShare"
import { ShareCustomerAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Dropdown, MenuProps, message, Modal, Typography } from "antd"
import { CloseCircleOutlined, DeleteOutlined, EllipsisOutlined, WarningOutlined } from "@ant-design/icons"
import ChangeStatusForm from "./ChangeStatus"
import ShareDetailView from "./Detail"
import moment from "moment"



export default () => {
    const requestActions = simpleRequestActions();
    const [filter, setFilter] = useState<FetchPagingParams<any>>();
    const [statusState, setStatusState] = useState<{
        visible?: { name: "MODAL", paylod?: any, status: string }
    }>();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['share', filter],
        queryFn: () => ShareCustomerAPI(requestActions).page({
            criteria: filter?.criteria,
            pagination: filter?.pagination
        })
    });

    const itemMenu = (item: any): MenuProps["items"] => [
        {
            key: "Revoked",
            label: "Revoked",
            itemIcon: <WarningOutlined />,
            onClick: () => setStatusState({ visible: { name: "MODAL", paylod: item, status: "Revoked" } })
        },
        {
            key: "Rejecte",
            label: "Rejecte",
            itemIcon: <CloseCircleOutlined />,
            onClick: () => setStatusState({ visible: { name: "MODAL", paylod: item, status: "Rejected" } })
        },
        {
            type: "divider"
        },
        {
            key: "Delete",
            label: "Delete",
            danger: true,
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Delete Confirmation",
                    content: (
                        <>
                            This action is permanent and cannot be undone.<br />
                            Are you sure you want to proceed?
                        </>
                    ),
                    onOk: async () => {
                        await ShareCustomerAPI(requestActions).delete([item.id]);
                        message.success("Success!")
                    }
                })
            }
        },
    ]

    return (
        <>
            <PageWrapper
                tabRender={(item) => [
                    {
                        tabLabel: "Share",
                        action: "add",
                        panel: ({ onCloseTab, key }) => <FormShare
                            onBack={() => onCloseTab}
                            onView={() => { }}
                            type="new"
                        />
                    },
                    {
                        tabLabel:"Detail",
                        action:"view",
                        panel:({ onCloseTab, key })=><ShareDetailView
                            onBack={onCloseTab}
                            data={item}
                        />
                    }
                ]}
                listView={{
                    type: "Table",
                    onRefresh: refetch,
                    onFilter: (filterParams, page, sort) => {
                        setFilter(v => ({
                            ...v,
                            criteria: {
                                ...v?.criteria,
                                searchValue: filterParams?.searchValue,
                                status: filterParams?.status == "ALL" ? undefined : filterParams?.status
                            },
                            pagination: { ...page, current: (page?.current || 1) - 1 },
                            sort: sort
                        }))
                    },
                    statuses: [
                        { option: { value: "All", label: "ALL" } },
                        { option: { value: "Pending", label: "Pending" } },
                        { option: { value: "Active", label: "Active" } },
                        { option: { value: "Accept", label: "Accept" } },
                        { option: { value: "Rejected", label: "Rejected" } },
                        { option: { value: "Revoked", label: "Revoked" } },
                        { option: { value: "Expired", label: "Expired" } },
                    ],
                    props: {
                        dataSource: data?.items,
                        loading: isFetching,
                        pagination: {
                            total: data?.total,
                        },
                        columns: [
                            {
                                title: "Date",
                                dataIndex: "createdDate",
                                valueType: "date",
                                actionProps:(item)=>({
                                    label:moment(item.createdDate).format("YYYY-MM-DD"),
                                    type:"view",
                                    
                                })
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
                                title: "Recipient Code",
                                dataIndex: "SalespersonName",
                                render: (_, r) => r?.salesperson?.code
                            },
                            {
                                title: "Recipient Name",
                                render: (_, r) => r?.salesperson?.name
                            },
                            {
                                title: "Status",
                                dataIndex: "status",
                                render:(_,r)=><Typography.Text
                                    style={{
                                        color:r.status =="Pending"?"#faad14"
                                        :r.status =="Active"?"#52c41a"
                                        :r.status =="Accepted"?"#1890ff"
                                        :r.status =="Rejected"?"#ff4d4f"
                                        :r.status =="Revoked"?"#d4380d"
                                        :"#d4b106"
                                    }}
                                >{r.status}</Typography.Text>
                            },
                            {
                                title: "",
                                render: (_, r) => {
                                    return <Dropdown

                                        menu={{
                                            items: itemMenu(r),
                                            style: {
                                                width: 200
                                            }
                                        }}
                                    >
                                        <a onClick={(e) => e.preventDefault()}>
                                            <EllipsisOutlined />
                                        </a>
                                    </Dropdown>
                                }
                            }
                        ]
                    }
                }}
            />


            <ChangeStatusForm
                 open={statusState?.visible?.name=="MODAL"}
                 status={statusState?.visible?.status}
                 onSave={async(data)=>{
                    await ShareCustomerAPI(requestActions).changeStatus({
                        ...data,
                        ids:[statusState?.visible?.paylod.id]
                    });
                    message.success("Success!")
                    setStatusState({visible:undefined});
                    refetch();
                 }}
                 onCancel={()=>setStatusState({visible:undefined})}
            />
        </>
    )
}