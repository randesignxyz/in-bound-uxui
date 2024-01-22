// import { ModalForm, ModalFormProps, ProFormSelect, ProFormText, ProFormTextArea, ProTable } from "@ant-design/pro-components";
// import { useEffect, useState } from "react";
// import { GratisServices } from "../../services";
// import { simpleRequestActions } from "@/services/model";
// import { AdjustItem, ItemDetail, SaleOrder } from "../../types";
// import { formatDate } from "@/pages/utils";
// import { ColumnsType } from "antd/es/table";
// import moment from "moment";
// import { message } from "antd";

// interface Props extends ModalFormProps<{status:string, remarks: string}>{
//     verifyId: number;
//     required?: boolean
//     onSave: (status: string ,remarks: string,selected: AdjustItem[], cb:(v: boolean)=>void) => void;
//     trigger?: JSX.Element;
// }

// interface DataType {
//     key: React.ReactNode;
//     name: string; 
//     children?: DataType[];
//     uuId: string; 
//     id?: number;
//     docNum?: number;
//     docDate?: moment.Moment;
//     itemLineNum?: number;
//     itemCode?: string;
//     itemName?: string;
//     qty?: number;
//     uomCode?: string;
//     itemDate?: moment.Moment;
//     customerId?: number;
//     customerCode?: string;
//     contractVerifyId?: number;
//     verifiedDate?:moment.Moment;
//   }
   

// export default ( {verifyId,trigger,required, onSave, ...rest} : Props) => {
//     const requestActions = simpleRequestActions()
//     const [open,setOpen] = useState<boolean>(false)
//     const [data, setData] = useState<DataType[]>()
//     const [selected, setSelected] = useState<AdjustItem[]>([])

//     // useEffect(()=>{
//     //     // if((!data || data?.length==0) && verifyId>0)loadData()
//     // },[data])
//     const loadData = async ()=>{
//         const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)    
//         setData( rs.map(it => {
//             var children = it.items?.map(it => {return({
//                 key: `${it.uuId}`,
//                 name: it.itemCode,
//                 uuId: it.uuId,
//                 id: it.id,
//                 docNum: it.docNum,
//                 docDate: formatDate(it.docDate),
//                 itemLineNum: it.itemLineNum,
//                 itemCode: it.itemCode,
//                 itemName: it.itemName,
//                 qty: it.qty,
//                 uomCode: it.uomCode,
//                 itemDate:it.itemDate,
//                 customerId: it.customerId,
//                 customerCode: it.customerCode,
//                 contractVerifyId: it.contractVerifyId,


//             })as DataType})
//             return (
//                 {
//                 key: `${it.uuId}`,
//                 name: it.itemName, 
//                 verifiedDate: it.verifiedDate,
//                 children: children
//                 }
//             ) as DataType
//         }))
//     }
    
//     return <ModalForm trigger={trigger}
//         {...rest}
        
//         submitter={{
//             searchConfig: {
//                 submitText: 'Add',
//             }
//         }}
        
//         open={open}
//         onFinish = {async dataForm => {
            
//             onSave(dataForm.status,dataForm.remarks,selected,(v)=>{ 
//                 setSelected([]) 
//                 setData([])     
//                 setOpen(!v);
//             });
//             return false;
//         }} 
//         onOpenChange={(v)=>{          
//             if(v && verifyId>0) loadData()
//             setOpen(v);
//         }}  
//     >
//         {/* <ProFormText rules={[{required }]}  label= "Label" name={'label'} /> */}
//         {/* <ProFormSelect rules={[{required:true }]}  label='Status'  name={'status'} options={[{label:'Achieved',value:'ACHIEVED'},{label:'Failed',value:'FAILED'}]} />
//         <ProFormTextArea rules={[{required: true }]}  label= "Remarks" name={'remarks'} /> */}
//         <ProTable<DataType>
//             loading = {requestActions.request?.loading|| false}
//             search={false}
//             options={{
//                 fullScreen: false,
//                 density: false,
//                 reload: false,
//                 setting: false,
//             }} 
//             columns={[
//                 {
//                     title:'Item Code',
//                     // dataIndex:'name',
//                     render:(_,r)=> formatDate(r.verifiedDate)
                    
//                 },
//                 {
//                     title:'Item Name',
//                     dataIndex:'itemName'
//                 },
//                 {
//                     title:'Order No',
//                     dataIndex:'docNum'
//                 },{
//                     title:'Order Date',
//                     render:(_,r)=> formatDate(r.docDate)
//                 }, {
//                     title:'Qty',
//                     align:'right',
//                     dataIndex:'qty'
//                 }
//             ]}
//             // request={ async(page: any)=>{
//             //     const rs = await GratisServices.gratisSaleOrderList(verifyId).query(requestActions)              
//             //     return{               
//             //         success: true, 
//             //         total: rs.length || 0,
//             //         data: rs
//             //     }
//             // }}
//             dataSource={data}
//             // expandable={{
//             //     expandedRowRender: (record => ItemDetial(record.items)),
//             //     rowExpandable: record => true,
//             // }}
//             rowKey="key"
            
//             rowSelection={{
//                 checkStrictly : false,
//                 selections: false,//["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
//                 onSelect(item, selected1) {
//                     var rs = [] as AdjustItem[]
//                         if(item.children!= null && item.children.length>0){
//                             rs =  item?.children?.map(it =>  ({
//                                 uuId: it.uuId,
//                                 id: it.id, 
//                                 docNum: it.docNum,
//                                 itemLineNum: it.itemLineNum,
//                                 itemCode: it.itemCode,
//                                 customerId : it.customerId,
//                                 customerCode: it.customerCode,
//                                 contractVerifyId: it.contractVerifyId
//                             })as AdjustItem)
//                         }else{
//                             rs = [item]
//                         }
//                     if (selected1) {

//                         setSelected(v => [...v,...(rs.filter(it =>selected.find(r => r.uuId===it.uuId)?.uuId !=it.uuId )||[])])
//                     } else {
//                         setSelected(v => v?.filter(it => rs.find(r=> r.uuId === it.uuId)?.uuId != it.uuId ))
//                     }
//                 },
//                 onChange(_, selectedRows, info) {
//                     if (info.type !== 'single') {
//                         var rows =selectedRows.filter(it => (it.children||[])?.length>0?false:true)
//                         setSelected(rows)
//                     }
//                 },
//             }}
//         />

//     </ModalForm>
// }

// /*
// const ItemDetial = (data?: ItemDetail[]) => {
//     return (
//     <ProTable<ItemDetail> 
        
//         search={false}
//         options={{
//             fullScreen: false,
//             density: false,
//             reload: false,
//             setting: false,
//         }} 
//         columns={[
//             {
//                 title:'Order No',
//                 dataIndex:'docNum'
//             },
//             {
//                 title:'Order Date',
//                 render:(_,r)=> formatDate(r.docDate)
//             },
//             {
//                 title:'#',
//                 dataIndex:'itemLineNum'
//             },
//             {
//                 title:'Item Code',
//                 dataIndex:'itemCode'
//             },
//             {
//                 title:'Item Name',
//                 dataIndex:'itemName'
//             },
//             {
//                 title:'Qty',
//                 align:'right',
//                 dataIndex:'qty'
//             },
//             {
//                 title:'UoM',
//                 dataIndex:'uomCode'
//             }
//         ]} 
//         dataSource={data}
//         rowKey="id"
//         rowSelection={{
//             selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
//         }}
//     />
//     )
// }*/