import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import type { FormModalProps } from '@/components/FormModal';
import FormModalComp from '@/components/FormModal';
import RemarkModal from '@/components/remark-modal';
import { formatDate } from '@/pages/utils';
import type { ApprovalStockControlDto, StockControlLess } from '@/services/sale/data';
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ProDescriptions, ProFormDatePicker } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Card, Flex, Input, Tag, Tooltip, Typography, message } from 'antd';
import { uniqueId } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// const layout = {
//   labelCol: { span: 6 },
//   wrapperCol: { span: 14 },
// };

interface Props extends FormModalProps {
  data?: StockControlLess;
  actionHandlers: {
    onAddItem?: (item: ApprovalStockControlDto) => void;
    onRejectItem: (id: number, remark: string) => void;
    onReload?: () => void;
  };
}

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

interface EditableStockItem {
  id?: number;
  key: React.Key;
  batchNo?: moment.Moment;
  itemName: string;
  itemCode: string;
  uom: string;
  beginningQty: number;
  quantity: number;
  expiredDate?: moment.Moment;
  isSplit: boolean;
  stockCategoryId?: number;
  status: string;
  internalId?: string;
  itemType?: number;
}

const EditItemEntryModal: React.FC<Props> = ({ data, actionHandlers, ...props }) => {
  //   const [formStock] = useForm<StockControlItemLess>();
  // const uomList = [{ id: 1, name: 'Case' }];
  const formatStringDate = 'DD-MM-YYYY';
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<EditableStockItem[]>([]);
  const { Text } = Typography;

  const [isError, setIsError] = useState<boolean>(false);

  const [showRemark, setShowRemark] = useState<{
    record: EditableStockItem | undefined;
    isOpen: boolean;
  }>();

  const onResetActionHandler = useCallback(() => {
    if (data) {
      setDataSource(
        data.items
          ?.filter((it) => it.status !== 'rejected')
          .map((it) => {
            const batchNo = moment(it.batchNo, formatStringDate);
            const itemEdit: EditableStockItem = {
              id: it.id,
              key: (Math.random() * 1000000).toFixed(0),
              batchNo: it.batchNo === null || it.batchNo === '' || it.batchNo =="n/a" ? undefined : batchNo,
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
              itemType: it.itemType
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
    // formStock.resetFields();

    onResetActionHandler();
    return () => {
      //   formStock.resetFields();
    };
  }, [onResetActionHandler, props.open]);

  const generalInfo: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Store Name', value: data?.stockName },
    {
      label: 'Requested Date',
      value: formatDate(data?.requestedDate),
    },
    {
      label: 'Request By',
      //   onClick: () => {
      //     history.push(`${CrmPaths.customer}/detail/${soDetail?.associatedTo.customer.id}`);
      //   },
      value: `${data?.owner}`,
    },
    { label: 'Serial #', value: data?.referenceNo },
    {
      label: 'Approved Date',
      value: formatDate(data?.approvedDate),
    },
    { label: 'Approved By', value: data?.approvedBy },
    { label: 'Plate Number', value: data?.plateNumber },
    { label: 'Description', value: data?.description },
    { label: 'Received By', value: data?.receivedBy ? data?.receivedBy : 'N/A' },
  ];

  // const allowReload = useCallback(() => {
  //   return (
  //     dataSource.length === dataSource.filter((it) => it.status === 'rejected').length &&
  //     dataSource.every((it) => it.status === 'rejected')
  //   );
  // }, [dataSource]);

  const disabledButton = useCallback(() => {
    return dataSource.some(o => ((o.itemType == 132) && o.batchNo == null ));
    // return dataSource
    //   .filter((it) => it.beginningQty === 0)
    //   .filter((it) => it.status !== 'rejected')
    //   // .some((it) => !(it.batchNo && it.expiredDate));
    //   .some(it=> (it.itemType != 132 && it.batchNo && it.expiredDate))
  }, [dataSource]);

  const onSubmitActionHandler = async () => {
   
    const items = dataSource.map((it) => {
      const isBeginning = it.beginningQty > 0;
      const batchNumber = formatDate(it.batchNo, formatStringDate);
      return {
        id: it.id!,
        itemCode: it.itemCode,
        batchNo: it.batchNo?formatDate(moment(it.batchNo), formatStringDate) : 'n/a',
        expiredDate: it.batchNo?moment(it.batchNo).add(6,"M"):undefined,
        isBeginning: isBeginning,
        quantity: isBeginning ? it.beginningQty : it.quantity,
        isSplit: it.isSplit,
        stockCategoryId: it.stockCategoryId,
        status: it.status,
        internalId: it.internalId,
      };
    });
    const item: ApprovalStockControlDto = {
      stockControlId: data?.id || -1,
      description: data?.description,
      receivedBy: data?.receivedBy,
      referenceNo: data?.referenceNo,
      items: items,
    };
    if (actionHandlers.onAddItem) {
      actionHandlers.onAddItem(item);
    }
    // }
  };

  return (
    <FormModalComp
      key={`FormModalComp-${data?.id}`}
      {...props}
      width="1000px"
      disabled={disabledButton()}
      onSubmit={onSubmitActionHandler}
      onResetForm={onResetActionHandler}
      okText={'Update'}
      title="Issue Stock"
    >
      <Flex vertical gap={12}>
        <Card size={"small"}>
          <ProDescriptions<StockControlLess>
            dataSource={data}
            contentStyle={{
              fontWeight: 500
            }}
            columns={[
              {
                title: "Store Name",
                render: (_, r) => <Typography.Text type='success'>{r.stockName}</Typography.Text>
              },
              {
                title: "Requested Date",
                dataIndex: "requestedDate",
                valueType: "date"
              },
              {
                title: "	Request By",
                dataIndex: "owner"
              },
              {
                title: "Serial #",
                dataIndex: "referenceNo"
              },
              {
                title: "	Approved Date",
                dataIndex: "approvedDate",
                valueType: "date"
              },
              {
                title: "Approved By",
                dataIndex: "approvedBy"
              },
              {
                title: "Plate Number",
                dataIndex: "plateNumber"
              },
              {
                title: "Received By",
                dataIndex: "receivedBy",
              },
              {
                title: "Status",
                dataIndex: "receivedBy",
                render: (_, r) => <Tag color='gold' bordered={false}>{r.status}</Tag>
              },
              {
                title: "Description",
                dataIndex: "description"
              },
            ]}
          />
        </Card>
        <Card size='small'>
          <EditableProTable<EditableStockItem>
            title={() => <Text>Stock Items</Text>}
            rowKey={(r) => {
              return r.key;
            }}
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
              onSave: async (_, record: EditableStockItem, originRow: EditableStockItem) => {

                if(record.batchNo){
                  record.batchNo = moment(originRow.batchNo)
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
                formItemProps: (form, _config) => {
                  return (
                    {
                      ...form,
                      hidden: _config.entity.itemType == 132 ? false : true,
                      rules: [
                        {
                          required: _config.entity.itemType == 132 ? true : false
                        }
                      ],
                    } 
                  ) 
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
                  record.beginningQty === 0 && (
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
                      <Tooltip title="Copy" key={`copy-${record.key}`}>
                        <Button
                          type="link"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            const key = (Math.random() * 1000000).toFixed(0);
                            const first: EditableStockItem = {
                              id: record.id,
                              beginningQty: record.beginningQty,
                              itemCode: record.itemCode,
                              itemName: record.itemName,
                              quantity: record.quantity,
                              uom: record.uom,
                              isSplit: true,
                              status: record.status,
                              stockCategoryId: record.stockCategoryId,
                              internalId: record.internalId,
                              itemType:record.itemType,
                              key: key,
                            };
                            actionRef.current?.addEditRecord?.(first);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete" key={`delete-${record.key}`}>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            
                            if (record.internalId === undefined) {
                              const dataSourceItems = dataSource.filter(
                                (it) => it.key !== record.key && it.internalId !== record.internalId,
                              );
                              setDataSource(dataSourceItems);
                              actionRef.current?.reload();
                            } else {
                              const isCopied = dataSource.some((e) => (e.id === record.id) && !record.isSplit);
                              console.log(dataSource)
                              if (isCopied) {
                                message.error('Please remove copied item firstly.');
                              } else {
                                setShowRemark({ isOpen: true, record: record });
                              }
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

      <RemarkModal
        title="Delete the item"
        open={showRemark?.isOpen}
        width='500px'
        onCancel={() => setShowRemark({ isOpen: false, record: undefined })}
        onSave={(id, remarks) => {
          if (showRemark !== undefined && showRemark.record !== undefined) {
            const dataSourceItems = dataSource.filter(
              // (it) => it.id !== showRemark.record?.id && it.key !== showRemark.record?.key,
              (it) => it.key !== showRemark.record?.key
            );
            setDataSource(dataSourceItems);
            actionRef.current?.reload();
            setShowRemark({ isOpen: false, record: undefined });
            actionHandlers.onRejectItem(showRemark!.record!.id!, remarks);
          }
        }}
      />
    </FormModalComp>
  );
};

export default EditItemEntryModal;
