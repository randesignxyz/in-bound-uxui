
import { formatDate, formatter } from "@/pages/utils"
import { DeliveryCost } from "@/services/del-expense/data"
import { simpleRequestActions } from "@/services/model"
import ProTable from "@ant-design/pro-table"
import { Descriptions, Divider, Modal, ModalProps } from "antd"
import React, { useEffect, useState } from "react"
import { DlvExpenseServices } from "../services"
import { searchDeliveryCost } from "@/models/delivery"
import ItemPriceList from "./ItemPriceList"

interface Props extends ModalProps {
    params:searchDeliveryCost   
    onOkButton?: (data1: DeliveryCost[]) => void;
}

const MultiClaimedDialog: React.FC<Props> = (props) => {

    const { params,onOkButton, ...rest } = props;
    const [data, setData] = useState< DeliveryCost[]>([]);
    const requestActions = simpleRequestActions();

    useEffect(() => {
        if(props.open || props.visible) {
            init();
        }
        
    }, [props.open, props.visible]);

    const init = async () => {
       const rs = await DlvExpenseServices.listAllDNsBYEquaulOrLessThanSettledOn({...params,settledOn: params.settledOn.endOf('month')},0,20 ).query(requestActions)
       setData(rs.items);
    }

    return <Modal destroyOnClose title = "Unclaimed DNs" width='1000px' {...rest} 
        okText= { 'Claim All'}        
        onOk={()=>{
            onOkButton?.(data);
        }}
        okButtonProps={{
            disabled: (data && data.length>1)? false:true
        }}
    >
        <Descriptions style = {{margin: 20}} column={1} labelStyle={{ fontWeight: 'bolder' }}>           
            <Descriptions.Item label='Quntity'>{data?.find(it => it.docEntry == 0)?.qty || 0}</Descriptions.Item>
            <Descriptions.Item label='Total Amount'>
                {formatter.format(data?.find(it => it.docEntry == 0)?.baseCurrAmount || 0)}
            </Descriptions.Item>
        </Descriptions>
        <Divider/>
        <ProTable<DeliveryCost>
            search={false}
            loading = {requestActions.request?.loading || false}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }}
            bordered
            expandable={{
            expandedRowRender: (record => <ItemPriceList item={record} />),
                rowExpandable: record => true,
            }}
            rowKey='docEntry' 
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
                }, {
                    title: 'Price Place',
                    dataIndex: 'place'
                }, {
                    title: 'Qty',
                    align: 'right',
                    dataIndex: 'qty'
                }, {
                    title: 'Amount',
                    align: 'right',
                    render: (_, d) => formatter.format(d.baseCurrAmount || 0)
                }
            ]}

            dataSource={data?.filter(it => it.docEntry > 0)}

        />
    </Modal>
}

export default MultiClaimedDialog