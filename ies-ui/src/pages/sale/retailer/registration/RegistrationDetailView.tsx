import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { LookupData } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { history } from '@umijs/max';
import { Button, Card, message, Row, Space, Tag } from 'antd';
import { join, startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import ApproveFormModal from '../components/ApproveFormModal';
import BreadCrumbCom from '../components/BreadCrumbCom';
import RemarkFormModal from '../components/RemarkFormModal';
import { RegistrationForm } from './data';
import { RegistrationFormAPI } from './services';

interface Props {
  // onEdit: (id: string) => void;
  id: string;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = RegistrationFormAPI(requestActions);
  const [registration, setRegistration] = useState<RegistrationForm>();
  const [commentModal, setCommentModal] = useState<{ visible: boolean; id?: string }>({
    visible: false,
    id: undefined,
  });
  const [customerTypes, setCustomerTypes] = useState<LookupData[]>([]);
  const [approveModal, setApproveModal] = useState<{
    visible: boolean;
    // customerNo?: string;
    // customerType?: string;
    id?: string;
  }>({
    visible: false,
  });
  // const [form] = useForm<RegistrationForm>();

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          setRegistration(await services.detailRegistration(id).query(requestActions));
          const rs = await MultiRequest<{
            customerTypes: LookupData[];
          }>([services.listLookupData.queryParams])(requestActions);
          const result = rs.customerTypes.filter((it) => it.code.toLowerCase() !== 'other');
          const it = {
            id: -1,
            code: 'ALL',
            name: 'All',
            type: 'CUSTOMER_TYPE',
          } as LookupData;
          result.unshift(it);
          setCustomerTypes(result);
        } catch (e) {
          message.error(e);
        }
      }
    })();
  }, []);

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.registration}/list`,
      label: 'Registrations',
    },
    {
      path: '',
      label: 'Detail',
    },
  ];

  const displayItems = [
    { label: 'Business Name', value: registration?.businessName },
    {
      label: 'Status',
      value: registration?.status,
      tag: (status: string) => (
        <Tag color={status === 'pending' ? 'default' : status === 'approved' ? 'green' : 'red'}>
          {startCase(status)}
        </Tag>
      ),
    },
    { label: 'Request Date', value: formatDateTime(registration?.createdDate) },
    { label: 'Business Owner', value: registration?.businessOwner },
    { label: 'Reference No', value: registration?.customerNo },
    // {
    //   label: 'Customer Name',
    //   value: `${registration?.customer?.firstName} ${registration?.customer?.lastName}`,
    // },
    // { label: 'Customer No', value: registration?.customerNo },
    // { label: 'Customer Phone', value: registration?.phone },
  ];

  const displayCustomer = [
    {
      label: 'First Name',
      value: registration?.customer?.firstName,
      onClick: () => history.push(`${RetailerPath.customer}/detail/${registration?.customer?.id}`),
    },
    { label: 'Last Name', value: registration?.customer?.lastName },
    { label: 'Phone', value: registration?.customer?.phone },
    {
      label: 'Status',
      value: registration?.customer?.status,
      tag: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
      ),
    },
    {
      label: 'Type',
      value: registration?.customer?.type,
      tag: (type: string) => (
        <Tag
          color={
            type.toLowerCase() === 'direct'
              ? 'green'
              : type.toLowerCase() === 'default'
              ? 'default'
              : 'warning'
          }
        >
          {type}
        </Tag>
      ),
    },
    { label: 'Modified by', value: registration?.customer?.lastModifiedBy },
    { label: 'Modified date', value: formatDate(registration?.customer?.lastModifiedDate) },
    {
      label: 'Customer Group',
      value: registration?.customer?.customerGroup?.name,
      onClick: () =>
        history.push(
          `${RetailerPath.customergroup}/detail/${registration?.customer?.customerGroup?.id}`,
        ),
    },
  ];

  const displayRemark = [{ label: 'Remark', value: registration?.remark }];
  const displayItemsAddress = [{ label: 'Address', value: registration?.address }];
  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
        <Space>
          <Button
            type="default"
            style={{ backgroundColor: 'red', color: 'white' }}
            onClick={() => {
              setCommentModal({ visible: true, id: registration?.id });
            }}
          >
            Reject
          </Button>
          {['pending', 'reject'].indexOf(registration?.status ?? '') !== -1 && (
            <Button
              type="primary"
              onClick={() => {
                setApproveModal({
                  visible: true,
                  // customerNo: registration?.customerNo,
                  // customerType: registration?.customer?.customerGroupId,
                  id: registration?.id,
                });
              }}
            >
              Approved
            </Button>
          )}
        </Space>
      </Row>
      <Card size="small" title="General Info" style={{ marginTop: 8.0 }}>
        <DescriptionDisplay data={displayItems} column={3} />
        <DescriptionDisplay data={displayItemsAddress} column={1} />
        <DescriptionDisplay data={displayRemark} column={1} />
      </Card>
      {registration?.customer && (
        <Card size="small" title="Customer Info" style={{ marginTop: 8.0 }}>
          <DescriptionDisplay data={displayCustomer} column={3} />
        </Card>
      )}
      {/* {registration?.customerNo && (
        <Card size="small" title="Reference Info" style={{ marginTop: 8.0 }}></Card>
      )} */}

      <RemarkFormModal
        title="Reject Registration Form"
        open={commentModal.visible}
        onCancel={() => {
          setCommentModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark) => {
          console.log(remark);
          const response: { data: string; message: string } =
            (await services.updateStatusSuggestion({
              id: id,
              remark: remark,
              status: 'reject',
              customerType: 'Default',
              customerNo: '',
            })) as { data: string; message: string };
          setCommentModal({ visible: false, id: undefined });
          message.info(response.message);
          setRegistration(await services.detailRegistration(id).query(requestActions));
        }}
        id={commentModal.id ?? ''}
      />

      <ApproveFormModal
        open={approveModal.visible}
        customerTypes={customerTypes}
        actionHandler={{
          onCancel: () => {
            setApproveModal({ visible: false, id: undefined });
          },
          onOk: async (remark, customerType, it, customerGroupId) => {
            const response: { data: string; message: string } =
              (await services.updateStatusSuggestion({
                id: approveModal.id ?? '',
                status: 'approved',
                customerType: customerType,
                customerNo: join([it?.code, it?.name], ' - '),
                remark: remark,
                customerGroupId: customerGroupId,
              })) as { data: string; message: string };
            // console.log(selectedCustomerGroup);
            // console.log(it);
            message.info(response.message);
            setApproveModal({
              visible: false,
              id: undefined,
            });
            setRegistration(await services.detailRegistration(id).query(requestActions));
          },
        }}
      />
    </>
  );
};
