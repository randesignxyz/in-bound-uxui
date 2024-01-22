import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { BasicData, CustomerView, outletType } from '@/services/crm/data';
import { LookupData, LookupDataItem } from '@/services/data';
import { ProCard } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import BasicEntryForm from './BasicEntryForm';

const layout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};

export interface DetailViewProps {
  data?: CustomerView;
  editProps: EditProps;
}

interface EditProps extends FormModalProps {
  layoutConfig: {
    supplySource?: boolean;
  };
  editData?: BasicData;
  init?: {
    outletTypeList?: outletType[];
    lookupDataList?: LookupData[];
    seList?: LookupDataItem[];
    supplySourceList?: LookupDataItem[];
  };
  actionHandlers?: {
    onSave?: (data: BasicData) => void;
  };
}

const BasicInfoView: React.FC<DetailViewProps> = ({ data, editProps }) => {
  const { layoutConfig, init, editData, actionHandlers, ...rest } = editProps || {
    init: undefined,
  };
  const [form] = useForm<BasicData>();

  const outlet = init?.outletTypeList?.find((it) => it.id == editData?.outletTypeId);

  useEffect(() => {
    if (editProps?.open) {
      form.setFieldsValue({
        ...editData,
        mainChannel: outlet?.mainChannel,
        subChannel: outlet?.subChannel,
      });
    }
    return () => {
      form.resetFields();
    };
  }, [editProps?.open]);

  const basicInfoData: DescriptionDisplayDataItem[] = [
    { label: 'Name (KH)', value: data?.internalName },
    { label: 'Name (Latin)', value: data?.name },
    { label: 'Owner Name (KH)', value: data?.ownerName },
    {
      label: 'Sale Executive',
      value: [data?.sale?.code, data?.sale?.name].filter((it) => it).join(' - '),
    },
    { label: 'Customer Type', value: data?.type?.name },
    { label: 'Division', value: data?.division?.name },
    { label: 'Main Channel', value: data?.outletType?.mainChannel },
    { label: 'Sub Channel', value: data?.outletType?.subChannel },
    { label: 'Outlet Type', value: data?.outletType?.name },
    { label: 'Region', value: data?.region.name },
    { label: 'Source', value: data?.source },
    { label: 'Status', value: data?.status },
    {
      label: 'ID His', value: [
        data?.codeTracking?.idl9,
        data?.codeTracking?.idl0,
        data?.codeTracking?.idm0,
        data?.codeTracking?.idc0
      ].filter(it => it && it != data?.code).join(", ")
    },
  ];

  const onValuesChangeHandlers = (changedValues: any, values: BasicData) => {
    const { outletTypeId } = changedValues;

    if (outletTypeId || 'outletTypeId' in changedValues) {
      const outlet = init?.outletTypeList?.find((it) => it.id == outletTypeId);
      form.setFieldsValue({
        mainChannel: outlet?.mainChannel,
        subChannel: outlet?.subChannel,
      });
    }
  };

  return (
    <Card size="small">
      <DescriptionDisplay data={basicInfoData} />

      <FormModalComp
        {...rest}
        okText="Edit"
        title='Edit Customer'
        onResetForm={() => form.setFieldsValue({ ...editData })}
        onSubmit={async () => {
          const dataForm = await form.validateFields();
          actionHandlers?.onSave?.(dataForm);
        }}
      >
        <ProCard boxShadow size="small">
          <ProForm
            layout="horizontal"
            {...layout}
            submitter={false}
            form={form}
            onValuesChange={onValuesChangeHandlers}
          >
            <BasicEntryForm layoutConfig={layoutConfig} {...init} />
          </ProForm>
        </ProCard>
      </FormModalComp>
    </Card>
  );
};

export default BasicInfoView;
