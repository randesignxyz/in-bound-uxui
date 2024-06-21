import AttachedFileList from '@/components/Attachment/AttachedFileList';
import RemarkModalV2 from '@/components/remark-modal-v2';
import Status from '@/components/Status';
import { formatDate, formatter, formatterPercentage, toReadable } from '@/pages/utils';
import { CheckOutlined, CopyOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PartitionOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Button, Checkbox, Flex, Form, Input, message, Modal, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import ChangeVendorForm from './ChangeVendorForm';
import { PrItem, QuotationDetail, QuotationItemtDetail } from './data';
import { createQuotationService } from './services';
import Flow from '../flow';
import { downloadReport } from '@/services/apiGateway';
import moment from 'moment';
import { simpleRequestActions } from '@/services/model';

export default ({
  id,
  openInTab,
  onBack,
  onEdit,
  onAdd,
}: {
  id?: number;
  openInTab?: true;
  onBack?: () => void;
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}) => {
  const srv = createQuotationService();
  const [data, setData] = useState<QuotationDetail>();
  const [openFlow, setOpenFlow] = useState<number>()
  const initData = async () => {
    if (id) {
      try {
        const rs = await srv.fetchItem(id);
        setData(rs);
      } catch (error: any) {
        message.error(error.message || 'Failed to fetch data.');
      }
    }
  };
  useEffect(() => {
    initData();
  }, []);

  const onVoidHandler = async (remarks: string) => {
    try {
      await srv.void(data?.id!!, remarks);
      initData();
      message.success("Successfully voided.")
      return true;
    } catch (error: any) {
      message.error(error.messge || 'Failed to void.');
      return false;
    }
  };

  const onSelectHandler = async (remarks: string) => {
    try {
      await srv.select(data?.id!!, remarks);
      initData();
      try {
        await srv.postPQ(data?.id!!)
      } catch (error: any) {
        message.error(error.message || 'Failed to post to SAP.');
        return false;
      }

      message.success("Successfully selected.")
      return true;
    } catch (error: any) {
      message.error(error.message || 'Failed to select.');
      return false;
    }
  };

  const onPostQP = (item: QuotationDetail) => {
    Modal.confirm({
      title: 'Post to SAP',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await srv.postPQ(item.id)
          message.success("Successfully posted.")
          initData();
        } catch (error: any) {
          message.error(error.message || "Failed to post.")
        }
      }
    })
  }

  const linkPR = (records: QuotationItemtDetail) => {
    return (
      <Table<PrItem>
        size="small"
        rowKey={'id'}
        pagination={false}
        dataSource={records?.item?.prItems?.filter((it) =>
          records.prLinked.some((i) => i == it.id),
        )}
        columns={[
          {
            title: 'Form No',
            render: (_, r) => (
              <a
                onClick={() => {
                  window
                    .open(
                      `./../../../data-form/requisition_request_process/${r?.processInstId}`,
                      '_blank',
                    )
                    ?.focus();
                }}
              >
                {r.formNo}
              </a>
            ),
          },
          { title: 'Doc No', render: (_, r) => r.docNo },
          { title: 'Requested By', render: (_, r) => r.requestedBy },

          { title: 'Qty', align: 'right', render: (_, r) => r.qty },
          { title: 'uom', render: (_, r) => r.uom },
        ]}
      />
    );
  };


  const actionButtons = <Space>
    {data?.status == 'PENDING' && (
      <RemarkModalV2
        required
        confirm
        title="Void Quotation"
        trigger={
          <Button type="link" danger icon={<DeleteOutlined />}>
            Void
          </Button>
        }
        item={{
          id: data.id,
        }}
        onSave={(_, remarks) => onVoidHandler(remarks!)}
      />
    )}

    {data?.status == 'PENDING' && (
      <RemarkModalV2
        required
        confirm
        title="Select Quotation"
        trigger={
          <Button type="link" icon={<CheckOutlined />}>
            Select
          </Button>
        }
        item={{
          id: data.id,
        }}
        onSave={(_, remarks) => onSelectHandler(remarks!)}
      />
    )}

    {(['SELECTED', 'REJECTED'].some(it => it == data?.status) && (data?.integratedStatus || 'FAILED') == 'FAILED') &&
      <Button danger type="link" icon={<UploadOutlined />} onClick={() => data && onPostQP(data)}>
        Post To SAP
      </Button>}
    <Button type="link" icon={<PartitionOutlined />} onClick={() => id && setOpenFlow(id)}>
      Flow
    </Button>

    {data?.status == 'PENDING' && (
      <Button type="link" icon={<EditOutlined />} onClick={() => id && onEdit?.(id)}>
        Edit
      </Button>
    )}
    <Button type="link" icon={<CopyOutlined />} onClick={() => onAdd?.(id)}>
      Copy
    </Button>
    {/* <Button type="link" icon={<PlusOutlined />} onClick={() => onAdd?.()}>
      New
    </Button> */}
    {/* {(data?.integratedStatus || 'FAILED') != 'FAILED' && <Button loading={action.request?.loading || false} type='link' onClick={async () => {

    try {
      await downloadReport<{ processInstId: string; processDefKey: string; }>(action)({
        reportName: 'export-form',
        fileName: `${data?.code}_${moment().toDate().toDateString()}`,
        type: 'PDF',
        data: {
          processDefKey: 'quotation-form',
          processInstId: `${data?.id}-${data?.code}`
        }
      })
    } catch (error: any) {
      message.error(error.message || 'Failed to export data.')
    }
  }} icon={<ExportOutlined />}>Export</Button>} */}
  </Space>
  const content = data && <Space direction="vertical" style={{ width: '100%' }}>
    <ProCard
      bordered
      style={{ marginBlockStart: 8 }}
      direction="row"
      size="small"
      title={'Genernal'}
      extra={openInTab && actionButtons}
    >
      <Flex justify="space-between">
        <Flex style={{ width: 700 }}>
          <ProDescriptions<QuotationDetail>
            dataSource={data}
            column={2}
            columns={[
              {
                title: 'Vendor',

                render: (_, r) => (
                  <Space.Compact>
                    {[r.vendor.code, r.vendorName].filter((it) => it).join('-')}
                    {(r.vendor.id || 0) < 0 && r.status == 'SELECTED' && (
                      <ChangeVendorForm
                        trigger={
                          <Button danger size="small" type="link" icon={<EditOutlined />} />
                        }
                        quotationId={data.id}
                        onRefresh={() => {
                          initData();
                        }}
                      />
                    )}
                  </Space.Compact>
                ),
              },
              { title: 'Contact Person', render: (_, r) => r.contactPerson },
              { title: 'Phone1', render: (_, r) => r.phone1 },
              { title: 'Phone2', render: (_, r) => r.phone2 },
              { title: 'Mail', render: (_, r) => r.mail },
              { title: 'Address', render: (_, r) => r.address },
              { title: 'Payment Group', render: (_, r) => r.paymentGroup },
              { title: 'Vendor Ref No', render: (_, r) => r.refNo },
              { title: 'Issued Date', render: (_, r) => formatDate(r.issuedDate) },
              { title: 'Required Date', render: (_, r) => formatDate(r.requiredDate) },
              { title: 'Service', render: (_, r) => <Checkbox checked={r.service} /> },

            ]}
          />
        </Flex>
        <Flex style={{ width: 400 }}>
          <ProDescriptions<QuotationDetail>
            dataSource={data}
            column={1}
            columns={[
              { title: 'Delivery Lead Time', dataIndex: 'leadTime' },
              { title: 'Warranty', dataIndex: 'warranty' },
              { title: 'Trade Term', dataIndex: 'tradeTerms' },
              { title: 'Specifications', dataIndex: 'specifications' },
              {
                title: 'Void Remarks',
                hideInDescriptions: !data.voidReason,
                render: (_, r) => r.voidReason,
              },

              {
                title: 'Status',
                render: (_, r) => <Status value={r.status} text={toReadable(r.status)} />,
              },
              { title: 'Select Remarks', render: (_, r) => r.selectRemarks, hideInDescriptions: !data?.selectRemarks }
            ]}
          />
        </Flex>
      </Flex>
    </ProCard>
    <ProCard
      bordered
      size="small"
      direction="column"
      title={`${data.service ? 'Sevice List' : 'Item List'}`}
    >
      <Table<QuotationItemtDetail>
        dataSource={data.items}
        rowKey={'id'}
        pagination={false}
        expandable={{
          expandedRowRender: linkPR,
          rowExpandable: (record) => record.prLinked.length > 0,
        }}
        size="small"
        columns={
          data.service
            ? [
              { title: 'No', dataIndex: 'no' },
              { title: 'Service', dataIndex: 'itemName' },
              { title: 'Description', dataIndex: 'description' },
              {
                title: 'Amount',
                width: 150,
                align: 'right',
                render: (_, r) => formatter.format(r.amount),
              },
              {
                title: 'Discount (%)',
                width: 130,
                align: 'right',
                render: (_, r) =>
                  r.discountPercentage != undefined
                    ? formatterPercentage.format(r.discountPercentage / 100)
                    : '',
              },
              {
                title: 'Amt. After Discount',
                align: 'right',
                width: 150,
                render: (_, r) => formatter.format(r.amountAfterDiscount),
              },
              { title: 'Remarks', dataIndex: 'remarks' },
            ]
            : [
              { title: 'No', dataIndex: 'no' },
              { title: 'Item Code', dataIndex: 'itemCode' },
              { title: 'item Name', dataIndex: 'itemName' },
              { title: 'Description', dataIndex: 'description' },
              { title: 'Qty', width: 100, align: 'right', dataIndex: 'qty' },
              { title: 'UoM', width: 100, dataIndex: 'uomName' },
              {
                title: 'Price',
                width: 150,
                align: 'right',
                render: (_, r) => formatter.format(r.price),
              },
              {
                title: 'Amount',
                width: 150,
                align: 'right',
                render: (_, r) => formatter.format(r.amount),
              },
              {
                title: 'Discount (%)',
                width: 120,
                align: 'right',
                render: (_, r) =>
                  r.discountPercentage != undefined
                    ? formatterPercentage.format(r.discountPercentage / 100)
                    : '',
              },
              {
                title: 'Amt. After Discount',
                width: 150,
                align: 'right',
                render: (_, r) => formatter.format(r.amountAfterDiscount),
              },
              { title: 'Remarks', dataIndex: 'remarks' },
            ]
        }
        footer={() => (
          <ProCard>
            <ProCard size="small">
              <ProDescriptions<QuotationDetail>
                dataSource={data}
                column={1}
                columns={[
                  {
                    title: 'Buyer',
                    render: (_, r) =>
                      [r.buyer?.code, r.buyer?.name].filter((it) => it).join(' - '),
                  },
                  {
                    title: 'Owner',
                    render: (_, r) =>
                      [r.owner?.code, r.owner?.name].filter((it) => it).join(' - '),
                  },
                  { title: 'Remarks', dataIndex: 'remarks' },
                ]}
              />
            </ProCard>
            <ProCard size="small" colSpan={'500px'}>
              <Form
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
                style={{ maxWidth: 600 }}
              >
                <Form.Item
                  style={{ fontWeight: 'bolder' }}
                  label="Total Amount Before Discount"
                >
                  <Input value={formatter.format(data.totalAmount)} />
                </Form.Item>
                <Form.Item label="Discount">
                  <Space.Compact>
                    <Input
                      style={{
                        width: '30%',
                      }}
                      value={
                        data.discountPercentage != undefined
                          ? formatterPercentage.format(data.discountPercentage / 100)
                          : ''
                      }
                    />
                    <Input
                      style={{
                        width: '70%',
                      }}
                      value={
                        data.discountAmount != undefined
                          ? formatter.format(data.discountAmount)
                          : ''
                      }
                    />
                  </Space.Compact>
                </Form.Item>
                <Form.Item label="Tax">
                  <Input style={{
                    width: '30%',
                  }} value={data.tax != undefined ? formatterPercentage.format(data.tax / 100) : ''} />
                </Form.Item>
                <Form.Item style={{ fontWeight: 'bolder' }} label="Total Payment Due">
                  <Input value={formatter.format(data.paymentDue)} />
                </Form.Item>
              </Form>
            </ProCard>
          </ProCard>
        )}
      />
    </ProCard>
    {(data.attachmentFiles?.length || 0) > 0 && (
      <AttachedFileList
        readonly={true}
        title="Attachment Files"
        removeButton={false}
        initFiles={
          data.attachmentFiles?.map((it) => ({ activity: 'Upload', fileId: it })) || []
        }
      />
    )}
  </Space>
  return (
    <>
      {openInTab ? content : <PageContainer
        // onBack={onBack}
        title="Quotation"
        subTitle={data?.code}
        loading={srv.requestAction.request?.loading || false}
        extra={actionButtons}
      >
        {content}
      </PageContainer>}
      <Flow
        open={!!openFlow}
        onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
        type={'PQ'}
        fromId={openFlow || 0}
      />
    </>
  );
};
