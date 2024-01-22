import React from 'react'
import FormModalComp from '@/components/FormModal'
import { Form, Select, InputNumber, message } from 'antd'
import { domain } from '@/services/del-expense/data';
import { useForm } from 'antd/lib/form/Form';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const AddPriceItem: React.FC<{
    deliveryItemList: domain.delivery.DeliveryItem[]
    visible: boolean;
    onAddItem: (itemCode: string, unit: number, price: number, cb: () => void) => void;
    onCancel: () => void;
}> = ({ visible, deliveryItemList, onAddItem, onCancel }) => {

    const [form] = useForm()

    return <FormModalComp
        title="Item Price"
        visible={visible}
        onCancel={onCancel}
        width="500px"
        okText = "Add"
        onResetForm={() => { form.resetFields() }}
        onSubmit={() => {
            form.validateFields().then(values => {
                const {itemCode, unit, price} = values
                onAddItem(itemCode, unit, price, () => {
                    // form.resetFields()
                    message.info({
                        content: 'Added successfully'
                    })
                })

            })
         }}>
        <Form initialValues ={{unit: 1}} form = {form} {...layout}>
            <Form.Item name = 'itemCode' label="Item" rules = {[{required: true}]}>
                <Select>
                    {deliveryItemList.map(item => {
                        return <Select.Option key= {item.id} value = {item.code}>
                            {`${item.shortName} (${item.code})`} 
                        </Select.Option>
                    })}
                </Select>
            </Form.Item>
            <Form.Item name = 'unit' label="Unit" rules = {[{required: true}]} >
                <InputNumber min={1} />
            </Form.Item>
            <Form.Item name = 'price' label="Price" rules = {[{required: true}]} >
                <InputNumber min={0} />
            </Form.Item>
        </Form>
    </FormModalComp>
}

export default AddPriceItem