import PageWrapper from "@/components/PageWrapper"
import { useAccess, useQuery } from "@umijs/max"
import { CustomerWithAddressVerifiedAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useEffect, useMemo, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Button, message, Segmented, Space, Tooltip, Typography } from "antd"
import { AppstoreOutlined, BarsOutlined, CheckCircleOutlined, CheckCircleTwoTone, CloseCircleOutlined, CloseCircleTwoTone, ExportOutlined, SyncOutlined } from "@ant-design/icons"
import ChangeStatusForm from "./ChangeStatus"
import VerifiedDetailView from "./Detail"
import { ProTable } from "@ant-design/pro-components"
import { ShippingAddressAPI } from "../shipping_address/services"
import { CrmServices } from "../services"
import moment from "moment"
import numeral from "numeral";

import ExportModal from "./ExportModal"
import { downloadGenericReport } from "@/services/apiGateway"
import { getUrlReporting } from "@/pages/ReportUrl"

export default () => {
    const access = useAccess()
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
            pagination={false}
        />
    }

    const onDowloadReportHandler = async (params: any) => {

            try {
                const reportName = 'customer_verification_report';
                await downloadGenericReport(requestActions)({
                    fileName: `${reportName}-${moment().format()}.xls`,
                    type: 'EXCEL',
                    data: {
                        reportName: reportName,
                        reportPath: getUrlReporting('crm'),
                        data: [
                            { key: "startDate", type: "string", value: params.date?.[0] },
                            { key: "endDate", type: "string", value: params.date?.[1] },
                            { key: "saleCode", type: "string", value: params.sale?.filter((p: any)=>p)?.join(",") },
                            { key: "status", type: "string", value: params.status?.filter((p: any)=>p)?.join(",") },
                        ],
                    },
                }).then(() => { });
                message.success('Export successfully.');
            } catch (error: any) {
                message.error(error.message || 'Failed to generate report.');
            }
        };
        
    const [exportState, setExportState] = useState<boolean>(false);
    return (
        <>
            {(lookupData && filter.criteria?.advanceSearch?.mode) &&
                <PageWrapper
                    tabRender={(item) => [
                        {
                            tabLabel: item?.code || "N/A",
                            tabKey: item?.id || "N/A",
                            action: "view",
                            panel: ({ onCloseTab }) => <VerifiedDetailView mode={filter.criteria.advanceSearch.mode} onBack={onCloseTab} data1={item} />,
                        },
                    ]}
                    listView={{
                        type: "Table",
                        onRefresh: refetch,
                        title:"Verification List",
                        actions: [
                            !access.crmReadOnly?{
                                icon: <SyncOutlined />,
                                label: "Sync",
                                key: "sync",
                                onClick: async () => {
                                    await CustomerWithAddressVerifiedAPI(requestActions).syncVerifiedLatlong();
                                    refetch?.();
                                    message.success("Success!");
                                },
                            }:{onClick:()=>{},key:""},
                            {
                                icon: <ExportOutlined />,
                                label: "Export",
                                key: "export",
                                onClick:()=>setExportState(true)
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
                                    title: "Verified Date",
                                    render: (_, r) => r?.customerVerifiedLatLong ? moment(r?.customerVerifiedLatLong?.createdDate)?.format("YYYY-M-DD") : "",
                                    valueType: "date"
                                },
                                {
                                    title: "Distance",
                                    render: (_, r) => {
                                        const origin = `${r?.customerVerifiedLatLong?.currentLat},${r?.customerVerifiedLatLong?.currentLong}` // example: your current location
                                        const destLat = r?.customerVerifiedLatLong?.latitude;
                                        const destLng = r?.customerVerifiedLatLong?.longitude;

                                        // Only create link if lat/lng exist
                                        if (!destLat || !destLng) return "No location";

                                        const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destLat},${destLng}&travelmode=driving`;

                                        return (
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {numeral(r?.customerVerifiedLatLong?.distance).format("000,000")} {r?.customerVerifiedLatLong?.distance?"Meters":""}
                                            </a>
                                        );
                                    },
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
                                                                : r.verifiedStatus?.id === 20004  //"Confirmed"
                                                                    ? "#52c41a" // green
                                                                    : undefined
                                            }}
                                        >{r.verifiedStatus?.name}</Typography>
                                    }
                                },
                                // {
                                //     title: "Action",
                                //     render: (_, r) => r.verifiedStatus?.id == 20002 && <div>
                                //         <Tooltip title={"Confirm "}><Button type="link" icon={<CheckCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Confirm", addressId: r.addressId, } })} /></Tooltip>
                                //         <Tooltip title={"Rejecte "}><Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => setStatusState({ visible: { name: "MODAL", status: "Reject", addressId: r.addressId, } })} /></Tooltip>
                                //     </div>
                                // }
                            ]
                        },
                    }}
                />
            }

            <ExportModal
                open={exportState}
                modalProps={{
                    onCancel:()=>setExportState(false)
                }}
                onExport={(it)=>{
                    onDowloadReportHandler(it)
                }}
            />

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