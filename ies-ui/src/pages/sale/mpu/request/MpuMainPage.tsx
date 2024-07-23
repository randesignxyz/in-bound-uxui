import PageWrapper from "@/components/PageWrapper"
import { PurchaseReqeustAdvanceSearch, PurchaseRequestDTO, PurchaseRequestUpdateParam } from "./data"
import MpuRequestEntryForm from "./MpuRequestEntryForm"
import { AlignCenterOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, ExclamationCircleOutlined, IssuesCloseOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons"
import MpuRequestDetail from "./MpuRequestDetail"
import { Tag, Dropdown, MenuProps, Modal } from "antd"
import { useQuery } from "@umijs/max"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { useRef, useState } from "react"
import { simpleRequestActions } from "@/services/model"
import { PurChaseRequestAPIService } from "./service"
import { ActionType } from "@ant-design/pro-components"
import ActionStatusModalForm from "./ActionStatusForm"

interface Props {

}

const MpuRequestMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = PurChaseRequestAPIService(requestActions);
    const actionRef = useRef<ActionType>();
    const [actionStatusState, setActionStatusState] = useState<{
        visible?: {
            type: "open";
            payloads?: PurchaseRequestDTO;
        }
    }>();
    const [filter, setFilter] = useState<TableViewSearchParams<PurchaseReqeustAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })
    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => services.page(filter), {
        refetchOnWindowFocus: false
    });
    const items = (items: PurchaseRequestDTO): MenuProps["items"] => [
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
                        await services.updateStatus({
                            id:items.id,
                            status:"rejected",
                            remark:"data was reject"
                        });
                        actionRef.current?.reload?.();
                        refetch();
                    }
                })
            },
        },
    ];
    return <>
        <PageWrapper<PurchaseRequestDTO, PurchaseReqeustAdvanceSearch, {}>
            tabRender={items => [
                {
                    action: "add",
                    tabKey: "add",
                    panel: ({ onCloseTab, onUpdateTab, key }) => <MpuRequestEntryForm
                        type={"CREATE"}
                        onBack={ onCloseTab}
                        onView={(items) =>onUpdateTab("view",items, undefined, key)}
                        />,
                    tabLabel: "Add New",
                    tabIcon: <PlusOutlined />,
                },
                {
                    action: "view",
                    tabKey:"view",
                    panel: ({ onAddTab, onUpdateTab, key }) => <MpuRequestDetail
                        id={items?.id}
                        onEdit={() => onUpdateTab?.('edit', undefined, undefined, key)}
                        onAdd={() => onAddTab?.('add', undefined, key)}
                    />,
                    tabLabel:`${ items?.purchaseRequestNo}`,
                    tabIcon: <AlignCenterOutlined />
                },
                {
                    action: "edit",
                    tabKey:"edit",
                    panel: ({ onUpdateTab, onCloseTab, key }) => <MpuRequestEntryForm
                        type={"EDIT"}
                        onView={() => onUpdateTab?.("view", undefined, undefined, key)}
                        onBack={()=> {
                            onUpdateTab?.("view", undefined, undefined, key)  
                            refetch()
                        }}
                        id={items?.id}
                        openInTab
                    />,
                    tabLabel: `Edit ${items?.purchaseRequestNo}`,
                    tabIcon: <EditOutlined />,
                },
            ]}
            listView={{
                statuses:[
                    {option:{value:"ALL", label:"All"}},
                    {option:{value:"pending", label:"Pending"}},
                    {option:{value:"rejected", label:"Rejected"}},
                    {option:{value:"closed", label:"Closed"}},
                    {option:{value:"partial", label:"Partial"}},
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
                                label: item.purchaseRequestNo || 'n/a',
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
                                        : r.status == "closed" ? <CheckCircleOutlined />
                                            : r.status == "rejected" ? <CloseCircleOutlined />
                                                : <ExclamationCircleOutlined />
                                }
                                bordered={false}
                                color={
                                    r.status == "pending"
                                        ? "processing"
                                        : r.status == "closed" ? "success"
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
        <ActionStatusModalForm
            open={actionStatusState?.visible?.type == "open"}
            onCancel={() => setActionStatusState({ visible: undefined })}
            data={actionStatusState?.visible?.payloads}
            onSave={async(items:PurchaseRequestUpdateParam)=>{
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
        />
    </>
}

export default MpuRequestMainPage