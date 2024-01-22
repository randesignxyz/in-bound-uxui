import {
  ModalForm,
  ModalFormProps,
  ProCard,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { createVendorService } from '../vendor/services';
import { VendorDetail } from '../vendor/vendor';

type DataFormType = {
  vendorId: number;
  vendorName: string;
  contactPersonId: number;
  noneVendor: boolean;
  phone1: string;
  phone2?: string;
  phone3?: string;
  mail?: string;
  address?: string;
};

export default ({
  quotationId,
  onRefresh,
  ...props
}: ModalFormProps<DataFormType> & { quotationId: number; onRefresh: () => void }) => {
  const vendorSrv = createVendorService();
  const [form] = useForm<DataFormType>();
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState<VendorDetail>();

  const onSelectVendor = async (vendorId: number) => {
    try {
      if (vendorId < 0) return;
      const rs = await vendorSrv.fetchItem(vendorId);
      form.resetFields(['contactPersonId']);

      setVendor(rs);
      return rs;
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data.');
    }
  };

  const onFindVendorHandler = async ({ keyWords }: { keyWords?: string }) => {
    const rs = await vendorSrv.fetchPaging({
      keywords: keyWords,
    });

    const dataItems = rs.items.map((it) => ({
      label: [it.code, it.name].join('-'),
      value: it.id,
    }));
    return dataItems;
  };

  useEffect(() => {
    form.setFieldsValue({
      contactPersonId: vendor?.contactList.find((it) => it)?.id,
      phone1: vendor?.phone1,
      phone2: vendor?.phone2,
      mail: vendor?.mail,
      address: vendor?.address,
    });
  }, [vendor]);

  return (
    <ModalForm
      title="Change Vendor"
      open={open}
      onOpenChange={setOpen}
      form={form}
      width={600}
      {...props}
      onFinish={async (dataForm) => {
        Modal.confirm({
          title: 'Chnage Vendor',
          content: 'Are you sure?',
          onOk: async () => {
            try {
              vendor &&
                (await vendorSrv.updateVendor({
                  quotationId: quotationId,
                  vendorId: vendor.id!!,
                  vendorCode: vendor.code!!,
                  vendorName: vendor.name,
                  contactPersonId: dataForm.contactPersonId,
                  contactPerson: vendor.contactList.find((it) => it.id == dataForm.contactPersonId)
                    ?.contactName!!,
                  phone1: dataForm.phone1,
                  phone2: dataForm.phone2,
                  mail: dataForm.mail,
                  address: dataForm.address,
                }));
              message.success('Vendor changed successfully.');
              onRefresh();
              setOpen(false);
            } catch (error: any) {
              message.error(error.message || 'Failed to change.');
            }
          },
        });
      }}
      onValuesChange={(changedValues) => {
        const { vendorId } = changedValues;
        if ('vendorId' in changedValues) {
          onSelectVendor(vendorId);
        }
      }}
    >
      <ProCard>
        <ProFormSelect
          rules={[{ required: true }]}
          name={'vendorId'}
          label="Vendor"
          fieldProps={{ popupMatchSelectWidth: 500 }}
          allowClear
          showSearch
          request={onFindVendorHandler}
          width={470}
        />
        <ProFormGroup>
          <ProFormSelect
            rules={[{ required: true }]}
            label="Contact Person"
            name={'contactPersonId'}
            placeholder={'Contact Person'}
            options={vendor?.contactList.map((it) => ({
              label: `${it.contactName}`,
              value: it.id,
            }))}
            width={470}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText rules={[{ required: true }]} name={'phone1'} label="Phone1" width={'sm'} />
          <ProFormText name={'phone2'} label="Phone2" width={'sm'} />
        </ProFormGroup>
        <ProFormText width={470} name={'mail'} label="E-Mail" />
        <ProFormTextArea
          name={'address'}
          fieldProps={{ rows: 1, maxLength: 300 }}
          width={470}
          label="Address"
        />
      </ProCard>
    </ModalForm>
  );
};
