import type { FormModalProps } from '@/components/FormModal';
import FormModalComp from '@/components/FormModal';
import { formatDate } from '@/pages/utils';
import { CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import type {
  ApprovalStockControlDto,
  EditableStockItem,
  StockControlLess,
} from '@/services/sale/data';
import { CopyOutlined, DeleteOutlined, EditOutlined, FieldBinaryOutlined } from '@ant-design/icons';
import { ProDescriptions, ProForm, ProFormSelect } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Card, Flex, Tag, Tooltip, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { uniqueId } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import RemarkModalForm from '../../component/RemarkModal';
import { DistributorCreate } from '../../mpu/request/data';
interface Props extends FormModalProps {
  data?: StockControlLess;
  actionHandlers: {
    onAddItem?: (item: ApprovalStockControlDto) => void;
    onCancel: () => void;
    onRejectAll: (param: RemarkParam) => void;
  };
  role?: string;
}

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const EditItemEntryModal: React.FC<Props> = ({ data, actionHandlers, role, ...props }) => {
  const requestActions = simpleRequestActions();
  const formatStringDate = 'DD-MM-YYYY';
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<EditableStockItem[]>([]);
  const { Text } = Typography;
  const [distributor, setDistributor] = useState<DistributorCreate>();
  const [form] = useForm<ApprovalStockControlDto>();
  const [isError, setIsError] = useState<boolean>(false);

  const [remarkState, setRemarkState] = useState<{
    open: boolean;
    carryData?: number;
  }>();

  const onResetActionHandler = useCallback(() => {
    if (data) {
      //?.filter((it) => it.status !== 'rejected')
      setDataSource(
        data.items?.map((it) => {
          const batchNo = moment(it.batchNo, formatStringDate);
          console.log(batchNo);
          const itemEdit: EditableStockItem = {
            id: it.id,
            key: (Math.random() * 1000000).toFixed(0),
            batchNo:
              it.batchNo === null || it.batchNo === '' || it.batchNo === 'n/a'
                ? undefined
                : batchNo,
            beginningQty: it.beginningQty,
            expiredDate: it.expiredDate,
            itemName: it.itemName,
            quantity: it.quantity,
            uom: it.uom || '',
            itemCode: it.itemCode,
            isSplit: false,
            stockCategoryId: it.itemType,
            status: it.status,
            internalId: it.internalId,
            itemType: it.itemType,
            isBeginning: it.beginningQty > 0,
          };
          return itemEdit;
        }) || [],
      );
    }
    setEditableRowKeys([]);
    actionRef.current?.reload();
  }, [data]);

  useEffect(() => {
    if (!props.open) return;
    form.resetFields();
    onResetActionHandler();
    return () => {
      //   formStock.resetFields();
    };
  }, [onResetActionHandler, props.open]);

  // const allowReload = useCallback(() => {
  //   return (
  //     dataSource.length === dataSource.filter((it) => it.status === 'rejected').length &&
  //     dataSource.every((it) => it.status === 'rejected')
  //   );
  // }, [dataSource]);

  const disabledButton = useCallback(() => {
    return dataSource.some(
      (o) => o.itemType === 132 && o.status !== 'rejected' && o.batchNo === undefined,
    );
    // return (
    //   dataSource
    //     // .filter((it) => it.beginningQty === 0)
    //     .filter((it) => it.status !== 'rejected')
    //     // .some((it) => !(it.batchNo && it.expiredDate));
    //     .some((it) => it.itemType !== 132 && it.batchNo && it.expiredDate)
    // );
  }, [dataSource]);

  const onSubmitActionHandler = async () => {
    await form.validateFields();
    const items = dataSource.map((it) => {
      const isBeginning = it.beginningQty > 0;
      // const batchNumber = formatDate(it.batchNo, formatStringDate);
      return {
        id: it.id!,
        quantity: isBeginning ? it.beginningQty : it.quantity,
        isBeginning: isBeginning,
        batchNo: it.batchNo ? formatDate(moment(it.batchNo), formatStringDate) : 'n/a',
        expiredDate: it.batchNo ? moment(it.batchNo).add(6, 'M') : undefined,
        itemCode: it.itemCode,
        stockCategoryId: it.stockCategoryId,
        isSplit: it.isSplit,
        internalId: it.internalId,
        status: it.status,
        itemName: it.itemName,
        pricing: 0.0,
        key: it.key,
        uom: it.uom,
      };
    });
    const item: ApprovalStockControlDto = {
      stockControlId: data?.id || -1,
      description: data?.description,
      receivedBy: data?.owner.split('-')[0],
      referenceNo: data?.referenceNo,
      items: items,
      distributorCode: distributor?.code,
    };
    if (actionHandlers.onAddItem) {
      actionHandlers.onAddItem(item);
    }
  };

  return (
    <FormModalComp
      key={`FormModalComp-${data?.id}`}
      {...props}
      width="1000px"
      // disabled={disabledButton()}
      // onSubmit={onSubmitActionHandler}
      // onResetForm={onResetActionHandler}
      // okText={'Update'}
      footer={
        <Flex gap="small" align="flex-start" justify="flex-end">
          <Button type="default" onClick={() => actionHandlers.onCancel()}>
            <Typography.Text type="secondary">Cancel</Typography.Text>
          </Button>
          <Button type="default" onClick={onResetActionHandler}>
            Reset
          </Button>
          <Button
            type="default"
            danger
            onClick={() => setRemarkState({ open: true, carryData: data?.id })}
          >
            Reject
          </Button>
          <Button
            type="primary"
            color="secondary"
            disabled={disabledButton()}
            onClick={onSubmitActionHandler}
          >
            Submit
          </Button>
        </Flex>
      }
      title="Issue Stock"
    >
      <Flex vertical gap={12}>
        <Card size={'small'}>
          <ProDescriptions<StockControlLess>
            dataSource={data}
            contentStyle={{
              fontWeight: 500,
            }}
            columns={[
              {
                title: 'Store Name',
                render: (_, r) => <Typography.Text type="success">{r.stockName}</Typography.Text>,
              },
              {
                title: 'Requested Date',
                dataIndex: 'requestedDate',
                valueType: 'date',
              },
              {
                title: '	Request By',
                dataIndex: 'owner',
              },
              {
                title: 'Serial #',
                dataIndex: 'referenceNo',
              },
              {
                title: '	Approved Date',
                dataIndex: 'approvedDate',
                valueType: 'date',
              },
              {
                title: 'Approved By',
                dataIndex: 'approvedBy',
              },
              {
                title: 'Plate Number',
                dataIndex: 'plateNumber',
              },
              {
                title: 'Received By',
                dataIndex: 'receivedBy',
              },
              {
                title: 'Status',
                dataIndex: 'receivedBy',
                render: (_, r) => (
                  <Tag color="gold" bordered={false}>
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Description',
                dataIndex: 'description',
              },
            ]}
          />
        </Card>
        {role !== undefined && (
          <Card size={'small'}>
            <ProForm submitter={false} form={form} layout="horizontal">
              <ProFormSelect
                showSearch
                debounceTime={500}
                name={'distributorId'}
                rules={[{ required: true }]}
                onChange={async (s: number) => {
                  const y = await CrmServiceAPI(requestActions).findDetailCustomer({ id: s });
                  setDistributor({
                    code: y.code,
                    id: y.id,
                    name: y.name,
                    phone: y.contacts?.[0].phone1,
                    latitude: y?.addressList?.[0]?.latitude,
                    longitude: y?.addressList?.[0]?.longitude,
                  });
                }}
                label={'Distributor'}
                request={async (k: { keyWords: string }) => {
                  const data = await CrmServiceAPI(requestActions).findAllCustomer({
                    searchValue: k.keyWords,
                  });

                  return data.items.map((p) => ({ value: p.id, label: p.name }));
                }}
              />
            </ProForm>
          </Card>
        )}
        <Card size="small">
          <EditableProTable<EditableStockItem>
            title={() => (
              <Text>
                Stock Items <FieldBinaryOutlined />
              </Text>
            )}
            rowKey={(r) => {
              return r.key;
            }}
            size="small"
            actionRef={actionRef}
            key={`EditableProTable-${data?.id}`}
            recordCreatorProps={false}
            value={dataSource}
            onValuesChange={setDataSource}
            editable={{
              onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
              onlyOneLineEditorAlertMessage:
                'Please save the editing record, before start edit a new record.',
              type: 'single',
              editableKeys,
              onSave: async (_, record: EditableStockItem) => {
                if (record.batchNo) {
                  record.batchNo = moment(record.batchNo);
                  record.expiredDate = moment(record.batchNo).add(6, 'M');
                }
                await waitTime(100);
              },
              onChange: setEditableRowKeys,
              actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
            }}
            columns={[
              {
                key: 'batchNo',
                title: 'Batch #',
                dataIndex: 'batchNo',
                valueType: 'date',
                width: 140,
                render: (_, r) => {
                  if (r.batchNo === null || r.batchNo === undefined) {
                    return '';
                  } else {
                    return formatDate(r.batchNo, formatStringDate);
                  }
                },
                formItemProps: (form, _config) => {
                  // console.log('-------------------');
                  // console.log(_config);
                  // console.log('-------------------');
                  // console.log(form.getFieldValue(_config.dataIndex));
                  return {
                    ...form,
                    hidden: _config.entity.itemType === 132 && role === undefined ? false : true,
                    rules: [
                      {
                        required:
                          _config.entity.itemType === 132 && role === undefined ? true : false,
                      },
                    ],
                  };
                },
              },
              {
                title: 'Expired Date',
                dataIndex: 'expiredDate',
                valueType: 'date',
                readonly: true,
              },
              {
                title: 'Item Code',
                dataIndex: 'itemCode',
                readonly: true,
                width: 90,
              },
              {
                title: 'Item Name',
                dataIndex: 'itemName',
                readonly: true,
                width: 180,
              },
              {
                title: 'UoM',
                dataIndex: 'uom',
                readonly: true,
                align: 'center',
                width: 60,
              },
              {
                title: 'Begin Qty',
                align: 'right',
                dataIndex: 'beginningQty',
                readonly: true,
                width: 90,
              },
              {
                title: 'Request Qty',
                align: 'right',
                dataIndex: 'quantity',
                valueType: 'digit',
                width: 100,
                formItemProps: {
                  validateStatus: isError ? 'error' : 'success',
                  rules: [
                    {
                      validator: (_, value) => {
                        return value === 0
                          ? Promise.reject('Quantity sould be greater than 0.')
                          : Promise.resolve(undefined);
                      },
                      whitespace: false,
                    },
                  ],
                },
              },
              {
                dataIndex: 'itemId',
                readonly: true,
                hideInTable: true,
              },
              {
                valueType: 'option',
                align: 'right',
                width: 120,
                render: (_text, record, _, action) => [
                  record.status === 'rejected' && <Text type="danger">{record.status}</Text>,
                  record.beginningQty === 0 && record.status !== 'rejected' && (
                    <>
                      <Tooltip title="Edit" key={`editable-${record.key}`}>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            if (!action?.isEditable) setIsError(false);
                            action?.startEditable?.(record.key);
                          }}
                        />
                      </Tooltip>

                      {record.stockCategoryId === 132 && (
                        <Tooltip title="Copy" key={`copy-${record.key}`}>
                          <Button
                            type="link"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              const key = Math.random() * 1000000;
                              const first: EditableStockItem = {
                                id: -key,
                                beginningQty: record.beginningQty,
                                itemCode: record.itemCode,
                                itemName: record.itemName,
                                quantity: record.quantity,
                                uom: record.uom,
                                isSplit: true,
                                status: record.status,
                                stockCategoryId: record.stockCategoryId,
                                internalId: uniqueId(),
                                itemType: record.itemType,
                                batchNo: undefined,
                                expiredDate: undefined,
                                key: -key,
                              };
                              // dataSource.push(first);
                              // setDataSource(dataSource);
                              // actionRef.current?.reload();
                              actionRef.current?.addEditRecord?.(first);
                            }}
                          />
                        </Tooltip>
                      )}

                      <Tooltip title="Delete" key={`delete-${record.key}`}>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            if (record.isSplit) {
                              const dataSourceItems = dataSource.filter(
                                (it) => it.id !== record.id,
                              );
                              setDataSource(dataSourceItems);
                            } else {
                              record.status = 'rejected';
                              setDataSource([...dataSource]);
                            }
                          }}
                        />
                      </Tooltip>
                    </>
                  ),
                ],
              },
            ]}
          />
        </Card>
      </Flex>

      <RemarkModalForm
        open={remarkState?.open}
        showAlertInfo
        onCancel={() => setRemarkState({ open: false })}
        status="reject"
        onSave={async (remark) => {
          const payload = {
            ...remark,
            id: data!.id,
          };
          setRemarkState({ open: false });
          actionHandlers.onRejectAll?.(payload);
        }}
      />

      {/* <RemarkModal
        title="Delete the item"
        open={showRemark?.isOpen}
        width="500px"
        id={showRemark?.record?.id}
        onCancel={() => setShowRemark({ isOpen: false, record: undefined })}
        onSave={(id, remarks) => {
          if (showRemark !== undefined && showRemark.record !== undefined) {
            const dataSourceItems = dataSource.filter(
              // (it) => it.id !== showRemark.record?.id && it.key !== showRemark.record?.key,
              (it) => it.key !== showRemark.record?.key,
            );
            setDataSource(dataSourceItems);
            actionRef.current?.reload();
            setShowRemark({ isOpen: false, record: undefined });
            actionHandlers.onRejectItem(id, remarks);
          }
        }}
      /> */}
    </FormModalComp>
  );
};

export default EditItemEntryModal;
