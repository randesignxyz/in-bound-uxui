import BaseCrud from '@/components/base-crud';
import Status from '@/components/Status';
import { formatter } from '@/pages/utils';
import { ExportOutlined, PartitionOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { history, useAccess } from '@umijs/max';
import { Button, Checkbox, Modal, Space, Tooltip, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ProPaths } from '..';
import Flow from '../flow';
import {
  QuotationDetail,
  QuotationListItem,
  QuotationSavePayload,
  QuotationSearchParams,
} from './data';
import { createQuotationService } from './services';
import { Flex } from 'antd/lib';

const { Link } = Typography;

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}


export default ({ onAdd }: Props) => {
  const srv = createQuotationService();
  const access = useAccess();
  const [vendorChangeRequired, setVendorChagneRequired] = useState(0);
  const [openFlow, setOpenFlow] = useState<QuotationListItem>();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [forceReload, setForceReload] = useState(0)

  const init = async () => {
    const rs = await srv.getVendorChangedRequired();
    setVendorChagneRequired(rs.data);
  };
  // const actionRef = useRef<ActionType>();
  const onPostQP = (item: QuotationListItem) => {
    Modal.confirm({
      title: 'Post to SAP',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await srv.postPQ(item.id)
          message.success("Successfully posted.")
          setForceReload(v => v + 1)
        } catch (error: any) {
          message.error(error.message || "Failed to post.")
          setForceReload(v => v + 1)
        }
      }
    })
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <BaseCrud<QuotationListItem, QuotationDetail, QuotationSearchParams, QuotationSavePayload>
        services={srv}
        listView={{
          bordered: true,
          forceReload: forceReload,
          statusProps: {
            defaultValue: 'ALL',
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Selected', value: 'SELECTED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Expired', value: 'EXPIRED' },
              { label: 'Void', value: 'VOID' },
            ],
          },

          subStatusProps: (status) => {

            status && setSelectedStatus(status);

            return status == 'SELECTED'
              ? {
                defaultValue: 'ALL',
                options: [
                  { label: 'All', value: 'ALL' },
                  {
                    label: 'Vendor Change Required',
                    disabled: vendorChangeRequired == 0,
                    value: 'VENDOR_CHNAGE_REQUIRED',
                  },
                ],
              }
              : undefined;
          },
          columns: () => [
            {
              title: 'Code #',
              sorter: 'codeNo',
              width: 140,
              render: (_, r) => (
                <Space>
                  <Button
                    size="small"
                    type="link"
                    icon={<ExportOutlined />}
                    onClick={async () => {
                      window.open(`/external/${ProPaths.quotation}/detail/${r.id}`, '_blank')?.focus();
                    }}
                  />
                  <Link
                    onClick={() => history.push(ProPaths.quotation + `/detail/${r.id}`)}
                    type={
                      (r.vendor.id || 0) <= 0 && r.status == 'SELECTED' ? 'danger' : undefined
                    }
                  >
                    <Tooltip
                      color="red"
                      title={
                        (r.vendor.id || 0) <= 0 &&
                        r.status == 'SELECTED' &&
                        'Please replace temporary vendor with SAP vendor.'
                      }
                    >
                      {r.code}
                    </Tooltip>
                  </Link>

                </Space>
              ),
            },
            {
              title: 'Info',
              children: [
                { title: 'Vendor Ref#', width: 130, render: (_, r) => r.refNo },
                {
                  title: 'Service',
                  width: 40,
                  align: 'center',
                  render: (_, r) => <Checkbox checked={!!r.service} />,
                },
                {
                  title: 'Vendor',
                  sorter: 'vendor',
                  render: (_, r) => [r.vendor.code, r.vendor.name].filter((it) => it).join(' - '),
                },
                { title: 'Issued Date', sorter: 'issuedDate', align: 'right', width: 110, dataIndex: 'issuedDate' },
                {
                  title: 'Pay. Due Amt',
                  sorter: 'paymentDueAmount',
                  width: 110,
                  align: 'right',
                  render: (_, r) => formatter.format(r.paymentDue),
                },
                { title: 'Status', render: (_, r) => <Status text={r.status} /> },
              ],
            },

            {
              title: 'SAP Info',
              hideInTable: ['ALL', 'SELECTED', 'REJECTED'].some((it) => it == selectedStatus),
              children: [
                { title: 'Doc #', dataIndex: 'integratedDoc' },
                { title: 'Posted Date', sorter: 'postedDate', dataIndex: 'postedDate' },
                { title: 'Status', render: (_, r) => r.integratedStatus && <Status text={r.integratedStatus} /> }],
            },
            {
              width: 5,
              render: (_, r) => (
                <Flex >
                  <Button type="link" title='View Flow' onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
                  {(['SELECTED', 'REJECTED'].some(it => it == r.status) && (r.integratedStatus || 'FAILED') == 'FAILED') && <Button title='Post quotation to to SAP' type="link" danger onClick={() => onPostQP(r)} icon={<UploadOutlined />} />}
                </Flex>

              ),
            },
          ],
          quickSearch: true,
          addNewAction: access.canCreatePQ
            ? {
              label: 'New Quotation',
              icon: <PlusOutlined />,
              key: 'new-quotation',
              onAddNew: onAdd,
            }
            : undefined,
          onBeforeSearch: undefined,
        }}
        title={'Quotation'}
      />
      <Flow
        open={!!openFlow}
        onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
        type={'PQ'}
        fromId={openFlow?.id || 0}
      />
    </>
  );
};
