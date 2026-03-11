import { Delivery, EditSo, So, SoDeliveryMethod } from '@/services/sale/data';
import { DollarCircleOutlined, EnvironmentOutlined, PaperClipOutlined } from '@ant-design/icons';

import { AddressInfo } from '@/services/crm/data';
import { FooterToolbar, PageContainer, ProForm, ProFormField } from '@ant-design/pro-components';
import { Button, Card, Col, Form, message, Modal, Row, Space, Spin, Tabs } from 'antd';
import { head, sumBy } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { Model } from '../model';
import { DeliveryEntry, SoItemEntry } from '../reducer';
import AttachmentsEntity from './AttachmentsEntity';
import DeliveryItemList from './deliveryitemlist';
import PackageItemEntry from './PackageItemEntry';
import SimpleItemEntry from './SimpleItemEntry';
import SoHeader from './SoHeader';
import ItemList from './SoItemList';

type Props = {
  openInTab?: true;
  type: 'new' | 'edit';
  onBack?: (id?: number) => void;
  id?: number;
  target?: 'PO' | 'GO' | string;
  onMarkTabAsModified?: (modified: boolean) => void;
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const layout1 = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface SummaryAmount {
  subTotal: number;
  discountAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface DeliveryInfo {
  deliveryDate?: moment.Moment;
  deliveryMethod?: SoDeliveryMethod;
  address?: AddressInfo;
  status?: string
}

const EntryForm: React.FC<Props> = ({ type, id, openInTab, onBack, target, onMarkTabAsModified }) => {
  const { state, actions, modals } = Model();
  const { data } = state;
  const [form] = Form.useForm<So>();
  const [formSum] = Form.useForm<SummaryAmount>();
  const [customerId, setCustomerId] = useState<number>();
  const [requiredFields, setRequiredFields] = useState<{
    deliveryDate?: boolean;
    shippingAddress?: boolean;
  }>();
  const [selectedItem, setSelectedItem] = useState<SoItemEntry>();
  const [defaultDelivery, setDefaulDelivery] = useState<DeliveryInfo>();

  useEffect(() => {
    actions.initData();
  }, []);

  //Loading so for edit
  useEffect(() => {
    if (!id) return;
    actions.fetchSo(id);
    actions.loadAttachments(id);
  }, [state.data?.initData, id]);

  //set data for editing
  useEffect(() => {
    if (!state.data?.soDetail) return;
    const { soDetail } = state.data;
    form.setFieldsValue({
      customerId: soDetail.associatedTo.customer.id,
      salespersonId: soDetail.associatedTo.salesperson.id,
      orderDate: soDetail.orderedDate,
      refNo: soDetail.refNo,
      remarks: soDetail.remarks,
      deliveryMethodId: soDetail.associatedTo.deliveryMethod.id,
      deliveryDate: soDetail.deliveryDate,
      shippingAddressId: soDetail.associatedTo.shippingAddress.id,
      address: getAddress(soDetail.associatedTo.shippingAddress.id),
      budgetCode: soDetail.budgetCode,
      distributorId: soDetail.distributor?.id,
    });
    actions.loadSoItems();
    setCustomerId(soDetail.associatedTo.customer.id);
    setDefaulDelivery({
      deliveryMethod: soDetail.associatedTo.deliveryMethod,
      deliveryDate: soDetail.deliveryDate,
      address: data?.initData?.addressList?.find(
        (it) => (it.id = soDetail.associatedTo.shippingAddress.id),
      ),
      status: soDetail.status
    });
  }, [state.data?.soDetail]);

  useEffect(() => {
    if (!customerId) return;
    actions.loadDependencyCustomer(customerId);
    form.resetFields(['address', 'shippingAddressId', 'deliveryDate']);
    actions.clearSoItem();
  }, [customerId]);

  useEffect(() => {
    const defaultAddress = head(state.data?.initData?.addressList);
    form.setFieldsValue({
      shippingAddressId: defaultAddress?.id,
      address: getAddress(defaultAddress?.id || 0),
    });
    setDefaulDelivery((v) => ({ ...v, address: defaultAddress }));
  }, [state.data?.initData?.addressList]);

  useEffect(() => {
    form.setFieldsValue({
      salespersonId: state.data?.customerSaleInfo?.salesperson?.id,
    });
  }, [state.data?.customerSaleInfo?.salesperson]);

  useEffect(() => {
    const subTotal = sumBy(state.data?.soItems, (value) => value.totalAmount);
    const discountAmount = sumBy(state.data?.soItems, (value) => value.discountAmount || 0);
    const vatAmount = subTotal * 0;
    const totalAmount = subTotal + vatAmount;
    formSum.setFieldsValue({
      subTotal: subTotal,
      discountAmount: discountAmount,
      vatAmount: vatAmount,
      totalAmount: totalAmount,
    });
    actions.listTransportationOffer(defaultDelivery?.deliveryMethod);
    return () => { };
  }, [state.data?.soItems]);

  useEffect(() => {
    initialFormData();
  }, [state.data?.initData]);

  const initialFormData = () => {
    onMarkTabAsModified?.(false);
    const deliveryMothod = head(state.data?.initData?.deliveryMethodList);
    form.setFieldsValue({
      orderDate: moment(),
      deliveryMethodId: deliveryMothod?.id,
    });
    setDefaulDelivery((v) => ({ ...v, deliveryMethod: deliveryMothod }));
  };

  const getAddress = (addressId: number) => {
    const address = data?.initData?.addressList?.find((item) => item.id === addressId);
    return [
      { name: 'Street', value: address?.streetNo },
      { name: 'House#', value: address?.houseNo },
      { name: 'Village', value: address?.village },
      { name: 'Commune', value: address?.commune },
      { name: 'District', value: address?.district },
      { name: 'Province', value: address?.province },
      { name: 'Latitude', value: address?.latitude },
      { name: 'Longitude', value: address?.longitude },
      { name: 'Direction', value: address?.direction },
      { name: 'Hotspot', value: address?.hotspot },
    ]
      .filter((it) => it.value)
      .map((it) => `${it.name} ${it.value}`)
      .join(', ');
  };
  const onSaveActionHandler = async (isNew: boolean = false) => {
    try {
      const dataFrom = await form.validateFields();
      const sumData = await formSum.validateFields();
      if (!state.data?.soItems || state.data?.soItems.length === 0) {
        Error('Line item is empty.');
        return;
      }
      if (
        (state.data?.deliveryList?.flatMap((it) => it.itemList).filter((it) => it.qty < 0).length ||
          0) > 0
      ) {
        message.error('Delivery quantity cannot be negative.');
        return;
      }
      Modal.confirm({
        title: 'Save Purchase Order',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            const so = await actions.saveSo({
              id: state.data?.soDetail?.id,
              customerId: dataFrom.customerId,
              salespersonId: dataFrom.salespersonId,
              orderDate: dataFrom.orderDate,
              deliveryMethodId: dataFrom.deliveryMethodId,
              deliveryDate: dataFrom.deliveryDate,
              shippingAddressId: dataFrom.shippingAddressId,
              refNo: dataFrom.refNo,
              remarks: dataFrom.remarks,
              subtotalAmount: sumData.subTotal,
              discountAmount: sumData.discountAmount,
              vatAmount: sumData.vatAmount,
              totalAmount: sumData.totalAmount,
              items: state.data?.soItems,
              deliveries: state.data?.deliveryList as Delivery[],
              budgetCode: dataFrom.budgetCode,
              distributorId: dataFrom.distributorId,
              attachments: state.data?.attachments,
              target: target,
            });
            if (isNew) {
              console.log(so);
              onMarkTabAsModified?.(false);
              onBack?.(so.id);
            } else {
              onMarkTabAsModified?.(false);
              onBack?.();
            }
          } catch (error: any) {
            if (error.message.indexOf('Direct MC') !== -1) message.error(error.message);
            else message.error('Failed to save.');
          }
        },
      });
    } catch (error) {
      message.error('Invalied Data');
    }
  };

  const onEdit = async () => {
    try {
      Modal.confirm({
        title: 'Update Purchase Order',
        content: 'Update date will post to SAP. Are you sure?',
        onOk: async () => {
          try {
            const list = state.data?.deliveryList
              ?.filter(r => r.deliveryId) // keep only rows with deliveryId
              ?.map(r => ({
                deliveryId: r.deliveryId,
                shipDate: typeof r.deliveryDate === "string"
                  ? r.deliveryDate
                  : r.deliveryDate?.toISOString(),
              }))
            const payload = { data: list } as unknown as EditSo

            await actions.editSo(payload);
            onBack?.();
          } catch (error: any) {
            if (error.message.indexOf('Direct MC') !== -1) message.error(error.message);
            else message.error('Failed to save.');
          }
        },
      });

    } catch (error) {
      console.log("error", error);
      message.error("Invalid data");
    }
  };


  const onFormvalueChanged = (changedValues: any, values: So) => {
    onMarkTabAsModified?.(true);
    const { customerId, shippingAddressId, deliveryMethodId, deliveryDate } = changedValues;

    if (customerId && 'customerId' in changedValues) {
      setCustomerId(customerId);
    }

    if (shippingAddressId) {
      form.setFieldsValue({ address: getAddress(shippingAddressId) });
    }

    if ('deliveryMethodId' in changedValues) {
      const ds = state.data?.initData?.deliveryMethodList?.find((it) => it.id === deliveryMethodId);
      setRequiredFields((v) => ({
        ...v,
        deliveryDate: deliveryMethodId === 3,
        shippingAddress: deliveryMethodId !== 10,
      }));
      setDefaulDelivery((v) => ({ ...v, deliveryMethod: ds }));
      actions.listTransportationOffer(ds);
    }

    if ('shippingAddressId' in changedValues) {
      setDefaulDelivery((v) => ({
        ...v,
        address: state.data?.initData?.addressList?.find((it) => it.id === shippingAddressId),
      }));
    }

    if ('deliveryDate' in changedValues) {
      setDefaulDelivery((v) => ({ ...v, deliveryDate: deliveryDate }));
    }
  };

  const dataSources = (): SoItemEntry[] => {
    return actions.getSoItems(state.data?.transportation || [], defaultDelivery?.deliveryMethod);
  };

  const content = (
    <>
      <ProForm
        submitter={{
          render: () => {
            return (
              <FooterToolbar portalDom={false}>
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
                      onBack?.();
                    }}
                  >
                    Back
                  </Button>
                )}
                {type === 'edit' && (
                  <Button
                    onClick={() => {
                      initialFormData();
                    }}
                  >
                    Reset
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => {
                    if (data?.soDetail?.status?.toLowerCase() === 'posted') {
                      onEdit()
                    } else {
                      onSaveActionHandler(type === 'new')
                    }
                  }}
                >
                  {type === 'new' ? 'Save' : 'Update'}
                </Button>
              </FooterToolbar>
            );
          },
        }}
      />
      <Form.Provider>
        <Tabs>
          <Tabs.TabPane
            tab={
              <Space size={0}>
                <DollarCircleOutlined /> <span>Purchase Order</span>
              </Space>
            }
            key="saleOrder"
          >
            <ProForm
              // labelAlign='left'

              layout="horizontal"
              {...layout}
              size="middle"
              submitter={false}
              onValuesChange={onFormvalueChanged}
              form={form}
            >
              <SoHeader
                data={{
                  so: data?.soDetail,
                  addressList: data?.initData?.addressList,
                  salePersonList: data?.initData?.salePersonList,
                  deliveryMethodList: data?.initData?.deliveryMethodList,
                  requiredFields: requiredFields,
                  // budgetCodes: data?.initData?.listBudget,
                  isIndirectCustomer: data?.customerSaleInfo?.isIndirectCustomer,
                  distributors: data?.customerSaleInfo?.distributors,
                }}
              />
            </ProForm>
            <ItemList
              data={{
                lineItemList: dataSources(),
                disabled: customerId === undefined,
                itemList: state.data?.initData?.itemList,
              }}
              actionHandlers={{
                onSelectedItem: (item, auto) => {
                  if (item && customerId) {
                    setSelectedItem(undefined);
                    actions.findProductItem(item.id, customerId, auto);
                  }
                },
                onRemove: (data) => {
                  onMarkTabAsModified?.(true);
                  actions.removeSoItem(data);
                },
                onEdit: (data, auto) => {
                  setSelectedItem(data);

                  if (customerId) actions.findProductItem(data.itemId, customerId, auto);
                  modals.showModal('item-entry');
                },
              }}
            />

            <ProForm
              {...layout1}
              submitter={false}
              // labelAlign='left'
              style={{ fontWeight: 'bolder' }}
              layout="horizontal"
              form={formSum}
            >
              <Card size="small" style={{ marginTop: 10, marginBottom: 20 }}>
                <Row>
                  <Col flex="Auto" />
                  <Col flex="350px">
                    <ProFormField
                      // valueType={{ type: 'money', locale: "en-US" }}
                      render={(_, r) => {
                        return numeral(r['value']).format('$ 0,0.000000');
                      }}
                      label="Sub Total"
                      name="subTotal"
                      readonly
                    />
                    {/* <ProFormField valueType={{ type: 'money', locale: "en-US" }} label='Discount Amount' name='discountAmount' readonly /> */}
                    <ProFormField
                      // valueType={{ type: 'money', locale: "en-US", precision: 6 }}
                      render={(_, r) => {
                        return numeral(r['value']).format('$ 0,0.000000');
                      }}
                      label="VAT Amount"
                      name="vatAmount"
                      readonly
                    />
                    <ProFormField
                      // valueType={{ type: 'money', locale: "en-US", precision: 6 }}
                      render={(_, r) => {
                        return numeral(r['value']).format('$ 0,0.000000');
                      }}
                      label="Total Amount"
                      name="totalAmount"
                      readonly
                    />
                  </Col>
                </Row>
              </Card>
            </ProForm>
          </Tabs.TabPane>
          <Tabs.TabPane
            disabled={
              !defaultDelivery || !defaultDelivery.address || (data?.soItems?.length || 0) <= 0
            }
            tab={
              <Space size={0}>
                <EnvironmentOutlined /> <span>Delivery</span>
              </Space>
            }
            key="delivery"
          >
            <DeliveryItemList
              data={{
                defaultDelivery: defaultDelivery,
                addressList: state.data?.initData?.addressList,
                itemList: state.data?.deliveryList,
              }}
              actionHandlers={{
                onSave: (delivery: DeliveryEntry) => {
                  onMarkTabAsModified?.(true);
                  actions.saveShipping(delivery, defaultDelivery?.deliveryMethod);
                },
                delete: (key: string) => {
                  onMarkTabAsModified?.(true);
                  actions.deleteShipping(key, defaultDelivery?.deliveryMethod);
                },
              }}
            />
          </Tabs.TabPane>
          {/* Attachment Tab */}
          <Tabs.TabPane
            tab={
              <Space size={0}>
                <PaperClipOutlined /> <span>Attachment</span>
              </Space>
            }
            key="attachement"
          >
            <AttachmentsEntity
              attachments={data?.attachments || []}
              isCreated={!id}
              multiple={false}
              actionHandlers={{
                // onAddFile: (file) => {
                //   files[1]((v) => [...v, file]);
                // },
                onAddFile: (file) => {
                  onMarkTabAsModified?.(true);
                  actions.saveAttachment(file);
                },
                onRemoveFile: (file) => {
                  onMarkTabAsModified?.(true);
                  actions.deleteAttachment(file);
                },
                // onRemoveFile: (file) => {
                //   files[1]((v) => v.filter((it) => it.uid !== file.uid));
                // },
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Form.Provider>

      <PackageItemEntry
        width="1050px"
        loading={state.loading}
        title="Product Line Item"
        open={modals.isVisible('item-entry') && state.data?.productItem?.hasOffer}
        onCancel={() => modals.hideModal('item-entry')}
        data={{
          budgetLess: state.data?.initData?.listBudget,
          seq: (state.data?.soItems?.length || 1) * 1000,
          soLineItems:
            selectedItem &&
            state.data?.soItems?.filter(
              (it) => it.key === selectedItem?.key || it.parentKey === selectedItem?.key,
            ),
          productItem: state.data?.productItem,
          packageOffers: state.data?.packageOffer,
          defaultSaleType: state.data?.initData?.lookDataList
            ?.filter((it) => it.type === 'SALE_TYPE')
            .find((it) => it.code === 'STD'),
          saleTypes: state.data?.initData?.lookDataList?.filter((it) => it.type === 'SALE_TYPE'),
        }}
        actionHandlers={{
          onLoadOffer: (data) => {
            if (customerId)
              actions.getOffer({
                customerId: customerId,
                items: data,
              });
          },
          onAddSoItem: (data) => {
            onMarkTabAsModified?.(true);
            actions.saveSoItems(data);
            modals.hideModal('item-entry');
          },
        }}
      />

      <SimpleItemEntry
        loading={state.loading}
        open={modals.isVisible('item-entry') && !state.data?.productItem?.hasOffer}
        onCancel={() => modals.hideModal('item-entry')}
        width="500px"
        documentType={target}
        data={{
          seq: selectedItem?.seq || ((state.data?.soItems?.length || 0) + 1) * 1000,
          productItem: state.data?.productItem,
          soLineItem: selectedItem,
          budgetList: state.data?.initData?.listBudget,
          defaultSaleType: state.data?.initData?.lookDataList
            ?.filter((it) => it.type === 'SALE_TYPE')
            .find((it) => it.code === 'STD'),
          saleTypes: state.data?.initData?.lookDataList?.filter((it) => it.type === 'SALE_TYPE'),
          uomList: state.data?.initData?.uomList,
        }}
        actionHandlers={{
          onAddItem: (data) => {
            onMarkTabAsModified?.(true);
            actions.saveSoItem(data);
            setSelectedItem(undefined);
            modals.hideModal('item-entry');
          },
        }}
      />
    </>
  );

  return openInTab ? (
    <Spin spinning={state.loading}>{content}</Spin>
  ) : (
    <PageContainer title="PO#" subTitle={state.data?.soDetail?.docEntryNum}>
      {content}
    </PageContainer>
  );
};

export default EntryForm;
