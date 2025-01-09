import { formatDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { SaleInvoiceLess, StockControlLess, StockDetailItemLess } from '@/services/sale/data';
import { ProTable } from '@ant-design/pro-components';
import { Button, Card, Flex, Modal, Space, Table, Typography, message } from 'antd';
import numeral from 'numeral';
import React, { useState } from 'react';
import RemarkModalForm from '../component/RemarkModal';
import { SuggestionServiceAPI } from './services';

interface Props {
  data?: StockControlLess;
  source: 'ADMIN' | 'WAREHHOUSE' | 'CASHIER';
  actionButton?: boolean;
  onReload?: () => void;
  onSettlement: (data?: StockControlLess) => void;
  onMMAApprove?: (data?: StockControlLess, role?: string) => void;
  onMMAReviewSettlement?: (data: StockControlLess) => void;
}

const ExpendableTable: React.FC<Props> = ({
  data,
  source,
  onMMAReviewSettlement,
  onReload,
  onSettlement,
  onMMAApprove,
}) => {
  const requestActions = simpleRequestActions();
  const services = SuggestionServiceAPI(requestActions);

  const [remarkState, setRemarkState] = useState<{
    visible?: {
      open: boolean;
      carryData?: StockControlLess;
    };
  }>();
  const [modalApproveState, setModalApproveState] = useState<{
    state?: {
      visible: boolean;
      data?: StockControlLess;
    };
  }>();
  // const [countModal, setCountModal] = useState<{
  //   open?: boolean;
  //   record?: StockControlLess;
  // }>({});
  // const [settleModal, setSettleModal] = useState<{
  //   open?: boolean;
  //   record?: StockControlLess;
  // }>({});

  // const [approvalState, setApprovalState] = useState<{
  //   visible?: {
  //     name: 'MODAL';
  //     type: 'ADD';
  //     payload?: any;
  //   };
  // }>();

  const onApprove = (id?: number) => {
    Modal.confirm({
      title: 'Accept Suggestion.',
      content: 'Are you sure?',
      onOk: async () => {
        await services
          .aceptRequestStock(id)
          .then(() => {
            message.success('The stock request was accepted.');
          })
          .catch((p) => {
            message.error(p.message);
          });
        onReload?.();
      },
    });
  };
  return (
    <>
      {(source === 'ADMIN' && (
        <ProTable
          search={false}
          options={false}
          pagination={false}
          dataSource={data?.items as StockDetailItemLess[]}
          size="small"
          footer={() => {
            return (
              <Flex justify="flex-end">
                <Space>
                  {
                    <Button
                      danger
                      onClick={async () => {
                        // setRemarkState({ visible: { open: true, carryData: parent } });
                        Modal.confirm({
                          title: 'Reject Suggestion.',
                          content: 'Are you sure?',
                          onOk: async () => {
                            services
                              .reject(data?.id)
                              .then((p) => {
                                message.success('The stock request was rejected.');
                                onReload?.();
                              })
                              .catch((p) => {
                                message.error(p.message);
                              });
                          },
                        });
                      }}
                      // onClick={()=>onReject?.()}
                    >
                      Reject
                    </Button>
                  }
                  {(data?.status === 'settled' && (
                    <Button
                      type="primary"
                      onClick={() => {
                        onMMAReviewSettlement?.(data);
                      }}
                    >
                      Review Settlement
                    </Button>
                  )) || (
                    <Button
                      type="primary"
                      onClick={async () => {
                        if (data !== undefined && data !== null) {
                          if (
                            data.requestedBy?.teamType === 'MPU' &&
                            data.requestedBy?.role === 'ROLE_MPU_LEADER'
                          ) {
                            onMMAApprove?.(data, 'ROLE_MPU_LEADER');
                            return;
                          }
                          if (
                            data.requestedBy?.teamType === 'MPU' &&
                            data.requestedBy?.role === 'ROLE_VAN_SALE_LEADER'
                          ) {
                            setModalApproveState({ state: { visible: true, data } });
                            return;
                          }
                          onApprove(data.id);
                        }
                      }}
                    >
                      Approve
                    </Button>
                  )}
                </Space>
              </Flex>
            );
          }}
          summary={(data) => {
            const beginningQty = data.reduce((p, c) => {
              return p + c.beginningQty;
            }, 0);
            const requestQty = data.reduce((p, c) => {
              return p + c.quantity;
            }, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="right" colSpan={5}>
                  <Typography.Text type="secondary">Total</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Typography.Text type="success"> {beginningQty} </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Typography.Text type="success"> {requestQty} </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
          columns={[
            {
              title: 'Batch No',
              // dataIndex: "batchNo"
              render: (_, r) => {
                return r.batchNo === undefined || r.batchNo === null
                  ? '-'
                  : r.batchNo === 'n/a'
                  ? '-'
                  : r.batchNo;
              },
            },
            {
              title: 'Expired Date',
              dataIndex: 'expiredDate',
              valueType: 'date',
            },
            {
              title: 'Description',
              dataIndex: '',
              render: (_, r) => `${r.itemCode} - ${r.itemName} (${r.description})`,
            },
            {
              title: 'UOM',
              dataIndex: 'uom',
            },
            {
              title: 'Type',
              dataIndex: '',
              render: (_, r) => {
                if ('expiredDate' in r) {
                  return r.itemType === 131
                    ? 'Vital'
                    : r.itemType === 132
                    ? 'Mee Chiet'
                    : 'Merchandise';
                } else return '-';
              },
            },
            {
              title: 'Beginning Qty',
              dataIndex: 'beginningQty',
              align: 'right',
            },
            {
              title: 'Request Qty',
              dataIndex: 'quantity',
              align: 'right',
              render: (_, r) => {
                return <Typography.Text type="warning">{r.quantity}</Typography.Text>;
              },
            },
          ]}
        />
      )) ||
        (source === 'CASHIER' && (
          <ProTable<SaleInvoiceLess>
            search={false}
            options={false}
            dataSource={data?.invoices as SaleInvoiceLess[]}
            pagination={false}
            size="small"
            footer={() => {
              return (
                <Flex justify="flex-end" gap={12}>
                  {data?.invoices?.length ? (
                    <Button onClick={() => onSettlement(data)} type="primary">
                      Settlement
                    </Button>
                  ) : (
                    ''
                  )}
                  {data?.invoices?.length ? (
                    ''
                  ) : (
                    <Button
                      onClick={() => {
                        Modal.confirm({
                          title: 'Settlement has no invoice.',
                          content: 'Are you sure?',
                          onOk: async () => {
                            await services.onClosedRequest(data?.id);
                            onReload?.();
                          },
                        });
                      }}
                      type="primary"
                    >
                      Submit
                    </Button>
                  )}
                </Flex>
              );
            }}
            summary={(data) => {
              const total = data.reduce((p, c) => p + c.amount, 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={4}>
                    <Typography.Text type="secondary">Total</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Typography.Text type="success">
                      {' '}
                      {numeral(total).format('$ 0,000.00')}{' '}
                    </Typography.Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
            columns={[
              {
                title: 'Invoice #',
                dataIndex: 'invoiceNo',
              },
              {
                title: 'Reference #',
                dataIndex: 'referenceNo',
              },
              {
                title: 'Invoice Date',
                //dataIndex: 'invoiceNo'
                render: (_, r) => {
                  if ('invoiceDate' in r) {
                    return formatDate(r.invoiceDate);
                  } else return '-';
                },
              },
              {
                title: 'Salesperson',
                render: (_, r) => {
                  if ('invoiceDate' in r) {
                    return `${r.salesperson.salespersonCode} - ${r.salesperson.salespersonName}`;
                  } else return '-';
                },
              },
              {
                title: 'Amount',
                align: 'right',
                render: (_, r) => {
                  if ('invoiceDate' in r) {
                    // const amount = (dsdExchangeRate?.target_amount ?? 0) * r.amount;
                    return `$ ${numeral(r.amount).format('0,000.00')}`;
                  } else return '-';
                },
              },
            ]}
          />
        )) ||
        (source === 'WAREHHOUSE' && (
          <ProTable<StockDetailItemLess>
            search={false}
            options={false}
            size="small"
            dataSource={data?.items as StockDetailItemLess[]}
            pagination={false}
            footer={() => {
              return (
                data?.comments?.length && (
                  <Card size="small">
                    {data?.comments?.map((p) => {
                      return <Typography.Text type="secondary">{p?.description}</Typography.Text>;
                    })}
                  </Card>
                )
              );
            }}
            summary={(childData) => {
              const beginningQty = childData.reduce((p, c) => {
                return p + c.beginningQty;
              }, 0);
              const requestQty = childData.reduce((p, c) => {
                return p + c.quantity;
              }, 0);
              const solQty = childData.reduce((p, c) => p + c.soldQty, 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={5}>
                    <Typography.Text type="secondary">Total :</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Typography.Text type="success"> {beginningQty} </Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Typography.Text type="success">{requestQty} </Typography.Text>
                  </Table.Summary.Cell>
                  {/* {data?.status == "count stock" && <Table.Summary.Cell index={1} align="right" ><Typography.Text type="success">( {solQty} )</Typography.Text></Table.Summary.Cell>} */}
                </Table.Summary.Row>
              );
            }}
            columns={[
              {
                title: 'Batch No',
                // dataIndex: 'batchNo',
                render: (_, r) => {
                  return r.batchNo === undefined || r.batchNo === null
                    ? '-'
                    : r.batchNo === 'n/a'
                    ? '-'
                    : r.batchNo;
                },
              },
              {
                title: 'Expired Date',
                dataIndex: 'expiredDate',
                valueType: 'date',
              },
              {
                title: 'Description',
                dataIndex: '',
                render: (_, r) => `${r.itemCode} - ${r.itemName} (${r.description})`,
              },
              {
                title: 'UOM',
                dataIndex: 'uom',
              },
              {
                title: 'Type',
                dataIndex: '',
                render: (_, r) => {
                  if ('expiredDate' in r) {
                    return r.itemType === 131
                      ? 'Vital'
                      : r.itemType === 132
                      ? 'Mee Chiet'
                      : 'Merchandise';
                  } else return '-';
                },
              },
              {
                title: 'Beginning Qty',
                dataIndex: 'beginningQty',
                align: 'right',
              },
              {
                title: 'Request Qty',
                dataIndex: 'quantity',
                align: 'right',
                render: (_, r) => {
                  return <Typography.Text type="warning">{r.quantity}</Typography.Text>;
                },
              },
            ]}
          />
        ))}

      <RemarkModalForm
        open={remarkState?.visible?.open}
        showAlertInfo
        onCancel={() => setRemarkState({ visible: undefined })}
        status="reject"
        onSave={async (data) => {
          services
            .reject({
              id: remarkState?.visible?.carryData?.id,
              ...data,
            })
            .then((o) => {
              message.success('Your rejection request was a success!');
            });
          setRemarkState({ visible: undefined });
        }}
      />
      <Modal
        open={modalApproveState?.state?.visible}
        onCancel={() => setModalApproveState({ state: undefined })}
        title={'Which module you want to approve Stock?'}
        footer={false}
      >
        {/* <Flex vertical>
                <Typography.Text> - MMA Approveal is the action that approve saleperson request and assign distibutor saleperson stock issue</Typography.Text>
                <Typography.Text> - CMD approve that saleperson issue stock from internal warehouse </Typography.Text>
                </Flex> */}
        <Flex vertical gap={8}>
          <Button
            onClick={() => {
              onMMAApprove?.(modalApproveState?.state?.data, 'ROLE_MPU_LEADER');
              setModalApproveState({ state: undefined });
            }}
          >
            MMA Approval
          </Button>
          <Button
            onClick={() => {
              modalApproveState?.state?.data && onApprove(modalApproveState?.state?.data.id);
              setModalApproveState({ state: undefined });
            }}
          >
            CND Approval
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default ExpendableTable;