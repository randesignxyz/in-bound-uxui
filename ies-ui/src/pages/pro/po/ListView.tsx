import BaseCrud from '@/components/base-crud';
import Status from '@/components/Status';
import { formatDate, formatDateTime, formatter } from '@/pages/utils';
import { ExportOutlined, PartitionOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { history, useAccess } from '@umijs/max';
import { Button, Checkbox, Flex, Modal, Space, message } from 'antd';
import { useState } from 'react';
import Flow from '../flow';
import {
  PoRequestDetail,
  PoRequestFormNames,
  PoRequestListItem,
  PoRequestSavePayload,
  PoRequestSearchParams,
} from './data';
import { createPoService } from './services';

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

export default ({ onAdd }: Props) => {
  const srv = createPoService();
  const access = useAccess();
  const [openFlow, setOpenFlow] = useState<PoRequestListItem>();
  const [selectedStatus, setSelectedSatus] = useState<string>('ALL');
  const [forceReload, setForceReload] = useState(0)

  const onPostHandler = (item: PoRequestListItem) => {
    Modal.confirm({
      title: 'Post purchase order to SAP',
      content: "Are you sure?",
      onOk: async () => {
        try {
          await srv.postPo(item.id)
          message.success("Successfully posted.")
          setForceReload(v => v + 1)
        } catch (error: any) {
          message.error(error.message || "Failed to post.")
          setForceReload(v => v + 1)
        }

      }
    })
  }
  return (
    <>
      <BaseCrud<PoRequestListItem, PoRequestDetail, PoRequestSearchParams, PoRequestSavePayload>
        services={srv}
        listView={{

          bordered: true,
          forceReload: forceReload,

          columns: () => [
            {
              title: 'Requested Info',

              children: [
                {
                  title: 'Form #',
                  sorter: 'formNo',
                  render: (_, r) => (
                    <Space>
                      <Button
                        size="small"
                        type="link"
                        icon={<ExportOutlined />}
                        onClick={() => {
                          window
                            .open(
                              `/external/data-form/${PoRequestFormNames.processDefKey}/${r.processInstId}`,
                            )
                            ?.focus();
                        }}
                      />
                      <a
                        onClick={() => {
                          history.push(
                            `/data-form/${PoRequestFormNames.processDefKey}/${r.processInstId}`,
                          );
                        }}
                      >
                        {r.formNo || 'NA'}
                      </a>
                    </Space>
                  ),
                },
                { title: 'Requestor', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                { title: 'Requested Date', sorter: 'requestedDate', render: (_, r) => formatDateTime(r.createdDate) },
              ],
            },
            {
              title: 'Purchase order infomation',
              children: [
                {
                  title: 'Service',
                  width: 40,
                  align: 'center',
                  render: (_, r) => <Checkbox checked={!!r.isService} />,
                },
                { title: 'Vendor', sorter: 'vendor', render: (_, r) => [r.vendorCode, r.vendorName].join('-') },
                { title: 'Payment Term', sorter: 'paymentTerm', dataIndex: 'paymentTerm' },
                { title: 'Payment Due', sorter: 'paymentDue', render: (_, r) => formatter.format(r.paymentDue) },
                { title: 'Status', render: (_, r) => <Status text={r.workflowStatus} /> },
              ],
            },
            {
              title: 'SAP Information',
              hideInTable: !['ALL', 'APPROVED'].some((it) => it == selectedStatus),
              children: [
                { title: 'Posted Date', sorter: "postedDate", render: (_, r) => r.postedDate && formatDate(r.postedDate) },
                { title: 'Doc Num', render: (_, r) => r.sapDocNo },
                { title: 'Status', render: (_, r) => r.integratedStatus && <Status text={r.integratedStatus} /> },
              ],
            },
            {
              width: 5,
              render: (_, r) => (
                <Flex>
                  <Button type="link" onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
                  {(['APPROVED'].some(it => it == r.workflowStatus) && (r.integratedStatus || 'FAILED') == 'FAILED') && <Button title='Post purchase order to to SAP' type="link" danger onClick={() => onPostHandler(r)} icon={<UploadOutlined />} />}
                </Flex>

              ),
            },
          ],

          quickSearch: true,
          statusProps: {
            defaultValue: 'ALL',
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'In Process', value: 'IN_PROGRESS' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
          },
          subStatusProps: (status) => {
            status && setSelectedSatus(status);
            return status == 'APPROVED'
              ? {
                defaultValue: 'ALL',
                options: [
                  { label: 'All', value: 'ALL' },
                  { label: 'Posted', value: 'POSTED' },
                  { label: 'Closed', value: 'CLOSED' },
                  { label: 'Canceled', value: 'CANCELED' },
                  { label: 'Failed', value: 'FAILED' },
                ],
              }
              : undefined;
          },
          addNewAction: access.canCreatePO
            ? {
              label: 'New Request',
              icon: <PlusOutlined />,
              key: 'new-request',
              onAddNew: onAdd,
            }
            : undefined,
          onBeforeSearch: (criteria) => ({
            ...criteria,
            workflowStatus: criteria.status || 'ALL',
            status: undefined,
          }),
        }}
        title={'Purchase Order Request'}
      />
      <Flow
        open={!!openFlow}
        onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
        type={'PO'}
        fromId={openFlow?.id || 0}
      />
    </>
  );
};
