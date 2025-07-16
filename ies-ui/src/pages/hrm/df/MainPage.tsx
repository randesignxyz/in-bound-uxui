import PageWrapper from "@/components/PageWrapper"
import { DF360Form, DF360InfoAdvanceSearchParams } from "./data"
import { FileOutlined } from "@ant-design/icons"
import DataEntryView from "./DataEntryView"
import { formatDate } from "@/pages/utils"
import Status from "@/components/Status"

export default () => {
    return(<PageWrapper<DF360Form, DF360InfoAdvanceSearchParams, {}>

        tabRender={item => [
            {
                action: "add",
                tabIcon: <FileOutlined />,
                tabLabel: 'New Form',
                panel: (props) => <DataEntryView type="CREATE"
                                    onCloseTab={() => {
                                        props?.onCloseTab?.()
                                        // refetch()
                                    }} 
                                    // openInTab onBack={() => { }} type="CREATE" 
                                />,
            }
        
        ]}
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
            // onRefresh: refetch,
            onFilter: (params, page, sort) => {

            },
            props: {
                dataSource: [],
                pagination: { total: 0 },
                loading: false,
                scroll: { x: 'max-content' },
                bordered: true, 
                columns: [
                    {
                        title: 'Form No',dataIndex: 'formNo', sorter: 'formNo',
                        width: 100,
                        actionProps: (item) => ({ type: 'view', label: item.formNo || "n/a" })
                    }, {
                        title: 'Employee No',
                        width: 130,
                        sorter: 'empCode',
                        render: (_, r) => r.empCode,
                    }, {
                        title: 'Employee Name',
                        width: 130,
                        sorter: 'empName',
                        render: (_, r) => r.empName,
                    }, {
                        title: 'Employee Name(KH)',
                        width: 130,
                        sorter: 'empNameKh',
                        render: (_, r) => r.empNameKh,
                    }, {
                        title: 'Position',
                        width: 130,
                        sorter: 'jobTitle',
                        render: (_, r) => r.jobTitle,
                    }, {
                        title: 'Job Level',
                        width: 130,
                        sorter: 'jobLevel',
                        render: (_, r) => r.jobLevel,
                    }, {
                        title: 'Business Unit',
                        width: 130,
                        sorter: 'buName',
                        render: (_, r) => r.buName,
                    }, {
                        title: 'Function',
                        width: 130,
                        sorter: 'deptName',
                        render: (_, r) => r.deptName,
                    }, {
                        title: 'Modified By',
                        width: 130,
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
    />)
}