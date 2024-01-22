import { EditableFormInstance, EditableProTable, ModalForm, ModalFormProps, ProCard, ProForm, ProFormCheckbox, ProFormDigit, ProList, ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { GratisServices } from "../../../services";
import { simpleRequestActions } from "@/services/model";
import { AdjustItem, AdjustInfoOn, AdjustInfoItemDetail } from "../../../types";
import { formatDate, toReadable } from "@/pages/utils";
import { Button, Input, Popconfirm, Space, Table, message } from "antd";
import { uniqueId } from "lodash";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { itRequestSessions } from "@/pages/ict/it-request/RequestForm";
import { useForm } from "antd/es/form/Form";
import AdjustItemModal from "./AdjustItemModal";

interface Props extends ModalFormProps<{status:string, remarks: string}>{
    verifyId: number;
    customerCode?: string;
    required?: boolean
    onSave: (status: string ,remarks: string,adjItems: AdjustItem[], cb:(v: boolean)=>void) => void;
    trigger?: JSX.Element;
}

 const AdjustTranModal= ( {verifyId,customerCode,trigger,required, onSave, ...rest} : Props) => {
    const requestActions = simpleRequestActions()
    // const [form] = useForm<AdjustItem>()
    const [open,setOpen] = useState<boolean>(false)
    const [data, setData] = useState<AdjustInfoOn[]>()
    const editableFormRef = useRef<EditableFormInstance>();
    const [selected, setSelected] = useState<AdjustItem[]>([])
    // const [dataSource, setDataSource] = useState<(AdjustItem)[]>()
   
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
            // var data = await form.validateFields()    
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
            // console.log('Adjust Item',selected)   
           
            return false;
        }} 
        onOpenChange={(v)=>{          
            // if(v && verifyId>0) loadData()
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
                dataSource={selected}
                columns={[
                    {
                        title:'From', 
                        dataIndex:'dataSource',
                        render:(_,r)=> toReadable(r.dscription)
                    },
                    {title:'Invoice/SO', dataIndex:'docNum'},
                    {title:'Item Code', dataIndex:'itemCode'},
                    {title:'Item Name', dataIndex:'itemName'},
                    {title:'Qty', dataIndex:'qty'},
                    {
                        title:'',
                        width: 25,
                        render:(_,r) => {
                            var initData = data?.find(it=> it.uuId==r.uuId)
                            return [<Space>
                            <AdjustItemModal dataLookup={data} edit={true} initData={r}  addHandler={(item:AdjustItem)=> { setSelected(i=> i.map(it=> it.uuId==r.uuId?item:it)) }}  trigger={
                            <Button size="small" icon={<EditOutlined/>} type="default" ></Button>}
                            />                                    
                            <Button size="small" icon={<DeleteOutlined/>} danger 
                                onClick={(value)=>{
                                    setSelected(i=> i.filter(it => it.uuId!= r.uuId))
                                }}
                            />
                            </Space>
                        ]}
                    }
                ]}
            />
            <AdjustItemModal dataLookup={data} cusomterCode={customerCode} 
                initData={{
                    uuId:'',
                    docNum:'' ,
                    dscription: data?.find(it=> it.contractVerifyId===verifyId)?.dscription
                }} 
                addHandler={(item:AdjustItem)=> { setSelected(i=> ([...i.map(it=>it),item]) )}} 
                trigger={<Button
                    size="small"
                    style={{ width: '100%', marginBottom: 8 }}
                    type="dashed"
                    icon={<PlusOutlined />}
                    
                > Adjust Item</Button>} 
            />
        </ProCard>

    </ModalForm>
}


export default AdjustTranModal


const ItemDetial = (data?: AdjustInfoItemDetail[]) => {
    return (
    <Table<AdjustInfoItemDetail> 
        // search={false}
        footer={(data)=> false}
        // options={{
        //     fullScreen: false,
        //     density: false,
        //     reload: false,
        //     setting: false,        
        // }} 
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
        // rowKey="id"
        // rowSelection={{
        //     selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
        // }}
    />
    )
}