import { EditableFormInstance,  ModalForm, ModalFormProps, ProCard, ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { GratisServices } from "../../../services";
import { simpleRequestActions } from "@/services/model";
import { AdjustItem, AdjustInfoOn, AdjustInfoItemDetail, ItemSAP } from "../../../types";
import { formatDate, toReadable } from "@/pages/utils";
import { Button,Space, Table, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import AdjustItemModal from "./AdjustItemModal";
import ListItemSearchModal from "./ListItemSearchModal";

interface Props extends ModalFormProps<{status:string, remarks: string}>{
    loading?: boolean;
    incentiveSettlementId: number;
    verifyId: number;
    customerCode?: string;
    required?: boolean
    onSave: (status: string ,remarks: string,adjItems: AdjustItem[], cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
    data?:ItemSAP[]
}

 const SuggestionItemAdjustTranModal= ( {loading,incentiveSettlementId,verifyId,customerCode,trigger,required, onSave,data, ...rest} : Props) => {
    const requestActions = simpleRequestActions()
    const [open,setOpen] = useState<boolean>(false)
    // const [data, setData] = useState<AdjustInfoOn[]>()
    const editableFormRef = useRef<EditableFormInstance>();
    // const [data, setData] = useState<ItemSAP[]>()
    const [selected, setSelected] = useState<AdjustItem[]>([])
    const [modalSearch, setModalSearch] = useState<{
        type: 'itemSearch';
        cb: (item:ItemSAP) => void;
    }>()
   
    // useEffect(()=>{
    //     if(verifyId>0) loadData()
    // },[verifyId])
    // const loadData = async ()=>{
    //     // const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)    
    //     // setData(rs)
    //     // const itemAdjList = await GratisServices.getListSuggestionItemAdjustment(incentiveSettlementId,verifyId).query(requestActions)
    //     // console.log('item adj',itemAdjList)
    //     // setData(itemAdjList)
    // }
    
    return <ModalForm trigger={trigger} width={'70%'}
        loading={loading}
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
                message.error("No item's selected.")
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
                loading={loading}
                style={{width:'100%'}}
                cardProps={false}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false,
                }} 
                pagination={false}
                dataSource={data}
                columns={[
                    {title:'#',dataIndex:'ds'},
                    {
                        title:'Description', 
                        dataIndex:'dscription',
                        render:(_,r)=> toReadable(r?.dscription||'')
                    },{
                        title:'Doc Date',
                        dataIndex:'docDate',
                        render:(_,r)=> formatDate(r.docDate)
                    },
                    {title:'Invoice/SO', dataIndex:'docNum'},
                    {title:'Item Code', dataIndex:'itemCode'},
                    {title:'Item Name', dataIndex:'itemName'},
                    {title:'Qty', dataIndex:'quantity'},
                    // {
                    //     title:'',
                    //     width: 25,
                    //     render:(_,r) => {
                    //         var initData = data?.find(it=> it.uuId==r.uuId)
                    //         return [<Space>
                    //             <AdjustItemModal initData={r}  addHandler={(item:AdjustItem)=> { setSelected(i=> i.map(it=> it.uuId==r.uuId?{...it,qty: item.qty}:it)) }}  
                    //                 trigger={<Button size="small" type='link' icon={<EditOutlined/>} />}
                    //             />                                    
                    //             <Button size="small" type='link' icon={<DeleteOutlined/>} danger 
                    //                 onClick={(value)=>{
                    //                     setSelected(i=> i.filter(it => it.uuId!= r.uuId))
                    //                 }}
                    //             />
                    //         </Space>
                    //     ]}
                    // }
                ]}
                rowKey='uuId' 
                rowSelection={{
                    selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                    checkStrictly: true,
                    onSelect(item, selected) {
                        if (selected) {
                            setSelected(v => (
                                    [...(v || []), 
                                        {...item, 
                                            dataSource: item.dataSource,
                                            qty: item.quantity, 
                                            contractVerifyId: verifyId,               
                                            startedDate: item?.startedDate,
                                            endedDate:item?.endedDate
                                        } as AdjustItem 
                                    ]
                                )
                            )
                        } else {
                            setSelected(v => v?.filter(it => it.uuId != item.uuId))
                        }
                    },
                    onChange(_, selectedRows, info) {
                        if (info.type !== 'single') {
                            setSelected(
                                selectedRows.map(it=> ({
                                    ...it, 
                                    dataSource: it.dataSource,
                                    qty: it.quantity, 
                                    contractVerifyId: verifyId,               
                                    startedDate: it?.startedDate,
                                    endedDate:it?.endedDate
                                }  as AdjustItem)) 
                            )
                        }
                    },
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


export default SuggestionItemAdjustTranModal


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