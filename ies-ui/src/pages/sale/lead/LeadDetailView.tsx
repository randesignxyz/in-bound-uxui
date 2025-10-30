import DescriptionDisplay from '@/components/Descriptions';
import { simpleRequestActions } from '@/services/model';
import type { LeadDetail } from '@/services/sale/data';
import { ProDescriptions, ProForm, ProList } from '@ant-design/pro-components';
import { Button, Card, Divider, Flex, message, Modal, Row, Space, Spin, Tag, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import { LeadServiceAPI } from './services';
import { CheckCircleOutlined, CheckSquareOutlined, EditOutlined, FileDoneOutlined } from '@ant-design/icons';
import RemarkModal from './RemarkModal';
import ActivityLog from '@/components/ActivityLog';
import ImagePreview from '@/components/ImagePreview';

interface Props {
  onEdit: (data?: LeadDetail) => void;
  id?: number;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const LeadDetailView: React.FC<Props> = ({ id, onEdit }) => {
  const requestActions = simpleRequestActions();
  const services = LeadServiceAPI(requestActions);
  const [lead, setLead] = useState<LeadDetail>();
  useEffect(() => {
    (async () => {
      if (id) {
        setLead(await services.detailLead(id));
      }
    })();
  }, []);

  const [remarkState, setRemarkState] = useState<{
    visible?: { state: boolean, payload: any }
  }>()

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
    <>

      <Flex gap={12} vertical>
        <Card size='small' title={"Saleperson"}
          extra={[
            <Button type="link" onClick={() => onEdit?.(lead)} icon={<EditOutlined />}>
              Edit
            </Button>,
            <Button type="link"
              onClick={() => setRemarkState({ visible: { state: true, payload: lead } })}
              hidden={lead?.isVerified}
              icon={<FileDoneOutlined />}>
              Verfied
            </Button>
          ]}
        >
          <ProDescriptions
            dataSource={lead?.salesperson}
            loading={requestActions.request?.loading}

            contentStyle={{
              fontWeight: 500
            }}
            columns={[
              {
                title: "Saleperson",
                render: (_, r) => [r.salespersonCode, r.salespersonName].filter(p => p).join(" - ")
              },
              {
                title: "Phone Number",
                render: (_, r) => <Typography.Text type='warning'>{r.phoneNumber}</Typography.Text>
              },
              {
                title: "Plate Number",
                render: (_, r) => r.vehicle?.plateNumber
              },
            ]}
          />
        </Card>
        <Card size='small' title={<Space align='end'>
          <Typography.Text>Customer Information</Typography.Text>
          <Space hidden={!lead?.isVerified} style={{ color: "#4aae4d" }} size={2}>
            <CheckCircleOutlined />
            Verified
          </Space>
        </Space>}>
          <ProDescriptions
            loading={requestActions.request?.loading}
            contentStyle={{
              fontWeight: 500
            }}
            dataSource={lead}
            columns={[
              {
                title: "Code",
                render: (_, r) => r.leadCode ? r.leadCode : "N/A"
              },
              {
                title: "Shop Name",
                dataIndex: "internalName"
              },
              {
                title: "Ownere Name",
                render: (_, r) => [r.firstName, r.lastName].filter(o => o).join(" ")
              },
              {
                title: "Phone",
                render: (_, r) => <Typography.Text type='warning'>{[r.phone, r.phone1, r.phone2].filter(p => p).join(" / ")}</Typography.Text>
              },
              {
                title: "Outlet Type",
                render: (_, r) => <Tag color='blue'>{lead?.outletType?.name}</Tag>,
                span: 2
              },
              {
                valueType: "divider",
                span: 3,
              },
              {
                title: "House No",
                dataIndex: "houseNo"
              },
              {
                title: "Street No",
                dataIndex: "streetNo"
              },
              {
                title: "Street Name",
                dataIndex: "streetName"
              },
              {
                title: "Village",
                dataIndex: "streetName",
                render: (_, r) => lead?.village?.name
              },
              {
                title: "Commune",
                dataIndex: "streetName",
                render: (_, r) => lead?.commune?.name
              },
              {
                title: "District",
                dataIndex: "streetName",
                render: (_, r) => lead?.district?.name
              },
              {
                title: "Province",
                render: (_, r) => lead?.province?.name,

              },
              {
                title: "Region",
                render: (_, r) => lead?.region?.name,
                span: 2
              },
              {
                title: "Latitude",
                render: (_, r) => lead?.latitude,
              },
              {
                title: "Longitude",
                render: (_, r) => lead?.longitude,
              },
            ]}
          />
        </Card>
        <Card>
          <ProList
            dataSource={lead?.logs}
            metas={{
              title: {
                dataIndex: "activityType"
              },
              subTitle: {
                dataIndex: "login"
              },
              description: {
                render: (_, r) => <Space >
                  <Typography.Text type='secondary'>{r.remarks}</Typography.Text>
                  <Space>
                    {r.attached?.split(",")?.map(p => {
                      return p ?
                        <ImagePreview
                          height={50}
                          fileId={p}
                        />
                        : <></>
                    })}
                  </Space>
                </Space>
              },
              actions: {
                dataIndex: "activityDate",
                valueType: "date"
              }
            }}

          />
        </Card>
      </Flex>

      <RemarkModal
        open={remarkState?.visible?.state}
        modalProps={{
          onCancel: () => setRemarkState({ visible: undefined })
        }}
        onSave={async (data) => {
          Modal.confirm({
            title: "Confirmation", // ✅ Title shown at the top
            content: "Are you sure you want to verify this lead?", // ✅ Content message
            okText: "Yes, Verify",
            cancelText: "Cancel",
            onOk: async () => {
              await services.verified({
                ...data,
                id: lead?.id
              });
              message.success("Success!");
              setRemarkState({ visible: undefined });
            },
          });
        }}
      />
    </>
  );
};

export default LeadDetailView