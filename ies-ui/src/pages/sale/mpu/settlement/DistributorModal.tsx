import FormModalComp, { FormModalProps } from '@/components/FormModal';
import RemoteSelectBox from '@/components/RemoteSelectBox';
import { AddressInfo } from '@/services/crm/data';
import { CrmService, CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import { CustomerLookup } from '@/services/sale/data';
import { AimOutlined } from '@ant-design/icons';
import { ProForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { PurchaseOrderDistributorDto } from './data';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};

interface Props extends FormModalProps {
  //   id: number;
  addressList: AddressInfo[];
  purchaseOrder?: PurchaseOrderDistributorDto;
  onSubmitClick?: (
    purchaseOrderId: number,
    address: string,
    distributorId: number,
    distributorName: string,
    distributorCode: string,
    distributorPhone?: string,
    addressInfo?: AddressInfo,
  ) => void;
}

export default (props: Props) => {
  const requestActions = simpleRequestActions();
  //   const service = SettlementMethodServicAPI(requestActions);

  const [addressList, setAddressList] = useState<AddressInfo[]>();
  const [selectedAddress, setSelectedAddress] = useState<AddressInfo>();

  const [form] = useForm<{
    addressId: string | number;
    distributorId: string;
    address: string;
  }>();

  const getAddress = (address?: AddressInfo) => {
    return address
      ? [
          { name: 'Street', value: address?.streetNo },
          { name: 'House#', value: address?.houseNo },
          { name: 'Village', value: address?.village },
          { name: 'Commune', value: address?.commune },
          { name: 'District', value: address?.district },
          { name: 'Province', value: address?.province },
          { name: 'Latitude', value: address?.latitude },
          { name: 'Longitude', value: address?.longitude },
          { name: 'Direction', value: address?.direction },
          { name: 'Hotspot', value: address?.hotspot },
        ]
          .filter((it) => it.value)
          .map((it) => `${it.name} ${it.value}`)
          .join(', ')
      : '';
  };

  const onFormvalueChanged = async (changeValues: any) => {
    const { distributorId, addressId } = changeValues;
    if ('distributorId' in changeValues) {
      const dd = distributorId?.split(',')?.[0];

      const data = await CrmServiceAPI(requestActions).listAddressByCustomer({
        id: dd || 0,
      });
      setAddressList(data);
      if (data.length > 0) {
        setAddressList(data);
        const address = data[0];
        setSelectedAddress(address);
        form.setFieldsValue({
          addressId: address.id,
          address: getAddress(address),
        });
      }
    }
    if (addressId) {
      const address = addressList?.find((e) => e.id === addressId);
      setSelectedAddress(address);
      const fullAddress = getAddress(address);
      form.setFieldsValue({
        address: fullAddress,
      });
    }
  };

  const onSubmitAction = async () => {
    const dataForm = await form.validateFields();
    const distributor = dataForm.distributorId.split(',');
    if (props.onSubmitClick && props.purchaseOrder) {
      props.onSubmitClick(
        props.purchaseOrder.id,
        getAddress(selectedAddress),
        parseInt(distributor[0]),
        distributor[1],
        distributor[2],
        undefined,
        selectedAddress,
      );
    }
  };

  useEffect(() => {
    if (props.open) {
      setAddressList(props.addressList);
      setSelectedAddress(
        props.addressList.find((e) => e.customerAddressId === props.purchaseOrder?.addressId),
      );
      form.setFieldsValue({
        addressId: props.purchaseOrder?.addressCode,
        address: props.purchaseOrder?.address,
        distributorId: props.purchaseOrder?.distributorName,
        // [
        //   props.purchaseOrder?.distributorId,
        //   props.purchaseOrder?.distributorCode,
        //   props.purchaseOrder?.distributorName,
        // ].join(','),
      });
    }
  }, [props.open]);

  return (
    <>
      <FormModalComp
        // confirmLoading={requestActions.request?.loading}
        {...props}
        onResetForm={() => form.resetFields()}
        onSubmit={onSubmitAction}
      >
        {/* <Spin spinning={requestActions.request?.loading}> */}

        <ProForm
          submitter={false}
          layout="horizontal"
          {...layout}
          form={form}
          onValuesChange={onFormvalueChanged}
        >
          <Form.Item
            help={<span />}
            name="distributorId"
            label="Distributor"
            rules={[{ required: true }]}
            labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
          >
            <RemoteSelectBox<CustomerLookup, { searchValue: any }>
              width={'350px'}
              // popupMatchSelectWidth={500}
              //initData={ type === edi? [{ ...so.associatedTo.customer }] : []}
              transforms={{
                onCriteria: (value) => {
                  return { searchValue: value };
                },
                onOptionData: (item) => {
                  return {
                    value: [item.id, item.code, item.name].join(','),
                    label: [item.code, item.name].filter((it) => it !== null).join(' - '),
                  };
                },
              }}
              service={CrmService('search-basic-customer')}
            />
          </Form.Item>
          <ProFormSelect
            name={'addressId'}
            label="Address"
            labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
            allowClear={false}
            key={'addressId'}
            initialValue={props.purchaseOrder?.addressCode}
            showSearch
            rules={[{ required: true }]}
            options={addressList?.map((item) => {
              return {
                value: item.customerAddressId,
                label: item.address,
              };
            })}
          />
          <ProFormTextArea
            labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
            readonly
            //help={<AimOutlined />}
            label={<AimOutlined />}
            disabled={true}
            name="address"
          />
        </ProForm>
        {/* </Spin> */}
      </FormModalComp>
    </>
  );
};
