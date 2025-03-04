import { EditableFormInstance,  ModalForm, ModalFormProps, ProCard, ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { GratisServices } from "../../../services";
import { simpleRequestActions } from "@/services/model";
import { AdjustItem, AdjustInfoOn, AdjustInfoItemDetail, ItemSAP, GratisVerifyItem, GratisVerifyItemDetail } from "../../../types";
import { toReadable } from "@/pages/utils";
import { Button,Space, Table, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import AdjustItemModal from "./AdjustItemModal";
import ListItemSearchModal from "./ListItemSearchModal";

interface Props extends ModalFormProps<{status:string, remarks: string}>{
    verifyId: number;
    customerCode?: string;
    required?: boolean;
    onSave: (status: string ,remarks: string,adjItems: number[], cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
}

 const RemoveAdjustTranModal= ( {verifyId,customerCode,trigger,required, onSave, ...rest} : Props) => {
    const requestActions = simpleRequestActions()
    const [open,setOpen] = useState<boolean>(false)
    // const [data, setData] = useState<AdjustInfoOn[]>()
    const [dataSource, setDataSource] = useState<GratisVerifyItemDetail[]>()

    const editableFormRef = useRef<EditableFormInstance>();
    const [selected, setSelected] = useState<number[]>([])
    // const [modalSearch, setModalSearch] = useState<{
    //     type: 'itemSearch';
    //     cb: (item:ItemSAP) => void;
    // }>()
   
    useEffect(()=>{
        if(verifyId>0 && open) loadData()
    },[open])
    const loadData = async ()=>{
        // const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)    
        // setData(rs)
        const criteria = {id: verifyId, filter: 'ADJ'}
        const rs1 = await GratisServices.fetchGratisVerifyItemDetailList(criteria).query(requestActions)
        setDataSource(rs1)
        console.log('verifyId',rs1)
        // return{               
        //     success: true, 
        //     total: rs.length || 0,
        //     data: rs
        // }
    }
    
    return <ModalForm trigger={trigger} width={'70%'}
        {...rest}   
        submitter={{
            searchConfig: {
                submitText: 'Ok',
            }
        }}
        open={open}
        onFinish = {async dataForm => {   
            // await editableFormRef.current?.validateFields()  
            console.log('selected items: ',selected)
            if (selected && selected.length == 0) {
                message.error("No item avaible.")
            }else{
                onSave(dataForm.status,dataForm.remarks,selected,(v)=>{ 
                    setSelected([]) 
                    // setData([])     
                    setOpen(!v);
                });
            }
           
            return false;
        }} 
        onOpenChange={(v)=>{          
            setOpen(v);
        }}  
    >
        <ProCard
            style={{width:'100%'}}
            bordered={true}
        >
            <ProTable search={false} size="small"
                style={{width:'100%'}}
                cardProps={false}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false,
                }} 
                pagination={false}
                dataSource={dataSource}
                columns={[
                    {
                        title:'Description', 
                        dataIndex:'description',
                        // render:(_,r)=> toReadable(r.dscription)
                    },
                    {title:'Doc Num', dataIndex:'docNum'},
                    {title:'Item Code', dataIndex:'itemCode'},
                    {title:'Item Name', dataIndex:'itemName'},
                    {title:'Qty', dataIndex:'qty'},                   
                ]}
                rowKey='id' 
                rowSelection={{
                    selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                    checkStrictly: true,
                    onSelect(item, selected) {
                        if (selected) {
                            setSelected(v => (
                                [...(v || []), item.id]))
                        }else{
                            setSelected(v => v?.filter(it => it != item.id))
                        }
                    },
                    onChange(_, selectedRows, info) {
                        if (info.type !== 'single') {
                            setSelected(selectedRows.map(it=> (it.id)))
                        }
                    }
                }}
            />
            {/* <ListItemSearchModal    
                verifyId = {verifyId}
                dataLookup={data} 
                cusomterCode={customerCode}           
                selectedItems={selected} 
                addHandler={(items:AdjustItem[])=> { setSelected(v=> [...v,...items])}} 
                trigger={<Button
                    size="small"
                    style={{ width: '100%', marginBottom: 0, marginTop:15 }}
                    type="dashed"
                    icon={<PlusOutlined />}
                    
                > Add Item</Button>}          
            />     */}
        </ProCard>
    </ModalForm>
}


export default RemoveAdjustTranModal


// const ItemDetial = (data?: AdjustInfoItemDetail[]) => {
//     return (
//     <Table<AdjustInfoItemDetail> 
//         footer={(data)=> false}
//         columns={[
//             {
//                 title:'Name',
//                 dataIndex:'itemName'
//             },{
//                 title:'Code',
//                 dataIndex:'itemCode'
//             },{
//                 title:'Qty',
//                 align:'right',
//                 dataIndex:'qty'
//             }
//         ]} 
//         dataSource={data}
//     />
//     )
// }