import { simpleRequestActions } from '@/services/model';
import type { ProductItemDto } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
// import { DeleteOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, message, Modal, Row, Spin, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import type { CategoryDto } from '../category/data';
import { CategoryServiceAPI } from '../category/services';
import AddIngredientModal from '../components/AddIngredientModal';
import BreadCrumbCom from '../components/BreadCrumbCom';
import ImportProductModal from '../components/ImportProductModal';
import type { IngredientDto } from '../ingredient/data';
import type { ProductCreate } from './data';
import { ProductServiceAPI } from './services';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Props {
  type: 'new' | 'edit';
  id?: string;
}

export default ({ id, type }: Props) => {
  const requestActions = simpleRequestActions();
  const productService = ProductServiceAPI(requestActions);
  const saleServices = SaleServiceAPI(requestActions);
  const categoryServices = CategoryServiceAPI(requestActions);

  const [productItems, setProductItems] = useState<ProductItemDto[]>([]);
  const [ingredients, setIngredients] = useState<IngredientDto[]>([]);

  const [categories, setCategories] = useState<CategoryDto[]>([]);

  const [productModal, setProductModal] = useState<boolean>(false);
  const [ingredientModal, setIngredientModal] = useState<boolean>(false);

  const [itemCodeCrm, setItemCodeCrm] = useState<string>('');

  const actionRef = useRef<ActionType>();

  const [form] = useForm<ProductCreate>();

  const onSaveActionHandler = async (isNew?: boolean) => {
    const dataForm = await form.validateFields();

    const entity: ProductCreate = {
      ...dataForm,
      id: id,
      code: itemCodeCrm === '' ? dataForm.code : itemCodeCrm,
      ingredients: ingredients.map((it) => it.id),
    };

    try {
      const title = `${id === undefined ? 'Create' : 'Update'} Product.`;
      Modal.confirm({
        title: title,
        content: 'Are you sure:',
        onOk: async () => {
          const result: { data: string; message: string } = (await productService.save(entity)) as {
            data: string;
            message: string;
          };
          message.info(result.message);
          if (isNew) {
            form.resetFields();
            history.push(`${RetailerPath.productItem}/create`);
          } else history.push(`${RetailerPath.productItem}/detail/${result.data}`);
        },
      });
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const initializeData = async () => {
    setCategories(
      await (
        await categoryServices.listCategory({ criteria: { advanceSearch: { status: 'ALL' } } })
      ).items,
    );
    setProductItems(await saleServices.loadingProductItems());
  };

  const initDetail = async () => {
    if (id) {
      const product = await productService.detailProduct(id);
      form.setFieldsValue({
        name: product.name,
        nameEn: product.nameEn,
        description: product.description,
        descriptionEn: product.descriptionEn,
        code: product.code,
        barCode: product.barCode,
        shortName: product.shortName,
        // pricing: product.pricing?.pricing,
        categoryId: product.category?.id,
      });
      setItemCodeCrm(product.code);
      setIngredients(product.ingredients ?? []);
    }
  };

  useEffect(() => {
    initializeData();
    initDetail();
  }, []);

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
      path: `${RetailerPath.productItem}/create`,
      label: type === 'new' ? 'Create' : 'Edit',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Spin spinning={requestActions.request?.loading}>
        <ProForm
          form={form}
          {...layout}
          layout="horizontal"
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
                        history.push(`${RetailerPath.productItem}/detail/${id}`);
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
          <Card
            title="Product Info"
            extra={
              type === 'new' && (
                <Tooltip title="Import Product from IES." placement="leftTop">
                  <Button
                    type="link"
                    onClick={() => {
                      setProductModal(true);
                    }}
                  >
                    Import Product
                  </Button>
                </Tooltip>
              )
            }
            size="small"
            style={{ marginTop: 10, marginBottom: 20 }}
          >
            <Row gutter={20}>
              <Col flex={'auto'}>
                <ProFormText help={<span />} label="Product Name (KH)" name="name" required />
                <ProFormText help={<span />} label="Short Name" name="shortName" />
                <ProFormTextArea help={<span />} label="Decription (KH)" name="description" />
                <ProFormSelect<CategoryDto>
                  name="categoryId"
                  label="Cateogry"
                  options={categories.map((it) => {
                    return { label: it.name, value: it.id };
                  })}
                  rules={[{ required: true, message: 'Please select category.' }]}
                />
              </Col>
              <Col flex={'auto'}>
                <ProFormText help={<span />} label="Product Name (EN)" name="nameEn" required />
                <ProFormText help={<span />} label="Product Code" name="code" required />
                <ProFormTextArea help={<span />} label="Decription (EN)" name="descriptionEn" />
              </Col>
            </Row>
            {/* <Row gutter={20}>
              <Col flex={'auto'}>
                
              </Col>
              <Col flex={'auto'}>
            </Col>
            </Row> */}
          </Card>

          <Card
            title="Ingredients"
            size="small"
            extra={
              <Button type="link" onClick={() => setIngredientModal(true)}>
                {`${ingredients.length > 0 ? 'Edit' : 'Add'} Ingredients`}
              </Button>
            }
          >
            <ProTable<IngredientDto>
              actionRef={actionRef}
              search={false}
              options={false}
              rowKey={'key'}
              dataSource={ingredients}
              columns={[
                { title: 'Name', dataIndex: 'name' },
                {
                  title: 'Name En',
                  dataIndex: 'nameEn',
                },
                // {
                //   title: 'Action',
                //   width: 100,
                //   align: 'right',
                //   render: (_, r) => {
                //     return (
                //       <Tooltip placement="top" title="Remove">
                //         <DeleteOutlined
                //           style={{ color: '#448DF7' }}
                //           onClick={() => {
                //             ingredients.filter((it) => it.id !== r.id);
                //             setIngredients(ingredients.filter((it) => it.id !== r.id));
                //             actionRef.current?.reload();
                //           }}
                //         />
                //       </Tooltip>
                //     );
                //   },
                // },
              ]}
            />
          </Card>
          <AddIngredientModal
            key={'Add-Ingredient'}
            isVisible={ingredientModal}
            selectedDefault={ingredients}
            actionHandler={{
              onCancel: () => setIngredientModal(false),
              onOk: async (items?: IngredientDto[]) => {
                console.log(`${ingredients.length}  selected: ${items?.length}`);
                if (items) {
                  const newItems = items.map((it) => {
                    it.key = uniqueId();
                    return it;
                  });
                  setIngredients(newItems);
                  await actionRef.current?.reloadAndRest?.();
                }
                setIngredientModal(false);
              },
            }}
          />
          <ImportProductModal
            key={'Product-Modal'}
            isVisible={productModal}
            dataSource={productItems}
            actionHandler={{
              onOk: (item) => {
                if (item) {
                  setItemCodeCrm(item.code);
                  form.setFieldsValue({
                    nameEn: item.name,
                    code: item.code,
                    descriptionEn: item.description,
                    //pricing: item.price,
                    barCode: item.barcode,
                  });
                }
                setProductModal(false);
              },
              onCancel: () => {
                setProductModal(false);
              },
            }}
          />
        </ProForm>
      </Spin>
    </>
  );
};
