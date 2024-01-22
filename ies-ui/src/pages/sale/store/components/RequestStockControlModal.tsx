import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { formatDate } from '@/pages/utils';
import { LookupDataItem } from '@/services/data';
import { StockControlItemLess } from '@/services/sale/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, Card, message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ItemEntryFormModal from '../../stock-control/ItemEntryFormModal';

export interface RequestStockControlModalProps extends FormModalProps {
  isLoading: boolean;
  data?: {
    selectedSE: string;
    typeProductItems?: { type: number; value: LookupDataItem[] }[];
    typeId?: number;
    stockCategory?: LookupDataItem[];
  };
  actionHandlers?: {
    onLoadInitData: () => void;
  };
}

// const layout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 14 },
// };

const RequestStockControlModal: React.FC<RequestStockControlModalProps> = ({
  isLoading,
  actionHandlers,
  data,
  ...rest
}) => {
  const [dataSource, setDataSource] = useState<StockControlItemLess[]>([]);
  // const [form] = useForm<SaveStockControl>();
  const actionRef = useRef<ActionType>();
  const [addNewModal, setAddNewModal] = useSetState<{
    visible?: boolean;
  }>({});

  useEffect(() => {
    if (!rest.open) {
      //actionHandlers?.onClearLastStockControl && actionHandlers.onClearLastStockControl();
      return;
    }
    actionHandlers?.onLoadInitData();
    setDataSource([]);
    // form.setFieldsValue({
    //   empNo: data?.selectedSE,
    //   approvedDate: moment(),
    //   requestedDate: moment(),
    // });
    return () => {
      // form.resetFields();
    };
  }, [rest.open]);

  const onSubmitActionHandler = async () => {
    message.info('Not implement yet');
  };

  return (
    <FormModalComp
      {...rest}
      width="850px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button
          key="reset"
          onClick={() => {
            // form.resetFields();
            setDataSource([]);
          }}
        >
          Reset
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled || dataSource.length <= 0}
          key="submit"
          type="primary"
          onClick={async () => await onSubmitActionHandler()}
        >
          Submit
        </Button>,
      ]}
    >
      <Card size="small" title={data?.typeId ? '' : 'Request Items'}>
        <ProTable<StockControlItemLess>
          headerTitle="Line Items"
          size="small"
          sortDirections={['ascend']}
          showSorterTooltip={false}
          rowKey="id"
          pagination={false}
          bordered={false}
          search={false}
          dataSource={dataSource}
          actionRef={actionRef}
          toolBarRender={() => [
            <Button
              type="primary"
              size="small"
              disabled={isLoading}
              onClick={() => setAddNewModal({ visible: true })}
              icon={<PlusOutlined />}
            />,
          ]}
          options={{
            setting: false,
            density: false,
            fullScreen: false,
            reload: false,
          }}
          columns={[
            {
              title: '#',
              dataIndex: 'index',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => a.index! - b.index!,
              key: 'itemId',
            },
            { title: 'Batch #', dataIndex: 'batchNo' },
            { title: 'Description', dataIndex: 'itemName' },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Quantity', align: 'right', dataIndex: 'itemQuantity' },
            { title: 'Remark', dataIndex: 'remark' },
            {
              title: 'Expired Date',
              render: (_, r) => {
                return formatDate(r.expiredDate);
              },
            },
            {
              title: 'Action',
              render: (_, data) => {
                return (
                  <Space size={0}>
                    {/* <Button size="small" type="link" icon={<EditOutlined />} onClick={(_) => {}} /> */}
                    <Button
                      size="small"
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        let copyArray = dataSource
                          .copyWithin(-1, -1)
                          .filter((it) => it.itemId !== data.itemId);
                        copyArray.forEach((it, index) => {
                          it.index = index + 1;
                        });
                        console.log(copyArray);
                        setDataSource(copyArray);
                        actionRef.current?.reload();
                      }}
                    />
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>
      <ItemEntryFormModal
        open={addNewModal.visible}
        onCancel={() => setAddNewModal({ visible: false })}
        loading={isLoading}
        data={{
          typeId: data?.typeId,
          seq: (dataSource.length || 0) + 1,
          types: data?.stockCategory,
          typeProductItems: data?.typeProductItems,
          keyStr: 'request-stock-item',
        }}
        actionHandlers={{
          onAddItem: (item) => {
            console.log(item);
            const existing = dataSource.find((it) =>
              it.itemType !== 132
                ? it.itemType === item.itemType && it.itemId === item.itemId
                : it.itemType === item.itemType &&
                  it.itemId === item.itemId &&
                  it.batchNo === item.batchNo,
            );
            if (existing) {
              let copyArray = dataSource.copyWithin(-1, -1);
              copyArray.forEach((it) => {
                if (
                  it.itemType !== 132
                    ? it.itemType === item.itemType && it.itemId === item.itemId
                    : it.itemType === item.itemType &&
                      it.itemId === item.itemId &&
                      it.batchNo === item.batchNo
                )
                  it.itemQuantity += item.itemQuantity;
              });
              setDataSource(copyArray);
            } else {
              setDataSource([...dataSource, item]);
            }
            setAddNewModal({ visible: false });
          },
        }}
      />
    </FormModalComp>
  );
};

export default RequestStockControlModal;
