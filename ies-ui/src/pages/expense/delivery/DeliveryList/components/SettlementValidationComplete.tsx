/**
 * SKH-20230531
 * Validatin settlement DN(s) on Action(`Complete`) with cancelled='Y' or base current amount <=0 or no DN(s) in DN Claimed List.
 */
import { ModalForm, ProDescriptions, ProFormTextArea, ProTable} from "@ant-design/pro-components";
import { DlvExpenseServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import { Children, useEffect, useState } from "react";
import { DeliveryCost, DeliveryInvoiceItem } from "@/services/del-expense/data";
import { formatDate, formatter } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import { Button, Modal, Spin } from "antd";


export interface  DataFormType {
    completedRemarks?: string;
}
export default ({ trigger,settlementId,onFinish }: { trigger?: JSX.Element, settlementId: number,onFinish:(formData: DataFormType,cb:(v: boolean)=>void)=> void})=> {
    const [form] = useForm<DataFormType>();
    const [open,setOpen] = useState<boolean>(false);
    const [dataV, setDataV] = useState<DeliveryCost[]>([]);
    const [dataInv, setDataInv] = useState<DeliveryInvoiceItem[]>([]);
    const[loading,setLoading] = useState<boolean>(true)
    const requestActions = simpleRequestActions();
    const checkingDNs=async () => {
        const rs = await DlvExpenseServices.listDNChecking({deliveryId: settlementId}).query(requestActions);
        setDataV(rs.items);
        setLoading(false);
    };
    const checkingInvItems=async () => {
        const rs = await DlvExpenseServices.listInvItemBySettledId({deliveryId: settlementId}).query(requestActions);
        setDataInv(rs.items);
        setLoading(false);
    };    
    useEffect(() => {   
        if(open) {
            setLoading(true);
            checkingInvItems();
        }    
    },[open]);
    useEffect(() => {   
        if(dataInv && dataInv.length>0) {
            setLoading(true);            
            checkingDNs();   
        }    
    },[dataInv]);
    return <ModalForm
        trigger={trigger}
        open = {open}
        title="Submit Settlement"
        form = {form}   
        submitter={{
            searchConfig: {
                submitText: 'Ok',
            },
            render(_, dom) {  
                return ((dataInv && dataInv.length==0)||dataV.length>0)?[dom[0]]:[dom[0],dom[1]];
            },
        }}
       
        onFinish={async () => {   
           const formData = await form.validateFields();
           onFinish(formData,(v)=>{                
                setOpen(!v);
            });
        }} 
        onOpenChange={(v)=>{
            if(!v){
                setDataV([]);
                form.resetFields();               
            }
            setOpen(v);
        }}    
    >        
    {/* <Spin spinning = {requestActions.request?.loading || false}>   */}
    <Spin spinning = {requestActions.request?.loading || false} >        
       {(dataInv && dataInv.length>0) &&(dataV && dataV.length==0) && <ProFormTextArea label="Remarks" name="completedRemarks">
        </ProFormTextArea>}
        {(dataInv && dataInv.length==0) && <div style={{padding:'0px 0px 15px 25px'}}><span style={{color:'red'}}>Please make sure DN Claimed List is not empty.</span></div>}
        {(dataInv && dataInv.length>0) && (dataV && dataV.length>0)  && <div style={{padding:'0px 0px 15px 25px'}}><span style={{color:'red'}}>Please make sure Dilivery Note is not cancelled or zero amount.</span></div>}
       
        {(dataInv && dataInv.length>0) &&(dataV && dataV.length>0)  &&<div><ProTable<DeliveryCost>
            size="small"
            search={false}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }}
            bordered
           dataSource = {dataV}
        //    expandable={{
        //     expandedRowRender: (record => <ItemPriceList item={record} />),
        //     rowExpandable: record => true,
        //     }}
           columns={[
            {
                title: 'Date',
                render: (_, d) => formatDate(d.docDate),
                width: 100
            }, {
                title: 'DN #',
                dataIndex: 'docNo'
            }, {
                title: 'Customer No/Name',
                render: (_, d) => [d.customerNo, d.customerName].join('/')
            }, {
                title: 'Shipped To',
                render: (_, d) => [d.province, d.district].join('/')
            }/*, {
                title: 'Price Place',
                dataIndex: 'place'
            }*/, {
                title: 'Qty',
                align: 'right',
                dataIndex: 'qty'
            }, {
                title: 'Cancelled',
                align: 'center',
                dataIndex: 'cancelled'
            }, {
                title: 'Amount',
                align: 'right',
                render: (_, d) => formatter.format(d.baseCurrAmount || 0)
            }
        ]}
        />
        </div>
        }
    </Spin>
    </ModalForm>
};