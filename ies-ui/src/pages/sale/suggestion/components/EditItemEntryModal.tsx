import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import type { FormModalProps } from '@/components/FormModal';
import FormModalComp from '@/components/FormModal';
import { formatDate } from '@/pages/utils';
import type { ApprovalStockControlDto, StockControlLess } from '@/services/sale/data';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Card, Tooltip, Typography } from 'antd';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';

// const layout = {
//   labelCol: { span: 6 },
//   wrapperCol: { span: 14 },
// };

interface Props extends FormModalProps {
  data?: StockControlLess;
  actionHandlers: {
    onAddItem?: (item: ApprovalStockControlDto) => void;
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
  id: React.Key;
  batchNo?: moment.Moment;
  itemName: string;
  itemCode: string;
  uom: string;
  beginningQty: number;
  quantity: number;
  expiredDate?: moment.Moment;
  isSplit: boolean;
  stockCategoryId?: number;
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

  const onResetActionHandler = useCallback(() => {
    if (data) {
      setDataSource(
        data.items?.map((it) => {
          const batchNo = moment(it.batchNo, formatStringDate);
          const itemEdit: EditableStockItem = {
            id: it.id || (Math.random() * 1000000).toFixed(0),
            batchNo: it.batchNo === null ? undefined : batchNo,
            beginningQty: it.beginningQty,
            expiredDate: it.expiredDate,
            itemName: it.itemName,
            quantity: it.quantity,
            uom: it.uom || '',
            itemCode: it.itemCode,
            isSplit: false,
            stockCategoryId: it.itemType,
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

  const onSubmitActionHandler = async () => {
    const item: ApprovalStockControlDto = {
      stockControlId: data?.id || -1,
      description: data?.description,
      receivedBy: data?.receivedBy,
      referenceNo: data?.referenceNo,
      items: dataSource.map((it) => {
        const isBeginning = it.beginningQty > 0;
        const batchNumber = formatDate(it.batchNo, formatStringDate);
        return {
          id: parseInt(it.id.toString()),
          itemCode: it.itemCode,
          batchNo: batchNumber || '',
          //it.expiredDate = '31-08-2022'
          expiredDate: it.expiredDate,
          isBeginning: isBeginning,
          quantity: isBeginning ? it.beginningQty : it.quantity,
          isSplit: it.isSplit,
          stockCategoryId: it.stockCategoryId,
        };
      }),
    };
    if (actionHandlers.onAddItem) {
      actionHandlers.onAddItem(item);
    }
  };

  const disabledButton = useCallback(() => {
    return dataSource
      .filter((it) => it.beginningQty === 0)
      .some((it) => !(it.batchNo && it.expiredDate));
  }, [dataSource]);

  return (
    <FormModalComp
      key={`FormModalComp-${data?.id}`}
      {...props}
      //   isHiddenReset
      width="1000px"
      disabled={disabledButton()}
      onSubmit={onSubmitActionHandler}
      onResetForm={onResetActionHandler}
      okText={'Update'}
      title="Issue Stock"
    >
      <Card size="small" title="Stock Detail" style={{ marginBottom: 10 }}>
        <DescriptionDisplay data={generalInfo} />
      </Card>
      {/* <Card size="small" title="Stock Items"> */}
      <EditableProTable<EditableStockItem>
        title={() => <Text>Stock Items</Text>}
        rowKey={'id'}
        // scroll={{
        //   x: 960,
        // }}
        actionRef={actionRef}
        // id="id"
        //key={`EditableProTable-${data?.id}`}
        recordCreatorProps={false}
        value={dataSource}
        // onDataSourceChange={setDataSource}
        // onChange={setDataSource}
        onValuesChange={setDataSource}
        editable={{
          onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
          onlyOneLineEditorAlertMessage:
            'Please save the editing record, before start edit a new record.',
          type: 'single',
          editableKeys,

          onSave: async (_, record: EditableStockItem, originRow: EditableStockItem) => {
            console.log(record);
            console.log(originRow);
            const batchDate = record.batchNo;
            record.expiredDate = moment(batchDate).add(6, 'M');
            // record.batchNo = moment(batchDate);
            await waitTime(1000);
            // return Promise.resolve(record);
            // const sourceQty =
            //   data?.items?.find(
            //     (it) =>
            //       it.itemCode === editRow.itemCode && it.batchNo === null && it.beginningQty === 0,
            //   )?.quantity || 0;

            // const editedQty =
            //   dataSource
            //     .filter(
            //       (it) =>
            //         it.itemCode === editRow.itemCode &&
            //         it.batchNo !== null &&
            //         it.beginningQty === 0,
            //     )
            //     .reduce((acc, it) => (acc += it.quantity), 0) + editRow.quantity;

            // const isError = sourceQty < editedQty;
            // setIsError(isError);

            // return isError ? Promise.reject('Error') : Promise.resolve('Success');
          },
          // onValuesChange: () => {
          //   setIsError(false);
          // },
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
            formItemProps: {
              rules: [
                {
                  // whitespace: false,
                  required: true,
                  message: 'Please Enter',
                },
              ],
            },
            render: (_text, r) => {
              return formatDate(r.batchNo, formatStringDate);
            },
          },
          {
            title: 'Expired Date',
            dataIndex: 'expiredDate',
            valueType: 'date',
            readonly: true,
            render: (_, r) => {
              return formatDate(r.expiredDate, formatStringDate);
            },
            // valueType: 'date',
            // width: 140,
            // formItemProps: {
            //   rules: [
            //     {
            //       required: true,
            //       message: 'Please Enter',
            //     },
            //   ],
            // },
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
                    // return isError
                    //   ? Promise.reject('Quantity is over.')
                    //   : value === 0
                    //   ? Promise.reject('Quantity sould be greater than 0.')
                    //   : Promise.resolve(undefined);
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
                  <Tooltip title="Edit" key={`editable-${record.id}`}>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        if (!action?.isEditable) setIsError(false);
                        //console.log(_text, record, action);
                        action?.startEditable?.(record.id);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Copy" key={`copy-${record.id}`}>
                    <Button
                      type="link"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        const first: EditableStockItem = {
                          id: (Math.random() * 1000000).toFixed(0),
                          beginningQty: record.beginningQty,
                          itemCode: record.itemCode,
                          itemName: record.itemName,
                          quantity: record.quantity,
                          uom: record.uom,
                          batchNo: moment(),
                          isSplit: true,
                          stockCategoryId: record.stockCategoryId,
                        };
                        actionRef.current?.addEditRecord?.(first);
                      }}
                    />
                  </Tooltip>
                </>
              ),
            ],
          },
        ]}
      />
      {/* </Card> */}
    </FormModalComp>
  );
};

export default EditItemEntryModal;
