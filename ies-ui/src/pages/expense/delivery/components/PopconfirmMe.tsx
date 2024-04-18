import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import { RenderFunction } from "antd/es/_util/getRenderPropValue";
import { TooltipPlacement } from "antd/lib/tooltip";

const  PopconfirmMe: React.FC<{title: string,icon?: React.ReactNode, description?: React.ReactNode | RenderFunction,placement?: TooltipPlacement, onConfirm:()=>void , children?: React.ReactNode}> =({title, icon, description,placement, onConfirm,children})=> {
    return (
       <Popconfirm 
           title={title}
           placement={placement}
           description={description}
           onConfirm={onConfirm}
           icon ={ icon? icon:<ExclamationCircleOutlined style={{ color: 'red' }}/>}
       >
       {children}</Popconfirm>
       )
   };
   export default PopconfirmMe   