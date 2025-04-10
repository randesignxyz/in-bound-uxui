import { formatDate, formatDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  EditOutlined,
  EnvironmentOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Button, Card, Flex, message, Row, Space, Table, Tag, Typography } from 'antd';
import { Col } from 'antd/lib';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { PurchaseOrderDTO } from '../mpu/purchase_order/data';
import { PurchaseOrderServiceAPI } from '../mpu/purchase_order/services';
import { PurchaseRequestItemCreate } from '../mpu/request/data';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import moment from 'moment';

interface Props {
  id?: number;
  onEdit?: (po?: PurchaseOrderDTO) => void;
  onAdd?: () => void;
}

const MpuPoDetail: React.FC<Props> = ({ id, onEdit }) => {
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const [dataSource, setDataSource] = useState<PurchaseOrderDTO>();
  //const [address, setAddress] = useState<AddressInfo>();
  const onLoad = async () => {
    const data = await services.detail(id);
    // const add = await CrmServiceAPI(requestActions).findAddress({ id: data.addressId||0 });
    // setAddress(add);
    setDataSource(data);
  };


  const onDowloadReportHandler = async (id?: number) => {
    try {
      // const dataForm = await form.validateFields()
      const reportName = 'stock-request-report-form'
      // setLoading(true)
      await downloadGenericReport(requestActions)({
        fileName: `${reportName}-${moment().format()}.pdf`,
        type: 'PDF',
        data: {
          reportName: reportName,
          reportPath: getUrlReporting('sale/forms'),
          data: [
            { key: 'purchaseId', value: id, type: 'string' },
          ]
        }
      }).then((edit) => {
        // setLoading(false)
      })
    } catch (error: any) {
      message.error(error.message || "Failed to generate report.")
      // setLoading(false)
    }
  }
  useEffect(() => {
    if (id) {
      onLoad();
    }
  }, [id]);

  const onEditEvent = () => {
    if (onEdit) {
      onEdit(dataSource);
    }
  };

  return (
    <>
      <Flex vertical gap={18}>
        <Card
          size="small"
          title="Purchase Order"
          extra={
            // dataSource?.status === 'Pending' && (
            //   <Button type="link" onClick={onEditEvent}>
            //     <EditOutlined />
            //     Edit
            //   </Button>
            // )
            <Button
              icon={<DownloadOutlined />}
              type='link'
              onClick={async () => onDowloadReportHandler(dataSource?.id)}
            // onClick={()=>setPrintModalState({visible:{name:"Modal", payloads:r.id}})}
            />
          }
        >
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
                    title: 'Request By',
                    render: (_, r) => [r.requestedCode, r.requestedBy].filter((p) => p).join(' - '),
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
                    title: 'Purchase Order Date',
                    // dataIndex: 'purchaseOrderDate',
                    // valueType: 'date',
                    render: (_, r) => {
                      return formatDate(r.purchaseOrderDate);
                    },
                  },
                  {
                    title: 'Request By Date',
                    // dataIndex: 'requestedDate',
                    // valueType: 'date',
                    render: (_, r) => {
                      return formatDateTime(r.requestedDate);
                    },
                  },

                  // {
                  //   title: 'Distributor Phone',
                  //   dataIndex: 'distributorPhone',
                  // },
                  // {
                  //   title: 'Address Location',
                  //   span: 3,
                  //   render: (_, r) => {
                  //     return (
                  //       <Space align="baseline">
                  //         <a
                  //           href={`https://www.google.com/maps/search/?api=1&query=${r?.latitude?.replace(
                  //             /[&\/[\]\#,+()$~%'":*?<>{}]/g,
                  //             '',
                  //           )}%2C${r?.longitude?.replace(/[&\/[\]\#,+()$~%'":*?<>{}]/g, '')}`}
                  //           target="_blank"
                  //           rel="noreferrer"
                  //         >
                  //           <EnvironmentOutlined />
                  //         </a>
                  //         {r.address}
                  //       </Space>
                  //     );
                  //   },
                  // },
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
                    title: 'Status',
                    dataIndex: 'status',
                    render: (_, r) => (
                      <Tag
                        icon={
                          r.status === 'Pending' ? (
                            <SyncOutlined spin />
                          ) : r.status === 'Paid' ? (
                            <DollarOutlined />
                          ) : r.status === 'Rejected' ? (
                            <CloseCircleOutlined />
                          ) : (
                            <CheckCircleOutlined />
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
                                : 'success'
                        }
                      >
                        {r.status}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Assign To',
                    render: (_, r) => [r.assignedToCode, r.assignedTo].filter((p) => p).join(' - '),
                  },
                  // {
                  //   title: 'Assign To ',
                  //   dataIndex: 'assignedTo',
                  // },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={12} style={{ marginLeft: 20, marginTop: 20 }}>
            <Col md={16} xs={24}>
              <ProDescriptions
                dataSource={dataSource}
                loading={requestActions.request?.loading}
                contentStyle={{ fontWeight: 500 }}
                column={1}
                columns={[
                  {
                    title: 'Remarks: ',
                    dataIndex: 'remark',
                  },
                ]}
              />
            </Col>
            <Col md={8} xs={24} />
          </Row>
        </Card>
        <Card title="Distributor Info" size="small">
          <Row gutter={12} style={{ marginLeft: 20 }}>
            <Col md={8} xs={24}>
              <ProDescriptions
                dataSource={dataSource}
                contentStyle={{ fontWeight: 500 }}
                loading={requestActions.request?.loading}
                column={1}
                columns={[
                  {
                    title: 'Distributor Name',
                    render: (_, r) =>
                      [r.distributorCode, r.distributorName].filter((p) => p).join(' - '),
                    // dataIndex: 'distributorName',
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
                    title: 'Distributor Code',
                    dataIndex: 'distributorCode',
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
                    title: 'Ship Address',
                    dataIndex: 'addressCode',
                  },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={12} style={{ marginLeft: 20, marginTop: 20 }}>
            <Col md={16} xs={24}>
              <ProDescriptions
                dataSource={dataSource}
                loading={requestActions.request?.loading}
                contentStyle={{ fontWeight: 500 }}
                column={1}
                columns={[
                  {
                    title: 'Address Location',
                    render: (_, r) => {
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
                  },
                ]}
              />
            </Col>
            <Col md={8} xs={24} />
          </Row>
        </Card>
        <Card title="Purchase Order Item" size="small">
          <ProTable<PurchaseRequestItemCreate>
            search={false}
            options={false}
            size="small"
            pagination={false}
            dataSource={dataSource?.items}
            columns={[
              {
                title: 'Description',
                dataIndex: 'itemName',
              },
              {
                title: 'Code',
                dataIndex: 'itemCode',
              },
              {
                title: 'Status',
                render: (_, r) => (
                  <Tag
                    icon={
                      r.status === 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'Paid' ? (
                        <DollarOutlined />
                      ) : r.status === 'Rejected' ? (
                        <CloseCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
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
                            : 'success'
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Type',
                dataIndex: 'itemType',
              },
              {
                title: 'UOM',
                dataIndex: 'uom',
              },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
                align: 'right',
              },

              {
                title: 'Unit Price',
                dataIndex: 'pricing',
                align: 'right',
                render: (_, r) => `$ ${numeral(r.pricing).format('0,000.000')}`,
              },
              {
                title: 'Amount',
                align: 'right',
                render: (_, r) => (
                  <Typography.Text type="success">
                    {' '}
                    $ {numeral(r.quantity * r.pricing).format('0,000.000')}
                  </Typography.Text>
                ),
              },
            ]}
            summary={() => {
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={1} colSpan={7} align="right">
                      Total Amount
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="warning">
                        $ {numeral(dataSource?.totalAmount).format('0,000.000')}
                      </Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={1} colSpan={7} align="right">
                      Discount Amount
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Typography.Text type="warning">
                        $ {numeral(dataSource?.discountAmount).format('0,000.000')}
                      </Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={1} colSpan={7} align="right">
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
        {dataSource?.status === 'Pending' && (
          <Card size="small">
            <Flex justify="flex-end">
              <Button type="primary" onClick={onEditEvent}>
                Edit
              </Button>
            </Flex>
          </Card>
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
