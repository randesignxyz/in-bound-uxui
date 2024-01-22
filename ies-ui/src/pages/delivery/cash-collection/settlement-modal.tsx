import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ImagePreview from '@/components/ImagePreview';
import { formatter, formatterKh } from '@/pages/utils';
import {
  CashCollections,
  CheckoutListItem,
  SettlementItem,
} from '@/services/delivery/data';
import { EditOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { Alert, Button, Card, Col, Image, Row, Space, Tag } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { Moment } from 'moment';
import EditSettlmentModal from './edit-settlment-modal';

interface Props extends FormModalProps {
  data: CheckoutListItem[];
  deliveryId: number;
  onReload?: (freightId: number) => void;
  onSave: (items: SettlementItem[], remarks?: string) => void;
}

const Settlement: React.FC<Props> = ({ data, deliveryId, onSave, onReload, ...rest }) => {
  const [form] = useForm();

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

  return (
    <FormModalComp
      {...rest}
      title="Cash collection settlement"
      onResetForm={() => {
        form.resetFields();
      }}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const items = data
          .flatMap((it) => it.cashCollections)
          .map((it) => {
            const item = dataForm[it.id] as { ref?: string; validDate?: Moment };
            return { id: it.id, ref: item.ref, validDate: item.validDate } as SettlementItem;
          });
        const remarks = dataForm['remarks'];
        onSave(items, remarks);
      }}
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
            extra={<EditSettlmentModal onRefresh={() => onReload?.(deliveryId)} data={{ checkout: it, freightId: it.id }} trigger={<Button type='link' icon={<EditOutlined />} />} />}
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
                  formItemProps: (form, config) => ({
                    rules: [{ required: config.entity.paymentMethod.toLowerCase() === 'bank' }],
                  }),
                },
                {
                  title: 'Valid Date',
                  valueType: 'date',
                  dataIndex: 'validDate',
                  formItemProps: (form, config) => ({
                    rules: [{ required: config.entity.paymentMethod.toLowerCase() === 'cheque' }],
                  }),
                },
              ]}
              footer={(items) => <Row>
                <Col flex={'150px'} style={{ fontWeight: 'bolder' }}>
                  Total Amount
                </Col>
                <Col flex={1} style={{ fontWeight: 'bolder', textAlign: 'right' }}>
                  {formatter.format(items.map(it=> it.paidAmount).reduce((c, p) => c + p, 0))}
                </Col>
                </Row>}
              editable={{
                type: 'multiple',
                editableKeys: data.flatMap((it) => it.cashCollections.map((i) => i.id)),
                form: form,
              }}
            />}

            {it.cashCollections.length === 0 && <Alert message="No cash collection" type="info" showIcon />}
          </ProCard>
        );
      })}
      <Card style={{ marginTop: 5 }}>
        <ProForm submitter={false} form={form}>
          <ProFormTextArea rules={[{required: data.flatMap(it => it.cashCollections.flatMap(it => it)).some(it => it.paymentMethod == "RECONCILE") }]} name={'remaks'} label="Remarks" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default Settlement;
