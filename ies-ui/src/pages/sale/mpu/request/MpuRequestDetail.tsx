import { formatDate, formatter } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Button, Card, Col, Flex, Row, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { PurchaseRequestDTO, PurchaseRequestItemCreate } from './data';
import { PurChaseRequestAPIService } from './service';
const { Text } = Typography;

interface Props {
  id?: number;
  onEdit: (id?: number) => void;
  openInTab?: true;
  onAdd?: (id?: number) => void;
}
const MpuRequestDetail: React.FC<Props> = ({ id, openInTab, onAdd, onEdit }) => {
  const requestActions = simpleRequestActions();
  const [dataSources, setDataSources] = useState<PurchaseRequestDTO>();
  const service = PurChaseRequestAPIService(requestActions);
  const loadData = async () => {
    const data = await service.fetchData(id);
    setDataSources(data);
  };
  useEffect(() => {
    id && loadData();
  }, []);

  return (
    <>
      {dataSources && (
        <Flex gap={18} vertical>
          <Card
            size="small"
            extra={
              <Space>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  type="link"
                  onClick={() => onEdit?.(id)}
                >
                  Edit
                </Button>
                <Button
                  icon={<PlusOutlined />}
                  size="small"
                  type="link"
                  onClick={() => onAdd?.(id)}
                >
                  New
                </Button>
                {/* <Button icon={<IssuesCloseOutlined/>} size="small" type="link" onClick={()=>onEdit?.(id)} >Force Close</Button> */}
              </Space>
            }
          >
            <ProDescriptions
              dataSource={dataSources}
              columns={[
                {
                  title: 'Code',
                  dataIndex: 'purchaseRequestNo',
                },
                {
                  title: 'Request By',
                  dataIndex: 'requestedBy',
                },
                {
                  title: 'Request Date',
                  dataIndex: 'requestedDate',
                  valueType: 'dateTime',
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (_, r) => (
                    <Tag
                      icon={
                        r.status == 'pending' ? (
                          <SyncOutlined spin />
                        ) : r.status == 'closed' ? (
                          <CheckCircleOutlined />
                        ) : r.status == 'rejected' ? (
                          <CloseCircleOutlined />
                        ) : (
                          <ExclamationCircleOutlined />
                        )
                      }
                      bordered={false}
                      color={
                        r.status == 'pending'
                          ? 'processing'
                          : r.status == 'closed'
                          ? 'success'
                          : r.status == 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {r.status.toUpperCase()}
                    </Tag>
                  ),
                },
                {
                  title: 'Remark',
                  dataIndex: 'remark',
                  span: 3,
                },
                {
                  span: 3,
                  render: (_, r) => {
                    return (
                      <Space direction="vertical" size={'small'}>
                        <div>
                          <Text type="secondary">created by: {r.createdBy} / </Text>
                          <Text type="secondary">created date: {formatDate(r.createdDate)} </Text>
                        </div>
                        <div>
                          <Text type="secondary">last modified by: {r.lastModifiedBy} / </Text>
                          <Text type="secondary">
                            last modified date: {formatDate(r.lastModifiedDate)}
                          </Text>
                        </div>
                      </Space>
                    );
                  },
                },
              ]}
            />
          </Card>
          <Card size="small">
            <Row gutter={12}>
              <Col span={12}>
                <ProDescriptions
                  column={1}
                  title={'Saleperson Information'}
                  dataSource={dataSources}
                  columns={[
                    {
                      title: 'Saleperson Code',
                      dataIndex: 'assignedToCode',
                    },
                    {
                      title: 'Saleperson Name',
                      dataIndex: 'assignedTo',
                    },
                  ]}
                />
              </Col>
              <Col span={12}>
                <ProDescriptions
                  title={'Distributor'}
                  dataSource={dataSources}
                  column={2}
                  columns={[
                    {
                      title: 'Code',
                      dataIndex: 'distributorCode',
                    },
                    {
                      title: 'Name',
                      dataIndex: 'distributorName',
                    },
                    {
                      title: 'Phone number',
                      dataIndex: 'distributorPhone',
                    },
                    {
                      title: 'Distination Location',
                      render: (_, r) => [r.latitude, r.longitude].join('-'),
                    },
                  ]}
                />
              </Col>
            </Row>
          </Card>
          <ProTable<PurchaseRequestItemCreate>
            search={false}
            options={false}
            size="small"
            headerTitle={'Items'}
            pagination={false}
            dataSource={dataSources.items}
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
          <Flex justify="space-between">
            <div></div>
            <Card size="small">
              <ProDescriptions<PurchaseRequestDTO>
                column={1}
                style={{
                  width: '300px',
                }}
                labelStyle={{
                  width: 150,
                }}
                contentStyle={{
                  fontWeight: 'bold',
                }}
                dataSource={dataSources}
                columns={[
                  {
                    title: 'Grant Amount',
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
            </Card>
          </Flex>
        </Flex>
      )}
    </>
  );
};
export default MpuRequestDetail;
