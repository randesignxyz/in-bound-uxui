import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";

const  PopconfirmMsg: React.FC<{title: string, description?: string,placement?: TooltipPlacement, onConfirm:()=>void , children?: React.ReactNode}> =({title, description,placement, onConfirm,children})=> {
    return (
       <Popconfirm 
           title={title}
           placement={placement}
           description={description}
           onConfirm={onConfirm}
           icon ={<ExclamationCircleOutlined style={{ color: 'red' }}/>}
       >
       {children}</Popconfirm>
       )
   };
export default PopconfirmMsg   