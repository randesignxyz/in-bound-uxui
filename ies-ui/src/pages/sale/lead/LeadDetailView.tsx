import DescriptionDisplay from '@/components/Descriptions';
import { simpleRequestActions } from '@/services/model';
import type { LeadDetail } from '@/services/sale/data';
import { ProForm } from '@ant-design/pro-components';
import { Button, Card, Divider, Row, Space, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import { LeadServiceAPI } from './services';
import { EditOutlined } from '@ant-design/icons';

interface Props {
  onEdit: (data?:LeadDetail) => void;
  id?: number;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const LeadDetailView:React.FC<Props> = ({ id, onEdit }) => {
  const requestActions = simpleRequestActions();
  const services = LeadServiceAPI(requestActions);
  const [lead, setLead] = useState<LeadDetail>();
  const [form] = useForm<LeadDetail>();

  useEffect(() => {
    (async () => {
      if (id) {
        setLead(await services.detailLead(id));
      }
    })();
  }, []);

  const displayItems = [
    { label: 'Shop Name', value: lead?.internalName },
    { label: 'Outlet Type', value: lead?.outletType?.name },
    { label: 'Remark', value: lead?.remark },
    { label: 'First Name', value: lead?.firstName === '' ? 'N/A' : lead?.firstName },
    { label: 'Last Name', value: lead?.lastName === '' ? 'N/A' : lead?.lastName },
    { label: '', value: '' },
    { label: 'Phone Number', value: lead?.phone },
    { label: 'Phone 1', value: lead?.phone1 },
    { label: 'Phone 2', value: lead?.phone2 },
    { label: 'House No', value: lead?.houseNo },
    { label: 'Street No', value: lead?.streetNo },
    { label: 'Street Name', value: lead?.streetName },
    { label: 'Village', value: lead?.village?.name },
    { label: 'District', value: lead?.district?.name },
    { label: 'Commune', value: lead?.commune?.name },
    { label: 'Province', value: lead?.province?.name },
    { label: 'Region', value: lead?.region?.name },
    { label: 'Latitude', value: lead?.latitude },
    { label: 'Longitude', value: lead?.longitude },
  ];

  const displaySalesperson = [
    {
      label: 'Salesperson Name',
      value: `${lead?.salesperson?.salespersonCode} - ${lead?.salesperson?.salespersonName}`,
    },
    {
      label: 'Plate Number',
      value: lead?.salesperson?.vehicle?.plateNumber,
    },
  ];

  return (
    <Spin spinning={requestActions.request?.loading}>
      <ProForm form={form} {...layout} layout="horizontal" submitter={false}>
        <Row justify="end">
          <Space>
            {/* <Button type="default" onClick={() => onAdd?.()}>
              New
            </Button> */}

          </Space>
        </Row>
        <Card
          title={'Customer Info'}
          size="small"
          extra={[
            <Button type="link" onClick={() => onEdit?.(lead)} icon={<EditOutlined/>}>
              Edit
            </Button>
          ]}>
          <DescriptionDisplay data={displaySalesperson} column={2} />
          <Divider />
          <DescriptionDisplay data={displayItems} column={3} />
        </Card>
      </ProForm>
    </Spin>
  );
};

export default LeadDetailView