import { formatDate, formatter, formatterPercentage, formatterQty } from '@/pages/utils';
import { ProCard, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Checkbox, Flex, Space } from 'antd';
import { useEffect, useState } from 'react';
import { PoRequestDetail, PoRequestItemDetail } from './data';
import { createPoService } from './services';
import RelatedObjectItems from '../components/RelatedObjectItems';

export default ({
  instanceId,
  setAttachFiles,
  onSet,
  forceReload
}: {
  instanceId: string;
  setAttachFiles: (files: string[]) => void;
  onSet: (item: PoRequestDetail) => void;
  forceReload?: number;
}) => {
  const srv = createPoService();
  const [data, setData] = useState<PoRequestDetail>();

  const init = async () => {
    const rs = await srv.fetchProcessInstance(instanceId);
    onSet(rs)
    setData(rs);
    setAttachFiles(rs.files || []);
  };
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if ((forceReload || 0) > 0)
      init();
  }, [forceReload]);

  return (
    <Flex vertical>
      <Space direction="vertical">
        <ProCard title="General">
          <Flex justify="space-between">
            <Flex>
              <ProDescriptions<PoRequestDetail>
                columns={[
                  { title: 'Vendor', render: (_, r) => [r.vendorCode, r.vendorName].join('-') },
                  { title: 'Contact Person', dataIndex: 'contactPerson' },
                  { title: 'Phone1', dataIndex: 'phone1' },
                  { title: 'E-Mail', dataIndex: 'mailAddress' },
                  { title: 'Address', dataIndex: 'address' },
                  { title: 'Payment Term', dataIndex: 'paymentTerm' },
                  { title: 'Delivered Date', render: (_, r) => r.deliveredDate && formatDate(r.deliveredDate) },
                  { title: 'Service', render: (_, r) => <Checkbox checked={r.isService} /> },
                ]}
                column={1}
                size="small"
                dataSource={data}
              />
            </Flex>

            <Flex vertical>
              <ProDescriptions<PoRequestDetail>

                column={1}
                dataSource={data}
              />
              <ProDescriptions<PoRequestDetail>
                columns={[
                  { title: 'Bill To', render: (_, r) => r.billToAddressName },
                  { title: 'Bill To Address', valueType: 'textarea', dataIndex: 'billToAddress' },
                ]}
                column={1}
                dataSource={data}
              />
              <ProDescriptions<PoRequestDetail>
                columns={[
                  { title: 'Ship to', dataIndex: 'shipToAddressName' },
                  { title: 'Ship To Address', dataIndex: 'shipToAddress' },
                ]}
                column={1}
                size="small"
                dataSource={data}
              />

            </Flex>
          </Flex>
        </ProCard>
        <ProCard>
          <ProTable<PoRequestItemDetail>
            search={false}
            size="small"
            rowKey={'id'}
            pagination={false}
            dataSource={data?.items}
            expandable={{
              expandedRowRender: (record) => record.relatedObjects && <RelatedObjectItems mainId={record.id} items={record.relatedObjects} />,
              rowExpandable: (record) => (record.relatedObjects?.length || 0) > 0,
            }}
            options={{
              setting: false,
              density: false,
              reload: false,
            }}
            columns={[
              { title: '#', dataIndex: 'seq' },
              { title: 'Item Code', dataIndex: 'itemCode', hideInTable: data?.isService },
              { title: 'Item Name', dataIndex: 'itemName' },
              { title: 'Description', dataIndex: 'description' },
              { title: 'UoM', dataIndex: 'uomName', hideInTable: data?.isService },
              {
                title: 'Price',
                align: 'right',
                dataIndex: 'price',
                hideInTable: data?.isService,
                render: (_, r) => formatter.format(r.price),
              },
              {
                title: 'Qty',
                align: 'right',
                dataIndex: 'qty',
                hideInTable: data?.isService,
                render: (_, r) => formatterQty.format(r.qty),
              },

              {
                title: 'Dis. (%)',
                align: 'right',
                valueType: 'percent',
                width: data?.isService ? undefined : 100,
                dataIndex: 'discountPercentage',
              },
              {
                title: 'Amount',
                align: 'right',
                dataIndex: 'amount',
                render: (_, r) => formatter.format(r.amount),
              },
              {
                title: 'Amt. after Dis.',
                align: 'right',
                dataIndex: 'amount',
                render: (_, r) => formatter.format(r.amountAfterDiscount),
              },
              { title: 'Reamrks', dataIndex: 'remarks' },
            ]}
          />
        </ProCard>
        <ProCard>
          <Flex>
            <Flex>
              <ProDescriptions<PoRequestDetail>
                column={1}
                dataSource={data}
                columns={[{ title: 'Owner Function', dataIndex: 'ownerFunction' }, { title: 'Remarks', dataIndex: 'remarks' }]}
              />
            </Flex>
            <Flex>
              <ProDescriptions<PoRequestDetail>
                column={1}
                style={{ width: 300 }}
                dataSource={data}
                columns={[
                  {
                    title: 'Total Amount',
                    dataIndex: 'totalAmount',
                    render: (_, r) => formatter.format(r.totalAmount),
                  },
                  {
                    title: 'Discount (-)',
                    render: (_, r) =>
                      r.discountAmount &&
                      r.discountAmount > 0 &&
                      [
                        formatter.format(r.discountAmount),
                        `(${r.discountPercentage &&
                        formatterPercentage.format(r.discountPercentage / 100)
                        })`,
                      ].join(' '),
                  },
                  {
                    title: 'Tax (+)',
                    render: (_, r) =>
                      r.tax &&
                      [
                        formatter.format(r.taxAmount),
                        `(${formatterPercentage.format(r.tax / 100)})`,
                      ].join(' '),
                  },
                  {
                    title: 'Payment Due',
                    dataIndex: 'paymentDue',
                    render: (_, r) => formatter.format(r.paymentDue),
                  },
                ]}
              />
            </Flex>
          </Flex>
        </ProCard>
      </Space>
    </Flex>
  );
};
