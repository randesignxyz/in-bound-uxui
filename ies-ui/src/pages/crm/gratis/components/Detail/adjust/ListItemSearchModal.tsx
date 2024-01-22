import { ModalForm, ModalFormProps, ProTable } from "@ant-design/pro-components";
import { ItemSAP } from "../../../types";
import { message } from "antd";
import { formatDate } from "@/pages/utils";


interface Props extends ModalFormProps<{}> {
    // trigger?: JSX.Element;
    // loading?: boolean;
    onSelected:(item: ItemSAP)=>void;
    loading?:boolean;
    dataSource?: ItemSAP[]
  
}
const ListItemSearchModal = ({onSelected, loading,dataSource,...rest}:Props) =>{
    return(
        <ModalForm<{}> {...rest} width={'60%'} size="small" layout="vertical" 
            // trigger={trigger}        
            // form={form}
            // open ={open}
            //  loading={loading}
            // modalProps={{
            //     maskClosable:false 
            //  }}
            onFinish={async dataForm=>{
                // onSelected?.();
                return true;
            }}
            submitter= {false}
        >
            <ProTable search={false}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false,
                }} 
               
                columns={[
                    {
                        title:'Doc Num',
                        dataIndex:'docNum'
                    },{
                        title:'Doc Date',
                        dataIndex:'docDate',
                        render:(_,r)=> formatDate(r.docDate)
                    },
                    {
                        title:'Item Code',
                        dataIndex:'itemCode'
                    },
                    {
                        title:'Item Name',
                        dataIndex:'itemName'
                    },
                    {
                        title:'Qty',
                        dataIndex:'quantity'
                    },
                    {
                        render:(_,r)=> <a onClick={()=> onSelected(r)} >Select</a>
                    }
                ]}
                rowKey='uuId'
                
                // rowSelection={{
                //     // selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                //     checkStrictly: false,
                    
                    
                // }} 
                dataSource={dataSource}
            />

         </ModalForm>
    )
}
export default ListItemSearchModal