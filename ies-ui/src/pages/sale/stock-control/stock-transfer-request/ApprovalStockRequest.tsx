import { ProTable } from "@ant-design/pro-components"

interface Props{

}

const ApprovalStockRequest:React.FC <Props> =({})=>{

    return (
        <>
            <ProTable
            
                columns={[
                    {
                        title:"Items Code",
                        dataIndex:"itemsCode"
                    },
                    {
                        title:"Items Name",
                        dataIndex:"itemsName"
                    },
                    {
                        title:"Quantity",
                        dataIndex:"qty"
                    },
                    {
                        title:"Remark",
                        dataIndex:"remark"
                    }
                ]}
            />
        </>
    )
}

export default ApprovalStockRequest