import type {
  CountStockDto,
  CountStockItemDto,
  StockControlLess,
  StockDetailItemSettle,
} from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import type { ModalFormProps } from '@ant-design/pro-form';
import { ModalForm, ProFormCheckbox } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
interface Props extends ModalFormProps {
  data?: StockControlLess;
  actionHandlers: {
    onCancel?: () => void;
    onAddItem?: (item: CountStockDto) => void;
  };
}

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const CountStockModal: React.FC<Props> = ({ data, actionHandlers, ...props }) => {
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<StockDetailItemSettle[]>([]);
  const [isRemarkRequired, setIsRemarkRequired] = useState<boolean>(false);
  const { Text } = Typography;

  useEffect(() => {
    if (!props.open) return;

    const onResetActionHandler = () => {
      if (data) {
        setDataSource(
          data.items?.map((it) => {
            const endQty = it.beginningQty + it.quantity - it.soldQty;
            const d: StockDetailItemSettle = {
              ...it,
              isSettle: true,
              remark: '',
              totalQty: it.beginningQty + it.quantity,
              endQty: endQty,
              actualQty: endQty,
            };
            return d;
          }) || [],
        );
      }
      setEditableRowKeys([]);
      actionRef.current?.reload();
    };
    onResetActionHandler();
    return () => {};
  }, [data, props.open]);

  return (
    <ModalForm<{ isKeepForwarding: boolean }>
      title="Count Stock"
      width="1350px"
      layout={'horizontal'}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => actionHandlers.onCancel && actionHandlers.onCancel(),
        okText: <Text style={{ color: 'white' }}>Submit</Text>,
      }}
      initialValues={{
        isKeepForwarding: true,
      }}
      submitTimeout={1000}
      onFinish={(params) => {
        const items = dataSource.map((it) => {
          const item: CountStockItemDto = {
            id: it.id!!,
            actualQty: it.actualQty || 0,
            endQty: it.endQty || 0,
            remark: it.remark || '',
          };
          return item;
        });

        const countStock: CountStockDto = {
          isForwardingStockControl: params.isKeepForwarding,
          stockControlId: data?.id || 0,
          items: items,
        };
        if (actionHandlers.onAddItem) {
          actionHandlers.onAddItem(countStock);
        }
        return Promise.resolve(true);
      }}
      open={props.open}
      //visible={props.visible}
    >
      <EditableProTable<StockDetailItemSettle>
        rowKey="id"
        // scroll={{
        //   x: 960,
        // }}
        recordCreatorProps={false}
        value={dataSource}
        // onChange={setDataSource}
        onValuesChange={setDataSource}
        // onDataSourceChange={setDataSource}
        editable={{
          onlyOneLineEditorAlertMessage:
            'Please save the editing record, before start edit a new record.',
          type: 'single',
          editableKeys,
          onSave: async () => {
            await waitTime(200);
          },
          onValuesChange: (r, d) => {
            console.log(r.remark);
            setIsRemarkRequired(r.endQty !== r.actualQty);
            if (r.remark !== '' || r.endQty === r.actualQty) {
              console.log('save');
              setDataSource(d);
            }
            //
          },
          onChange: setEditableRowKeys,
          actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
        }}
        columns={[
          // {
          //   title: 'Expired Date',
          //   readonly: true,
          //   valueType: 'date',
          //   dataIndex: 'expiredDate',
          //   width: 120,
          // },
          {
            title: 'Batch #',
            readonly: true,
            //valueType: 'date',
            dataIndex: 'batchNo',
            width: 120,
          },
          {
            title: 'Product Name',
            dataIndex: 'itemName',
            readonly: true,
          },
          //   {
          //     title: 'UoM',
          //     dataIndex: 'uom',
          //     readonly: true,
          //     align: 'center',
          //     width: 60,
          //   },
          {
            title: 'Beginning Stock',
            align: 'right',
            dataIndex: 'beginningQty',
            readonly: true,
            width: 130,
          },
          {
            title: 'Request Stock',
            align: 'right',
            dataIndex: 'quantity',
            readonly: true,
            width: 130,
          },
          {
            title: 'Total Stock',
            align: 'right',
            dataIndex: 'totalQty',
            readonly: true,
            width: 130,
          },
          {
            title: 'Stock Used',
            align: 'right',
            dataIndex: 'soldQty',
            readonly: true,
            width: 130,
          },
          {
            title: 'End Stock',
            align: 'right',
            dataIndex: 'endQty',
            readonly: true,
            width: 100,
          },
          {
            title: 'Actual Balance',
            align: 'right',
            dataIndex: 'actualQty',
            valueType: 'digit',
            formItemProps: {
              //validateStatus: isRemarkRequired ? 'error' : 'success',
              rules: [
                {
                  validator: (_, value) => {
                    // console.log(record, value, callback);
                    return value < 0
                      ? Promise.reject('Quantity sould be positive number.')
                      : Promise.resolve(undefined);
                  },
                  required: true,
                  message: 'Please Enter',
                  whitespace: false,
                  //   transform: (value) => {
                  //     console.log('transform', value);
                  //   },
                },
              ],
            },
            width: 130,
          },
          {
            title: 'Remark',
            dataIndex: 'remark',
            valueType: 'text',
            // ellipsis: true,
            formItemProps: {
              rules: [
                {
                  required: isRemarkRequired,
                  message: 'Please enter remark',
                  whitespace: false,
                },
              ],
            },
          },
          {
            valueType: 'option',
            align: 'right',
            width: 120,
            render: (_text, record, _, action) => [
              <Tooltip title="Edit" key={`editable-${record.id}`}>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    if (!action?.isEditable)
                      setIsRemarkRequired(record.endQty !== record.actualQty);
                    action?.startEditable?.(record.id || 0);
                  }}
                />
              </Tooltip>,
            ],
          },
        ]}
      />

      <ProFormCheckbox name="isKeepForwarding" label="Stock balance is to be carried Forward" />
    </ModalForm>
  );
};

export default CountStockModal;
