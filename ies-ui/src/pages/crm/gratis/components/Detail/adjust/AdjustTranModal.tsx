import { EditableFormInstance,  ModalForm, ModalFormProps, ProCard, ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { GratisServices } from "../../../services";
import { simpleRequestActions } from "@/services/model";
import { AdjustItem, AdjustInfoOn, AdjustInfoItemDetail, ItemSAP } from "../../../types";
import { toReadable } from "@/pages/utils";
import { Button,Space, Table, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import AdjustItemModal from "./AdjustItemModal";
import ListItemSearchModal from "./ListItemSearchModal";

interface Props extends ModalFormProps<{status:string, remarks: string}>{
    verifyId: number;
    customerCode?: string;
    required?: boolean
    onSave: (status: string ,remarks: string,adjItems: AdjustItem[], cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
}

 const AdjustTranModal= ( {verifyId,customerCode,trigger,required, onSave, ...rest} : Props) => {
    const requestActions = simpleRequestActions()
    const [open,setOpen] = useState<boolean>(false)
    const [data, setData] = useState<AdjustInfoOn[]>()
    const editableFormRef = useRef<EditableFormInstance>();
    const [selected, setSelected] = useState<AdjustItem[]>([])
    const [modalSearch, setModalSearch] = useState<{
        type: 'itemSearch';
        cb: (item:ItemSAP) => void;
    }>()
   
    useEffect(()=>{
        if(verifyId>0) loadData()
    },[])
    const loadData = async ()=>{
        const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)    
        setData(rs)
    }
    
    return <ModalForm trigger={trigger} width={'70%'}
        {...rest}   
        submitter={{
            searchConfig: {
                submitText: 'Save',
            }
        }}
        open={open}
        onFinish = {async dataForm => {   
            await editableFormRef.current?.validateFields()  
            if (selected && selected.length == 0) {
                message.error("No adjust item avaible.")
            }else{
                onSave(dataForm.status,dataForm.remarks,selected,(v)=>{ 
                    setSelected([]) 
                    setData([])     
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
                dataSource={selected}
                columns={[
                    {
                        title:'Description', 
                        dataIndex:'dscription',
                        render:(_,r)=> toReadable(r.dscription)
                    },
                    {title:'Doc Num', dataIndex:'docNum'},
                    {title:'Item Code', dataIndex:'itemCode'},
                    {title:'Item Name', dataIndex:'itemName'},
                    {title:'Qty', dataIndex:'qty'},
                    {
                        title:'',
                        width: 25,
                        render:(_,r) => {
                            var initData = data?.find(it=> it.uuId==r.uuId)
                            return [<Space>
                                <AdjustItemModal initData={r}  addHandler={(item:AdjustItem)=> { setSelected(i=> i.map(it=> it.uuId==r.uuId?{...it,qty: item.qty}:it)) }}  
                                    trigger={<Button size="small" type='link' icon={<EditOutlined/>} />}
                                />                                    
                                <Button size="small" type='link' icon={<DeleteOutlined/>} danger 
                                    onClick={(value)=>{
                                        setSelected(i=> i.filter(it => it.uuId!= r.uuId))
                                    }}
                                />
                            </Space>
                        ]}
                    }
                ]}
            />
            <ListItemSearchModal    
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
            />    
        </ProCard>
    </ModalForm>
}


export default AdjustTranModal


const ItemDetial = (data?: AdjustInfoItemDetail[]) => {
    return (
    <Table<AdjustInfoItemDetail> 
        footer={(data)=> false}
        columns={[
            {
                title:'Name',
                dataIndex:'itemName'
            },{
                title:'Code',
                dataIndex:'itemCode'
            },{
                title:'Qty',
                align:'right',
                dataIndex:'qty'
            }
        ]} 
        dataSource={data}
    />
    )
}