import { ActionType, ModalForm, ModalFormProps, ProFormSelect, ProTable } from "@ant-design/pro-components";
import { AdjustInfoOn, AdjustItem, ItemSAP } from "../../../types";
import {Input, Space, message  } from "antd";
import { formatDate, toReadable } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import { useRef, useState } from "react";
import { GratisServices } from "../../../services";
import { simpleRequestActions } from "@/services/model";

interface Props extends ModalFormProps<{}> {
    verifyId: number;
    trigger?: JSX.Element;
    selectedItems: AdjustItem[];
    addHandler:(item: AdjustItem[])=>void;
    dataLookup?: AdjustInfoOn[];
    cusomterCode?:string;  
}
const ListItemSearchModal = ({verifyId,trigger,selectedItems, addHandler, dataLookup, cusomterCode}:Props) =>{
    const [form] = useForm<AdjustItem>() 
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions() 
    const [selectedFrom, setSelectedFrom] = useState<AdjustInfoOn>()
    const [searchData, setSearchData] = useState<ItemSAP[]>()
    const [selected, setSelected] = useState<AdjustItem[]>()
    // const [docNum,setDocNum] = useState<string>()

    const onSearch=async (value:string)=>{
        try{
            form.validateFields()            
            // setDocNum(value)
            if(value=='' || value.length<4) return
            const rs = await GratisServices.getListItemAdjustment(verifyId,cusomterCode,value,selectedFrom?.dataSource,selectedFrom?.startedDate,selectedFrom?.endedDate).query(requestActions)             
            if(rs && rs.length>0){  
                setSearchData(rs)
            }else{
                message.warning('Not found')
            } 
        }catch(ex){
            message.error('Not found')
        }
    }
    return(
        <ModalForm<AdjustItem> width={'60%'}  layout="vertical" 
            form={form}                        
            trigger={trigger}    
            title='Find: Invoice / SO'
            modalProps={{
                maskClosable:false
            }}
            submitter={{
                searchConfig: {
                    submitText: 'Add',
                    resetText: 'Close'
                },
                render(_,defaultDoms) {
    
                    if (defaultDoms.length > 1) {
                        return [
                            defaultDoms[0],
                            (selected||[])?.length>0&&defaultDoms[1],
                        ]
                    }
                    else return defaultDoms
                },
            }}
            onFinish={async dataForm=>{
                console.log('selected',selected)
                addHandler(selected||[])
                setSearchData(v=> v?.filter((it:any)=> !!!selected?.find(i=>i.uuId===it.uuId)))
                setSelected([])
                return Promise.resolve()
            }}
           
            onValuesChange={(record:any, data:AdjustItem)=> {
                var dscription = record.dscription
                if(dscription){
                    setSelectedFrom(it=> dataLookup?.find(it=> it.dscription==dscription))
                }           
            }}
        ><Space direction='vertical' style={{width: '100%'}} >            
            <ProTable   loading={requestActions.request?.loading} 
                size="small"
                search={false}
                bordered
                cardProps={false}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false
                }}       
                pagination={false}      
                headerTitle={               
                    <Space>
                        <ProFormSelect  width={220} allowClear={false}  rules={[{required:true, message:''  }]}  label='From'  name={'dscription'}
                            options={dataLookup?.map(it=> ({label: toReadable(it.dscription), value:it.dscription}))} />
                        <Input.Search  loading={requestActions.request?.loading}   placeholder='Invoice/SO'allowClear={true}  style={{marginTop:15}} onSearch={(value,_)=>onSearch(value)}/>
                    </Space>  
                }             
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
                    }                  
                ]}
                rowKey='uuId' 
                rowSelection={{
                    selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                    checkStrictly: true,
                    getCheckboxProps: (data) => ({ disabled: !!selectedItems.find(it=> it.docNum==data.docNum && it.itemCode==data.itemCode) }),
                    onSelect(item, selected) {
                        if (selected) {
                            setSelected(v => (
                                    [...(v || []), 
                                        {...item, 
                                            dataSource: selectedFrom?.dataSource,
                                            qty: item.quantity, 
                                            contractVerifyId: selectedFrom?.contractVerifyId||0,               
                                            startedDate: selectedFrom?.startedDate,
                                            endedDate:selectedFrom?.endedDate
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
                                    dataSource: selectedFrom?.dataSource,
                                    qty: it.quantity, 
                                    contractVerifyId: selectedFrom?.contractVerifyId||0,               
                                    startedDate: selectedFrom?.startedDate,
                                    endedDate:selectedFrom?.endedDate
                                }  as AdjustItem)) 
                            )
                        }
                    },
                }}
                dataSource={searchData}
            />
         </Space>
         </ModalForm>
    )
}
export default ListItemSearchModal