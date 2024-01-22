import useQueryData from '@/hooks/useQueryData'
import { SAPServiceType } from '@/services/API'
import { Modal, Spin, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import React, { useEffect } from 'react'

const DeliveryCostHis: React.FC<{
    visible: boolean;
    onHide: () => void;
    docEntry: number;
}> = ({ visible, onHide, docEntry }) => {

    const queryService = useQueryData<{ docEntry: number }, ChangeDelivery>({ name: 'SAP', action: 'query_delivery_cost_his' } as SAPServiceType)

    useEffect(() => {
        visible && queryService.load({
            docEntry: docEntry
        })
    }, [visible, docEntry])
    return <Modal
        title='History'
        width =  '1000px'
        open={visible}
        footer={false}
        destroyOnClose
        onCancel={onHide}>
        <Spin spinning={queryService.loading}>
            <Table<ChangeDelivery>
                columns={itemCols}
                rowKey="modifiedDate"
                dataSource={queryService.result?.data || []}
                pagination={false}
                size="small"
            />
        </Spin>
    </Modal>
}

interface ChangeDelivery {
    modifiedDate: number,
    modifiedBy: string,
    remarks: string
}
const itemCols: ColumnsType<ChangeDelivery> = [
    {
        title: 'Modified Date',
        dataIndex: 'modifiedDate',
        width: '200px',
        render: (_, record) => moment(record.modifiedDate).format('YYYY-MM-DD HH:mm:SS')
    },
    {
        title: 'Modified By',
        dataIndex: 'modifiedBy',
        width: '300px',
    },
    {
        title: 'Remarks',
        dataIndex: 'remarks'
    },
]

export default DeliveryCostHis