import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import PageWrapper from "@/components/PageWrapper";
import { simpleRequestActions } from "@/services/model";
import { IssuesCloseOutlined, DeleteOutlined, PlusOutlined, AlignCenterOutlined, EditOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, EllipsisOutlined } from "@ant-design/icons";
import { ActionType } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import { MenuProps, Modal, Tag, Dropdown } from "antd";
import { useEffect, useRef, useState } from "react";
import MpuRequestEntryForm from "../request/MpuRequestEntryForm";
import { PurChaseRequestAPIService } from "../request/service";
import { PurchaseOrderAdvanceSearch, PurchaseOrderDTO } from "./data";
import MpuPoDetail from "./MpuPODetail";
import MpuPoEntryForm from "./MpuPOEntryForm";
import { PurchaseOrderServiceAPI } from "./services";


interface Props {

}

const POMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = PurchaseOrderServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [actionStatusState, setActionStatusState] = useState<{
        visible?: {
            type: "open";
            payloads?: PurchaseOrderDTO;
        }
    }>();
    const [filter, setFilter] = useState<TableViewSearchParams<PurchaseOrderAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })
    const { data, isFetching, refetch } = useQuery(['fetch-po-list', filter], () => services.page(filter), {
        refetchOnWindowFocus: false,
        keepPreviousData:false
    });
    const items = (items: PurchaseOrderDTO): MenuProps["items"] => [
        {
            key: "action-status",
            label: "Force Close",
            itemIcon: <IssuesCloseOutlined />,
            onClick: () => setActionStatusState({ visible: { type: "open", payloads: items } })
        },
        {
            type: "divider"
        },
        {
            key: "reject",
            label: "Reject",
            danger: true,
            disabled: items.status != "pending",
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Reject Purchase Request",
                    content: "are you sure?",
                    onOk: async () => {
                        // await services.updateStatus({
                        //     id:items.id,
                        //     status:"rejected",
                        //     remark:"data was reject"
                        // });
                        // actionRef.current?.reload?.();
                        // refetch();
                    }
                })
            },
        },
    ];
    useEffect(()=>{

    },[data]);
    return <>
        <PageWrapper<PurchaseOrderDTO, PurchaseOrderAdvanceSearch, {}>
            tabRender={items => [
                {
                    action: "add",
                    tabKey: "add",
                    panel: ({ onCloseTab, onUpdateTab, key }) => <MpuPoEntryForm
                        type={"CREATE"}
                        onBack={onCloseTab}
                        onView={(items) => onUpdateTab("view", items, undefined, key)}        
                        />,
                    tabLabel: "Add New",
                },
                {
                    action: "view",
                    tabKey:"view",
                    panel: ({ onAddTab, onUpdateTab, key }) => <MpuPoDetail
                        id={items?.id}
                        onEdit={() => onUpdateTab?.('edit', undefined, undefined, key)}
                        onAdd={() => onAddTab?.('add', undefined, key)}
                    />,
                    tabLabel:`${ items?.purchaseRequestNo}`,
                },
                {
                    action: "edit",
                    tabKey:"edit",
                    panel: ({ onUpdateTab, onCloseTab, key }) => <MpuPoEntryForm
                        type={"EDIT"}
                        onView={() => onUpdateTab?.("view", undefined, undefined, key)}
                        onBack={()=> {
                            onUpdateTab?.("view", undefined, undefined, key)  
                            refetch()
                        }}
                        id={items?.id}
                    />,
                    tabLabel: `Edit ${items?.purchaseRequestNo}`,
                },
            ]}
            listView={{
                statuses:[
                    {option:{value:"ALL", label:"All"}},
                    {option:{value:"pending", label:"Pending"}},
                    {option:{value:"rejected", label:"Rejected"}},
                    {option:{value:"paid", label:"Paid"}},
                ],
                type: "Table",
                title:"Purchase Order",
                onRefresh: refetch,
                actionButtons:[
                    {
                        icon:<PlusOutlined/>,
                        type:"link",
                        addNewTab:true
                    }
                ],
                onFilter(params, page, sort) {
                    setFilter(v => ({
                        criteria: { 
                            searchValue:params?.searchValue,
                           advanceSearch:{
                            status:params?.status
                           }
                        },
                        pagination: { ...page },
                        sort: sort
                    }))
                },
                props: {
                    dataSource: data?.items,
                    actionRef: actionRef,
                    loading:isFetching,

                    columns: [
                        {
                            title: 'No',
                            dataIndex: "purchaseRequestNo",
                            actionProps: (item) => ({
                                type: 'view',
                                label: item.requestedCode || 'n/a',
                            }),
                        },
                        {
                            title: 'Requester',
                            dataIndex: "requestedBy"
                        },
                        {
                            title: 'Distributor Name',
                            dataIndex: 'distributorName',
                        },
                        {
                            title: 'Assigned To',
                            dataIndex: 'assignedTo',
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            render: (_, r) => <Tag
                                icon={
                                    r.status == "pending" ? <SyncOutlined spin />
                                        : r.status == "paid" ? <CheckCircleOutlined />
                                            : r.status == "rejected" ? <CloseCircleOutlined />
                                                : <ExclamationCircleOutlined />
                                }
                                bordered={false}
                                color={
                                    r.status == "pending"
                                        ? "processing"
                                        : r.status == "paid" ? "success"
                                            : r.status == "rejected" ? "error"
                                                : "warning"
                                }>{r.status?.toUpperCase()}</Tag>
                        },
                        {
                            title: 'GrantAmount',
                            dataIndex: 'grantAmount',
                            valueType: "money",
                        },
                        {
                            title: 'Total Amount',
                            dataIndex: "totalAmount",
                            valueType: "money"
                        },
                        {
                            title: 'Requested Date',
                            dataIndex: "requestedDate",
                            valueType: "date"
                        },
                        {
                            title: 'Action',
                            align: "center",
                            render: (_, r) => {
                                return (
                                    <Dropdown
                                        menu={{
                                            items: items(r),
                                            style: {
                                                width: 200
                                            }
                                        }}
                                    >
                                        <a><EllipsisOutlined /></a>
                                    </Dropdown>
                                );
                            },
                        },
                    ]
                }
            }}
        />
        {/* <ActionStatusModalForm
            open={actionStatusState?.visible?.type == "open"}
            onCancel={() => setActionStatusState({ visible: undefined })}
            data={actionStatusState?.visible?.payloads}
            onSave={async(items:PurchaseOrderCreate)=>{
                Modal.confirm({
                    title: "force Close Purchase Order.",
                    content: "are you sure?",
                    onOk: async () => {
                        await services.updateStatus(items);
                        actionRef.current?.reload?.();
                        refetch();
                    }
                })
            }}
        /> */}
    </>
}

export default POMainPage