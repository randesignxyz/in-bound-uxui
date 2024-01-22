import React, { useEffect } from 'react'
import { Modal, Card, Descriptions, Table, Spin } from 'antd'
// import { domain } from '@/core/delivery'
import moment from 'moment'
import { ColumnsType } from 'antd/lib/table'

import { Tabs } from 'antd';
import useQueryData from '@/hooks/useQueryData'
import { SAPServiceType } from '@/services/API'
import { domain } from '@/services/del-expense/data';

const { TabPane } = Tabs;

const itemCols: ColumnsType<domain.delivery.OutsourcePriceItem> = [
    {
        title: 'Item Code',
        dataIndex: 'itemCode',
        width: '200px'
    },
    {
        title: 'Name',
        dataIndex: 'shortName',
    },
    {
        title: 'Unit',
        dataIndex: 'unit',
        align: 'right',
        width: '200px'
    },
    {
        title: 'Price',
        dataIndex: 'price',
        align: 'right',
        width: '200px'
    },
    {
        title: 'Currency',
        dataIndex: 'currency',
        width: '30px'
    }
]

const PricePreview: React.FC<{
    visible: boolean;
    delivery?: domain.delivery.DeliveryItem;
    docEntry: number;
    onCancel: () => void
}> = ({
    visible,
    delivery,
    docEntry,
    onCancel
}) => {

        const priceRate = useQueryData<{ docEntry: number }, domain.delivery.OutsourcePrice>({ name: 'SAP', action: 'query_outsource_price_by_doc_entry' } as SAPServiceType)
        useEffect(() => {
            if (visible) priceRate.load({ docEntry: docEntry })
        }, [visible, docEntry])

        return <Modal
            title={'Price Preview'}
            width={'1000px'}
            open={visible}
            destroyOnClose
            footer={false}
            onCancel={onCancel}>
            <Spin spinning={priceRate.loading}>
                <Tabs>
                    {
                        (priceRate.result?.data || []).map((item, index) => {
                            return <TabPane tab={`Price ${index + 1}`} tabKey={item.id.toString()} key={item.id} >
                                <Card key={`card-${item.id}`} >
                                    <Descriptions style={{ alignContent: 'right' }} colon key={`description-${item.id}`}>
                                        <Descriptions.Item label="Outsource">{delivery && delivery.outsource}</Descriptions.Item>
                                        <Descriptions.Item label="Province">{item.province}</Descriptions.Item>
                                        <Descriptions.Item label="Place">{item.place}</Descriptions.Item>
                                        <Descriptions.Item label="Place Description">{item.description}</Descriptions.Item>
                                        <Descriptions.Item label="Effective Date">{item.effectiveDate && moment(item.effectiveDate).format("YYYY-MM-DD")}</Descriptions.Item>
                                        <Descriptions.Item label="Expiry Date">{item.expiryDate && moment(item.expiryDate).format("YYYY-MM-DD")}</Descriptions.Item>
                                        <Descriptions.Item label="Type">{item.type}</Descriptions.Item>
                                        <Descriptions.Item label="UoM">{item.uom}</Descriptions.Item>
                                        <Descriptions.Item label="Product">{item.productTypeName}</Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                <Table<domain.delivery.OutsourcePriceItem>
                                    columns={itemCols}
                                    key={`table-${item.id}`}
                                    rowKey="id"
                                    dataSource={item.priceItems || []}
                                    pagination={false}
                                    size="small"
                                />
                            </TabPane>
                        })
                    }
                </Tabs>
            </Spin>
        </Modal>
    }

export default PricePreview