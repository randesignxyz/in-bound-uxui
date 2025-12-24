import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { UIBuilder } from '@/components/UIBuilder';
import { LookupDataItem } from '@/services/data';
import { BudgetCodeLess, PackageOffer, ProductItem, SoLineItemEntry } from '@/services/sale/data';
import ProForm, {
  ProFormDigit,
  ProFormField,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { Card, Form, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { head, uniqueId } from 'lodash';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { SoItemEntry } from '../reducer';

interface Props extends FormModalProps {
  data: {
    seq: number;
    soLineItems?: SoItemEntry[];
    productItem?: ProductItem;
    packageOffers?: PackageOffer[];
    budgetLess?: BudgetCodeLess[];
    defaultSaleType?: LookupDataItem;
    saleTypes?: LookupDataItem[];
  };
  actionHandlers: {
    onLoadOffer?: (params: SoLineItemEntry[]) => void;
    onAddSoItem?: (soItems: SoItemEntry[]) => void;
  };
}

interface FormDataType {
  lineItems: SoLineItemEntry[];
  offerLineItems?: SoLineItemEntry[];
}

interface ItemEntityForm {
  id: number;
  type: string;
  qty: number;
  uomId: number;
  price: number;
  amount: number;
  main: boolean;
  categoryId?: number;
  budgetCode?: string;
  discountPercent: number;
}

const PackageItemEntry: React.FC<Props> = ({ data, loading, actionHandlers, ...props }) => {
  // const [loadOffer, setLoadOffer] = useState<boolean>(false)
  const [focusIn, setFocusIn] = useState<boolean>(false);
  const itemList = [data.productItem, ...(data.productItem?.mixedProductItemList || [])];
  const uomList = [{ id: 1, name: 'Case' }];

  const optionList = (index: number) => {
    if (index > 0) {
      return data.productItem?.mixedProductItemList.map((it) => ({
        value: it.id,
        label: [it.code, it?.name].join('-'),
      }));
    }

    return [
      {
        value: data.productItem?.id || 0,
        label: [data.productItem?.code, data.productItem?.name].join('-'),
      },
    ];
  };

  const [form] = useForm<FormDataType>();

  //const defaultBudgetCode = 'SD-TPS01'

  //Component did mount
  useEffect(() => {
    if (!props.open) return;
    onResetActionHandler();
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  //Loading offer
  // useEffect(() => {
  //   data.packageOffers &&
  //     form.setFieldsValue({
  //       offerLineItems: head(data.packageOffers)?.offerList.map((it) => ({
  //         id: it.itemItem.id,
  //         uomId: 1,
  //         qty: it.qty,
  //         price: 0,
  //         amount: 0,
  //         type: it.offerType,
  //         main: false,
  //         budgetCode: '',
  //         discountPercent: 0,
  //       })),
  //     });
  // }, [data.packageOffers]);

  useEffect(() => {
    if (!data.packageOffers) return;

    const newOffers =
      head(data.packageOffers)?.offerList.map(it => ({
        id: it.itemItem.id,
        uomId: 1,
        qty: it.qty,
        price: 0,
        amount: 0,
        type: it.offerType,
        main: false,
        budgetCode: '',
        discountPercent: 0,
      })) || [];

    const oldOffers = form.getFieldValue('offerLineItems') || [];

    const merged = mergeOffers(oldOffers, newOffers);

    form.setFieldsValue({
      offerLineItems: merged,
    });
  }, [data.packageOffers]);

  const lineItems = Form.useWatch('lineItems', form);

  useEffect(() => {
    if (!lineItems) return;

    onGetOffer();
  }, [lineItems]);

  const onResetActionHandler = () => {
    if (!data.productItem) return;

    const defaultItemEntity: ItemEntityForm = {
      id: data.productItem.id,
      type: data.defaultSaleType?.code!,
      qty: 1,
      uomId: 1,
      price: data.productItem.priceAfterDiscount || data.productItem.price,
      amount: data.productItem.priceAfterDiscount || data.productItem.price,
      main: true,
      categoryId: data.productItem?.itemCategoryId,
      budgetCode: '', //head(data.budgetLess?.find(it => it.saleType === data.defaultSaleType?.id)?.budgets)?.code,
      discountPercent: data.productItem.discountPercent || 0,
    };

    const list = data.soLineItems?.map((it) => {
      const item: ItemEntityForm = {
        id: it.itemId,
        type: it.type || '',
        uomId: it.uomId,
        qty: it.qty,
        price: it.price,
        amount: it.amount,
        main: !it.parentKey,
        categoryId: it.categoryId,
        budgetCode: it.budgetCode,
        discountPercent: it.discountPercent || 0,
      };
      return item;
    }) || [defaultItemEntity];

    const formData: FormDataType = {
      lineItems: list.filter((it) => it.type === data.defaultSaleType?.code),
      offerLineItems: list.filter((it) => it.type !== data.defaultSaleType?.code),
    };

    form.setFieldsValue(formData);
  };

  // const fetchBudgetCode: {label: string, value: string}[] = (saleTypeCode: string) => {
  //     const saleType = data.saleTypes?.find(it => it.code === saleTypeCode)
  //     return data.budgetLess?.find(it => it.saleType === saleType?.id)?.budgets.map(it => ({label: it.name, value: it.code!})) || []
  // }

  const mergeOffers = (
    oldOffers: SoLineItemEntry[],
    newOffers: SoLineItemEntry[]
  ) => {
    const map = new Map<string, SoLineItemEntry>();

    // keep old first
    oldOffers.forEach(o => {
      const key = `${o.id}_${o.type}`;
      map.set(key, o);
    });

    // override with backend response
    newOffers.forEach(o => {
      const key = `${o.id}_${o.type}`;
      map.set(key, {
        ...map.get(key),
        ...o, // backend qty wins
      });
    });

    return Array.from(map.values());
  };

  const onGetOffer = async () => {
    const dataForm = form.getFieldsValue(true);

    const lineItems = dataForm.lineItems?.filter(it => it.id);
    if (!lineItems?.length) return;

    actionHandlers.onLoadOffer?.(lineItems);

    setFocusIn(false);
  };

  // const onGetOffer = async () => {
  //   // if (!loadOffer) return
  //   const dataForm = await form.validateFields();
  //   data.productItem?.mixedProductItemList.filter(
  //     (it) => dataForm.lineItems.find((ti) => ti.id === it.id) === undefined,
  //   );
  //   actionHandlers.onLoadOffer?.(dataForm.lineItems.filter((it) => it.id !== undefined));
  //   setFocusIn(false);
  // };

  const onSaveActionHandler = async () => {
    const dataForm = await form.validateFields();
    //Take key from editted item to use for updating.
    //If key is null, so line item must be new to be addede.
    const main = data.soLineItems?.find((it) => !it.parentKey);
    const mainKey = main?.key || uniqueId('soitem');

    const soItems: SoItemEntry[] = dataForm.lineItems
      .concat(dataForm.offerLineItems || [])
      .map((it) => {
        const item = itemList.find((it1) => it1?.id === it.id);
        if (!item) throw new Error('Item not found.');
        const uom = uomList.find((it1) => it1.id === it.uomId);
        if (!uom) throw new Error('Uom not found.');
        const percentage = (it.discountPercent || 0) / 100;
        const discountAmount = item.price * percentage;
        const totalAmount = it.qty * it.price;

        return {
          id: 0,
          seq: it.main ? main?.seq || data.seq : data.seq + 10,
          key: it.main ? mainKey : uniqueId('soitem'),
          itemId: it.id,
          itemCode: item.code,
          description: item.name,
          uomId: it.uomId,
          uom: uom?.name,
          qty: it.qty,
          price: it.price,
          amount: it.amount,
          discountPercent: it?.discountPercent,
          totalAmount: totalAmount,
          type: it.type,
          parentKey: it.main ? undefined : mainKey,
          categoryId: item.itemCategoryId,
          budgetCode: it.budgetCode,
          discountAmount: discountAmount,
        };
      });

    const mainSoItem = soItems.find((it) => it.parentKey === undefined);
    if (!mainSoItem) throw new Error('Main So item not found.');
    actionHandlers.onAddSoItem?.(soItems);
  };

  return (
    <FormModalComp
      {...props}
      disabled={focusIn}
      okText={data.soLineItems ? 'Update' : 'Add'}
      onResetForm={() => {
        onResetActionHandler();
        onGetOffer();
      }}
      onSubmit={onSaveActionHandler}
    >
      <Spin spinning={loading}>
        <ProForm
          submitter={false}
          form={form}
          // onBlurCapture={async () => {
          //   await onGetOffer();
          //   // setLoadOffer(false)
          // }}
          onValuesChange={(changeValues, values) => {
            //console.log(changeValues);

            //Skip offer item
            // if ('offerLineItems' in changeValues) {
            //     setLoadOffer(false)
            //     return
            // }
            // setLoadOffer(true)

            if (Array.isArray(changeValues.lineItems)) {
              changeValues.lineItems.map((it: any) => {
                if (it !== undefined && 'qty' in it) {
                  setFocusIn(true);
                }
              });
            }
            const { lineItems } = changeValues;
            const newValues = values.lineItems.map(
              (it: { qty: any; id: number; price: number }, idx: string | number) => {
                const qty =
                  'qty' in changeValues && changeValues[idx] !== undefined
                    ? changeValues[idx].qty
                    : it.qty;
                const productItem = data.productItem?.mixedProductItemList.find(
                  (i) => i.id === it.id,
                );
                const isChangedPrice = 'price' in it;
                const total = isChangedPrice ? it.price * qty : (productItem?.price || 0) * qty;
                if (isChangedPrice) {
                  return { ...it, amount: total };
                } else {
                  return {
                    ...it,
                    price: productItem?.price || 0,
                    categoryId: productItem?.itemCategoryId,
                    amount: total,
                  };
                }
              },
            );

            form.setFieldsValue({
              lineItems: newValues.filter((it) => it.id),
            });

            if (Array.isArray(lineItems) && lineItems.length !== values.lineItems.length)
              onGetOffer();
          }}
        >
          <Card size="small" title="Standard Items">
            <Form.List name="lineItems">
              {UIBuilder.createFormListElements1(
                (field) => {
                  return (
                    <>
                      <ProFormText
                        readonly
                        name={[field.name, 'type']}
                        width={200}
                        help={<span />}
                        fieldKey={[field.key, 'type']}
                      />
                      <ProFormSelect
                        placeholder="Product"
                        name={[field.name, 'id']}
                        width="md"
                        fieldProps={{ popupMatchSelectWidth: 300, allowClear: false }}
                        help={<span />}
                        rules={[{ required: true }]}
                        fieldKey={[field.key, 'id']}
                        options={optionList(field.key)}
                      />
                      <ProFormDigit
                        placeholder="Qty"
                        rules={[{ required: true }]}
                        width={100}
                        min={1}
                        help={<span />}
                        proFieldProps={{}}
                        name={[field.name, 'qty']}
                        fieldKey={[field.key, 'qty']}
                      />
                      {/* <ProFormSelect
                                name={[field.name, 'uomId']}
                                fieldKey={[field.fieldKey, 'uomId']}
                                fieldProps={{ defaultActiveFirstOption: true, allowClear: false }}
                                placeholder='UOM'
                                width={100}
                                options={[{ value: 1, label: 'Each' }]} /> */}

                      <ProFormSelect
                        name={[field.name, 'budgetCode']}
                        fieldKey={[field.key, 'budgetCode']}
                        fieldProps={{ defaultActiveFirstOption: true }}
                        placeholder="Budget Code"
                        width={120}
                        allowClear={true}
                        options={data.budgetLess
                          ?.find((it) => it.saleType === data.defaultSaleType?.id)
                          ?.budgets.map((it) => ({ label: it.name, value: it.code! }))}
                      />
                      {/* .map(it => ({value: it.code!!, label:it.name})) */}
                      <ProFormField
                        readonly
                        render={(_, r) => {
                          return numeral(r['value']).format('0%');
                        }}
                        // valueType= { {
                        //     type: 'percent',
                        // }}
                        help={<span />}
                        name={[field.name, 'discountPercent']}
                        fieldKey={[field.fieldKey, 'discountPercent']}
                      />
                      <ProFormField
                        readonly
                        render={(_, r) => {
                          return numeral(r['value']).format('$ 0,0.00000');
                        }}
                        help={<span />}
                        name={[field.name, 'price']}
                        fieldKey={[field.fieldKey, 'price']}
                      />
                      <ProFormField
                        readonly
                        render={(_, r) => {
                          return numeral(r['value']).format('$ 0,0.00000');
                        }}
                        // valueType= { {
                        //     type: 'money',
                        //     locale: 'en-US',
                        //     precision: 6,
                        // }}
                        help={<span />}
                        name={[field.name, 'amount']}
                        fieldKey={[field.fieldKey, 'amount']}
                      />
                    </>
                  );
                },
                (dataList) => {
                  return !(data.productItem?.mixedProductItemList.length === dataList.length - 1);
                },
                (index) => ({
                  id: head(data.productItem?.mixedProductItemList)?.id,
                  qty: 1,
                  uomId: 1,
                  type: data.defaultSaleType?.code,
                  main: false,
                  budgetCode: '',
                }),
                () => {
                  onGetOffer();
                  // const dataForm = await form.validateFields()
                  // console.log(dataForm.lineItems)
                },
                true,
              )}
            </Form.List>
          </Card>
          <Card size="small" title="Offer Item" style={{ marginTop: 10 }}>
            <Form.List name="offerLineItems">
              {UIBuilder.createFormListElements1((field) => {
                return (
                  <>
                    <ProFormText
                      readonly
                      name={[field.name, 'type']}
                      width="md"
                      help={<span />}
                      fieldKey={[field.fieldKey, 'type']}
                    />
                    <ProFormSelect
                      placeholder="Product"
                      name={[field.name, 'id']}
                      width="md"
                      fieldProps={{ popupMatchSelectWidth: 300, allowClear: false }}
                      help={<span />}
                      rules={[{ required: true }]}
                      fieldKey={[field.fieldKey, 'id']}
                      options={itemList.map((it) => ({
                        value: it?.id || 0,
                        label: [it?.code, it?.name].join('-'),
                      }))}
                    />
                    <ProFormDigit
                      placeholder="Qty"
                      rules={[{ required: true }]}
                      width={100}
                      min={1}
                      help={<span />}
                      proFieldProps={{}}
                      name={[field.name, 'qty']}
                      fieldKey={[field.fieldKey, 'qty']}
                    />
                    <ProFormSelect
                      name={[field.name, 'budgetCode']}
                      fieldKey={[field.fieldKey, 'budgetCode']}
                      fieldProps={{ defaultActiveFirstOption: true }}
                      placeholder="Budget Code"
                      width={120}
                      allowClear={true}
                      options={data.budgetLess?.flatMap((it) =>
                        it.budgets.map((ti) => ({ label: ti.code!, value: ti.code! })),
                      )}
                    />
                    <ProFormSelect
                      name={[field.name, 'uomId']}
                      fieldKey={[field.fieldKey, 'uomId']}
                      fieldProps={{ defaultActiveFirstOption: true }}
                      placeholder="UOM"
                      width={100}
                      options={[{ value: 1, label: 'Each' }]}
                    />

                    {/* 
                            <ProFormDigit
                                placeholder='Unit Price'
                                width={150}
                                min={0}
                                rules={[{ required: true }]}
                                help={<span />}
                                name={[field.name, 'price']}
                                fieldKey={[field.fieldKey, 'price']}
                            /> */}
                  </>
                );
              })}
            </Form.List>
          </Card>
        </ProForm>
      </Spin>
    </FormModalComp>
  );
};

export default PackageItemEntry;
