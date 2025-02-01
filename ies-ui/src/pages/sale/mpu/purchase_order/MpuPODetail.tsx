import { AddressInfo } from '@/services/crm/data';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Card, Flex, Row, Space, Table, Tag, Typography } from 'antd';
import { Col } from 'antd/lib';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { PurchaseRequestItemCreate } from '../request/data';
import { PurchaseOrderDTO } from './data';
import { PurchaseOrderServiceAPI } from './services';

interface Props {
  id?: number;
  onEdit?: () => void;
  onAdd?: () => void;
}

const MpuPoDetail: React.FC<Props> = ({ id, onEdit, onAdd }) => {
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const [dataSource, setDataSource] = useState<PurchaseOrderDTO>();
  const [address, setAddress] = useState<AddressInfo>();
  const onLoad = async () => {
    const data = await services.detail(id);
    // const add = await CrmServiceAPI(requestActions).findAddress({ id: data.addressId||0 });
    // setAddress(add);
    setDataSource(data);
  };
  useEffect(() => {
    id && onLoad();
  }, [id]);

  return (
    <>
      <Flex vertical gap={18}>
        <Card size="small" title="Information">
          <Row gutter={12} style={{ marginLeft: 20 }}>
            <Col md={8} xs={24}>
              <ProDescriptions
                column={1}
                contentStyle={{ fontWeight: 500 }}
                dataSource={dataSource}
                loading={requestActions.request?.loading}
                columns={[
                  {
                    title: 'Purchase Order',
                    dataIndex: 'purchaseOrderCode',
                  },
                  {
                    title: 'Purchase Order Date',
                    dataIndex: 'purchaseOrderDate',
                    valueType: 'date',
                  },
                  {
                    title: 'Requester',
                    render: (_, r) => [r.requestedCode, r.requestedBy].filter((p) => p).join(' - '),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    render: (_, r) => (
                      <Tag
                        icon={
                          r.status == 'Pending' ? (
                            <SyncOutlined spin />
                          ) : r.status == 'Paid' ? (
                            <DollarOutlined />
                          ) : r.status == 'Rejected' ? (
                            <CloseCircleOutlined />
                          ) : (
                            <CheckCircleOutlined />
                          )
                        }
                        bordered={false}
                        color={
                          r.status == 'Pending'
                            ? 'processing'
                            : r.status == 'Paid'
                            ? 'success'
                            : r.status == 'Rejected'
                            ? 'error'
                            : 'success'
                        }
                      >
                        {r.status}
                      </Tag>
                    ),
                  },
                ]}
              />
            </Col>
            <Col md={8} xs={24}>
              <ProDescriptions
                dataSource={dataSource}
                loading={requestActions.request?.loading}
                contentStyle={{ fontWeight: 500 }}
                column={1}
                columns={[
                  {
                    title: 'Distibutor Code',
                    dataIndex: 'distributorCode',
                  },
                  {
                    title: 'Distributor Name',
                    dataIndex: 'distributorName',
                  },
                  {
                    title: 'Distributor Phone',
                    dataIndex: 'distributorPhone',
                  },
                  {
                    title: 'Checked In Location',
                    span: 3,
                    render: (_, r) => {
                      // const aa = [
                      //     { name: 'Street', value: address?.streetNo },
                      //     { name: 'House#', value: address?.houseNo },
                      //     { name: 'Village', value: address?.village },
                      //     { name: 'Commune', value: address?.commune },
                      //     { name: 'District', value: address?.district },
                      //     { name: 'Province', value: address?.province },
                      //     { name: 'Latitude', value: address?.latitude },
                      //     { name: 'Longitude', value: address?.longitude },
                      //     { name: 'Direction', value: address?.direction },
                      //     { name: 'Hotspot', value: address?.hotspot },
                      // ]
                      //     .filter((it) => it.value)
                      //     .map((it) => `${it.name} ${it.value}`)
                      //     .join(', ')

                      return (
                        <Space align="baseline">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${r?.latitude?.replace(
                              /[&\/[\]\#,+()$~%'":*?<>{}]/g,
                              '',
                            )}%2C${r?.longitude?.replace(/[&\/[\]\#,+()$~%'":*?<>{}]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <EnvironmentOutlined />
                          </a>
                          {r.address}
                        </Space>
                      );
                    },

                    // render: (_, r) => <Typography.Paragraph copyable>{[r.latitude, r.longitude].filter(p => p).join(",")}</Typography.Paragraph>
                  },
                ]}
              />
            </Col>
            <Col md={8} xs={24}>
              <ProDescriptions
                dataSource={dataSource}
                contentStyle={{ fontWeight: 500 }}
                loading={requestActions.request?.loading}
                column={1}
                columns={[
                  {
                    title: 'Assigned To Code',
                    dataIndex: 'assignedToCode',
                  },
                  {
                    title: 'Assign To ',
                    dataIndex: 'assignedTo',
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card title="Items" size="small">
          <ProTable<PurchaseRequestItemCreate>
            search={false}
            options={false}
            size="small"
            pagination={false}
            dataSource={dataSource?.items}
            columns={[
              {
                title: 'Product Name',
                dataIndex: 'itemName',
              },
              {
                title: 'Code',
                dataIndex: 'itemCode',
              },
              {
                title: 'Type',
                dataIndex: 'itemType',
              },
              {
                title: 'Category',
                dataIndex: 'stockCategoryName',
              },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
                align: 'right',
              },
              {
                title: 'UOM',
                dataIndex: 'uom',
              },
              {
                title: 'Unit Price',
                dataIndex: 'pricing',
                align: 'right',
                render: (_, r) => `$ ${numeral(r.pricing).format('0,000.000')}`,
              },
              {
                title: 'Total',
                align: 'right',
                render: (_, r) => (
                  <Typography.Text type="success">
                    {' '}
                    $ {numeral(r.quantity * r.pricing).format('0,000.000')}
                  </Typography.Text>
                ),
              },
            ]}
            summary={(item) => {
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={1} colSpan={4} align="right">
                      Total Amount
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="warning">
                        $ {numeral(dataSource?.totalAmount).format('0,000.000')}
                      </Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={1} colSpan={4} align="right">
                      Discount Amount
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="warning">
                        $ {numeral(dataSource?.discountAmount).format('0,000.000')}
                      </Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={1} colSpan={4} align="right">
                      Grand Amount
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="warning">
                        $ {numeral(dataSource?.grantAmount).format('0,000.000')}
                      </Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
        </Card>

        {(dataSource?.foc?.length || 0) > 0 && (
          <>
            <Card size="small" title="Free of Charge">
              <ProTable
                search={false}
                options={false}
                pagination={false}
                size="small"
                dataSource={dataSource?.foc || []}
                columns={[
                  {
                    title: 'Item Code',
                    dataIndex: 'itemCode',
                  },
                  {
                    title: 'Item Name',
                    dataIndex: 'itemName',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'qty',
                    render: (_, r) => <Typography.Text type="warning">{r.qty}</Typography.Text>,
                  },
                  {
                    title: 'Uom',
                    dataIndex: 'uom',
                    render: (_, r) => r.uom?.toLowerCase(),
                  },
                ]}
              />
            </Card>
          </>
        )}
        {/* <Card size='small'>
                    <Flex
                        justify='space-between'
                    >
                        <div></div>
                        <ProDescriptions<PurchaseOrderDTO>
                            column={1}
                            style={{
                                width: "300px",
                            }}
                            labelStyle={{
                                width: 150
                            }}
                            contentStyle={{
                                fontWeight: 500
                            }}
                            dataSource={dataSource}
                            columns={[
                                {
                                    title: "Total Amount",
                                    dataIndex: "totalAmount",
                                    valueType: "money",
                                    render: (_, r) => <Typography.Text type="warning">$ {numeral(r.totalAmount).format("0,000.000")}</Typography.Text>
                                },
                                {
                                    title: "Discount Amount",
                                    dataIndex: "discountAmount",
                                    valueType: "percent",
                                    render: (_, r) => <Typography.Text type="warning"> {numeral(r.discountAmount).format("0,000.000")}</Typography.Text>

                                },
                                {
                                    title: "Grand Amount",
                                    dataIndex: "grandAmount",
                                    valueType: "money",
                                    render: (_, r) => <Typography.Text type="warning">${numeral(r.grantAmount).format("0,000.000")}</Typography.Text>
                                },
                            ]}
                        />
                    </Flex>
                </Card> */}
      </Flex>
    </>
  );
};

export default MpuPoDetail;
