import PageWrapper from "@/components/PageWrapper"
import { FileOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Spin } from "antd"
import { RegisterCuistomerInfoAdvanceSearchParams, RegisterCustomerInfo } from "./data"
import DataEntryView from "./DataEntryView"

export default()=>{
    return(<Spin spinning={false}>
        <PageWrapper<RegisterCustomerInfo, RegisterCuistomerInfoAdvanceSearchParams, {}>
            tabRender={item => [
                {
                    action: "add",
                    tabIcon: <FileOutlined />,
                    tabLabel: 'New P  ',
                      panel: (props) => <DataEntryView
                                            // onCloseTab={() => {
                                            //     props?.onCloseTab?.()
                                            //     // refetch()
                                            // }} 
                                            // openInTab onBack={() => { }} type="CREATE" 
                                            />,
                }
            ]} 
            listView={{
                // actionButtons: ,
                type: 'Table',
                title: "Register Customer List",
                statuses: [
                    { option: { label: 'All', value: 'ALL', default: true }, },                   
                    { option: { label: 'Pending', value: 'PENDING' }, },
                    {
                        option: { label: 'Submitted', value: 'SUBMITTED', }, subOptions: [
                            { label: 'All', value: 'ALL', default: true },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Rejected', value: 'REJECTED' },
                        ]
                    },
                    { option: { label: 'Canceled', value: 'CANCELED' },}                  
                
                ],
                props: {
                    dataSource: [],
                    pagination: { total: 0 },
                    loading: false,
                    scroll: { x: 'max-content' },
                    bordered: true, 
                    columns: [
                        {
                            title: 'Form No', sorter: 'formNo',
                            width: 100,
                            actionProps: (item) => ({ type: 'view', label: "n/a" })
                        }
                    ]
                }
            }}
        />
    </Spin>)
}