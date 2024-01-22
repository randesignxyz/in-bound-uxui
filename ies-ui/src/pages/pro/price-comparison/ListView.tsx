import BaseCrud from '@/components/base-crud';
import Status from '@/components/Status';
import { formatDateTime } from '@/pages/utils';
import { ExportOutlined, PartitionOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { history, useAccess } from '@umijs/max';
import { Button, Checkbox, Flex, Modal, Space, Tooltip, message } from 'antd';
import Link from 'antd/lib/typography/Link';
import { uniq } from 'lodash';
import { useState } from 'react';
import Flow from '../flow';
import {
  PriceComparisonDetail,
  PriceComparisonListItem,
  PriceComparisonSavePayload,
  PriceComparisonSearchParams,
} from './data';
import { PriceComparisonFormNames } from './process-flow/data';
import { createPriceComparisonService } from './service';
import { createQuotationService } from '../quotation/services';

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

export default ({ onAdd }: Props) => {
  const srv = createPriceComparisonService();
  const srvQuote = createQuotationService()
  const [openFlow, setOpenFlow] = useState<PriceComparisonListItem>();
  const access = useAccess();
  const [forceReload, setForceReload] = useState(0)

  const onPosting = (item: PriceComparisonListItem) => {
    Modal.confirm({
      title: "Posting quotations to SAP.",
      content: "Are you sure?",
      onOk: async () => {
        try {
          await srvQuote.postPQs(item.id)
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
      <BaseCrud<
        PriceComparisonListItem,
        PriceComparisonDetail,
        PriceComparisonSearchParams,
        PriceComparisonSavePayload
      >
        services={srv}
        listView={{
          forceReload: forceReload,

          columns: () => [
            {
              title: 'Form No',
              sorter: "formNo",
              render: (_, r) => {
                const sapVendorRequired =
                  r.quotations.map((it) => it.vendorCode && it.selected).filter((it) => it).length == 0 &&
                  r.workflowStatus == 'APPROVED';
                return (
                  <Space>
                    <Button
                      size="small"
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={() => {
                        window
                          .open(
                            `/external/data-form/${PriceComparisonFormNames.processDefKey}/${r.processInstId}`,
                          )
                          ?.focus();
                      }}
                    />
                    <Link
                      type={sapVendorRequired ? 'danger' : undefined}
                      onClick={() => {
                        history.push(
                          `/data-form/${PriceComparisonFormNames.processDefKey}/${r.processInstId}`,
                        );
                      }}
                    >
                      <Tooltip
                        color="red"
                        title={
                          sapVendorRequired &&
                          'Please replace temporary vendor for the right SAP vendor.'
                        }
                      >
                        {r.formNo || 'NA'}
                      </Tooltip>
                    </Link>
                  </Space>
                );
              },
            },
            {
              title: 'Service',
              width: 40,
              align: 'center',
              render: (_, r) => <Checkbox checked={!!r.isService} />,
            },
            {
              title: 'Selected Vendor',
              render: (_, r) => {
                return uniq(r.quotations.filter(it => it.selected).map((it) => it.vendorCode || 'N/A')).join(', ');
              },
            },
            { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
            { title: 'Requested Date', sorter: "requestedDate", render: (_, r) => formatDateTime(r.requestedDate) },

            { title: 'Remarks', dataIndex: 'remarks' },
            { title: 'Comment/Justification', dataIndex: 'justifications' },
            {
              title: 'Workflow Status',
              render: (_, r) => r.workflowStatus && <Status text={r.workflowStatus} />,
            },
            {
              width: 5,
              render: (_, r) => (
                <Flex>
                  <Button type="link" title='View Flow' onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
                  {r.workflowStatus == 'APPROVED' && r.quotations.some(it => (it.integratedStatus || 'FAILED') == 'FAILED') && <Button
                    title='Post all quotations to to SAP' type="link"
                    danger onClick={() => { onPosting(r) }} icon={<UploadOutlined />} />}
                </Flex>
              ),
            },
          ],
          quickSearch: true,

          addNewAction: access.canCreateQC
            ? {
              label: 'Create',
              icon: <PlusOutlined />,
              key: 'new-price-comparison',
              onAddNew: onAdd,
            }
            : undefined,
          statusProps: {
            defaultValue: 'ALL',
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Pending', value: 'REQUESTED' },
              { label: 'In Process', value: 'IN_PROGRESS' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
          },
          subStatusProps: undefined,
          onBeforeSearch: (criteria) => ({
            ...criteria,
            workflowStatus: criteria.status || 'ALL',
            status: undefined,
          }),
        }}
        title={'Price Comparison List'}
      />
      <Flow
        open={!!openFlow}
        onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
        type={'QC'}
        fromId={openFlow?.id || 0}
      />
    </>
  );
};
