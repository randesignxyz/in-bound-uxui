import ImagePreview from '@/components/ImagePreview';
import { formatter, formatterKh } from '@/pages/utils';
import { CashCollections } from '@/services/delivery/data';
import { ProCard } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-table';
import { Alert, Card, Image, Space } from 'antd';

export interface Props {
  data: CashCollections[];
  hideCustomerInfo?: true;
  title?: string;
}

const PaymentListView: React.FC<Props> = ({ data, title,  hideCustomerInfo }) => {
  const onExpendRenderHandler = (data: CashCollections) => (
    <ProCard size='small'>
      <Image.PreviewGroup>
        <Space>
          {(data.images || []).map((imageId) => (
            <ImagePreview width={'80px'} key={imageId} fileId={imageId} fileName={''} />
          ))}
        </Space>
      </Image.PreviewGroup>
    </ProCard>
  );
  return (
    <>
      {data.length > 0 && (
        <EditableProTable<CashCollections>
          rowKey={'id'}
          value={data}
          headerTitle = {title}
          size="small"
          recordCreatorProps={false}
          tableStyle={{}}
          expandable={{
            rowExpandable: (d) => (d.images || []).length > 0,
            expandedRowRender: onExpendRenderHandler,
          }}
          columns={[
            {
              title: 'P.Method',
              // width: 120,
              dataIndex: 'paymentMethod',
              editable: false,
              render: (_, r) => [r.paymentMethod, r.bank].filter((it) => it).join('-'),
            },
            {
              title: 'Amount',
              width: 120,
              align: 'right',
              dataIndex: 'paidAmount',
              editable: false,
              render: (_, r) => {
                const text = [
                  formatter.format(r.paidAmount), 
                  r.localCurrency && `(${formatterKh.format(r.paidAmount * (r.exchangeRate ||1))})`
                ].filter(it=>it).join(' ')
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
            },
            {
              title: 'Valid Date',
              valueType: 'date',
              dataIndex: 'validDate',
            },
          ]}
        />
      )}

      {data.length === 0 && <Alert message="No cash collection" type="info" showIcon />}
    </>
  );
};

export default PaymentListView;
