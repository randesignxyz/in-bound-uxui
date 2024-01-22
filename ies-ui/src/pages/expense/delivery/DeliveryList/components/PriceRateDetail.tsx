// import { domain } from '@/core/delivery'
import { Card, Descriptions } from 'antd'
import moment from 'moment'
import React from 'react'
import ItemPriceList from './ItemPriceList'
import { domain } from '@/services/del-expense/data'

const PriceRateDetail: React.FC<{ item: domain.delivery.DeliveryCost }> = ({ item }) => {
    return <Card title="Price Rate Preview" bordered={false} size='small'>
        <Descriptions>
            <Descriptions.Item label="Date">{moment(item.docDate).format("YYYY-MM-DD")}</Descriptions.Item>
            <Descriptions.Item label="Delivery No">{item.docNo}</Descriptions.Item>
            <Descriptions.Item label="Customer No">{item.customerNo}</Descriptions.Item>
            <Descriptions.Item label="Customer Name">{item.customerName}</Descriptions.Item>
            <Descriptions.Item label="Ship To">{`${item.province}/${item.district}`} </Descriptions.Item>
            <Descriptions.Item label="Price Place">{item.place}</Descriptions.Item>
            <Descriptions.Item label="Qty"><b>{item.qty}</b> </Descriptions.Item>
            <Descriptions.Item label="Amount"><b>{item.baseCurrAmount?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</b></Descriptions.Item>
        </Descriptions>
        <ItemPriceList item={item} />

    </Card>
}

export default PriceRateDetail