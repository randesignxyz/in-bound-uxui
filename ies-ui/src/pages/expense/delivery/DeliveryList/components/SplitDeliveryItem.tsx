
import { ModalProps } from '@/components/core/ModalProps'
import useProcessData from '@/hooks/useProcessData'
import { ServiceType } from '@/services/API'
import { domain } from '@/services/del-expense/data'
import { Form, message, Modal, Space, Spin, Table } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { ColumnsType } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'

const itemCols: ColumnsType<domain.delivery.DeliveryCostItem> = [
    {
        title: 'Item Code',
        dataIndex: 'itemNo',
        width: '200px'
    },
    {
        title: 'Item Name',
        dataIndex: 'itemName',
    },
    {
        title: 'Quantity',
        dataIndex: 'qty',
    },
]

interface SplitDeliveryProps extends ModalProps<domain.delivery.DeliveryCost, string> { }

const SplitDelivery: React.FC<SplitDeliveryProps> = ({
    visible,
    item,
    onHide,
    onCompleted
}) => {

    const [selectedItems, setSelectedItems] = useState<domain.delivery.DeliveryCostItem[]>([])

    const srv = useProcessData({ name: 'SAP', action: 'split_delivery' } as ServiceType)

    const [form] = Form.useForm()

    useEffect(()=> {
        if(visible) {
            form.resetFields()
        }
    }, [item, visible])

    return <Modal
        title="Split Location"
        width={'700px'}
        open={visible}
        onCancel={onHide}
        onOk={() => {

            if (selectedItems.length == item.itemList.length) {
                message.error("All items cannot be split.")
                return
            }

            form.validateFields().then(values => {
                const { remarks } = values
                const data = {
                    docEntry: item.docEntry,
                    itemCodes: selectedItems.map(item => item.itemNo),
                    remarks: remarks
                }

                Modal.confirm({
                    title: 'Confirmation',
                    content: 'Are you sure to process?',
                    onOk: () => {
                        srv.exec(data, () => {
                            message.success("Split delivery is successful.")
                            onCompleted('Split delivery is successful')
                        })
                    }
                })

            })

        }}><Spin spinning = {srv.loading}>
            <Space direction='vertical' style={{ width: '100%' }}>

                <Table<domain.delivery.DeliveryCostItem>
                    rowSelection={{
                        hideSelectAll: true,
                        type: "checkbox",
                        onChange: (_, selectedRows) => { setSelectedItems(selectedRows) }
                    }}
                    rowKey="itemNo"
                    size='small'
                    columns={itemCols}
                    dataSource={item.itemList}
                    pagination={false}
                />
                <Form form={form}>
                    <Form.Item label="Remarks" name="remarks" rules={[{ required: true }]}>
                        <TextArea />
                    </Form.Item>
                </Form>
            </Space>
        </Spin>
    </Modal>
}

export default SplitDelivery