import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { AddressInfo, VisitPlanListItem } from '@/services/crm/data';
import ProForm, { ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { Card, Checkbox, Form, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { head } from 'lodash';
import { LookupData } from '@/services/data';

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

interface Props extends FormModalProps {
  lookupDataList: LookupData[];
  item?: VisitPlanListItem;
  actionHandlers?: {
    onLoadAddressList?: () => Promise<AddressInfo[]>;
    onSave?: (
      data: VisitPlanListItem,
      weekOfTheMonths: number[],
      dayOfTheWeeks: number[],
      numDaysBefore?: number,
      remarks?: string,
    ) => Promise<void>;
    onAdd?: (
      customerAddressId: number,
      weekOfTheMonths: number[],
      dayOfTheWeeks: number[],
      numDaysBefore?: number,
      remarks?: string,
    ) => Promise<void>;
  };
}

const VisitPlanModal: React.FC<Props> = ({ item, lookupDataList, actionHandlers, ...rest }) => {
  // const [autoGen, setAutoGen] = useState<boolean>(false)
  const [form] = Form.useForm<{
    customerAddressId: number;
    weekOfTheMonths: number[];
    dayOfTheWeeks: number;
    // autoCreateSchedule: boolean;
    numDaysBefore?: number;
    remarks?: string;
  }>();

  const [addressList, setAddressList] = useState<AddressInfo[]>([]);

  useEffect(() => {
    if (rest.open) {
      initialValues();
    }

    return () => {
      form.resetFields();
    };
  }, [rest.open]);

  const initialValues = async () => {
    const addressList = await actionHandlers?.onLoadAddressList?.();
    setAddressList(addressList || []);

    form.setFieldsValue({
      customerAddressId: item?.address.id,
      weekOfTheMonths: item?.visits.filter((it) => it.type == 'WEEK_OF_MONTH').map((it) => it.id),
      dayOfTheWeeks: head(item?.visits.filter((it) => it.type == 'DAY_OF_WEEK').map((it) => it.id)),
      numDaysBefore: item?.numDaysBefore || 1,
      remarks: item?.remarks,
    });
  };

  return (
    <FormModalComp
      {...rest}
      title="Visit Plan"
      onResetForm={() => {
        initialValues();
      }}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        if (item)
          await actionHandlers?.onSave?.(
            item,
            dataForm.weekOfTheMonths,
            [dataForm.dayOfTheWeeks],
            // dataForm.autoCreateSchedule,
            dataForm.numDaysBefore,
            dataForm.remarks,
          );
        else
          await actionHandlers?.onAdd?.(
            dataForm.customerAddressId,
            dataForm.weekOfTheMonths,
            [dataForm.dayOfTheWeeks],
            // dataForm.autoCreateSchedule,
            dataForm.numDaysBefore,
            dataForm.remarks,
          );
      }}
    >
      <ProForm
        form={form}
        // onValuesChange = {(changedValues) => {
        //     const {autoCreateSchedule} = changedValues
        //     if('autoCreateSchedule' in changedValues) {
        //         setAutoGen(autoCreateSchedule)
        //     }
        // }}
        submitter={false}
        layout="horizontal"
        {...layout}
      >
        <Card size="small" bordered={false}>
          <ProFormSelect
            label="Customer"
            hidden={addressList !== undefined || item !== undefined}
            width={'md'}
          />
          <ProFormSelect
            rules={[{ required: true }]}
            label="Address"
            name={'customerAddressId'}
            hidden={item !== undefined}
            width={'md'}
            options={(addressList || []).map((it) => ({
              label: it.address,
              value: it.id,
            }))}
          />
          <Form.Item rules={[{ required: true }]} label="Week" name="weekOfTheMonths">
            <Checkbox.Group
              options={(lookupDataList?.filter((it) => it.type == 'WEEK_OF_MONTH') || []).map(
                (it) => {
                  return { value: it.id, label: it.name };
                },
              )}
            />
          </Form.Item>

          <Form.Item rules={[{ required: true }]} label="Day" name="dayOfTheWeeks">
            <Radio.Group
              options={lookupDataList
                ?.filter((it) => it.type == 'DAY_OF_WEEK')
                .map((it) => {
                  return { value: it.id, label: it.name };
                })}
            />
          </Form.Item>
          {/* <ProFormCheckbox label = 'Auto Create Schedule' name = "autoCreateSchedule"  />
                    {autoGen && <ProFormDigit min = {1} width = {200} label = "Days before" name = 'numDaysBefore' rules = {[{required: true}]} />} */}
          <ProFormTextArea label="Remarks" name="remarks" />
        </Card>
      </ProForm>
    </FormModalComp>
  );
};

export default VisitPlanModal;
