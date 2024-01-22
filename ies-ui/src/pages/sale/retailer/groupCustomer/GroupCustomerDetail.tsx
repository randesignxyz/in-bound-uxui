import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Row, Space, Switch, Tag } from 'antd';
import { startCase } from 'lodash';
import numeral from 'numeral';
import { useCallback, useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { ItemsPricing } from '../pricing/data';
import { CustomerGroup } from './data';
import { GroupCustomerServiceAPI } from './service';

interface Props {
  onEdit: (id: string) => void;
  id: string;
  //   customer?: GroupCustomer;
}

export default ({ id, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = GroupCustomerServiceAPI(requestActions);
  const [customerGroup, setCustomerGroup] = useState<CustomerGroup>();
  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: SalePaths.groupCustomer,
      label: 'Customer Group',
    },
    {
      path: '',
      label: 'Detail',
    },
  ];

  const displayItems = [
    { label: 'Group Name', value: customerGroup?.name },
    {
      label: 'Status',
      value: customerGroup?.status,
      tag: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
      ),
    },
    {
      label: 'Is Default',
      value: customerGroup?.isDefault ?? false,
      tag: (value: boolean) => <Switch defaultChecked={value} disabled />,
    },
    { label: 'Code', value: customerGroup?.code },
    {
      label: 'Description',
      value: customerGroup?.description,
    },
    { label: 'Created by', value: customerGroup?.createdBy },
    { label: 'Created Date', value: formatDateTime(customerGroup?.createdDate) },
    { label: 'Last modified by', value: formatDateTime(customerGroup?.lastModifiedDate) },
  ];

  const initData = useCallback(async () => {
    if (id) {
      const customerGroup = await services.detailGroupCustomer(id);
      setCustomerGroup(customerGroup);
    }
  }, []);
  useEffect(() => {
    initData();
  }, []);

  return (
    <>
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
      <Card size="small" title="General Info" style={{ marginTop: 10, marginBottom: 10 }}>
        <DescriptionDisplay data={displayItems} column={3} />
      </Card>
      <Card size="small" title="Items Pricing Rule">
        <ProTable<ItemsPricing>
          size="small"
          search={false}
          options={false}
          dataSource={customerGroup?.items}
          columns={[
            {
              title: 'Pricing Code',
              render: (_, r) => {
                return (
                  <Button
                    type="link"
                    onClick={() => {
                      const url = RetailerPath.pricing;
                      history.push(url.concat('/detail/', r.id));
                    }}
                  >
                    {r.code}
                  </Button>
                );
              },
            },
            {
              title: 'Product Item',
              render: (_, r) => {
                return (
                  <Button
                    type="link"
                    onClick={() => {
                      const url = '/retailer/products';
                      history.push(url.concat('/detail/', r.productId ?? ''));
                    }}
                  >
                    {r.productCode?.concat('-', r.productName ?? '')}
                  </Button>
                );
              },
            },
            {
              title: 'Unit Price',
              valueType: 'money',
              render: (_, r) => numeral(r.unitPrice).format('$ 0,0.00'),
            },
            {
              title: 'Discount Price',
              valueType: 'money',
              render: (_, r) =>
                r.discountPrice === undefined ? '' : numeral(r.discountPrice).format('$ 0,0.00'),
            },
            {
              title: 'Status',
              render: (_, r) => {
                return <Tag color={`${r.status ? 'green' : 'red'}`}>{startCase(r.status)}</Tag>;
              },
            },

            {
              title: 'Effective Date',
              render: (_, r) => {
                return formatDate(r.effectiveDate);
              },
            },
            {
              title: 'Expired Date',
              render: (_, r) => {
                return formatDate(r.expiredDate);
              },
            },
          ]}
        />
      </Card>
    </>
  );
};
