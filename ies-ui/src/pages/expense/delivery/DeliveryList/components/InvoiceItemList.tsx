import React, { useState, useEffect } from 'react'
import { Card, Table } from 'antd';
import moment from 'moment';
import { useModel } from 'umi';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { domain } from '@/services/del-expense/data';
import { ColumnsType } from 'antd/lib/table/interface';

const cols: ProColumns<domain.delivery.DeliveryNote>[] = [
    {
        title: 'Date',
        dataIndex: 'deliveryDate',
        render: (v: any, record: domain.delivery.DeliveryNote) => {
            return moment(record.deliveryDate).format("YYYY-MM-DD")
        },
        width: '100px',
    },
    {
        title: 'Shipping No',
        dataIndex: 'docNo',
        width: '100px',
    },
    {
        title: 'Customer',
        dataIndex: 'customerName'
    },
    {
        title: 'Quantity',
        dataIndex: 'qty',
        align: 'right',
        width: '100px',
    },
    {
        title: 'Amount',
        dataIndex: 'baseCurrAmount',
        align: 'right',
        width: '150px',
        render: (_: any, record: domain.delivery.DeliveryNote) => {
            return record.amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
    },
    {
        title: 'Comment',
        dataIndex: 'comment',
        width: '200px',
    },
    // {
    //     title: 'Action',
    //     dataIndex: 'operation',
    //     width: 20,
    //     render: (text: any, record: domain.delivery.DeliveryNote) => {
    //         return (
    //             <div>
    //                 <Popconfirm title="Sure to delete?" onConfirm={() => removeItem(record)}>
    //                     <a hidden={completed} ><DeleteOutlined style={{ color: "red" }} /></a>
    //                 </Popconfirm>
    //             </div>

    //         )
    //     }
    // }
]

const itemCols: ColumnsType<domain.delivery.DeliveryCostItem> = [
    {
        title: 'Item Code',
        dataIndex: 'itemNo',
        width: '150px',
        align: 'left',
    },
    {
        title: 'Item Name',
        align: 'left',
        dataIndex: 'itemName',
    },
    {
        title: 'Quantity',
        dataIndex: 'qty',
        align: 'right',
        width: '150px',
    },
    {
        title: 'Price',
        dataIndex: 'price',
        align: 'right',
        width: '150px',
        render: (_, record) => {
            return record.price && record.price.toFixed(3).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
    },

    {
        title: 'Amount',
        dataIndex: 'amount',
        align: 'right',
        width: '150px',

        render: (_, record) => {
            return record.amount && record.amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
    }

]

const priceList = (item: domain.delivery.DeliveryNote) => {

    return <Card>
        <Table<domain.delivery.DeliveryCostItem>
            columns={itemCols}
            dataSource={item.itemList}
            rowKey='itemNo'
            pagination={false}
            size="small"
        />
    </Card>
}

const InvoiceItemList: React.FC<{
    invoiceId: number
}> = ({ invoiceId }) => {

    const { loading, invoiceItemData, fetchInvoiceItem } = useModel('delivery')
    const [localDataSource, setLocalDataSource] = useState<domain.delivery.DeliveryNote[]>([])

    useEffect(() => {
        fetchInvoiceItem(invoiceId)
    }, [])

    useEffect(() => {
        setLocalDataSource(invoiceItemData?.data || [])
    }, [invoiceItemData])

    return <ProTable<domain.delivery.DeliveryNote>
        search={false}
        columns={cols}
        loading={loading}
        rowKey='docEntry'
        dataSource={localDataSource}
        size='small'
        expandable={{
            expandedRowRender: priceList,
            rowExpandable: (record: any) => true,
        }}
        pagination={false}
        summary={data => {
            return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
                <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={5} >
                    {
                        localDataSource && localDataSource.length > 0 ? localDataSource.reduce((p, c) => {
                            return {
                                ...p,
                                amount: p.qty + c.qty
                            }
                        }).qty : 0
                    }
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} > {

                    (localDataSource && localDataSource.length > 0 ? localDataSource.reduce((p, c) => {
                        return {
                            ...p,
                            amount: p.amount + c.amount
                        }
                    }).amount : 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
                } </Table.Summary.Cell>
            </Table.Summary.Row>

        }}
    />
}

export default InvoiceItemList