import PageWrapper from "@/components/PageWrapper"
import { useQuery } from "@umijs/max"
import { CustomerWithAddressVerifiedAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useEffect, useMemo, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Button, message, Segmented, Space, Tooltip, Typography } from "antd"
import { AppstoreOutlined, BarsOutlined, CheckCircleOutlined, CheckCircleTwoTone, CloseCircleOutlined, CloseCircleTwoTone, SyncOutlined } from "@ant-design/icons"
import ChangeStatusForm from "./ChangeStatus"
import VerifiedDetailView from "./Detail"
import { ProTable } from "@ant-design/pro-components"
import { ShippingAddressAPI } from "../shipping_address/services"
import { CrmServices } from "../services"
import moment from "moment"


export default () => {
    const requestActions = simpleRequestActions();
    const [filter, setFilter] = useState<FetchPagingParams<any>>({ criteria: { advanceSearch: { mode: "Address" } } });
    const [statusState, setStatusState] = useState<{
        visible?: { name: "MODAL", addressId?: number, status: string }
    }>();
    const [lookupData, setLookupData] = useState<any[]>();

    const onLookupData = async () => {
        setLookupData(await CrmServices.listLookupData(["VERIFIED_ADDRESS_LAT_LONG"]).query(requestActions))
    }
    useEffect(() => {
        onLookupData()
    }, []);

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['share', filter],
        queryFn: () => {
            // return CustomerWithAddressVerifiedAPI(requestActions).page({
            //     criteria: filter?.criteria,
            //     pagination: {
            //         current: filter?.pagination?.current,
            //         pageSize: filter?.pagination?.pageSize
            //     }
            // })
            if (filter?.criteria.advanceSearch.mode == "Customer") {
                return CustomerWithAddressVerifiedAPI(requestActions).page({
                    criteria: filter?.criteria,
                    pagination: {
                        current: filter?.pagination?.current,
                        pageSize: filter?.pagination?.pageSize
                    }
                })
            }
            else {
                return ShippingAddressAPI(requestActions).page({ ...filter })
            }
        },
        cacheTime: 0,
        refetchOnWindowFocus: false,
    });

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
                    render: (_, r) => <Typography.Text>{r?.verifiedStatus?.name}</Typography.Text>
                },
                {
                    title: "",
                    render: (_, r) => r.verifiedStatus?.id != 20004 && <div>
                        <Tooltip title={"Confirm "}><Button type="link" icon={<CheckCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Confirm", addressId: r.id, } })} /></Tooltip>
                        <Tooltip title={"Rejecte "}><Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Reject", addressId: r.id, } })} /></Tooltip>
                    </div>
                }
            ]}
            // dataSource={item.addresses}
            pagination={false}
        />
    }

    const columns = useMemo(() => {
        if (filter.criteria?.advanceSearch?.mode === "Address") {
            return [
                {
                    title: "Code",
                    actionProps: (item) => ({
                        label: item?.code,
                        type: "view",
                    })
                },
                {
                    title: "Address Code",
                    dataIndex: "addressCode"
                },
                {
                    title: "Customer Code",
                    dataIndex: "customerCode"
                },
                {
                    title: "Salesperson Code",
                    render: (_, r) => r.salesperson?.code
                },
                {
                    title: "Salesperson Name",
                    render: (_, r) => r.salesperson?.nmae
                },
                {
                    title: "Verified",
                    dataIndex: "verified",
                    render: (_, r) => {
                        return <Typography >{r.verifiedStatus?.name}</Typography>
                    }
                },
                {
                    title: "",
                    render: (_, r) => r.verifiedStatus?.id == 19004 && <div>
                        <Tooltip title={"Confirm "}><Button type="link" icon={<CheckCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Confirm", addressId: r.addressId, } })} /></Tooltip>
                        <Tooltip title={"Rejecte "}><Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Reject", addressId: r.addressId, } })} /></Tooltip>
                    </div>
                }
            ];
        }
        return [
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
                render: (_, r) => <Space>
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

        ];
    }, [filter.criteria?.advanceSearch?.mode]);
    return (
        <>
            {(lookupData && filter.criteria?.advanceSearch?.mode) &&
                <PageWrapper
                    tabRender={(item) => [
                        {
                            tabLabel: item?.code || "N/A",
                            tabKey: item?.id || "N/A",
                            action: "view",
                            panel: ({ onCloseTab }) => <VerifiedDetailView mode={filter.criteria.advanceSearch.mode} onBack={onCloseTab} data={item} />,
                        },
                    ]}
                    listView={{
                        type: "Table",
                        onRefresh: refetch,
                        actions: [
                            {
                                icon: <SyncOutlined />,
                                label: "Sync",
                                key: "sync",
                                onClick: async () => {
                                    await CustomerWithAddressVerifiedAPI(requestActions).syncVerifiedLatlong();
                                    refetch?.();
                                    message.success("Success!");
                                },
                            },
                        ],
                        // actionButtons: [
                        //     <Segmented
                        //         onChange={(vl) => {
                        //             setFilter((s) => ({
                        //                 ...s,
                        //                 criteria: {
                        //                     ...s?.criteria,
                        //                     advanceSearch: { ...s?.criteria?.advanceSearch, mode: vl },
                        //                 },
                        //             }));
                        //         }}
                        //         options={[
                        //             { value: "Customer", icon: <AppstoreOutlined />, label: "Customer" },
                        //             { value: "Address", icon: <BarsOutlined />, label: "Address" },
                        //         ]}
                        //     />,
                        // ],
                        onFilter: (filterParams, page, sort) => {
                            setFilter((v) => ({
                                ...v,
                                criteria: {
                                    ...v?.criteria,
                                    searchValue: filterParams?.searchValue,
                                    status: undefined,
                                    advanceSearch: {
                                        ...v.criteria?.advanceSearch,
                                        verified: filterParams?.status == "ALL" ? undefined : filterParams?.status
                                    }
                                },
                                pagination: { ...page, current: (page?.current || 1) - 1 },
                                sort: sort,
                            }));
                        },
                        statuses: [
                            { option: { value: "ALL", label: "All" } },
                            ...(lookupData?.map(p => ({
                                option: { value: p.id, label: p.name }
                            })) || [])
                        ],
                        props: {
                            dataSource: data?.items,
                            loading: isFetching,
                            expandable:
                                filter.criteria?.advanceSearch?.mode === "Customer"
                                    ? { expandedRowRender: addressExpaned }
                                    : undefined,
                            pagination: {
                                total: data?.total,
                            },
                            // columns: columns,
                            columns: [
                                // {
                                //     title: "Customer",
                                //     dataIndex: "customerCode"
                                // },
                                {
                                    title: "Customer",
                                    actionProps: (item) => ({
                                        label: item?.customerCode,
                                        type: "view",
                                    })
                                },
                                {
                                    title: "Address",
                                    dataIndex: "addressCode"
                                },
                                
                                // {
                                //     title: "Salesperson Code",
                                //     render: (_, r) => r.salesperson?.code
                                // },
                                {
                                    title: "Salesperson",
                                    render: (_, r) => r.salesperson?.name
                                },
                                // {
                                //     title:"Created By",
                                //     render:(_,r)=>r.customerVerifiedLatLong.createdBy
                                // },
                                {
                                    title:"Verified Date",
                                    render:(_,r)=>r?.customerVerifiedLatLong?moment(r?.customerVerifiedLatLong?.createdDate)?.format("YYYY-M-DD"):"",
                                    valueType:"date"
                                },
                                {
                                    title: "Status",
                                    dataIndex: "verified",
                                    render: (_, r) => {
                                        return <Typography
                                            style={{
                                                color:
                                                    r.verifiedStatus?.id === 20001 // Unverified
                                                        ? "#868684ff" // orange
                                                        : r.verifiedStatus?.id === 20002 //"Pending"
                                                            ? "#1890ff" // blue
                                                            : r.verifiedStatus?.id === 20003 //"Rejected"
                                                                ? "#ff4d4f" // red
                                                                : r.verifiedStatus?.id ===20004  //"Confirmed"
                                                                    ? "#52c41a" // green
                                                                    : undefined
                                            }}
                                        >{r.verifiedStatus?.name}</Typography>
                                    }
                                },
                                {
                                    title: "Action",
                                    render: (_, r) => r.verifiedStatus?.id == 20002 && <div>
                                        <Tooltip title={"Confirm "}><Button type="link" icon={<CheckCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Confirm", addressId: r.addressId, } })} /></Tooltip>
                                        <Tooltip title={"Rejecte "}><Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Reject", addressId: r.addressId, } })} /></Tooltip>
                                    </div>
                                }
                            ]
                        },
                    }}
                />
            }


            <ChangeStatusForm
                open={statusState?.visible?.name == "MODAL"}
                status={statusState?.visible?.status}
                onSave={async (data) => {
                    await CustomerWithAddressVerifiedAPI(requestActions).changeStatus({
                        ...data,
                        id: statusState?.visible?.addressId
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