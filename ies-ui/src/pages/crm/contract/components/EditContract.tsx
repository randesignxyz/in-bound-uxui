import { ContractData } from '@/services/crm/contract';
import { ContractDetail } from '@/services/crm/data';
import { Form, message, Modal } from 'antd';
import moment from 'moment';
import React from 'react';
import { useEffect } from 'react';
import { ContactType, Model } from '../model';
import ContractEntryModal from './ContractEntryModal';

interface Props {
  visible?: boolean;
  amended?: true;
  data?: ContractDetail;
  actionHandlers?: {
    onReload?: (id: number) => void;
    onCancel?: (reload?: true) => void;
  };
}

const EditContract: React.FC<Props> = ({ data, amended, visible, actionHandlers }) => {
  const { actions, state } = Model();
  const [form] = Form.useForm<ContractData>();

  const onSubmitHandler = async () => {
    const values = await form.validateFields();

    if (!values || !data) return;

    Modal.confirm({
      title: 'Edit contract',
      content: 'Do you want to submit?',
      onOk: async () => {
        try {
          const rs = await actions.saveContract({
            ...values,
            id: data?.id,
            customerId: data.customer.id,
            expiryDate: values.expiryDate.add(2, 'M').endOf('M'),
          });
          message.success(`Successfully updated.`);
          if (amended) {
            actionHandlers?.onReload?.(rs.id);
          } else actionHandlers?.onCancel?.(true);
        } catch (error: any) {
          message.error(error.message || 'Failed to update.');
        }
      },
    });
  };

  useEffect(() => {
    if (!visible || !data) return;

    actions.loadInitData(data.customer.id);

    resetData();
  }, [visible]);

  const resetData = () => {
    if (!data) return;

    actions.applyLayoutConfig(data.contractType.code as ContactType, data.includedIncentive);

    actions.listSubContract(data.contractType.id);

    form.setFieldsValue({
      amended: amended,
      customerId: data.customer.id,
      contractDate: moment(data.contractDate),
      contractTypeId: data.contractType.id,
      subContractTypeId: data.subContractType.id,
      effectiveDate: moment(data.effectiveDate),
      expiryDate: moment(data.expireDate),
      exclusiveProductIds: data?.options
        .filter((it) => it.type == 'EXCLUSIVE_PRODUCT')
        .map((it) => it.id),
      offerFrequencyId: data.frequencySettlement.id,
      settlementPlanId: data.settlementPlan.id,
      displayOfferIds: data.options.filter((it) => it.type == 'OFL_OFFER').map((it) => it.id),
      customerDisplays: data.options
        .filter((it) => it.type == 'CUSTOMER_DISPLAY')
        .map((it) => it.id),
      displayProducts:
        data.productDisplay.length > 0
          ? data.productDisplay.map((it) => {
              return { productId: it.id, qty: it.amount };
            })
          : [{}],
      sponsorItems:
        data.itemSponsor.length > 0
          ? data.itemSponsor.map((it) => {
              return { itemId: it.id, qty: it.amount };
            })
          : [{}],
      remarks: data.remarks,

      // incentiveSchemes: data.incentiveScheme.length > 0 ? data.incentiveScheme.map(it => {
      //     return { schemeNo: it.schemeNo, itemId: it.item.id, qty: it.qty, sponsorItemId: it.sponsorItem.id, sponsorQty: it.sponsorQty, remarks: it.remarks }
      // }) : [{ schemeNo: 1 }]
    });
  };

  return (
    <ContractEntryModal
      form={form}
      title={amended ? 'Admend contract' : 'Edit Contract'}
      open={visible}
      onCancel={() => actionHandlers?.onCancel?.()}
      onResetForm={async () => {
        resetData();
      }}
      onSubmit={onSubmitHandler}
      onFormValuesChange={(changedValues) => {
        const { includedIncentive, contractTypeId } = changedValues;
        if (contractTypeId) {
          actions.applyLayoutConfig(
            (state.initialData?.lookupDataList?.find(
              (it) => it.type == 'CONTRACT_TYPE' && it.id == contractTypeId,
            )?.code as ContactType) || 'EXCLUSIVE',
          );
          actions.listSubContract(contractTypeId);
        }

        Object.keys(changedValues).some((it) => it === 'includedIncentive') &&
          actions.enableIncentiveEntry(includedIncentive);
      }}
      layoutConfig={state.layoutConfig}
      initData={state.initialData}
    />
  );
};

export default EditContract;
