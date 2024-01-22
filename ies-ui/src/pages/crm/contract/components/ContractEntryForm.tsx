import FileUploader from '@/components/Attachment/FileUploader';
import { UIBuilder } from '@/components/UIBuilder';
import { SubContractType } from '@/services/crm/contract';
import { CustomerItemLess, IncentiveScheme } from '@/services/crm/data';
import { LookupData, LookupDataItem } from '@/services/data';
import { EditOutlined } from '@ant-design/icons';
import { ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { useState } from 'react';
import { LayoutConfig } from '../model';

export interface ContractEntryFormProps {
  initData?: {
    customer?: CustomerItemLess;
    lookupDataList?: LookupData[];
    productList?: LookupDataItem[];
    itemList?: LookupDataItem[];
    shippingChannelList?: LookupDataItem[];
    subContractTypeList?: SubContractType[];
    incentiveSchemeList?: IncentiveScheme[];
  };
  ebabledAttachment?: true;
  layoutConfig?: LayoutConfig;
  termVisible?: boolean;
  uploadFiles?: UploadFile[];
  actionHandlers?: {
    onSetFiles?: (files: UploadFile[]) => void;
    onClearScheme?: () => void;
  };
}

export const ContractEntryForm: React.FC<ContractEntryFormProps> = ({
  initData,
  layoutConfig,
  ebabledAttachment,
  uploadFiles,
  termVisible,
  actionHandlers,
}) => {
  const [manualScheme, setManualScheme] = useState<boolean>(false);
  return (
    <>
      <Card size="small" title="Basic Info" bordered={false}>
        <Row gutter={10}>
          <Col flex="50%">
            <Form.Item
              help={<span />}
              label="Contract Type"
              name="contractTypeId"
              rules={[{ required: true }]}
            >
              <Select
                style={{ width: '250px' }}
                options={initData?.lookupDataList
                  ?.filter((it) => it.type == 'CONTRACT_TYPE')
                  ?.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
              />
            </Form.Item>
            <Form.Item
              help={<span />}
              rules={[{ required: true }]}
              label="Sub Contract Type"
              name="subContractTypeId"
            >
              <Select
                popupMatchSelectWidth={400}
                style={{ width: '250px' }}
                options={initData?.subContractTypeList?.map((it) => {
                  return { value: it.id, label: [it.budgetCode, it.name].join('-') };
                })}
              />
            </Form.Item>
            <Form.Item label="Customer">
              <Input style={{ width: '250px' }} value={initData?.customer?.name} />
            </Form.Item>
          </Col>
          <Col flex="50%">
            {/* <Form.Item rules={[{ required: true }]} help={<span />} label='Contract Date' name='contractDate'>
                            <DatePicker style={{ width: '200px' }} />
                        </Form.Item> */}
            <Form.Item
              help={<span />}
              label="Contract Start Date"
              name="effectiveDate"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              help={<span />}
              label="Contract End Date"
              name="expiryDate"
              rules={[{ required: true }]}
            >
              <DatePicker picker="month" style={{ width: '200px' }} />
            </Form.Item>
            <ProFormText label="Contract Duration" readonly name="contractDuration" />
          </Col>
        </Row>
      </Card>

      <Card hidden={!termVisible} size="small" title="Sale Terms" bordered={false}>
        {layoutConfig?.showExclusiveProduct && (
          <Form.Item
            labelCol={{ span: 4 }}
            rules={[{ required: true }]}
            label="Exclusive Product"
            name="exclusiveProductIds"
          >
            <Checkbox.Group
              options={initData?.productList?.map((it) => {
                return { value: it.id, label: it.name };
              })}
            ></Checkbox.Group>
          </Form.Item>
        )}

        {layoutConfig?.displayProduct && (
          <Form.Item
            labelCol={{ span: 4 }}
            required={true}
            label="Customer Displays"
            name="customerDisplays"
            rules={[{ required: true }]}
          >
            {UIBuilder.createCheckBoxGroup(
              initData?.lookupDataList
                ?.filter((it) => it.type == 'CUSTOMER_DISPLAY')
                .map((it) => {
                  return { value: it.id, label: it.name };
                }),
            )}
          </Form.Item>
        )}

        {layoutConfig?.displayProduct && (
          <Form.Item labelCol={{ span: 4 }} required={true} label="Display Amount">
            <Form.List name="displayProducts">
              {UIBuilder.createFormListElements(
                (field) => {
                  return (
                    <>
                      <ProFormSelect
                        placeholder="Product"
                        name={[field.name, 'productId']}
                        width="sm"
                        help={<span />}
                        rules={[{ required: true }]}
                        fieldKey={[field.fieldKey, 'productId']}
                        options={UIBuilder.toOption(initData?.productList)}
                      />
                      <ProFormDigit
                        placeholder="Qty"
                        rules={[{ required: true }]}
                        width="sm"
                        help={<span />}
                        name={[field.name, 'qty']}
                        fieldKey={[field.fieldKey, 'qty']}
                      />
                    </>
                  );
                },
                () => true,
              )}
            </Form.List>
          </Form.Item>
        )}

        {layoutConfig?.pos && (
          <Form.Item
            labelCol={{ span: 4 }}
            label="POSM Offered"
            name="displayOfferIds"
            rules={[{ required: true }]}
          >
            {UIBuilder.createCheckBoxGroup(
              initData?.lookupDataList
                ?.filter((it) => it.type == 'OFL_OFFER')
                .map((it) => {
                  return { value: it.id, label: it.name };
                }),
            )}
          </Form.Item>
        )}

        <Form.Item
          help={<span />}
          // initialValue={1501}
          //
          labelCol={{ span: 4 }}
          label="Settlement Plan"
          name="settlementPlanId"
          rules={[{ required: true }]}
        >
          {UIBuilder.createRadioGroup(
            initData?.lookupDataList
              ?.filter(
                (it) =>
                  it.type == 'SETTLEMENT_PLAN' &&
                  (!layoutConfig?.postSettlementOnly || it.id !== 1501),
              )
              .map((it) => {
                return { value: it.id, label: it.name };
              }),
          )}
        </Form.Item>

        <Form.Item
          labelCol={{ span: 4 }}
          name="offerFrequencyId"
          label="Offer Frequency"
          rules={[{ required: true }]}
        >
          {UIBuilder.createRadioGroup(
            initData?.lookupDataList
              ?.filter((it) => it.type == 'OFFER_FREQUENCY')
              .map((it) => {
                return { value: it.id, label: it.name };
              }),
          )}
        </Form.Item>

        {layoutConfig?.showSponsor && (
          <Form.Item labelCol={{ span: 4 }} required={true} label="Monthly Sponsor">
            <Form.List name="sponsorItems">
              {UIBuilder.createFormListElements(
                (field, index) => {
                  return (
                    <>
                      <ProFormSelect
                        name={[field.name, 'itemId']}
                        placeholder="Item (SKU)"
                        width="sm"
                        help={<span />}
                        rules={[{ required: true }]}
                        fieldKey={[field.fieldKey, 'itemId']}
                        options={UIBuilder.toOption(initData?.itemList)}
                      />
                      <ProFormDigit
                        placeholder="Qty"
                        width="sm"
                        help={<span />}
                        rules={[{ required: true }]}
                        name={[field.name, 'qty']}
                        fieldKey={[field.fieldKey, 'qty']}
                      />
                    </>
                  );
                },
                () => true,
              )}
            </Form.List>
          </Form.Item>
        )}

        {layoutConfig?.incentiveScheme && (
          <Form.Item labelCol={{ span: 4 }} label="Incentive Scheme">
            <ProFormSelect
              width="md"
              name="incentiveSchemeId"
              options={initData?.incentiveSchemeList?.map((it) => {
                return { value: it.id, label: it.name };
              })}
              fieldProps={{
                onChange: () => {
                  setManualScheme(false);
                },
                popupMatchSelectWidth: 400,
                dropdownRender: (menu) => (
                  <div>
                    <Button
                      onClick={() => {
                        actionHandlers?.onClearScheme?.();
                        setManualScheme(true);
                      }}
                      icon={<EditOutlined />}
                      type="link"
                    >
                      Manual
                    </Button>
                    {menu}
                  </div>
                ),
              }}
            />

            <ProFormText
              rules={[{ required: true }]}
              readonly={!manualScheme}
              labelCol={{ span: 4 }}
              name="incentiveSchemeTier1"
              label="Tier 1"
            />
            <ProFormText
              readonly={!manualScheme}
              labelCol={{ span: 4 }}
              name="incentiveSchemeTier2"
              label="Tier 2"
            />
            <ProFormText
              readonly={!manualScheme}
              labelCol={{ span: 4 }}
              name="incentiveSchemeTier3"
              label="Tier 3"
            />
            <ProFormText labelCol={{ span: 4 }} name="incentiveSchemeRemarks" label="Remarks" />
          </Form.Item>
        )}
      </Card>

      <Card size="small" title="" bordered={false}>
        <ProFormTextArea labelCol={{ span: 4 }} label="Remarks" name="remarks" />
      </Card>
      {ebabledAttachment && (
        <Card size="small" bordered={false}>
          <FileUploader onSetFiles={actionHandlers?.onSetFiles} />
        </Card>
      )}
    </>
  );
};
