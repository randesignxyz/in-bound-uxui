import { formatDate, formatter, formatterPercentage, formatterQty } from '@/pages/utils';
import { ProCard, ProDescriptions, ProList, ProTable } from '@ant-design/pro-components';
import { Checkbox, Flex, Space } from 'antd';
import { useEffect, useState } from 'react';
import { PoRequestDetail, PoRequestItemDetail } from './data';
import { createPoService } from './services';
import { RelatedObj } from '../services';
import { CaretRightOutlined } from '@ant-design/icons';
import Link from 'antd/es/typography/Link';

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

  const linkedObject = (record: PoRequestItemDetail) => {
    return (
      <ProList<RelatedObj>
        // dataSource={[...(record.item.relatedTo || []), ...(record.combineWith?.flatMap(it => it.relatedTo || []) || [])]}
        dataSource={record.relatedObjects}
        ghost={true}
        grid={{ gutter: 16, column: 4 }}
        itemCardProps={{
          size: 'small',
          ghost: true
        }}
        metas={{
          title: {
            render: (_, r) => r.type,
          },
          subTitle: {
            render: (_, r) => <Link >{r.code}</Link>
          },
          content: {
            render: (_, r) => <>{r.items.map(it => <Flex vertical key={`%${record}-${it.id}-${r.type}-${r.id}`}>

              <Flex gap={5}>
                <Flex> <CaretRightOutlined /> </Flex>
                <Flex> Item: </Flex>
                <Flex> {`${it.itemCode} - ${it.itemName}`} </Flex>
              </Flex>
              <Flex gap={5}>
                <Flex> <CaretRightOutlined /> </Flex>
                <Flex> Desc: </Flex>
                <Flex> {it.itemDescription} </Flex>
              </Flex>
              <Flex gap={5}>
                <Flex> <CaretRightOutlined /> </Flex>
                <Flex> Qty: </Flex>
                <Flex> {it.qty} </Flex>
                {r.type == 'PR' && <Flex>,Ordered: </Flex>}
                {r.type == 'PR' && <Flex> {it.orderedQty || 0} </Flex>}
                {r.type == 'PR' && <Flex>,Purchased: </Flex>}
                {r.type == 'PR' && <Flex> {it.purchasedQty || 0} </Flex>}
                {r.type == 'PR' && <Flex>,Available: </Flex>}
                {r.type == 'PR' && <Flex> {it.availableQty || 0} </Flex>}
              </Flex>
              <Flex gap={5}>
                <Flex> <CaretRightOutlined /></Flex>
                <Flex> Price: </Flex>
                <Flex> {formatter.format(it.price)} </Flex>
              </Flex>
            </Flex>)}</>
          }
        }}

      />
    );
  };

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
              expandedRowRender: linkedObject,
              rowExpandable: (record) => (record.linkedItems?.length || 0) > 0,
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
                columns={[{ title: 'Remarks', dataIndex: 'remarks' }]}
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
