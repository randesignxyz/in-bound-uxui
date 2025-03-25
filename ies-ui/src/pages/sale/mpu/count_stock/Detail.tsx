import { displayDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { ActionType, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Button, Card, Flex, Modal, Spin, Table, Tag, Tooltip, Typography, message } from 'antd';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import RemarkModalForm from '../../component/RemarkModal';
import { StockCountDto } from './data';
import { CountStockServiceAPI } from './service';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import moment from 'moment';

const { Text } = Typography;

interface Props {
  id?: number;
}

const CountStockDetail: React.FC<Props> = ({ id }) => {
  const requestActions = simpleRequestActions();
  const services = CountStockServiceAPI(requestActions);
  // const [actionForm] = useForm<StatusActionForm>();
  const [dataSource, setDataSource] = useState<StockCountDto>();
  const actionRef = useRef<ActionType>();
  const [actionState, setActionState] = useState<{
    visible?: {
      open: true;
      status: 'Completed' | 'Pending' | 'Rejected';
    };
  }>();
  const loadData = async () => {
    setDataSource(await services.detail(id));
  };
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

   const onDowloadReportHandler = async (id?: number) => {
      try {
        // const dataForm = await form.validateFields()
        const reportName = 'stock-request-settlement-report-form'
        // setLoading(true)
        await downloadGenericReport(requestActions)({
          fileName: `${reportName}-${moment().format()}.pdf`,
          type: 'PDF',
          data: {
            reportName: reportName,
            reportPath: getUrlReporting('sale/forms'),
            data: [
              { key: 'stockControlId', value: id, type: 'string' },
            ]
          }
        }).then(() => {
          // setLoading(false)
        })
      } catch (error: any) {
        message.error(error.message || "Failed to generate report.")
        // setLoading(false)
      }
    }

  return (
    <Spin spinning={requestActions.request?.loading}>
      <Flex gap={16} vertical>
        <Card
          size="small"
          title="General Information"
          extra={[
            dataSource?.status === 'Pending' && (
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setActionState({
                    visible: { open: true, status: 'Rejected' },
                  });
                }}
              >
                Reject
              </Button>
            ),
            (dataSource?.purchaseOrder?.length ?? 0) > 0 && dataSource?.status === 'Pending' && (
              <Button
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    title: 'Approve Stock Count',
                    content: 'are you sure?',
                    onOk: async () => {
                      await services.confirmStockCount({ id: dataSource.id });
                      message.success('Sucess!');
                      actionRef.current?.reload?.();
                    },
                  });
                }}
              >
                Approve
              </Button>
            ),
            <Tooltip title="Download Report">
              <Button icon={<DownloadOutlined />}
                size='small'
                type='link'
                onClick={() => onDowloadReportHandler(dataSource?.stockControlId)}
              >Report Form</Button>
            </Tooltip>
          ]}
        >
          <ProDescriptions
            dataSource={dataSource}
            loading={requestActions.request?.loading}
            actionRef={actionRef}
            contentStyle={{
              fontWeight: 500,
            }}
            columns={[
              {
                title: 'Stock Count No',
                dataIndex: 'countedNo',
              },
              {
                title: 'Stock Count Date',
                render: (_, r) => {
                  return displayDateTime(r.countedDate);
                },
              },
              {
                title: 'Remark',
                dataIndex: 'remark',
                span: 3,
                valueType: 'text',
              },
              {
                title: 'Salesperson Code',
                dataIndex: 'salespersonCode',
              },
              {
                title: 'Salesperson Name',
                dataIndex: 'salespersonName',
                // render: (_, r) => {
                //   return [r.salespersonCode, r.salespersonName].join(' - ');
                // },
              },
              // {
              //   title: 'Store Code',
              //   dataIndex: 'storeCode',
              // },
              {
                title: 'Status',
                render: (_, r) => (
                  <Tag
                    bordered={false}
                    icon={
                      r.status === 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'Rejected' ? (
                        <CloseCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    color={
                      r.status === 'Pending'
                        ? 'processing'
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
                title: 'Cnt. Invoices',
                dataIndex: 'countedInvoices',
              },
              {
                title: 'Amount',
                // dataIndex: 'soldAmount',
                render: (_, r) => (
                  <Text type="success">$ {numeral(r.soldAmount).format('0,000.000')}</Text>
                ),
              },
            ]}
          />
        </Card>
        {/* <Card size="small">
          <ProDescriptions
            dataSource={dataSource}
            contentStyle={{
              fontWeight: 500,
            }}
            columns={[
              {
                title: 'Sold Quantity',
                dataIndex: 'soldQuantity',
                render: (_, r) => (
                  <Text type="danger">( {numeral(r.soldQuantity).format('0,000')} )</Text>
                ),
              },
              {
                title: 'Total Quantity',
                dataIndex: 'totalQuantity',
                render: (_, r) => <Text type="success">{r.totalQuantity}</Text>,
              },
              {
                title: 'Sold Amount',
                dataIndex: 'soldAmount',
                valueType: 'money',
                render: (_, r) => (
                  <Text type="success">$ {numeral(r.soldAmount).format('0,000.000')}</Text>
                ),
              },
            ]}
          />
        </Card> */}
        <Card size="small" title={'Product Item'}>
          <ProTable
            size="small"
            options={false}
            search={false}
            dataSource={dataSource?.items}
            pagination={false}
            ghost
            columns={[
              {
                title: 'Batch No',
                // dataIndex: 'batchNo',
                render: (_, r) => {
                  return r.batchNo !== null ? (r.batchNo === 'n/a' ? '-' : r.batchNo) : '-';
                },
              },
              { title: 'Code', dataIndex: 'itemCode' },
              {
                title: 'Description',
                dataIndex: 'itemName',
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
                title: 'Begin Qty',
                dataIndex: 'beginQuantity',
                valueType: 'digit',
                align: 'right',
              },
              {
                title: 'Req. Qty',
                dataIndex: 'requestQuantity',
                align: 'right',
              },
              {
                title: 'Sold Qty',
                dataIndex: 'soldQuantity',
                render: (_, r) => (
                  <>
                    ( <Text type="danger">{r.soldQuantity}</Text> )
                  </>
                ),
                align: 'right',
              },
              {
                title: 'System Qty',
                dataIndex: 'systemQuantity',
                align: 'right',
              },
              {
                title: 'Actual Qty',
                dataIndex: 'actualQuantity',
                render: (_, r) => <Text type="warning">{r.actualQuantity}</Text>,
                align: 'right',
              },
            ]}
            summary={(item) => {
              const begQty = item.reduce((p, c) => p + c.beginQuantity, 0);
              const reqQty = item.reduce((p, c) => p + c.requestQuantity, 0);
              const soldQty = item.reduce((p, c) => p + c.soldQuantity, 0);
              const systemQty = item.reduce((p, c) => p + c.systemQuantity, 0);
              const actQty = item.reduce((p, c) => p + c.actualQuantity, 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={1} colSpan={5} align="right">
                    <Text>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={1} align="right">
                    <Text>{numeral(begQty).format('0,000')}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={1} align="right">
                    <Text>{numeral(reqQty).format('0,000')}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={1} align="right">
                    <Text type="danger">( {numeral(soldQty).format('0,000')} )</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={1} align="right">
                    <Text type="success"> {numeral(systemQty).format('0,000')} </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={1} align="right">
                    <Text type="success"> {numeral(actQty).format('0,000')} </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Card>

        <Card
          title="Free of Charge"
          hidden={(dataSource?.freeOfCharge?.length ?? 0) > 0 ? false : true}
          size="small"
        >
          <ProTable
            search={false}
            size="small"
            ghost
            options={false}
            pagination={false}
            dataSource={dataSource?.freeOfCharge}
            columns={[
              {
                title: 'Item Name',
                dataIndex: 'itemName',
              },
              {
                title: 'Requested Quantity',
                dataIndex: 'quantity',
              },
              {
                title: 'Used Quantity',
                dataIndex: 'usingQty',
              },
              {
                title: 'Source',
                dataIndex: 'source',
              },
              // {
              //     title:"From",
              //     dataIndex:"borrowFrom"
              // }
            ]}
          />
        </Card>
        {/* <Card size="small" style={{ height: "100%" }}>
                    {
                        dataSource?.comment?.length ? (<>
                            <Timeline
                                mode="left"
                                items={dataSource.comment.map(p => ({
                                    label: <Space><Typography.Text type="warning">{p.createdBy}</Typography.Text><Typography.Text italic>{formatDate(p.createdDate)}</Typography.Text></Space>,
                                    children: <Flex vertical justify="space-around">
                                        <Typography.Text type="danger">{p.type}</Typography.Text>
                                        <Space>
                                            <Typography.Text type="secondary">remark:</Typography.Text>
                                            <Typography.Text >{p.description}</Typography.Text>
                                        </Space>

                                    </Flex>
                                }))}
                            />
                        </>)
                            : <Flex justify="center"><Text type="secondary">no remark</Text></Flex>
                    }
                </Card> */}
      </Flex>

      <RemarkModalForm
        showAlertInfo
        open={actionState?.visible?.open}
        status="reject"
        onCancel={() => setActionState({ visible: undefined })}
        onSave={(data) => {
          const entry = {
            ...data,
            id: dataSource?.id,
          };
          services.reject(entry).then(() => {
            actionRef.current?.reload?.();
            loadData();
            message.info('Your rejection request was a success!');
          });
          setActionState({ visible: undefined });
        }}
      />
    </Spin>
  );
};

export default CountStockDetail;
