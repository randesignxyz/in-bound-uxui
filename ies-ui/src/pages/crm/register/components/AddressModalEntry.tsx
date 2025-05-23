import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LocationType } from '@/services/crm/services';
import { AddressData, AddresssView } from '@/services/crm/data';
import ProForm from '@ant-design/pro-form';
import { uniqueId } from 'lodash';
import { useEffect } from 'react';
import AddressEntryForm, { AddressEntryFormProps } from './AddressEntryForm';
import { AddressDataForm } from './AddressListView';
import { useForm } from 'antd/lib/form/Form';

const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 19 },
};

const DEFAULT_ADDRESS_TYPE_ID = 14033;
interface Props extends AddressEntryFormProps, FormModalProps {
  data?: AddressDataForm;
  addressReadonly?: boolean;
  actionHandlers: {
    onAdd: (address: AddresssView, cb?: (sucess: boolean) => void) => void;
    onEdit: (address: AddresssView, cb?: (sucess: boolean) => void) => void;
    onLoadLocations?: (type: LocationType, parentId?: number) => void;
    onLoadMultiLocations?: (ids: number[]) => void;
    onCleaLocation?: (types: LocationType[]) => void;
  };
}

const AddressModalEntry: React.FC<Props> = ({
  addressReadonly,
  data,
  initData,
  locations,
  actionHandlers,
  ...props
}) => {
  const [form] = useForm<AddressDataForm>();
  useEffect(() => {
    if (!props.open) return;

    form.setFieldsValue({
      typeId: initData?.lookupDataList?.some((it) => it.id == DEFAULT_ADDRESS_TYPE_ID)
        ? DEFAULT_ADDRESS_TYPE_ID
        : initData?.lookupDataList?.find((it) => true)?.id,
      ...{
        ...data, communeId: data?.communeId == 0 ? undefined : data?.communeId,
        villageId: data?.villageId == 0 ? undefined : data?.villageId
      }
      ,
    });

    return () => {
      form.resetFields();
    };
  }, [props.open]);

  const onValuesChangeHandler = (changedValues: any, values: AddressData) => {
    const { provinceId, districtId, communeId } = changedValues;
    if (provinceId && 'provinceId' in changedValues) {
      actionHandlers?.onLoadLocations?.('DISTRICT', values.provinceId);
      actionHandlers?.onCleaLocation?.(['DISTRICT', 'COMMUNE', 'VILLAGE']);
      form.setFieldsValue({
        districtId: undefined,
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (districtId && 'districtId' in changedValues) {
      actionHandlers?.onLoadLocations?.('COMMUNE', values.districtId);
      actionHandlers?.onCleaLocation?.(['COMMUNE', 'VILLAGE']);
      form.setFieldsValue({
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (communeId && 'communeId' in changedValues) {
      actionHandlers?.onLoadLocations?.('VILLAGE', values.communeId);
      form.setFieldsValue({
        villageId: undefined,
      });
    }
  };

  return (
    <FormModalComp
      {...props}
      onResetForm={() => form.setFieldsValue({ ...data })}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const address: AddresssView = {
          address: dataForm.address,
          type: initData?.lookupDataList?.find((it) => it.id == dataForm.typeId),
          province: initData?.provinceList
            ?.filter((it) => it.id == dataForm.provinceId)
            .map((it) => {
              return {
                id: it.id,
                name: it.name,
              };
            })
            .find((it) => it),
          district: locations?.districtList
            ?.filter((it) => it.id == dataForm.districtId)
            .map((it) => {
              return { id: it.id, name: it.name };
            })
            .find((it) => it),
          commune: locations?.communeList
            ?.filter((it) => it.id == dataForm.communeId)
            .map((it) => ({ id: it.id, name: it.name }))
            .find((it) => it),
          village: locations?.villageList
            ?.filter((it) => it.id == dataForm.villageId)
            .map((it) => {
              return { id: it.id, name: it.name };
            })
            .find((it) => it),
          houseNo: dataForm.houseNo,
          streetNo: dataForm.streetNo,
          streetName: dataForm.streetName,
          houseNoKh: dataForm.houseNoKh,
          streetNoKh: dataForm.streetNoKh,
          streetNameKh: dataForm.streetNameKh,
          hotspot: dataForm.hotspot,
          direction: dataForm.direction,
          latitude: dataForm.latitude,
          longitude: dataForm.longitude,
          visitPlanOptionList: [dataForm.dayOfTheWeek, ...(dataForm.weekOfTheMonths || [])].filter(
            (it) => it,
          ) as number[],
        };

        if (data) {
          actionHandlers.onEdit({
            ...address,
            key: data.key,
            id: data.id,
          });
        } else {
          actionHandlers.onAdd({ ...address, key: uniqueId('address') });
        }
      }}
    >
      <ProForm
        {...layout}
        layout="horizontal"
        onValuesChange={onValuesChangeHandler}
        form={form}
        submitter={false}
      >
        <AddressEntryForm
          isEdit={!!data}
          addressReadonly={addressReadonly}
          defaultAddress={data?.typeId == DEFAULT_ADDRESS_TYPE_ID}
          initData={initData}
          locations={locations}
        />
      </ProForm>
    </FormModalComp>
  );
};

export default AddressModalEntry;
