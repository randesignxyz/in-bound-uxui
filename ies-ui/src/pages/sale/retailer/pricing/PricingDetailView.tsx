import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { Button, Card, Row, Space, Spin, Tag } from 'antd';
import { startCase } from 'lodash';
import numeral from 'numeral';
import { useCallback, useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import type { ItemsPricing } from './data';
import { PricingServiceAPI } from './services';

interface Props {
  onEdit: (id: string) => void;
  onAdd?: () => void;
  id: string;
}

export default ({ onEdit, id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = PricingServiceAPI(requestActions);
  const [pricing, setPricing] = useState<ItemsPricing>();

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
      path: '',
      label: 'Detail',
    },
  ];

  const initData = useCallback(async () => {
    if (id) {
      const pricing = await services.detailPricing(id);
      setPricing(pricing);
    }
  }, []);
  useEffect(() => {
    initData();
  }, []);

  const displayItems = [
    { label: 'Pricing Code', value: pricing?.code },
    //{ label: 'Pricing Type', value: pricing?.pricingType },
    {
      label: pricing?.pricingType === 'customer' ? 'Customer' : 'Customer Group',
      value: pricing?.referenceName,
    },
    {
      label: 'Status',
      value: pricing?.status,
      tag: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
      ),
    },

    { label: 'Product Code', value: pricing?.productCode },
    { label: 'Product Name', value: pricing?.productName },
    { label: 'Created By', value: pricing?.createdBy },

    { label: 'Unit Price', value: numeral(pricing?.unitPrice).format('$ #,#.00') },
    { label: 'Discount Price', value: numeral(pricing?.discountPrice).format('$ #,#.00') },
    { label: 'Created Date', value: formatDateTime(pricing?.createdDate) },

    { label: 'Effective Date', value: formatDate(pricing?.effectiveDate) },
    { label: 'Expire Date', value: formatDate(pricing?.expiredDate) },
    { label: 'Last modified By', value: pricing?.lastModifiedBy },
    { label: 'Last modified Date', value: formatDateTime(pricing?.lastModifiedDate) },
  ];

  return (
    <>
      <Spin spinning={requestActions.request?.loading}>
        <Row justify="space-between">
          <BreadCrumbCom separator=">" routes={routes} />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                onEdit?.(id);
              }}
            >
              Edit
            </Button>
          </Space>
        </Row>
        <Card title="General Info" size="small" style={{ marginTop: 10 }}>
          <DescriptionDisplay data={displayItems} column={3} />
        </Card>
      </Spin>
    </>
  );
};
