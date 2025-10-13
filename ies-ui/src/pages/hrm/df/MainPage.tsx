import PageWrapper from "@/components/PageWrapper"
import { DF360Emp, DF360EmpListItem, DF360InfoAdvanceSearchParams } from "./data"
import { DashOutlined, ExportOutlined, FileOutlined } from "@ant-design/icons"
import DataEntryView from "./DataEntryView"
import { formatDate, getColorStatus, toReadable } from "@/pages/utils"
import Status from "@/components/Status"
import { Df360EmpServiceAPI } from "./services"
import { useState } from "react"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { useAccess, useQuery } from "@umijs/max"
import DataEntryFormView from "./DataEntryFormView"
import { Badge, Button, Card, Col, Descriptions, Flex, Grid, message, Radio, Row} from "antd"
import editSettlmentModal from "@/pages/delivery/cash-collection/edit-settlment-modal"

export const openPR = (dfId: number) => window.open(`/externa/hrm/df/detail/${dfId}`, '_blank')?.focus()

export default () => {
    const access = useAccess()
    const services = Df360EmpServiceAPI()
    const [filter, setFilter] = useState<TableViewSearchParams<DF360InfoAdvanceSearchParams>>({
            criteria: { advanceSearch: { status: 'ALL' } }
        })
    const { data, isLoading, refetch } = useQuery(['fetch-fd360-emp-list', filter], () => services.list(filter), {
            refetchOnWindowFocus: false
        })
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [selectedItem, setSelectedItem] = useState<DF360EmpListItem | null>(null);

    const getColorStatus = (status?: string) => {
    if (['ACTIVE','SUBMITTED'].some((it) => it === status)) {
        return 'blue';
    }
     if (['COMPLETED'].some((it) => it === status)) {
        return 'green';
    }

    if (['FAILED'].some((it) => it === status)) {
        return 'red';
    }

    if (['PENDING'].some((it) => it === status)) {
        return 'gray';
    }
};
   
    return (<div> {isMobile ? (
            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                {selectedItem ? (
                // 👉 Show form view in center when a card is clicked
                <div style={{ width: "800px", maxWidth: "100%" }}>
                    <DataEntryFormView
                    id={selectedItem.id}
                    type="EDIT"
                    onCloseTab={() => setSelectedItem(null)} 
                    />
                </div>
                ) : (
                // 👉 Show list of cards
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <h3 style={{ color: "#b69901" }}>360 Degree Feedback List</h3>
                    <Flex vertical gap="middle">
                        <Radio.Group defaultValue="All" size="middle"
                            onChange={(v) => {
                                setFilter({
                                    ...filter,
                                    criteria: {
                                        ...filter.criteria,
                                        advanceSearch: {
                                            status: v.target.value
                                        }
                                    }
                                })
                            }}
                        >
                            <Radio.Button value="All">All</Radio.Button>
                            <Radio.Button value="PENDING">Pending</Radio.Button>
                            <Radio.Button value="SUBMITTED">Submitted</Radio.Button>
                        </Radio.Group>
                    </Flex>
                    {data?.items?.map((item) => (
                    <Badge.Ribbon 
                        color={getColorStatus(item.status || "")}  
                        text={toReadable(item.status || "")} >
                        <Card key={item.id} style={{ width: 300 }}>
                            <p>
                                <span  style={{ color: "#1677ff", cursor: "pointer" }}
                                    onClick={() => setSelectedItem(item)} 
                                >
                                    {item.empName || "n/a"}
                                </span>
                                {/* <span style={{ float: "right" }}>{item.status && 
                                    <Status size="small" text={item.status || ""} />
                                    // <Badge   text={toReadable(item.status || "")} />
                                    }</span> */}
                            </p>
                            {/* <p><strong>{item.empName} {item.empNo}</strong></p>                        */}
                            <p> {item.empNameKh}</p>
                            <p>{item.jobTitle}</p>
                        <Descriptions layout="vertical" size="small" column={2}>
                                <Descriptions.Item label="Business Unit">{item.buName}</Descriptions.Item>
                                <Descriptions.Item label="Function">{item.deptName}</Descriptions.Item>                            
                        </Descriptions>
                            {/* <p><strong>Job Level:</strong> {item.jobLevel}</p>
                            <p><strong>Business Unit:</strong> {item.buName}</p>
                            <p><strong>Function:</strong> {item.deptName}</p>
                            <p><strong>Modified By:</strong> {item.lastModifiedBy}</p>
                            <p><strong>Modified Date:</strong> {formatDate(item.lastModifiedDate)}</p>
                            <p>
                            <strong>Status:</strong>{" "}
                            {item.status && <Status size="small" text={item.status || ""} />}
                            </p> */}
                            <p>Due Date: {formatDate(item.dueDate)}</p>
                        </Card>
                    </Badge.Ribbon>
                    ))}
                </div>
                )}
            </div>
        
        ):(<PageWrapper<DF360EmpListItem, DF360InfoAdvanceSearchParams, {}>
    
        tabRender={item => 
            access.canAccessDF360NewForm?[{
                action: "add",
                tabIcon: <FileOutlined />,
                tabLabel: 'New Form',
                panel: (props) => <DataEntryView type="CREATE"
                                    onCloseTab={() => {
                                        props?.onCloseTab?.()
                                        refetch()
                                    }}
                                    // openInTab onBack={() => { }} type="CREATE" 
                                />,
            },{               
                action: 'view',
                value: item?.formNo ||item?.empNo || "n/a",
                tabLabel: item?.formNo || item?.empName +' ('+item?.empNo+')' || 'Draft',
                panel: (props) => <DataEntryFormView id={item?.id} type="EDIT"
                                    onCloseTab={() => {
                                        props?.onCloseTab?.()
                                        refetch()
                                    }} 
                                    // openInTab onBack={() => { }} type="CREATE" 
                                />,
            }]:[{               
                action: 'view',
                value: item?.formNo ||item?.empNo || "n/a",
                tabLabel: item?.formNo || item?.empName +' ('+item?.empNo+')' || 'Draft',
                panel: (props) => <DataEntryFormView id={item?.id} type="EDIT"
                                    onCloseTab={() => {
                                        props?.onCloseTab?.()
                                        // refetch()
                                    }} 
                                    // openInTab onBack={() => { }} type="CREATE" 
                                />,
            }]}
        listView={{
            type: 'Table',
            title: "360 Degree Feedback List",
            statuses: [
                { option: { label: 'All', value: 'ALL', default: true }, },   
                // { option: { label: 'Draft', value: 'DRAFT' }, },                
                { option: { label: 'Pending', value: 'PENDING' }, },
                // {
                //     option: { label: 'Submitted', value: 'SUBMITTED', }, subOptions: [
                //         { label: 'All', value: 'ALL', default: true },
                //         { label: 'Pending', value: 'PENDING' }, 
                //         { label: 'Approved', value: 'APPROVED', subOptions:[  
                //                 { label: 'All', value: 'ALL', default: true },
                //                 { label: 'Posted', value: 'POSTED' },
                //                 { label: 'Failed', value: 'FAILED' }
                //             ] 
                //         },
                //         { label: 'Rejected', value: 'REJECTED' },
                //     ]
                // },
                { option: { label: 'Submitted', value: 'SUBMITTED' },}                  
            
            ],
            onRefresh: refetch,
            onFilter: (params, page, sort) => {
                setFilter(v=>({
                    ...filter,
                    criteria: {
                        ...filter.criteria,
                        advanceSearch: {
                            status: params?.status || 'ALL'
                        },
                        sort: sort,
                    },
                    pagination: page,
                }))
            },
            props: {
                dataSource: data?.items||[],
                pagination: { total: data?.total},
                loading: false,
                scroll: { x: 'max-content' },
                bordered: true,
                actionButtonsColumnRender: (item) => ([
                     {
                            tooltip: 'View data in new browser tab', type: 'link',
                            // disabled: item.processStatus == 'DRAFT',
                             size: 'small', icon: <ExportOutlined />,
                            onClick: () => openPR(item.id)
                        },
                ]),
                columns: [
                    {
                        title: 'Form No',dataIndex: 'formNo', sorter: 'formNo',
                        width: 100,
                        actionProps: (item) => ({ type: 'view', label: item.formNo || "n/a" })
                    }, {
                        title: 'Employee No',
                        width: 130,
                        sorter: 'empCode',
                        render: (_, r) => r.empNo,
                    }, {
                        title: 'Employee Name',
                        width: 180,
                        sorter: 'empName',
                        render: (_, r) => r.empName,
                    }, {
                        title: 'Employee Name(KH)',
                        width: 180,
                        sorter: 'empNameKh',
                        render: (_, r) => r.empNameKh,
                    }, {
                        title: 'Position',
                        // width: 130,
                        sorter: 'jobTitle',
                        render: (_, r) => r.jobTitle,
                    }, {
                        title: 'Job Level',
                        // width: 130,
                        sorter: 'jobLevel',
                        render: (_, r) => r.jobLevel,
                    }, {
                        title: 'Business Unit',
                        // width: 130,
                        sorter: 'buName',
                        render: (_, r) => r.buName,
                    }, {
                        title: 'Function',
                        // width: 130,
                        sorter: 'deptName',
                        render: (_, r) => r.deptName,
                    }, {
                        title: 'Modified By',
                        // width: 130,
                        sorter: 'lastModifiedBy',
                        render: (_, r) => r.lastModifiedBy,
                    }, {
                        title: 'Modified Date',
                        width: 100,
                        sorter: 'lastModifiedDate',
                        render: (_, r) =>  formatDate(r.lastModifiedDate),
                    },{
                        title: 'Status',
                        width: 100,
                        sorter: 'status',
                        render: (_, r) => r.status && <Status size="small" text={r.status||''} />,
                    }, {
                        title: 'Due Date',
                        width: 100,
                        sorter: 'dueDate',
                        render: (_, r) =>  formatDate(r.dueDate),
                    }
                ]
            }
        }}
    />)}
    </div>)
}