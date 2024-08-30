import { ModalFormProps, ProCard} from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { ContactData, SaveContract } from "./data"
import { useEffect,useState } from 'react';
import { Alert, Button, Space, Switch } from "antd";
import { HistoryOutlined } from "@ant-design/icons";

import { Typography } from 'antd';
import { EssProfileData } from "./data.ess";

const { Paragraph, Text } = Typography;

interface Props extends ModalFormProps { 
    visible?:boolean,
    message?: String,
    description?:String,
    opentitle:String,
    type?:String,
    step:number
    cb:{onStartModify: (tid:number) => void; },
    data:EssProfileData,
    is_admin:boolean
}

export default ({visible,message,description,opentitle,type,step,cb,data,is_admin,...rest}: Props) => { 
    
    const [display,setDisplay] = useState(false); 

    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        // if(data==null){ 
        //     setDisplay(true);
        // }
        // else{ 
        if(step==0){
            setDisplay(true);
        }else{
            setDisplay(visible!!);
        }
        // }
        if(is_admin){
            setDisplay(true); 
        } 
    };

    return <>
    <div style={{paddingTop:'10px',display:display==true?'none':''}}>    
        <Alert style={{width:'95%',margin:'auto'}} {...rest}
            message={<Typography.Title level={5}>{message}</Typography.Title>}
            description={<Space direction="vertical" style={{width:'100%'}}>
                <ProCard bordered title={"Announcement Title"}>
                    {opentitle}
                </ProCard> 
                <ProCard bordered title={"Issued Info"}>
                    <Paragraph ellipsis={{rows: 2, expandable: true, symbol: 'more' }}>
                        {description} 
                    </Paragraph>
                </ProCard>
            </Space> }
            type={type||"info"} 
            closable
            showIcon
            action={
                <Space direction="vertical"> 
                  <Button danger style={{display:step==1?'':'none'}} onClick={()=>cb.onStartModify(2)}><HistoryOutlined /> Start</Button>  
                </Space>
              }
        /> 
    </div>
  </>
}