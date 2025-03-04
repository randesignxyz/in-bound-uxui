import { formatter } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Card, Flex, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { PurchaseRequestItemCreate } from '../request/data';
import { PurchaseOrderDTO } from './data';
import { PurchaseOrderServiceAPI } from './services';

interface Props {
  id: number;
}

const MpuPurchaseOrderDetail: React.FC<Props> = ({ id }) => {
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const [dataSource, setDataSource] = useState<PurchaseOrderDTO>();
  const onLoad = async () => {
    const data = await services.detail(id);
    setDataSource(data);
  };
  useEffect(() => {
    if (id) {
      onLoad();
    }
  }, [id]);

  return (
    dataSource && (
      <PageContainer
        onBack={() => history.push(`/sale/mpu_purchase_order/list`)}
        title="Detail Order Purchase"
      >
        <Flex vertical gap={18}>
          <Card size="small" title="Information">
            <ProDescriptions
              dataSource={dataSource}
              loading={requestActions.request?.loading}
              columns={[
                {
                  title: 'Purchase Request No',
                  dataIndex: 'purchaseRequestNo',
                },
                {
                  title: 'Saleperson Code',
                  dataIndex: 'ownerCode',
                  render: (_, r) => r.purchaseRequest.assignedToCode,
                },
                {
                  title: 'Saleperson',
                  dataIndex: 'ownerBy',
                  render: (_, r) => r.purchaseRequest.assignedToCode,
                },
                {
                  title: 'Distributor Name',
                  render: (_, r) => r.purchaseRequest.distributorName,
                },
                {
                  title: 'Distributor Code',
                  render: (_, r) => r.purchaseRequest.distributorCode,
                },
                {
                  title: 'Distributor Phone',
                  render: (_, r) => r.purchaseRequest.distributorPhone,
                },
                {
                  title: 'Purchase Order Date',
                  dataIndex: 'purchaseOrderDate',
                  valueType: 'date',
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (_, r) => (
                    <Tag
                      icon={
                        r.status === 'Pending' ? (
                          <SyncOutlined spin />
                        ) : r.status === 'Paid' ? (
                          <CheckCircleOutlined />
                        ) : r.status === 'Rejected' ? (
                          <CloseCircleOutlined />
                        ) : (
                          <ExclamationCircleOutlined />
                        )
                      }
                      bordered={false}
                      color={
                        r.status === 'Pending'
                          ? 'processing'
                          : r.status === 'Paid'
                          ? 'success'
                          : r.status === 'Rejected'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {r.status.toUpperCase()}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
          <ProTable<PurchaseRequestItemCreate>
            search={false}
            options={false}
            size="small"
            headerTitle={'Items'}
            pagination={false}
            dataSource={dataSource?.items}
            columns={[
              {
                title: 'Product Name',
                dataIndex: 'itemName',
              },
              {
                title: 'Category',
                dataIndex: 'stockCategoryName',
              },
              {
                title: 'UOM',
                dataIndex: 'uom',
              },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
              },
              {
                title: 'Unit Price',
                dataIndex: 'pricing',
              },
              {
                title: 'Total',
                render: (_, r) => formatter.format(r.quantity * r.pricing),
              },
            ]}
          />
          <Card size="small">
            <Flex justify="space-between">
              <div></div>
              <ProDescriptions<PurchaseOrderDTO>
                column={1}
                style={{
                  width: '300px',
                }}
                labelStyle={{
                  width: 150,
                }}
                contentStyle={{
                  fontWeight: 500,
                }}
                dataSource={dataSource}
                columns={[
                  {
                    title: 'Grand Amount',
                    dataIndex: 'grandAmount',
                    valueType: 'money',
                    render: (_, r) => (r.grantAmount ? formatter.format(r.grantAmount) : '$0.00'),
                  },
                  {
                    title: 'Discount Amount',
                    dataIndex: 'discountAmount',
                    valueType: 'percent',
                  },
                  {
                    title: 'Total Amount',
                    dataIndex: 'totalAmount',
                    valueType: 'money',
                    render: (_, r) => (r.totalAmount ? formatter.format(r.totalAmount) : '$0.00'),
                  },
                ]}
              />
            </Flex>
          </Card>
        </Flex>
      </PageContainer>
    )
  );
};

export default MpuPurchaseOrderDetail;
