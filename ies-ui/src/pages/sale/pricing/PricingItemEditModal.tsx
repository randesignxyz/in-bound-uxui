import FormModalComp, { FormModalProps } from '@/components/FormModal';

import { simpleRequestActions } from '@/services/model';
import {
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Col, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import { ItemSalesLinePriceDto, PricingUpdateParam } from './data';
import { PricingServiceAPI } from './services';

export interface PricingItemEditProps extends FormModalProps {
  item?: ItemSalesLinePriceDto;
  formEditType?: 'SINGLE' | 'MULTI';
  onSave: (actions: PricingUpdateParam) => void;
}
const PricingItemEditModal: React.FC<PricingItemEditProps> = ({
  onSave,
  item,
  formEditType,
  ...rest
}) => {
  const [form] = useForm<PricingUpdateParam>();
  const requestActions = simpleRequestActions();
  useEffect(() => {
    if (!rest.open) return;
    rest.open && form.resetFields();
    rest.open &&
      item &&
      form.setFieldsValue({
        unitPrice: item.unitPrice,
        unitPriceAfterDiscount: item.unitPriceAfterDiscount,
      });
    if (item !== undefined) {
      // form.setFieldsValue({
      //   id: item.id ?? 0,
      //   productCode: item.productCode,
      //   productId: item.productId,
      //   productName: item.productName,
      //   unitPrice: item.unitPrice,
      //   unitPriceAfterDiscount: item.unitPriceAfterDiscount,
      //   currency: item.currencyCode ?? '',
      // });
    }
  }, [rest.open]);

  // const [forceState, setForceState] = useState<{ action: string | 'ALL' }>();

  return (
    <FormModalComp
      {...rest}
      title={formEditType === 'MULTI' ? 'Edit Multi Pricing' : item?.productName}
      width={formEditType === 'MULTI' ? '800px' : '600px'}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const entry = {
          ...dataForm,
          id: formEditType === 'MULTI' ? dataForm.id : [item?.id || 0],
        };
        onSave(entry);
      }}
    >
      <ProForm form={form} submitter={false}>
        <Row gutter={12}>
          <Col span={24}>
            {formEditType === 'MULTI' && (
              <>
                <ProFormRadio.Group
                  radioType="button"
                  name={'Pricetype'}
                  addonBefore={'Team'}
                  initialValue={'ALL'}
                  fieldProps={{
                    onChange: (e) => {},
                  }}
                  options={[
                    {
                      value: 'ALL',
                      label: 'All',
                    },
                    {
                      value: 'ACT-GROUP',
                      label: 'Activation',
                    },
                    {
                      value: 'DSD-GROUP',
                      label: 'Van Sale',
                    },
                  ]}
                />
                <ProFormDependency dependencies={['Pricetype']} name={['Pricetype']}>
                  {({ Pricetype }) => {
                    return (
                      Math.random().toString() && (
                        <ProFormSelect
                          name={'id'}
                          label="Product Item"
                          showSearch
                          debounceTime={500}
                          mode="multiple"
                          colSize={24}
                          rules={[{ required: true }]}
                          request={async ({ keyWords }) => {
                            const data = await PricingServiceAPI(requestActions).page({
                              criteria: {
                                searchValue: keyWords,
                                advanceSearch: { status: Pricetype },
                              },
                            });
                            return data.items.map((o) => ({ label: o.productName, value: o.id }));
                          }}
                        />
                      )
                    );
                  }}
                </ProFormDependency>
              </>
            )}
          </Col>
          <Col span={12}>
            <ProFormDigit
              name="unitPrice"
              label="Unit Price"
              width={'lg'}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              name="unitPriceAfterDiscount"
              label="Unit Price After Discount"
              rules={[{ required: true }]}
              min={0}
              width={'lg'}
            />
          </Col>
        </Row>
      </ProForm>
    </FormModalComp>
  );
};

export default PricingItemEditModal;
