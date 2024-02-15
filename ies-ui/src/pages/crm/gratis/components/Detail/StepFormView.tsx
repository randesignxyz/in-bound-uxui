import { ProFormInstance, StepsForm } from "@ant-design/pro-components"
import { VerifyGratisContact } from "../../types"
import { formatDate } from "@/pages/utils"
import { CheckCircleOutlined } from "@ant-design/icons"
import { StepProps } from "antd";
import { useRef } from "react";


interface Props{
    title?:string;
    data: VerifyGratisContact;
    onClick: (data:VerifyGratisContact)=>void;
    children?: React.ReactNode;
}
const StepFormView =({title,data,onClick, children}:Props) => {
    
    return (<StepsForm.StepForm       
        name={`${data.orderNo}-${data.status}`}        
        title={title}  
        onFinish={async () => {            
            return true;
        }}      
        key={`${data.uuid}`} 
        stepProps={{            
            onClick:()=>{ onClick(data)},
            status: data.status==='ACHIEVED'?'finish':'error',
            icon: data.status=='ACHIEVED'?<CheckCircleOutlined style={{color: 'green'}} key={data.status}/>:<CheckCircleOutlined style={{color: 'red'}} key={data.status}/>
        }}              
    >
       {children}
    </StepsForm.StepForm>)
}

export default StepFormView