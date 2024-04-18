import { simpleRequestActions } from '@/services/model';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  ProForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, Row, Spin, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useRef, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { ProductDto } from '../product/data';
import { ProductServiceAPI } from '../product/services';
import { CustomerPricingParam } from './data';
import { CustomerPricingServiceAPI } from './services';

interface Props {
  type: 'new' | 'edit';
  //   id?: string;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export default ({ type }: Props) => {
  const requestActions = simpleRequestActions();
  const productServices = ProductServiceAPI(requestActions);
  const services = CustomerPricingServiceAPI(requestActions);
  // const customerServices = CustomerServiceAPI(requestActions);

  // const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [items, setItems] = useState<CustomerPricingParam[]>([]);
  //   const [pricings, setPricings] = useState<ItemsPricing[]>([]);

  const editableFormRef = useRef<EditableFormInstance>();
  const actionRef = useRef<ActionType>();

  const [form] = useForm<{
    customerId: string;
  }>();

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Customer Pricing',
    },
    // {
    //   path: `${RetailerPath.pricing}/list`,
    //   label: 'Pricing Rule',
    // },
    {
      path: `${RetailerPath.customer_pricing}/create`,
      label: type === 'new' ? 'Create' : 'Edit',
    },
  ];

  const resetForm = () => {
    setItems(
      products.map((it) => ({
        productName: it.name,
        productNameEn: it.nameEn,
        productCode: it.code,
        pricing: 0.0,
        remark: null,
        id: it.id,
        key: it.code,
        productId: it.id,
      })),
    );
    form.resetFields();
  };

  const onFormvalueChanged = async (changedValues: any) => {
    const { customerId } = changedValues;
    if (customerId !== undefined) {
      const pricingList = await services.listPricingByCustomer(customerId);
      //   setPricings(pricingList);

      const itemsList = products.map((it) => {
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
      });
      setItems(itemsList);
    }
  };

  const onSaveActionHandler = async () => {
    const value = await form.validateFields();
    if (value.customerId === undefined) {
      message.error('Customer is required');
      return;
    }

    try {
      const result = await services.savePricing({
        customerId: value.customerId,
        listPricing: items.map((it) => ({
          pricing: it.pricing,
          productCode: it.productCode,
        })),
      });
      message.info(result.message);
      resetForm();
    } catch (e: any) {
      message.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      const productList = await productServices.listProducts({});
      // const customerList = await services.listCustomer();
      // setCustomers(customerList);
      setProducts(productList);
      // const customerList = await customerServices.listCustomer({
      //   criteria: { searchValue: undefined },
      // });
      // setCustomers(customerList.items);

      setItems(
        productList.map((it) => ({
          productName: it.name,
          productNameEn: it.nameEn,
          productCode: it.code,
          pricing: 0.0,
          remark: null,
          id: it.id,
          key: `${it.sequence}`,
          productId: it.id,
        })),
      );
    })();
  }, []);
  return (
    <Spin spinning={requestActions.request?.loading}>
      <ProForm
        form={form}
        {...layout}
        layout="horizontal"
        onValuesChange={onFormvalueChanged}
        submitter={{
          render: () => {
            return (
              <FooterToolbar>
                <Button onClick={() => history.push(SalePaths.retailer)}>Cancel</Button>
                {type === 'new' && <Button onClick={() => form.resetFields()}>Clear</Button>}

                <Button type="primary" onClick={() => onSaveActionHandler()}>
                  {type === 'new' ? 'Save' : 'Edit'}
                </Button>
              </FooterToolbar>
            );
          },
        }}
      >
        <BreadCrumbCom separator=">" routes={routes} />
        <Card
          title={
            'General Info'
            // <TitleCard
            //   title="Pricing Rule"
            //   tagLable={type === 'new' ? 'New' : 'Edit'}
            //   color={type === 'new' ? 'blue' : 'warning'}
            // />
          }
          size="small"
          style={{ marginTop: 10, marginBottom: 20 }}
        >
          <Row gutter={50}>
            <Col span={12}>
              <ProFormSelect
                label="Customer"
                name="customerId"
                fieldProps={{
                  filterOption: false,
                }}
                request={async ({ keyWords }) => {
                  console.log(keyWords);
                  const data = await services.listCustomer(keyWords);
                  console.log(data);
                  return data.map((o) => ({
                    label: o.firstName,
                    value: o.id,
                  }));
                }}
                showSearch
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
          <Row gutter={50}>
            <Col>
              <EditableProTable<CustomerPricingParam>
                value={items}
                editableFormRef={editableFormRef}
                rowKey="key"
                size="small"
                recordCreatorProps={false}
                controlled
                actionRef={actionRef}
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
        </Card>
      </ProForm>
    </Spin>
  );
};
