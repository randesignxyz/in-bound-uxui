import { MultiRequest } from '@/services/apiGateway';
import { LookupData, LookupDataItem } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message, Modal, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { CustomerServices } from '../../customer/services';
import { ContractServices } from '../services';
import { SaveContactData } from '../types';

export default ({
  contractId,
  onRefresh,
  ...rest
}: ModalFormProps<SaveContactData> & { contractId?: number; onRefresh?: () => void }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<SaveContactData & { customer?: string }>();
  // const [data, setData] = useState<ContractViewData>()
  const onCustomerSearchHandler = async (keyWords?: string) => {
    const rs = await CustomerServices.search(keyWords).query(requestActions);
    return rs.map((it) => ({ label: [it.code, it.name].join(' '), value: it.id }));
  };

  const [lookupData, setLookupData] = useState<{
    contractTypes?: LookupData[];
    terms?: LookupData[];
    brandList?: LookupDataItem[];
  }>();

  useEffect(() => {
    if (!rest.open) return;
    (async () => {
      const rs = await MultiRequest<{
        contractTypes: LookupData[];
        terms: LookupData[];
        brandList: LookupDataItem[];
      }>([
        ContractServices.listContractType().queryParams,
        ContractServices.listTerms().queryParams,
        CustomerServices.listBrand.queryParams,
      ])(requestActions);

      setLookupData(rs);
      await loadData();
    })();
  }, [rest.open]);

  const loadData = async () => {
    if (contractId) {
      const dataRs = await ContractServices.detail(contractId).query(requestActions);
      // setData(dataRs)
      form.setFieldsValue({
        contractNo: dataRs.contractNo,
        customerId: dataRs.customer.id,
        budgetCode: dataRs.budgetCode,
        customer: [dataRs.customer.code, dataRs.customer.name].join(' '),
        contractTypeId: dataRs.contractType.id,
        contractDate: dataRs.effectiveDate,
        contractDuration: [dataRs.effectiveDate, dataRs.expireDate],
        termId: dataRs?.terms?.id,
        remarks: dataRs.remarks,
        brandId: dataRs.brand.id,
      });
    }
  };

  const onSaveContractHandler = async () => {
    const formData = await form.validateFields();

    Modal.confirm({
      title: 'Save Contract',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await ContractServices.saveContract({
            ...formData,
            contractDate: formData.contractDuration[0],
            id: contractId,
          })(requestActions);
          onRefresh?.();
          if (contractId) rest.onOpenChange?.(false);
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to save');
        }
      },
    });
  };

  return (
    <ModalForm form={form} title="Contract" {...rest} onFinish={onSaveContractHandler}>
      <Spin spinning={requestActions.request?.loading || false}>
        <ProFormGroup>
          <ProFormText label="Contract No" width={'md'} name={'contractNo'} />
          {!contractId && (
            <ProFormSelect
              rules={[{ required: true }]}
              label="Customer"
              width={'md'}
              showSearch
              name={'customerId'}
              request={({ keyWords }) => onCustomerSearchHandler(keyWords)}
            />
          )}
          {contractId && <ProFormText width={'lg'} readonly label="Customer" name="customer" />}
        </ProFormGroup>

        <ProFormGroup>
          <ProFormSelect
            label="Contract Type"
            rules={[{ required: true }]}
            showSearch
            width={'md'}
            options={lookupData?.contractTypes?.map((it) => ({ label: it.name, value: it.id }))}
            name={'contractTypeId'}
          />
          <ProFormSelect
            label="Brand"
            rules={[{ required: true }]}
            showSearch
            width={'md'}
            options={lookupData?.brandList?.map((it) => ({ label: it.name, value: it.id }))}
            name={'brandId'}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            rules={[{ required: true }]}
            label="Budget Code"
            width={'md'}
            name={'budgetCode'}
          />
          {/* <ProFormDatePicker rules={[{ required: true }]} label="Contract Date" width={'md'} name={'contractDate'} /> */}
          <ProFormDateRangePicker
            rules={[{ required: true }]}
            label="Contract Duration"
            width={'md'}
            name={'contractDuration'}
          />
        </ProFormGroup>
        {/* <ProFormGroup>
                
            </ProFormGroup> */}
        <ProFormSelect
          fieldProps={{ popupMatchSelectWidth: 700 }}
          showSearch
          label="Terms"
          name={'termId'}
          options={lookupData?.terms?.map((it) => ({ label: it.code +' - '+it.name, value: it.id }))}
        />
        <ProFormTextArea label="Remarks" name={'remarks'} />
      </Spin>
    </ModalForm>
  );
};
