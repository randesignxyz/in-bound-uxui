import { simpleRequestActions } from '@/services/model';
import {
  FooterToolbar,
  ProForm,
  ProFormDateRangePicker,
  ProFormMoney,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';

import { CustomerServiceAPI } from '../customer/services';

import { join } from 'lodash';
import moment from 'moment';
import { GroupCustomerServiceAPI } from '../groupCustomer/service';
import { ProductDto } from '../product/data';
import { ProductServiceAPI } from '../product/services';
import type { ItemsPricing } from './data';
import { PricingServiceAPI } from './services';

interface Props {
  type: 'new' | 'edit';
  id?: string;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface PricingModelForm {
  productId: string;
  unitPrice: number;
  discountPrice?: number;
  priceType: string;
  customerId?: string;
  customerGroupId?: string;
  expiredDates?: moment.Moment[];
}

export default ({ id, type }: Props) => {
  const requestActions = simpleRequestActions();
  const services = PricingServiceAPI(requestActions);
  const servicescustomer = CustomerServiceAPI(requestActions);
  const [form] = useForm<PricingModelForm>();
  const [selectedPrcingType, setSelectedPrcingType] = useState('customer group');
  const [products, setProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    (async () => {
      const productList = await ProductServiceAPI(requestActions).listProducts({
        criteria: { searchValue: undefined },
      });

      productList.sort((a, b) => {
        if (a.sequence < b.sequence) return -1;
        if (a.sequence > b.sequence) return 1;
        return 0;
      });
      setProducts(productList);

      if (id) {
        const pricing = await services.detailPricing(id);

        form.setFieldsValue({
          unitPrice: pricing.unitPrice,
          discountPrice: pricing.discountPrice,
          priceType: pricing.pricingType,
          expiredDates:
            pricing.effectiveDate !== null && pricing.expiredDate !== null
              ? [pricing.effectiveDate!, pricing.expiredDate!]
              : undefined,
          productId: pricing.productId,
          customerId: pricing.pricingType === 'customer' ? pricing.referenceId : undefined,
          customerGroupId: pricing.pricingType === 'customer' ? undefined : pricing.referenceId,
        });
      } else {
        form.setFieldsValue({
          priceType: 'customer group',
          discountPrice: 0.0,
        });
      }
    })();
  }, []);

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.pricing}/list`,
      label: 'Pricing Rule',
    },
    {
      path: `${RetailerPath.pricing}/create`,
      label: type === 'new' ? 'Create' : 'Edit',
    },
  ];

  const onFormValueChange = (changedValues: any) => {
    const { priceType } = changedValues;
    if (priceType && 'priceType' in changedValues) {
      if (priceType === 'customer') {
        form.setFieldsValue({ customerGroupId: undefined });
      } else {
        form.setFieldsValue({ customerId: undefined });
      }

      setSelectedPrcingType(priceType);
    }
  };

  const onSaveActionHandler = async (isNew?: boolean) => {
    const dataForm = await form.validateFields();

    if (dataForm.productId === undefined) {
      message.error('Please select product item.');
      return;
    }
    if (dataForm.unitPrice === undefined) {
      message.error('Please enter unit price.');
      return;
    }
    if (dataForm.priceType === 'customer' && dataForm.customerId === undefined) {
      message.error('Please select customer.');
      return;
    }
    if (dataForm.priceType === 'customer group' && dataForm.customerGroupId === undefined) {
      message.error('Please select customer group.');
      return;
    }
    const effectiveDate =
      dataForm.expiredDates !== undefined ? dataForm.expiredDates[0] : undefined;
    const expiredDate = dataForm.expiredDates !== undefined ? dataForm.expiredDates[1] : undefined;
    const entity: ItemsPricing = {
      id: id ?? '',
      pricingType: dataForm.priceType,
      unitPrice: dataForm.unitPrice,
      discountPrice: dataForm.discountPrice,
      productId: dataForm.productId,
      referenceId:
        dataForm.priceType === 'custoemr' ? dataForm.customerId : dataForm.customerGroupId,
      effectiveDate: effectiveDate,
      expiredDate: expiredDate,
    };

    try {
      const title = `${id === undefined ? 'Create' : 'Update'} Pricing.`;
      Modal.confirm({
        title: title,
        content: 'Are you sure:',
        onOk: async () => {
          try {
            const result = (await services.savePricing(entity)) as {
              message: string;
              data: string;
            };
            message.info(result.message);
            if (isNew) {
              form.resetFields();
              form.setFieldsValue({
                priceType: 'customer group',
                discountPrice: 0.0,
              });
              setSelectedPrcingType('customer group');
              history.push(`${RetailerPath.pricing}/create`);
            } else history.push(`${RetailerPath.pricing}/detail/${result.data}`);
          } catch (e: any) {
            message.error(e.message);
          }
        },
      });
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return (
    <ProForm
      form={form}
      {...layout}
      layout="horizontal"
      onValuesChange={onFormValueChange}
      submitter={{
        render: () => {
          return (
            <FooterToolbar>
              {type === 'new' && (
                <Button
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  Clear
                </Button>
              )}

              {type === 'edit' && (
                <Button
                  onClick={() => {
                    history.push(`${RetailerPath.pricing}/detail/${id}`);
                  }}
                >
                  Cancel
                </Button>
              )}
              {type === 'edit' && (
                <Button
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  Reset
                </Button>
              )}
              {type === 'new' && (
                <Button
                  type="primary"
                  onClick={() => {
                    onSaveActionHandler(true);
                  }}
                >
                  Save & Add New
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => {
                  onSaveActionHandler();
                }}
              >
                {type === 'new' ? 'Save & View' : 'Edit'}
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
              label="Product Item"
              name="productId"
              rules={[{ message: 'Please select product item.' }]}
              required={true}
              options={products.map((it) => ({
                label: join([it.code, it.nameEn], ' - '),
                value: it.id,
              }))}
              // request={async (params) => {
              //   const data = await ProductServiceAPI(requestActions).listPrduct({
              //     criteria: { searchValue: params['keyWords'] },
              //   });
              //   return data.items
              //     .filter((it) => it.status === 'active')
              //     .map((obj) => ({
              //       code: obj.code,
              //       label: join([obj.code, obj.nameEn], ' - '),
              //       value: obj.id,
              //     }))
              //     .sort((a, b) => {
              //       if (a.code < b.code) return -1;
              //       if (a.code > b.code) return 1;
              //       return 0;
              //     });
              // }}
            />
            <ProFormMoney label="Unit Price" name="unitPrice" required={true} min={1} />
            <ProFormMoney label="Discount Price" name="discountPrice" min={0} />
          </Col>
          <Col span={12}>
            <ProFormRadio.Group
              name="priceType"
              label="Apply For"
              options={[
                {
                  label: 'Customer Group',
                  value: 'customer group',
                },
                {
                  label: 'Customer',
                  value: 'customer',
                },
              ]}
            />
            {selectedPrcingType === 'customer group' ? (
              <ProFormSelect
                label="Customer Group"
                name="customerGroupId"
                rules={[{ message: 'Please select customer group.' }]}
                required={true}
                request={async (params) => {
                  const criteria = { criteria: { searchValue: params['keyWords'] } };
                  const data = await GroupCustomerServiceAPI(requestActions).listGroupCustomer(
                    criteria,
                  );

                  return data.items
                    .filter((it) => it.status === 'active')
                    .map((obj) => ({ label: obj.name, value: obj.id }));
                }}
                // width={'md'}
              />
            ) : (
              <ProFormSelect
                label="Customer"
                name="customerId"
                rules={[{ message: 'Please select customer.' }]}
                required={true}
                request={async (params) => {
                  const criteria = { criteria: { searchValue: params['keyWords'] } };
                  const data = await servicescustomer.listCustomer(criteria);
                  return data.items
                    .filter((it) => it.status === 'active')
                    .map((obj) => {
                      console.log(typeof obj);
                      return { label: obj.firstName + join(' ') + obj.lastName, value: obj.id };
                    });
                }}
                // width={'md'}
              />
            )}

            <ProFormDateRangePicker
              label="Expired Date"
              name="expiredDates"
              fieldProps={{
                // disabledDate: disabledDate,
                placeholder: ['Start Date', 'End Date'],
                format: (value) => value.format('DD-MM-YYYY'),
              }}
            />
          </Col>
        </Row>

        {/* <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              fieldProps={{ maxLength: 50 }}
              name={'name'}
              label="Name"
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={12}>
            <ProFormMoney
              customSymbol="$"
              label="Price"
              name="unitPrice"
              rules={[{ required: true }]}
              min={1}
            />
          </Col>
        </Row> */}

        {/* <Row gutter={16}>
          <Col span={6}>
            <ProFormDatePicker
              fieldProps={{
                disabledDate: disabledDate,
              }}
              width={'md'}
              name={'expireDate'}
              label="Expire Date"
            />
          </Col>
          <Col span={6}>
            <ProFormDatePicker
              width={'md'}
              name={'effectiveDate'}
              label="Effective Date"
              fieldProps={{
                disabledDate: disabledDate,
              }}
            />
          </Col>

          <Col span={12}>
            <ProFormTextArea name={'description'} label="Description" fieldProps={{ rows: 1 }} />
          </Col>
        </Row> */}
        {/* <Row gutter={4}>
          <Col span={12}>
            <Card>
              <Row gutter={4}>
                <Col span={12}>
                  <Radio.Group onChange={customerOnChange} defaultValue={valueCustomer}>
                    <Space direction="vertical">
                      <Radio value={1} style={{ height: 45 }}>
                        Everyone
                      </Radio>
                      <Space direction="vertical">
                        <Radio value={2} style={{ height: 40 }}>
                          Customer
                        </Radio>
                      </Space>
                      <Space direction="horizontal" style={{ display: 'flex' }}>
                        <Radio value={3} style={{ height: 40 }}>
                          Customer Group
                        </Radio>
                      </Space>
                    </Space>
                  </Radio.Group>
                </Col>
                <Col span={12} style={{ paddingTop: 45 }}>
                  <ProFormText name={'customer'} initialValue="all" hidden />
                  <ProFormSelect
                    fieldProps={{
                      onChange: (e) => {
                        form.setFieldValue('customer', e);
                      },
                    }}
                    request={async (params: TableViewSearchParams<CustomerAdvanceSearchParams>) => {
                      const data = await servicescustomer.listCustomer(params);
                      return data.items.map((obj) => ({
                        label: obj.firstName + join(' ') + obj.lastName,
                        value: obj.id,
                      }));
                    }}
                    width={'md'}
                    showSearch={true}
                    disabled={valueCustomer == '2' ? false : true}
                  />
                  <ProFormSelect
                    fieldProps={{
                      onChange: (e) => {
                        form.setFieldValue('customer', e);
                      },
                    }}
                    request={async (
                      params: TableViewSearchParams<GroupCustomerAdvanceSearchParams>,
                    ) => {
                      const data = await GroupCustomerServiceAPI(requestActions).listGroupCustomer(
                        params,
                      );
                      return data.items.map((obj) => ({ label: obj.name, value: obj.id }));
                    }}
                    width={'md'}
                    showSearch={true}
                    disabled={valueCustomer == '3' ? false : true}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Row gutter={4}>
                <Col span={8}>
                  <Radio.Group onChange={productOnChange} value={valueProduct}>
                    <Space direction="vertical">
                      <Radio style={{ height: 45 }}>All Product</Radio>
                      <Space direction="vertical">
                        <Radio value={2} style={{ height: 40 }}>
                          Specify Product
                        </Radio>
                      </Space>
                    </Space>
                  </Radio.Group>
                </Col>
                <Col span={12} style={{ paddingTop: 45 }}>
                  <ProFormText name={'product'} width={'md'} hidden initialValue={'all'} />
                  <ProFormSelect
                    fieldProps={{
                      onChange: (e) => {
                        form.setFieldValue('product', e);
                      },
                    }}
                    request={async (params: TableViewSearchParams<ProductAdvanceSearchParams>) => {
                      const data = await ProductServiceAPI(requestActions).listPrduct(params);
                      return data.items.map((obj) => ({ label: obj.name, value: obj.id }));
                    }}
                    width={'md'}
                    showSearch={true}
                    disabled={valueProduct == '2' ? false : true}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row> */}
      </Card>
    </ProForm>
  );
};
