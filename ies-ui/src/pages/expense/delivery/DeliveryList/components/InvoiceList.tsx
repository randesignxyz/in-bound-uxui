import React from 'react'
import { domain } from '@/core/delivery'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { Button } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import moment from 'moment'

const InvoiceList: React.FC<{
    dataSource: domain.delivery.DeliveryInvoice[];
    onAdd: () => void;
    completed: boolean;
    onEdit: (data: domain.delivery.DeliveryInvoice) => void
    onViewItems: (data: domain.delivery.DeliveryInvoice) => void;
}> = ({ dataSource, onAdd, onEdit, onViewItems, completed }) => {

    const cols: ProColumns<domain.delivery.DeliveryInvoice>[] = [
        {
            title: 'Invoice No',
            dataIndex: 'invoiceNo',
            hideInSearch: true,
            labelAlign: 'left',
            render: (_, record) => {
                return <Button type='link' onClick={() => {
                    onViewItems(record)
                }}>{record.invoiceNo}</Button>
            }
        },
        {
            title: 'Issue Date',
            dataIndex: 'issuedDate',
            hideInSearch: true,
            align: 'right',
            width: '130px',
            render: (_, record) => moment(record.issuedDate).format("YYYY-DD-MM")
        },
        {
            title: 'Received Date',
            dataIndex: 'receivedDate',
            hideInSearch: true,
            align: 'right',
            width: '130px',
            render: (_, record) => moment(record.receivedDate).format("YYYY-DD-MM")
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            hideInSearch: true,
            align: 'right',
            width: '150px',
            render: (_, record) => moment(record.createdDate).format("YYYY-DD-MM HH:mm:ss")
        },
        {
            title: 'Last Modified Date',
            dataIndex: 'modifiedDate',
            hideInSearch: true,
            align: 'right',
            width: '150px',
            render: (_, record) => record.modifiedDate ? moment(record.modifiedDate).format("YYYY-DD-MM HH:mm:ss") : '-'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            hideInSearch: true,
            align: 'right',
            width: '150px',
            render: (_, record) => {
                return record.amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            }
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            hideInSearch: true,
            align: 'left',
            width: '250px',
        },
        {
            title: '',
            width: '10px',
            hideInSearch: true,
            align: 'right',
            render: (v: any, record: domain.delivery.DeliveryInvoice) => {
                return !completed && <Button onClick = {_ => onEdit(record)} shape="circle" size="small" icon={<EditOutlined />} />
            }
        }
    ]

    return <ProTable<domain.delivery.DeliveryInvoice>
        columns={cols}
        search={false}
        rowKey='id'
        dataSource={dataSource}
        pagination={false}
        size='small'
        toolBarRender={(action, { selectedRows }) => [
            <Button hidden={completed} type="primary" onClick={onAdd} icon = {<PlusOutlined />}/>
        ]}
    />
}

export default InvoiceList