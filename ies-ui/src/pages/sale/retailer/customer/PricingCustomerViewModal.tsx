import { simpleRequestActions } from '@/services/model';
import { EditableFormInstance, EditableProTable, ModalForm } from '@ant-design/pro-components';
import { Col, Row, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CustomerPricingParam } from '../customer_pricing/data';
import { CustomerPricingServiceAPI } from '../customer_pricing/services';
import { ProductServiceAPI } from '../product/services';
import { CustomerDto } from './data';

interface Props {
  isVisible: boolean;
  selectedCustomer?: CustomerDto;
  actionHandler: {
    onCancel: () => void;
    onOk: (items?: CustomerPricingParam[]) => void;
  };
}

export default ({ isVisible, actionHandler, selectedCustomer }: Props) => {
  const requestActions = simpleRequestActions();
  const productServices = ProductServiceAPI(requestActions);
  const services = CustomerPricingServiceAPI(requestActions);
  const [items, setItems] = useState<CustomerPricingParam[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (isVisible) {
        setLoading(true);
        const productList = await productServices.listProducts({});
        const pricingList = await services.listPricingByCustomer(selectedCustomer?.id ?? '');

        setItems(
          productList.map((it) => {
            const pricing = pricingList.find((e) => e.productCode === it.code);
            return {
              productName: it.name,
              productNameEn: it.nameEn,
              productCode: it.code,
              pricing: pricing?.unitPrice ?? 0.0,
              remark: null,
              id: it.id,
              key: it.code,
              productId: it.id,
            };
          }),
        );
        setLoading(false);
      }
    })();
  }, [isVisible]);

  return (
    <ModalForm
      open={isVisible}
      title={`${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
      onFinish={() => {
        return Promise.resolve(true);
      }}
      modalProps={{
        closable: true,
        destroyOnClose: true,
        onCancel: actionHandler.onCancel,
        //afterClose: () => setSelectedItems([]),
      }}
      submitter={{
        resetButtonProps: {
          onClick: actionHandler.onCancel,
        },
        submitButtonProps: {
          onClick: () => {
            setLoading(true);
            actionHandler.onOk(items);
            setLoading(false);
          },
        },
      }}
    >
      <Spin spinning={loading}>
        <Row gutter={50}>
          <Col>
            <EditableProTable<CustomerPricingParam>
              value={items}
              editableFormRef={editableFormRef}
              rowKey="key"
              size="small"
              recordCreatorProps={false}
              controlled
              editable={{
                type: 'multiple',
                editableKeys: items?.map((it) => it.key),
                // onChange: setEditableRowKeys,

                onValuesChange: (_, d) => {
                  setItems(d);
                },
              }}
              columns={[
                {
                  title: 'No',
                  width: 50,
                  editable: false,
                  render: (_, __, i) => i + 1,
                },
                {
                  title: 'Product Code',
                  dataIndex: 'productCode',
                  readonly: true,
                },
                {
                  title: 'Product Name (EN)',
                  dataIndex: 'productNameEn',
                  readonly: true,
                },
                {
                  title: 'Product Name',
                  dataIndex: 'productName',
                  readonly: true,
                },
                {
                  title: 'Pricing',
                  dataIndex: 'pricing',
                  valueType: 'money',
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => {
                          // console.log(record, value, callback);
                          return value < 0
                            ? Promise.reject('Pricing sould be positive number.')
                            : Promise.resolve(undefined);
                        },
                        required: true,
                        message: 'Please Enter Pricing',
                        whitespace: false,
                      },
                    ],
                  },
                },
              ]}
            />
          </Col>
        </Row>
      </Spin>
    </ModalForm>
  );
};
