import PageWrapper from "@/components/PageWrapper"
import { CopyFilled, ExportOutlined, EyeFilled, FileOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Spin } from "antd"
import { RegisterCuistomerInfoAdvanceSearchParams, RegisterCustomer, RegisterCustomerListItem } from "./data"
import DataEntryView from "./DataEntryView"
import { RegisterCustomerServiceAPI } from "./services"
import { useQuery } from "@umijs/max"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { useState } from "react"
import Status from "@/components/Status"
import { formatDate } from "@/pages/utils"
import Form from "@/pages/process-flow/form"
import { RegisterCustomerRequestFormNames } from "./process-flow"

export default()=>{
    const services = RegisterCustomerServiceAPI()
     const [filter, setFilter] = useState<TableViewSearchParams<RegisterCuistomerInfoAdvanceSearchParams>>({
            criteria: { advanceSearch: { status: 'ALL' } }
        })
       const { data, isLoading, refetch } = useQuery(['fetch-register-customer-list', filter], () => services.list(filter), {
            refetchOnWindowFocus: false
        })
    
    function onDetailhandler(item: RegisterCustomerListItem): void {
        throw new Error("Function not implemented.")
    }

    return(<Spin spinning={isLoading}>
        <PageWrapper<RegisterCustomerListItem, RegisterCuistomerInfoAdvanceSearchParams, {}>
            tabRender={item => [
                {
                    action: "add",
                    tabIcon: <FileOutlined />,
                    tabLabel: 'New Register',
                    panel: (props) =>   <DataEntryView type="CREATE"
                                            onCloseTab={() => {
                                                props?.onCloseTab?.()
                                                // refetch()
                                            }} 
                                            // openInTab onBack={() => { }} type="CREATE" 
                                            />,
                }, {
                    action: 'view',
                    value: item?.formNo ||item?.customerCode || "n/a",
                    tabLabel: item?.formNo ||item?.customerCode || 'Draft',
                    panel: (props) => ['PENDING','DRAFT'].some(it=> it==item?.status) || !item?.formNo ? <DataEntryView id={item?.id} readOnly={item?.status==='CANCELED'} type="EDIT" onCloseTab={() => {
                            props?.onCloseTab?.()
                            refetch()
                        }} />: <Form openInTab formKey={RegisterCustomerRequestFormNames.processDefKey} id={item?.processInstId} />,
                }
            ]} 
            listView={{
                // actionButtons: ,
                type: 'Table',
                title: "Register Customer List",
                statuses: [
                    { option: { label: 'All', value: 'ALL', default: true }, },   
                    { option: { label: 'Draft', value: 'DRAFT' }, },                
                    { option: { label: 'Pending', value: 'PENDING' }, },
                    {
                        option: { label: 'Submitted', value: 'SUBMITTED', }, subOptions: [
                            { label: 'All', value: 'ALL', default: true },
                            { label: 'Approved', value: 'APPROVED' },
                            { label: 'Rejected', value: 'REJECTED' },
                        ]
                    },
                    { option: { label: 'Canceled', value: 'CANCELED' },}                  
                
                ],
                onRefresh: refetch,
                onFilter: (params, page, sort) => {
                    setFilter(v => ({
                        ...v,
                        criteria: {
                            ...v.criteria,
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                ...v.criteria?.advanceSearch,
                                ...params,
                                status: params?.status || 'ALL',
                                processStatus: params?.subStatus
                            },
                            sort: sort,
                        },
                        pagination: page,
                    }))
                },
                props: {
                    dataSource: data?.items,
                    pagination: { total: data?.total },
                    loading: false,
                    scroll: { x: 'max-content' },
                    bordered: true, 
                    // actionButtonsColumnRender: (item) => ([
                    //     {
                    //         tooltip: 'View data in new browser tab', type: 'link',
                    //         disabled: item.processStatus == 'DRAFT', size: 'small', icon: <ExportOutlined />,
                    //         // onClick: () => item.instanceId && openPR(item.instanceId)
                    //         // onClick: () => openPR(item.instanceId)
                    //     },
                    //     { tooltip: 'Quick view', type: 'link', size: 'small', icon: <EyeFilled />, onClick: () => onDetailhandler(item) },
                    //     {
                    //         tooltip: 'Copy', type: 'link',
                    //         size: 'small', icon: <CopyFilled />,
                    //         actionType: 'copy'
                    //     }
                    // ]),
                    columns: [
                        {
                            title: 'Form No',dataIndex: 'formNo', sorter: 'formNo',
                            width: 100,
                            actionProps: (item) => ({ type: 'view', label: item.formNo || "n/a" })
                        }, {
                            title: 'Customer No',
                            width: 130,
                            sorter: 'customerCode',
                            render: (_, r) => r.customerCode,
                        }, {
                            title: 'Business Name(English)',
                            width: 130,
                            sorter: 'buName',
                            render: (_, r) => r.buName,
                        }, {
                            title: 'Requested By',
                            width: 130,
                            sorter: 'createdBy',
                            render: (_, r) => r.createdBy,
                        }, {
                            title: 'Requested Dt',
                            align: 'right',
                            sorter: 'createdDate',
                            width: 120,
                            render: (_, r) => formatDate(r.createdDate),
                        }, {
                            title: 'Status',
                            dataIndex: 'status',
                            width: 100,
                            render: (_, r) => r.status && <Status size="small" text={r.status} />,
                        },
                        {
                            title: 'Workflow Status',
                            dataIndex: 'processStatus',
                            width: 100,
                            render: (_, r) => r.status && <Status size="small" text={r.processStatus||"NA"} />,
                        },
                    ]
                }
            }}
        />
    </Spin>)
}