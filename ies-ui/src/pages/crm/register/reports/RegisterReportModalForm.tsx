import { FileExcelOutlined } from "@ant-design/icons"
import { ModalForm } from "@ant-design/pro-components"
import { Button } from "antd"
import { useForm } from "antd/es/form/Form"
import { useState } from "react"

type DataFormType = {    
    requestedDate: moment.Moment[]
    status?: string[]
    // formTypeId?: number[]
}
export default ({ trigger }: { trigger?: JSX.Element}) => {
    const [form] = useForm<DataFormType>()
     const [loading, setLoading] = useState(false)
    const bnts = [
        <Button onClick={()=>{form.resetFields()}}>Reset</Button>,
        <Button loading={loading} icon={<FileExcelOutlined/>} >Export</Button>
        // <Dropdown menu={menuProps}>
        //     <Button loading={loading}>
        //         <Space>
        //             Export <DownOutlined />
        //         </Space>
        //     </Button>
        // </Dropdown>
    ] 

    return <ModalForm<DataFormType>
        trigger={trigger}
        title ={'Probation Evaluation Report'}
        form={form}        
        modalProps={{maskClosable: false}}
        submitter = {{
            render(_, dom) {
                return [dom[0], ...bnts]
            }
        }}
    > 
     <div>hello</div>
    </ModalForm>
}