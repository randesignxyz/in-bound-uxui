import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import { CloseIndirectSoParams, DeliveryEntry, Distributor } from '@/services/sale/data';
import ProForm, {
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { Moment } from 'moment';
import { useEffect, useState } from 'react';

interface Props extends FormModalProps {
  itemList: DeliveryEntry[];
  data: { distributorId?: number };
  onCloseSo: (data: CloseIndirectSoParams) => void;
}

const CloseSo: React.FC<Props> = ({ itemList, data, onCloseSo, ...props }) => {
  const requestActions = simpleRequestActions();
  const crmServices = CrmServiceAPI(requestActions);
  const [state, setState] = useState<{ distibutors: Distributor[] }>();
  const [form] = useForm<{
    invoiceNo: string;
    invoiceDate: Moment;
    shippedItem: {
      deliveryItemId: number;
      itemCode: string;
      description: string;
      type: string;
      ShippedQty: number;
      qty: number;
    }[];
    remarks?: string;
    distributor?: number;
  }>();

  useEffect(() => {
    if (!props.open) return;
    crmServices.listDistributor().then((it) => {
      setState({ ...state, distibutors: it });
    });
    setDataForm();
  }, [props.open]);

  const setDataForm = () => {
    form.setFieldsValue({
      distributor: data.distributorId,
      shippedItem: itemList.flatMap((it) =>
        it.itemList.map((it1) => ({
          deliveryItemId: it1.id,
          itemCode: it1.itemCode,
          description: it1.itemDesc,
          type: it1.type,
          qty: it1.qty,
          ShippedQty: it1.qty,
        })),
      ),
    });
  };

  return (
    <FormModalComp
      title="Close SO"
      width="800px"
      {...props}
      onResetForm={() => {
        form.resetFields();
        setDataForm();
      }}
      onSubmit={async () => {
        try {
          const dataForm = await form.validateFields();
          const qty = dataForm.shippedItem.reduce((sum, current) => sum + current.ShippedQty, 0);
          if (qty === 0) {
            message.error('The order cannot be closed. No quantity shipped.');
            return;
          }

          onCloseSo({
            invoiceNo: dataForm.invoiceNo,
            invoiceDate: dataForm.invoiceDate,
            remarks: dataForm.remarks,
            shippedItems: dataForm.shippedItem.map((it) => {
              return {
                deliveryItemId: it.deliveryItemId,
                shippedQty: it.ShippedQty,
              };
            }),
            distributor: dataForm.distributor,
          });
        } catch (error) {
          message.error('Invalid data.');
        }
      }}
    >
      <ProForm
        // {...layout}
        submitter={false}
        form={form}
      >
        <ProFormGroup label="Invoice">
          <ProFormText rules={[{ required: true }]} label="Invoice #" name={'invoiceNo'} />
          <ProFormDatePicker
            rules={[{ required: true }]}
            label="Invoice Date"
            name={'invoiceDate'}
          />
          <ProFormSelect
            rules={[{ required: true }]}
            width={'sm'}
            label="Distributor"
            allowClear
            showSearch
            name={'distributor'}
            options={state?.distibutors.map((it) => ({
              label: it.code?.concat(`-${it.name}`),
              value: it.id,
            }))}
          />
          <ProFormTextArea width="lg" label="Remarks" name="remarks" />
        </ProFormGroup>

        <ProFormGroup label="Line Items">
          <ProFormList
            creatorButtonProps={false}
            copyIconProps={false}
            deleteIconProps={false}
            name="shippedItem"
            itemRender={(_, listMeta) => {
              return (
                <ProForm.Group>
                  <ProFormText
                    label={listMeta.index === 0 && 'Item Code'}
                    width={200}
                    disabled
                    name="itemCode"
                  />
                  <ProFormText
                    label={listMeta.index === 0 && 'Description'}
                    width={200}
                    disabled
                    name="description"
                  />
                  <ProFormText
                    label={listMeta.index === 0 && 'Type'}
                    disabled
                    name="type"
                    width={70}
                  />
                  <ProFormDigit
                    label={listMeta.index === 0 && 'ShippedQty'}
                    width={100}
                    min={0}
                    name="ShippedQty"
                    max={listMeta.record['qty']}
                  />
                </ProForm.Group>
              );
            }}
            children={undefined}
          />
        </ProFormGroup>
      </ProForm>
    </FormModalComp>
  );
};

export default CloseSo;
