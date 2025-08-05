import PageWrapper from "@/components/PageWrapper"
import { useQuery } from "@umijs/max"
import { CustomerServices } from "../customer/services"
import FormShare from "./FormShare"
import { CustomerWithAddressVerifiedAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Dropdown, MenuProps, message, Modal, Space, Typography } from "antd"
import { CheckCircleTwoTone, CloseCircleOutlined, DeleteOutlined, EllipsisOutlined, WarningOutlined } from "@ant-design/icons"
import ChangeStatusForm from "./ChangeStatus"
import VerifiedDetailView from "./Detail"
import moment from "moment"
import { ProTable } from "@ant-design/pro-components"



export default () => {
    const requestActions = simpleRequestActions();
    const [filter, setFilter] = useState<FetchPagingParams<any>>();
    const [statusState, setStatusState] = useState<{
        visible?: { name: "MODAL", paylod?: any, status: string }
    }>();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['share', filter],
        queryFn: () => CustomerWithAddressVerifiedAPI(requestActions).page({
            criteria: filter?.criteria,
            pagination: {
                current: filter?.pagination?.current,
                pageSize: filter?.pagination?.pageSize
            }
        }),
        refetchOnWindowFocus: false,
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
                        // await ShareCustomerAPI(requestActions).delete([item.id]);
                        // message.success("Success!")
                    }
                })
            }
        },
    ]

    const addressExpaned = (item: any) => {

        return <ProTable
            rowKey="id"
            options={false}
            search={false}
            size="small"
            dataSource={item.address}
            // request={async () => {
            //     const listAddress = await CrmServiceAPI(requestActions).listAddressByCustomerId({id: item.entityId});
            //     console.log(listAddress);

            //     return Promise.resolve({
            //         data:listAddress,
            //         total: listAddress.length,
            //         success: true
            //     })
            // }}
            columns={[
                {
                    title: "Address",
                    dataIndex: "address",
                    render: (_, r) => <Space>
                        {r?.address}
                        {r.isVerified == true ? <CheckCircleTwoTone twoToneColor={"#52C41A"} /> : ""}
                    </Space>
                },
                {
                    title: "Province",
                    dataIndex: "province",
                },
                {
                    title: "Hotspot",
                    dataIndex: "hotspot",
                },
                {
                    title: "latitude Longitude",
                    dataIndex: "address",
                    render: (_, r) => [r?.latitude, r?.longitude].filter(v => v).join(", ")
                },
                {
                    title: "Verified",
                    render: (_, r) => <Typography.Text type={r?.isVerified === true ? "success" : "danger"}>{r?.isVerified === true ? "Yes" : "No"}</Typography.Text>
                }
            ]}
            // dataSource={item.addresses}
            pagination={false}
        />
    }
    return (
        <>
            <PageWrapper
                tabRender={(item) => [
                    // {
                    //     tabLabel: "Share",
                    //     action: "add",
                    //     panel: ({ onCloseTab, key }) => <FormShare
                    //         onBack={() => onCloseTab}
                    //         onView={() => { }}
                    //         type="new"
                    //     />
                    // },
                    {
                        tabLabel: item?.code||"N/A",
                        tabKey:item?.id ||"N/A",
                        action: "view",
                        panel: ({ onCloseTab, key }) => <VerifiedDetailView
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
                    // statuses: [
                    //     { option: { value: "All", label: "ALL" } },
                    //     { option: { value: "Pending", label: "Pending" } },
                    //     { option: { value: "Active", label: "Active" } },
                    //     { option: { value: "Accept", label: "Accept" } },
                    //     { option: { value: "Rejected", label: "Rejected" } },
                    //     { option: { value: "Revoked", label: "Revoked" } },
                    //     { option: { value: "Expired", label: "Expired" } },
                    // ],
                    props: {
                        dataSource: data?.items,
                        loading: isFetching,
                        expandable: { expandedRowRender: addressExpaned },
                        pagination: {
                            total: data?.total,
                        },
                        columns: [
                            {
                                title: "Customer Code",
                                dataIndex: "code",
                                valueType: "date",
                                actionProps: (item) => ({
                                    label: item.code,
                                    type: "view",

                                })
                            },
                            {
                                title: "Customer Name",
                                render:(_,r)=><Space>
                                    <Typography>{r.name}</Typography>
                                    <Typography.Text type="secondary" >{r.internalName}</Typography.Text>
                                </Space>
                            },
                            {
                                title: "Salesperson",
                                render: (_, r) => [r.salesperson?.code, r.salesperson?.name].filter(Boolean).join("-")
                            },
                            {
                                title: "Address Verified",
                                dataIndex: "verified",
                                render: (_, r) => {
                                    const ori = r.address?.length;
                                    const valided = r.address?.filter(o => o.isVerified == true)?.length
                                    return <Typography style={{ color: valided == 0 ? "#d4380d" : "#52c41a" }}>{valided}/{ori}</Typography>
                                }
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
                open={statusState?.visible?.name == "MODAL"}
                status={statusState?.visible?.status}
                onSave={async (data) => {
                    // await ShareCustomerAPI(requestActions).changeStatus({
                    //     ...data,
                    //     ids: [statusState?.visible?.paylod.id]
                    // });
                    // message.success("Success!")
                    // setStatusState({ visible: undefined });
                    // refetch();
                }}
                onCancel={() => setStatusState({ visible: undefined })}
            />
        </>
    )
}