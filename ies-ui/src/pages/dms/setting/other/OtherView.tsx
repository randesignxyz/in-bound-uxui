import { ProTable } from "@ant-design/pro-components"

interface Props{
    actionKey?:string
}

const OtherView :React.FC<Props> = ({ actionKey }) =>{

    return (
        <>
            <ProTable
                columns={[
                    {
                        title:"Name",
                        dataIndex:"name",
                    },
                    {
                        title:"Name",
                        dataIndex:"name",
                    },
                ]}
            />
            
        </>
    )
}


export default OtherView