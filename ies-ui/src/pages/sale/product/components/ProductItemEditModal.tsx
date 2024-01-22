import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProductItem } from '@/services/sale/data';
import { ProDescriptions } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Button, Col, Row, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { ProductActions } from '../data';

export interface ProductItemsFromProps extends FormModalProps {
  item?: ProductItem;
  actionHandlers?: {
    onSave?: (actions?: ProductActions) => void;
  };
}

const ProductItemEditModal: React.FC<ProductItemsFromProps> = ({
  actionHandlers,
  item,
  ...rest
}) => {
  const [actions, setActions] = useState<ProductActions>();

  useEffect(() => {
    if (!rest.open) return;
    setActions({
      isMobile: item?.isActiveMobileSales,
      isWeb: item?.isWebEnabled,
      isCountStock: item?.isStockCountEnabled,
    });
    //form.setFieldsValue({ empNo: seCode });
  }, [rest.open]);
  return (
    <FormModalComp
      {...rest}
      title={item?.name}
      width="600px"
      footer={[
        <Button key="reset" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submit"
          type="primary"
          onClick={() => {
            actionHandlers?.onSave?.(actions);
          }}
        >
          Update
        </Button>,
      ]}
    >
      <ProForm submitter={false} autoFocusFirstInput>
        <Row gutter={50}>
          <Col>
            <ProDescriptions column={3} title={item?.code}>
              <ProDescriptions.Item valueType="text" label="Mobile">
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked={item?.isActiveMobileSales}
                  onChange={(value) => {
                    setActions((v) => ({ ...v, isMobile: value }));
                  }}
                />
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="text" label="Web">
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked={item?.isWebEnabled}
                  onChange={(value) => {
                    setActions((v) => ({ ...v, isWeb: value }));
                  }}
                />
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="text" label="Count Stock">
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked={item?.isStockCountEnabled}
                  onChange={(value) => {
                    setActions((v) => ({ ...v, isCountStock: value }));
                  }}
                />
              </ProDescriptions.Item>
            </ProDescriptions>
          </Col>
        </Row>
      </ProForm>
    </FormModalComp>
  );
};

export default ProductItemEditModal;
