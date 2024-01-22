import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Locations } from '@/services/crm/data';
import { LocationType } from '@/services/crm/services';
import { LeadInfo, LeadLess } from '@/services/sale/data';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Card, Form, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface LeadFormModelProps extends FormModalProps {
  data: {
    salespersonCode?: string;
    phone?: string;
    typeId?: number;
    regionList?: Locations[];
    //seq: number;
    //slectedItem?: StockControlItemLess;
    //types?: LookupDataItem[];
    //typeProductItems?: { type: number; value: LookupDataItem[] }[];
  };
  locations?: {
    provinceList?: Locations[];
    districtList?: Locations[];
    communeList?: Locations[];
    villageList?: Locations[];
  };
  actionHandlers?: {
    onLoadLocations: (type: LocationType, isNotClearChild: boolean, parentId?: number) => void;
    onSave: (item: LeadLess) => void;
  };
}
// const layout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 16 },
// };

const LeadFormModel: React.FC<LeadFormModelProps> = ({
  data,
  locations,
  actionHandlers,
  ...props
}) => {
  const [formLead] = useForm<LeadInfo>();

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 16 },
  };

  const onSubmitActionHandler = async () => {
    const dataForm = await formLead.validateFields();
    const item: LeadLess = {
      ...dataForm,
      salespersonCode: data.salespersonCode,
    };
    actionHandlers?.onSave(item);
  };

  const onValuesChangeHandler = (changedValues: any, values: LeadLess) => {
    const { regionId, provinceId, districtId, communeId } = changedValues;

    if (regionId && 'regionId' in changedValues) {
      actionHandlers?.onLoadLocations('PROVINCE', false, values.regionId);
      formLead.setFieldsValue({
        provinceId: undefined,
        districtId: undefined,
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (provinceId && 'provinceId' in changedValues) {
      actionHandlers?.onLoadLocations('DISTRICT', false, values.provinceId);
      formLead.setFieldsValue({
        districtId: undefined,
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (districtId && 'districtId' in changedValues) {
      actionHandlers?.onLoadLocations('COMMUNE', false, values.districtId);
      formLead.setFieldsValue({
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (communeId && 'communeId' in changedValues) {
      actionHandlers?.onLoadLocations('VILLAGE', false, values.communeId);
      formLead.setFieldsValue({
        villageId: undefined,
      });
    }
  };

  useEffect(() => {
    if (!props.open) return;
    formLead.setFieldsValue({ phone: data.phone });
    return () => {
      formLead.resetFields();
    };
  }, [props.open]);
  return (
    <FormModalComp
      {...props}
      width="850px"
      onResetForm={() => formLead.resetFields()}
      onSubmit={onSubmitActionHandler}
      okText={'Add New'}
    >
      <Card size="small">
        <ProForm<LeadLess>
          form={formLead}
          onValuesChange={onValuesChangeHandler}
          {...layout}
          layout="horizontal"
          submitter={false}
        >
          <Form.Item label="General Info">
            <Space size={2} direction="vertical">
              <Space>
                <ProFormText placeholder="First Name" name="firstName" width="sm" />
                <ProFormText placeholder={'Last Name'} name="lastName" width="sm" />
                <ProFormText placeholder="Internal Name" name="internalName" width="sm" />
              </Space>
              <Space>
                <ProFormText
                  rules={[{ required: true }]}
                  placeholder="Phone"
                  name="phone"
                  width="sm"
                />
              </Space>
            </Space>
          </Form.Item>
          <Form.Item label="Address Info">
            <Space size={2} direction="vertical">
              <Space>
                <ProFormText help={<span />} name="houseNo" placeholder="House #" width="sm" />
                <ProFormText help={<span />} name="streetNo" placeholder="Street No" width="sm" />
                <ProFormText
                  help={<span />}
                  name="streetName"
                  placeholder="Street Name"
                  width="sm"
                />
              </Space>
              <Space>
                <ProFormSelect
                  name="regionId"
                  showSearch
                  allowClear={false}
                  options={data.regionList?.map?.((it) => {
                    return { label: it.name, value: it.id };
                  })}
                  placeholder="Region"
                  width="sm"
                />

                <ProFormSelect
                  name="provinceId"
                  showSearch
                  allowClear={false}
                  options={locations?.provinceList?.map?.((it) => {
                    return { label: it.name, value: it.id };
                  })}
                  placeholder="Province"
                  width="sm"
                />
                <ProFormSelect
                  name="districtId"
                  showSearch
                  allowClear={false}
                  options={locations?.districtList?.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
                  placeholder="District"
                  width="sm"
                />
              </Space>
              <Space>
                <ProFormSelect
                  name="communeId"
                  showSearch
                  allowClear={false}
                  options={locations?.communeList?.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
                  placeholder="Commune"
                  width="sm"
                />
                <ProFormSelect
                  name="villageId"
                  showSearch
                  allowClear={false}
                  options={locations?.villageList?.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
                  placeholder="Village"
                  width="sm"
                />
              </Space>
            </Space>
          </Form.Item>
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default LeadFormModel;
