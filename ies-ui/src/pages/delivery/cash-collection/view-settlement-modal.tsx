import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ImagePreview from '@/components/ImagePreview';
import { formatter, formatterKh } from '@/pages/utils';
import {
    CashCollections,
    CheckoutListItem,
    SettlementItem,
} from '@/services/delivery/data';
import { EditOutlined } from '@ant-design/icons';
import { ModalForm, ProCard } from '@ant-design/pro-components';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { Alert, Card, Image, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';

export default ({ trigger, deliveryId }: { trigger: JSX.Element, deliveryId: number; }) => {

    const requestActions = simpleRequestActions()
    const services = DeliveryServiceAPI(requestActions);
    const [data, setData] = useState<CheckoutListItem[]>([])
    const [open, setOpen] = useState(false)
    const onExpendRenderHandler = (data: CashCollections) => (
        <Card>
            <Image.PreviewGroup>
                <Space>
                    {(data.images || []).map((imageId) => (
                        <ImagePreview width={'80px'} key={imageId} fileId={imageId} fileName={''} />
                    ))}
                </Space>
            </Image.PreviewGroup>
        </Card>
    );


    useEffect(() => {
        if (open)
            (async () => {
                const checkoutList = await services.listCheckout(deliveryId);
                setData(checkoutList)
            })()
    }, [open])

    return (
        <ModalForm
            title="Cash collection settlement"
            submitter={false}
            onOpenChange={setOpen}
            modalProps={{ destroyOnClose: true }}
            trigger={trigger}
        >
            {data.map((it) => {
                return (
                    <ProCard
                        bordered
                        size="small"
                        style={{ marginBottom: 10 }}
                        key={`customer:${it.id}`}
                        title={`${it.customerCode}-${it.customerName}`}
                        subTitle={`${it.shipToCode}`}
                        extra={it.cashCollections.some(it => !it.settled && it.paymentMethod == 'NONE') ? <Tag color='warning'>Hold</Tag> : <Tag color='success'>Settled</Tag>}
                    >
                        <Card size="small" bordered={false}>
                            {it.invoices.map((item) => (
                                <Tag color={item.manualAdded ? 'warning' : 'success'} >Invoice Num: {item.invoiceNum}, Amount: {formatter.format(item.invoiceAmount)} {item.manualAdded ? "(Added)" : ''}</Tag>
                            ))}
                        </Card>

                        {it.cashCollections.length > 0 && <EditableProTable<CashCollections>
                            rowKey={'id'}
                            value={it.cashCollections}
                            size="small"
                            recordCreatorProps={false}
                            tableStyle={{}}
                            expandable={{
                                rowExpandable: (d) => (d.images || []).length > 0,
                                expandedRowRender: onExpendRenderHandler,
                            }}
                            columns={[

                                {
                                    title: 'Payment Method',
                                    width: 130,
                                    dataIndex: 'paymentMethod',
                                    editable: false,
                                    render: (_, r) => [r.paymentMethod, r.bank].filter((it) => it).join('-'),
                                },
                                {
                                    title: 'Amount',
                                    align: 'right',
                                    dataIndex: 'paidAmount',
                                    editable: false,
                                    render: (_, r) => {
                                        const text = [
                                            formatter.format(r.paidAmount),
                                            r.localCurrency && `(${formatterKh.format(r.paidAmount * (r.exchangeRate || 1))})`
                                        ].filter(it => it).join(' ')
                                        return text
                                    },
                                },
                                {
                                    title: 'Remarks',
                                    dataIndex: 'remarks',
                                    editable: false,
                                },
                                {
                                    title: 'Ref',
                                    dataIndex: 'ref',
                                    editable: false,
                                    formItemProps: (form, config) => ({
                                        rules: [{ required: config.entity.paymentMethod.toLowerCase() === 'bank' }],
                                    }),
                                },
                                {
                                    title: 'Valid Date',
                                    valueType: 'date',
                                    dataIndex: 'validDate',
                                    editable: false,
                                    formItemProps: (form, config) => ({
                                        rules: [{ required: config.entity.paymentMethod.toLowerCase() === 'cheque' }],
                                    }),
                                },
                            ]}
                        // editable={{
                        //     type: 'multiple',
                        //     editableKeys: data.flatMap((it) => it.cashCollections.map((i) => i.id)),
                        //     form: form,
                        // }}
                        />}

                        {it.cashCollections.length === 0 && <Alert message="No cash collection" type="info" showIcon />}
                    </ProCard>
                );
            })}
        </ModalForm>
    );
};

