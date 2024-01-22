import React from 'react'
import FormModalComp from '@/components/FormModal'
import { Form, Select, DatePicker, } from 'antd'
import { domain } from '@/services/del-expense/data';
import { ProForm, ProFormDatePicker, ProFormGroup, ProFormSelect } from '@ant-design/pro-components';

const CreateDeliveryForm: React.FC<{
    visible: boolean;
    initLookupData?: domain.delivery.DeliveryInitLookupData;
    onAddNewDelivery: (data: domain.delivery.AddInventory) => void;
    onCancel: () => void
}> = ({ visible, initLookupData, onAddNewDelivery, onCancel, }) => {
    const [form] = Form.useForm()

    return <FormModalComp
        title="Create Delivery Settlement"
        width = {'1000px'}
        open={visible}
        onCancel={() => {
            form.resetFields()
            onCancel()
        }}
        onResetForm={() => form.resetFields()}
        onSubmit={() => {
            form.validateFields().then(values => {

                const { outsourceId, settledOn } = values
                onAddNewDelivery({
                    outsourceId: outsourceId,
                    settledOn: settledOn
                })
            })
        }}>
        <ProForm submitter = {false} form={form} layout='vertical' >
            <ProFormGroup>
            <ProFormSelect fieldProps={{
                popupMatchSelectWidth: 500
            }} width={'sm'} showSearch allowClear label="Outsource" name="outsourceId"  rules = {[{required: true}]}
            options={initLookupData?.outsource?.map(it => ({label: it.display, value: it.value}))}
            />
            <ProFormDatePicker.Month name="settledOn"  label="Settled On"  rules = {[{required: true}]} />
            </ProFormGroup>
        </ProForm>

    </FormModalComp>
}

export default CreateDeliveryForm