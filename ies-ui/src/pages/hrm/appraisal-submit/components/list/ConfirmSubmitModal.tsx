import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProFormCheckbox, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { Button, Card, Checkbox, Col, Dropdown, Flex, message, Row, Space } from "antd"
import type { MenuProps } from 'antd';
import { useEffect, useState } from "react"
import { useForm } from "antd/es/form/Form"
import moment from "moment"
import { BU, Department, SubDepartment } from "@/pages/hrm/data"
import { EmployeeServices } from "@/pages/hrm/services"
import { DownOutlined, FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport, MultiRequest } from "@/services/apiGateway";
import { useSafeState } from "ahooks";

type DataFormType = {
    confirm?: boolean
}

export default ({ trigger, onFinish,open,onOpenModalChange }: { trigger?: JSX.Element,onFinish:()=>void, open?: boolean;
    onOpenModalChange:(v:boolean)=>void;}) => {
    const [form] = useForm<DataFormType>()
    const [confirm,setConfirm] = useState<boolean>(false)
    // const bnts = [
    //     <Button type="primary" onClick={()=>{}}>Ok</Button>
    // ]  
    // const empStatusDS = [{name:'Active',value:'ACTIVE'},{name:'Inactive',value:'INACTIVE'}]

    return <ModalForm<DataFormType>   
        form={form}
        open={open}
        onOpenChange={onOpenModalChange}
        trigger={trigger}
        title = "Reminder: Check Bell Curve Distribution"   
        modalProps={{
            closable: true,
            maskClosable: false
        }}
        submitter = {{
           
            searchConfig: {
                submitText: 'Ok',
            },
            submitButtonProps:{
                disabled: !confirm
            }        
        }}      
        onFinish={async(dataForm: DataFormType)=>{           
            onFinish() 
            return true
        }}
    >
        <Card>
            <Space direction="vertical">
                <span>Please review all of your appraisals to ensure they align with the recommended bell curve distribution. Submissions with significant deviations may require additional review.</span>
                <ProFormCheckbox name="confirm" fieldProps={{onChange:(v)=> setConfirm(v?.target?.checked||false)}}>Tick to confirm that your appraisals meet the required distribution prior to submission.</ProFormCheckbox>
            </Space>
            
        </Card>  
    </ModalForm>
}