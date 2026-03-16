import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { DeliveryNoteListItem, PickingSlipItem, QueueTicketListItem } from "@/services/delivery/data";
import ProForm, { ProFormGroup, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import ProTable from "@ant-design/pro-table";
import { Card } from "antd";
import { useForm } from "antd/lib/form/Form";
import { head, uniq } from "lodash";
import { useEffect, useState } from "react";

interface Props extends FormModalProps {
    data: {
        queueTicketItem: QueueTicketListItem,
        pickingSlipItems: PickingSlipItem[];
        deliveryNoteListItems: DeliveryNoteListItem[];
    },
    onSave: (id: number, shift: string, remarks?: string) => void;
}

const PickingSlip: React.FC<Props> = ({ data, onSave, ...props }) => {

    const truckList = uniq(data.pickingSlipItems.map(it => it.licensePlate))
    const shiftList = uniq(data.pickingSlipItems.map(it => it.shift))
    const [pickingList, setPickingList] = useState<PickingSlipItem[]>([])
    const [deliveryNoteList, setDeliveryNoteList] = useState<DeliveryNoteListItem[]>([])
    const [form] = useForm<{
        licensePlate: string;
        shift: string;
        remarks?: string;
    }>()

    useEffect(() => {

        if (!props.visible) return
        const licensePlate = head(truckList)
        const shift = head(shiftList)
        form.setFieldsValue({
            licensePlate: licensePlate,
            shift: shift,
        })

        setPickingList(data.pickingSlipItems.filter(it => it.shift === shift))
        setDeliveryNoteList(data.deliveryNoteListItems.filter(it => it.shift === shift))

    }, [props.visible])

    return (
        <FormModalComp title="Picking Slip"  {...props}
            onSubmit={async () => {
                const formData = await form.validateFields()
                onSave(data.queueTicketItem.id, formData.shift, formData.remarks)
            }}
        >
            <Card size="small">
                <ProForm
                    onValuesChange={(_, values) => {
                        setPickingList(data.pickingSlipItems.filter(it => it.shift === values.shift))
                        setDeliveryNoteList(data.deliveryNoteListItems.filter(it => it.shift === values.shift))

                    }}

                    form={form}
                    submitter={false}>
                    <ProFormGroup style={{ width: '100%' }}>
                        <ProFormText disabled label='Truck' name={'licensePlate'} width={'sm'} />
                        <ProFormSelect allowClear={false} rules={[{ required: true }]} label='Shift' name={'shift'} width={'sm'} options={shiftList} />
                        <ProFormTextArea fieldProps={{ rows: 1 }} label="Remarks" width="md" name={"remarks"} />
                    </ProFormGroup>

                </ProForm>
            </Card>
            <Card title="Picking Items" size="small" style={{ marginTop: '5px' }}>
                <ProTable
                    columns={[
                        { title: 'Item Code', dataIndex: 'itemCode' },
                        { title: 'Description', dataIndex: 'itemDescription' },
                        { title: 'UoM', dataIndex: 'uomCode' },
                        { title: 'Shipped Qty', dataIndex: 'qty', align: 'right' },
                        { title: 'Wherehouse Code', dataIndex: 'whsCode' },
                    ]}
                    size="small"
                    dataSource={pickingList}
                    options={false}
                    search={false}
                    pagination={false}
                    rowKey={"itemCode"}
                />
            </Card>
            <Card title="Delivery Note" size="small" style={{ marginTop: '5px' }}>
                <ProTable<DeliveryNoteListItem>
                    columns={[
                        { title: 'Del.Doc Num', dataIndex: 'docNum' },
                        { title: 'Company', dataIndex: 'company' },
                        { title: 'Cust. Code', dataIndex: 'cardCode' },
                        { title: 'Cust. Name', dataIndex: 'cardName' },
                        { title: 'Shipped To', dataIndex: 'shipToCode' },
                        { title: 'Quantity', dataIndex: 'qty', align: 'right' },
                        { title: 'Invoice', dataIndex: 'invDocNum', },
                        { title: 'Inv.Amount', dataIndex: 'invAmount', align: 'right' },
                    ]}
                    size="small"
                    dataSource={deliveryNoteList}
                    options={false}
                    search={false}
                    pagination={false}
                    rowKey={"itemCode"}
                />
            </Card>
        </FormModalComp>
    )
}

export default PickingSlip