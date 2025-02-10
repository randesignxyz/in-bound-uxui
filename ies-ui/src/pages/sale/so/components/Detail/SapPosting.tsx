import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { OfferCodeInfo, OfferCodeParam, SoItemDetail } from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import { ActionType, EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { Button, Flex, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { Dictionary, remove } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props extends FormModalProps {
  onPosting: (remarks?: string, offerCodes?: OfferCodeParam[]) => void;
  offerCodes: OfferCodeInfo[];
  items: SoItemDetail[];
}

const SapPosting: React.FC<Props> = ({ onPosting, items, offerCodes, ...props }) => {
  const [form] = useForm<{ remarks: string }>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<OfferCodeParam[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const [isError, setIsError] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [showing, setShowing] = useState<boolean>(false);

  const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const isDuplicated = () => {
    // const allTypes = items.map((e) => e.type!);
    // console.log(allTypes);
    // const t = offerCodes.filter((e) => allTypes.some((it) => it === e.saleType));
    // console.log(t);
    return (
      offerCodes
        // .filter((e) => allTypes.some((it) => it === e.saleType))
        .map((e) => e.saleType)
        .filter((it, index, self) => self.indexOf(it) !== index).length > 0
    );
  };

  const checking = (id: number, saleType: string | undefined) =>
    offerCodes.reduce((o, e) => {
      if (e.itemsIds.findIndex((it) => it === id) > -1 && e.saleType === saleType)
        o.push(e.offerCode);
      return o;
    }, new Array<string>());

  const resetData = () => {
    remove(editableKeys);
    setShowing(false);
    setDataSource(
      items.map((e) => {
        const mapping = checking(e.itemId, e.type);
        const it: OfferCodeParam = {
          soItemId: e.id,
          description: e.description,
          itemCode: e.itemCode,
          itemId: e.itemId,
          quantity: e.qty,
          type: e.type!,
          uom: e.uom,
          offerCode: mapping.length === 1 ? mapping[0] : undefined,
          isChecked: mapping.length > 1,
        };
        return it;
      }),
    );
  };

  useEffect(() => {
    if (!props.open) return;
    resetData();
    return () => {};
  }, [props.open]);

  const onDisabledButton = useCallback(() => {
    return dataSource.findIndex((e) => e.offerCode === undefined && e.isChecked) !== -1;
  }, [dataSource]);

  return (
    <FormModalComp
      {...props}
      disabled={onDisabledButton()}
      onResetForm={() => {
        resetData();
        form.resetFields();
      }}
      onSubmit={async () => {
        const rs = await form.validateFields();
        onPosting(rs.remarks, dataSource);
      }}
    >
      <ProForm form={form} submitter={false}>
        {((offerCodes.length > 1 && items.length > 0) || showing) && (
          <>
            <EditableProTable<OfferCodeParam>
              //   title={() => <Text>Product Items</Text>}
              rowKey={(r) => {
                return r.soItemId;
              }}
              size="small"
              editableFormRef={editableFormRef}
              actionRef={actionRef}
              key={`sapPosting`}
              recordCreatorProps={false}
              value={dataSource}
              onValuesChange={setDataSource}
              editable={{
                onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
                onlyOneLineEditorAlertMessage:
                  'Please save the editing record, before start edit a new record.',
                type: 'single',
                editableKeys,
                onSave: async () => {
                  //(_, record: OfferCodeParam, originRow: OfferCodeParam) => {
                  //   console.log(record);
                  //   console.log(originRow);
                  //   if (record.batchNo) {
                  //     record.batchNo = moment(originRow.batchNo);
                  //     record.expiredDate = moment(originRow.batchNo).add(6, 'M');
                  //   }
                  await waitTime(100);
                },
                onChange: setEditableRowKeys,
                actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
              }}
              columns={[
                {
                  title: 'Description',
                  dataIndex: 'description',
                  readonly: true,
                },
                {
                  title: 'Item Code',
                  dataIndex: 'itemCode',
                  readonly: true,
                  width: 90,
                },
                {
                  title: 'Type',
                  dataIndex: 'type',
                  readonly: true,

                  width: 60,
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  align: 'right',
                  readonly: true,
                },
                {
                  title: 'UoM',
                  dataIndex: 'uom',
                  readonly: true,
                  align: 'center',
                  width: 60,
                },
                {
                  key: 'offerCode',
                  title: 'Offer Code',
                  dataIndex: 'offerCode',
                  valueType: 'select',
                  width: 200,
                  align: isDuplicated() ? 'left' : 'right',
                  valueEnum: (e) => {
                    return offerCodes
                      .filter((it) => it.saleType === e.type)
                      .reduce((obj, it) => {
                        obj[it.offerCode] = { text: it.offerCode };
                        return obj;
                      }, {} as Dictionary<{ text: string }>);
                  },

                  formItemProps(form) {
                    return {
                      ...form,
                      validateStatus: isError ? 'error' : 'success',
                      rules: [{ required: true, message: 'Please select offer code.' }],
                    };
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
                  width: 100,
                  hideInTable: !isDuplicated(),
                  render: (_text, record, _, action) =>
                    checking(record.itemId, record.type).length > 1 && (
                      <Tooltip title="Edit" key={`editable-${record.itemId}`}>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            if (!action?.isEditable) setIsError(false);
                            action?.startEditable?.(record.soItemId);
                          }}
                        />
                      </Tooltip>
                    ),
                },
              ]}
            />
          </>
        )}

        <ProFormTextArea label="Remarks" name="remarks" />
        {!isDuplicated() && items.length > 0 && (
          <Flex align="center">
            There is a hidden promotion or offer code on the product item.
            <Button
              type="link"
              // icon={showing ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              iconPosition="end"
              onClick={() => setShowing(!showing)}
            >
              Show {showing ? 'less' : 'more'}
            </Button>
          </Flex>
        )}

        {/* {offerCodes.length === 1 && items.length > 0 && (
          <Flex align="center" justify="flex-end">
            <Space>
              <Button
                type="link"
                icon={showing ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={() => setShowing(!showing)}
              >
                View Offer Code
              </Button>
              <Switch checked={showing} onChange={(checked) => setShowing(checked)} />
            </Space>
          </Flex>
        )} */}
      </ProForm>
    </FormModalComp>
  );
};

export default SapPosting;
