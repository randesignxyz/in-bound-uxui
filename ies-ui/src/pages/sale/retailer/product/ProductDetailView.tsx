import DescriptionDisplay from '@/components/Descriptions';
import { simpleRequestActions } from '@/services/model';
import { FooterToolbar, ProForm, ProTable } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Button, Card, Col, Modal, Row, Space, Spin, Tag, Typography, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { startCase } from 'lodash';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { IngredientDto } from '../ingredient/data';
import type { ProductDto } from './data';
import { ProductServiceAPI } from './services';

interface Props {
  onEdit: (id: string) => void;
  onAdd?: () => void;
  id: string;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default ({ onEdit, id, onAdd }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ProductServiceAPI(requestActions);
  const [product, setProduct] = useState<ProductDto>();
  const [update, setUpdate] = useState<number>(0);
  const [form] = useForm<ProductDto>();
  const access = useAccess();
  const { confirm } = Modal;
  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.productItem}/list`,
      label: 'Product',
    },
    {
      path: `${RetailerPath.productItem}/${id}`,
      label: 'Detail',
    },
  ];

  const { Text } = Typography;

  useEffect(() => {
    (async () => {
      if (id) {
        setProduct(await services.detailProduct(id));
      }
    })();
  }, [update]);

  const displayItems = [
    { label: 'Product Name', value: product?.name },
    { label: 'Product Name En', value: product?.nameEn },
    { label: 'Product Code', value: product?.code },
    {
      label: 'Status',
      value: product?.status,
      tag: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
      ),
    },
    { label: 'Short Name', value: product?.shortName },
    { label: '', value: '' },
    { label: 'Description', value: product?.description },
    { label: 'Description En', value: product?.descriptionEn },
    // { label: 'Category', value: product?.category?.name },
    // { label: 'Pricing', value: formatter.format(product?.pricing?.pricing ?? 0.0) },
  ];

  const displayCategory =
    product !== undefined &&
    product.category !== undefined &&
    product !== null &&
    product.category !== null
      ? [
          { label: 'Name', value: product.category.name },
          { label: 'Code', value: product.category.code },
          {
            label: 'Status',
            value: product.category.status,
            tag: (status: string) => (
              <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
            ),
          },
        ]
      : [];
  const displayVat =
    product !== undefined && product.vat !== undefined && product !== null && product.vat !== null
      ? [
          { label: 'Description', value: product.vat.description },
          { label: 'Code', value: product.vat.code },
          {
            label: 'Status',
            value: product.vat.status,
            tag: (status: string) => (
              <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
            ),
          },
          { label: 'Percentage', value: numeral(product.vat.percentage).format('#.## %') },
        ]
      : [];

  const onInactiveProduct = () => {
    confirm({
      title:
        product?.status === 'active'
          ? 'Inactive product will effect to group of customer.'
          : 'Active Product',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          const response = await services.updateStatusProduct({
            id: id,
            status: product?.status === 'active' ? 'inactive' : 'active',
          });
          // await actionRef.current?.reload();
          message.info(response.message);
        } catch (e: any) {
          message.error(e);
        } finally {
          setUpdate(update + 1);
          // actionRef.current?.reload();
        }
      },
    });
  };
  return (
    <Spin spinning={requestActions.request?.loading}>
      <ProForm
        form={form}
        {...layout}
        layout="horizontal"
        submitter={{
          render: () => {
            return (
              <FooterToolbar>
                <Button
                  onClick={() => {
                    history.push(`${RetailerPath.productItem}/list`);
                  }}
                >
                  Back
                </Button>
                {access.canCreateRetailer && (
                  <Space>
                    <Button
                      style={{ color: product?.status === 'active' ? 'red' : 'black' }}
                      type="default"
                      onClick={() => onInactiveProduct()}
                    >
                      {product?.status === 'active' ? 'Inactive' : 'Active'}
                    </Button>
                    <Button type="default" onClick={() => onAdd?.()}>
                      New
                    </Button>
                    <Button type="primary" onClick={() => onEdit?.(id)}>
                      Edit
                    </Button>
                  </Space>
                )}
              </FooterToolbar>
            );
          },
        }}
      >
        <BreadCrumbCom separator=">" routes={routes} />
        {/* <Row justify="space-between">
          { && (
            <Space>
              <Button
                style={{ color: product?.status === 'active' ? 'red' : 'black' }}
                type="default"
                onClick={() => onInactiveProduct()}
              >
                {product?.status === 'active' ? 'Inactive' : 'Active'}
              </Button>
              <Button type="default" onClick={() => onAdd?.()}>
                New
              </Button>
              <Button type="primary" onClick={() => onEdit?.(id)}>
                Edit
              </Button>
            </Space>
          )}
        </Row> */}

        {/* tags={} */}
        <Card
          // title={<TitleCard title="Product" tagLable="Detail" color={'blue'} />}
          title="General Info"
          size="small"
          style={{ marginTop: 10, marginBottom: 20 }}
        >
          <DescriptionDisplay data={displayItems} column={3} />
        </Card>

        <Card title="Category Info" size="small" style={{ marginTop: 10, marginBottom: 20 }}>
          <DescriptionDisplay data={displayCategory} column={3} />
        </Card>

        <Card title="Vat Info" size="small" style={{ marginTop: 10, marginBottom: 20 }}>
          {displayCategory.length === 0 ? (
            <Row>
              <Col>
                <Text type="secondary">No Detail Item.</Text>
              </Col>
            </Row>
          ) : (
            <DescriptionDisplay data={displayVat} column={3} />
          )}
        </Card>

        <Card size="small" title="Ingredients">
          <ProTable<IngredientDto>
            search={false}
            options={false}
            rowKey={'id'}
            dataSource={product?.ingredients}
            columns={[
              { title: 'Name', dataIndex: 'name' },
              {
                title: 'Name En',
                dataIndex: 'nameEn',
              },
            ]}
          />
        </Card>
      </ProForm>
    </Spin>
  );
};
