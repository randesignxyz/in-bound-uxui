import { formatDate, formatter } from '@/pages/utils';
import { LookupDataItem } from '@/services/data';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Card, Checkbox, Flex, message, Popconfirm, Space, Table, Typography } from 'antd';
import Link from 'antd/lib/typography/Link';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { QuotationDetail } from '../quotation/data';
import { createQuotationService } from '../quotation/services';
import { PriceComparisonDetail, PriceComparisonItemRs1 } from './data';
import { PriceOfferType, SummaryTypes } from './DataEntryView';
import { createPriceComparisonService } from './service';

export default ({
  instanceId,
  setAttachFiles,
  onSet,
  forceReload
}: {
  instanceId: string;
  forceReload?: number;
  onSet: (data: PriceComparisonDetail) => void;
  setAttachFiles: (files: string[]) => void;
}) => {
  const srv = createPriceComparisonService();
  const [data, setData] = useState<PriceComparisonDetail>();
  const [vendors, setVendors] = useState<LookupDataItem[]>();
  const [quotationDetails, setquoationDetails] = useState<QuotationDetail[]>([]);
  const quotationService = createQuotationService();
  const [valCols, setValCols] = useState(0);

  const fetchDetail = async (ids: number[]) => {
    try {
      const rs = await quotationService.fetchItems(ids);
      setquoationDetails(rs);
      return rs;
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data.');
    }
  };

  const colspanHeader1 = data?.isService ? 4 : 6;
  const colspanHeader2 = data?.isService ? 2 : 3;

  const offerComparisons: { label: string; value: PriceOfferType; id: number }[] = [
    { label: '1st Offer Price', value: 'first', id: 1 },
    { label: 'Last Offer Price', value: 'last', id: 0 },
  ];

  const initData = async () => {
    const rs = await srv.fetchProcessInstance(instanceId);

    const vendors = rs.items.flatMap((it) =>
      it.items
        .filter((it1) => it1.priceOffer == 1)
        .flatMap(
          (it1) =>
            ({ id: it1.vendorId, code: it1.vendorCode, name: it1.vendorName } as LookupDataItem),
        ),
    );
    setValCols(rs.items.find((it) => it)?.items.length || 0);
    setAttachFiles(rs.attachedFiles);
    setData(rs);
    onSet(rs)
    const quotationIds = rs.items.flatMap((it) => it.items.map((it1) => it1.quotationId));

    fetchDetail(_.uniq(quotationIds));
    setVendors(_.uniqBy<LookupDataItem>(vendors, (it) => it.id));
  };

  useEffect(() => {
    initData();
  }, []);


  useEffect(() => {
    if (forceReload && forceReload > 0)
      initData();
  }, [forceReload]);

  const renderValue = (item: PriceComparisonItemRs1, vendorId: number, priceOffer: number) => {
    const quotation = item.items.find(
      (it) => it.priceOffer == priceOffer && it.vendorId == vendorId,
    );

    return (
      quotation?.price && quotation.price > 0 ? (
        <Space>
          <Typography.Text strong={quotation.selected}>
            {' '}
            {formatter.format(quotation.price)}
          </Typography.Text>
          {quotation.selected && <Checkbox checked />}
        </Space>
      ) : ''
    );
  };

  const renderVendorTitle = (priceOffer: number, vendor: LookupDataItem) => {
    const item = data?.items
      .flatMap((it) => it.items)
      .filter((it) => it.priceOffer == priceOffer && it.vendorId == vendor.id)
      .find((it) => it);

    const quotation = quotationDetails.find((it) => it.id == item?.quotationId);

    return (
      <Popconfirm
        trigger={'hover'}
        destroyTooltipOnHide={true}
        autoAdjustOverflow={true}
        showCancel={false}
        okText="Close"
        title={
          <ProDescriptions<QuotationDetail>
            dataSource={quotation}
            style={{ width: 300 }}
            column={1}
            columns={[
              {
                title: 'Quotation No',
                dataIndex: 'code',
              },
              {
                title: 'Vendor',
                render: (_, r) => [r.vendor?.code, r.vendor?.name].filter((it) => it).join('-'),
              },
              { title: 'Issued On', render: (_, r) => formatDate(r.issuedDate) },
              {
                title: 'Alert',
                hideInDescriptions:
                  !item?.selected ||
                  data?.workflowStatus != 'APPROVED' ||
                  (item?.vendorId || 0) > 0,
                render: (_, r) => (
                  <Typography.Text type="danger">
                    Please replace temporary vendor for the right SAP vendor.
                  </Typography.Text>
                ),
              },
            ]}
          />
        }
      >

        <Flex align='flex-end' vertical>
          {[<Typography.Link type={
            item?.selected && data?.workflowStatus == 'APPROVED' && (item?.vendorId || 0) < 0
              ? 'danger'
              : undefined
          }
            onClick={() => {
              window.open(`./../../pro/quotation/detail/${quotation?.id}`, '_blank')?.focus();
            }}>{vendor.name}</Typography.Link>, <Typography.Text type="secondary"> {quotation?.code}</Typography.Text>].filter(it => it).map((it, index) => (<Flex key={`${vendor.key}-${index}`}> {it}</Flex>))}
        </Flex>


      </Popconfirm>
    );
  };

  const isBold = (type: String) =>
    [
      'total',
      'totalPrice',
      'awardedLogisticesFee',
      'head',
      'logisticFee',
      'nonPriceCriteria',
      'totalAwardedAmount',
      'grantTotal',
    ].some((it) => it == type);
  const align = (type: string) =>
    [
      'total',
      'totalAwardedAmount',
      'subTotal',
      'discount',
      'head',
      'awardedLogisticesFee',
      'totalPrice',
      'grantTotal',
      // 'freight',
      // 'clearanceAgent',
    ].some((it) => it == type)
      ? 'right'
      : undefined;
  const fillterOut = (type: string) => {
    if (['totalAwardedAmount', 'logisticFee', 'awardedLogisticesFee'].some(i => i == type)) {
      return data?.otherCosts.some((it) => it.type == 'freight' || it.type == 'clearanceAgent');
    }

    if (type == 'freightTitle') {
      return data?.otherCosts.some((it) => it.type == 'freight');
    }

    if (type == 'clearanceAgentTitle') {
      return data?.otherCosts.some((it) => it.type == 'clearanceAgent');
    }
    return true;
  };

  const colSpan = (type: string) => {
    if (
      [
        'subTotal',
        'discount',
        'total',
        'totalPrice',
        'totalAwardedAmount',
        'awardedLogisticesFee',
        'grantTotal',
      ].some((it) => it == type)
    ) {
      return colspanHeader1;
    }

    if (['freightTitle', 'clearanceAgentTitle'].some((it) => it == type)) {
      return colspanHeader1 + valCols;
    }

    return colspanHeader2;
  };

  const rowSpan = (type: SummaryTypes) => {
    if (type == 'logisticFee') {
      const freightRows = data?.otherCosts.some((it) => it.type == 'freight')
        ? data?.otherCosts.filter((it) => it.type == 'freight').length + 1
        : 0;

      const clearanceFeeRows = data?.otherCosts.some((it) => it.type == 'clearanceAgent')
        ? data?.otherCosts.filter((it) => it.type == 'clearanceAgent').length + 1
        : 0;

      return freightRows + clearanceFeeRows > 0 ? freightRows + clearanceFeeRows + 1 : undefined;
    }

    if (type == 'nonPriceCriteria') {
      return 6;
    }
    return undefined;
  };


  const renderSummary = () => (
    <Table.Summary>
      {data?.otherCosts
        ?.filter((it) => fillterOut(it.type))
        .map((it, index) => (
          <Table.Summary.Row
            style={{ fontWeight: isBold(it.type) ? 'bolder' : undefined }}
            key={`row-summary-${index}`}
          >
            <Table.Summary.Cell
              align={align(it.type)}
              index={0}
              colSpan={colSpan(it.type)}
              rowSpan={rowSpan(it.type)}
            >
              <Flex style={{ paddingLeft: ["freight", "clearanceAgent"].some(i => i == it.type) ? 10 : undefined }}> {it.providerName}</Flex>
            </Table.Summary.Cell>

            {!['freightTitle', 'clearanceAgentTitle', 'logisticFee', 'nonPriceCriteria'].some(
              (it1) => it1 == it.type,
            ) &&
              offerComparisons.map((offer) =>
                vendors?.map((v, index1) => {
                  const item = it.items.find((i) => i.priceOffer == offer.id && i.vendorId == v.id);
                  return (
                    <Table.Summary.Cell align={align(it.type)} index={index1 + 1}>
                      <Flex key={`${item?.id}-${it.type}`} justify='space-between'>
                        {item?.text && item.text}
                        {item?.amount && item.amount > 0 ? formatter.format(item?.amount) : ''}
                        {item?.selected && <Checkbox checked />}
                      </Flex>
                    </Table.Summary.Cell>
                  );
                }),
              )}
          </Table.Summary.Row>
        ))}
      <Table.Summary.Row style={{ fontWeight: 'bolder' }}>
        <Table.Summary.Cell index={0} colSpan={colspanHeader1}>
          Recommendations and justifications
        </Table.Summary.Cell>
        <Table.Summary.Cell colSpan={valCols + colspanHeader1} index={1}>
          {data?.justifications}
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  );

  return (
    <Card>
      {data && (
        <ProTable<PriceComparisonItemRs1>
          search={false}
          pagination={false}
          bordered
          size="small"
          dataSource={data.items}
          options={false}
          rowKey={'id'}
          columns={[
            { title: '#', dataIndex: 'seq', width: 30 },
            {
              title: data.isService ? 'Service Name' : 'Item Code',
              responsive: ['lg', 'xl'],
              render: (_, r) => (
                <Flex vertical>
                  <Flex style={{ fontWeight: 'bold' }}>{r.itemCode}</Flex> <Flex>{r.itemName}</Flex>
                </Flex>
              ),
            },
            {
              title: 'Description',
              responsive: ['lg', 'xl'],
              render: (_, r) => r.description,
            },

            {
              title: 'Qty',
              hideInTable: data.isService,
              width: 70,
              align: 'right',
              render: (_, r) => r.qty,
            },
            {
              title: 'UoM',
              width: 70,
              hideInTable: data.isService,
              render: (_, r) => r.uomName,
            },
            {
              title: 'Target Price',
              align: 'right',
              width: 100,
              render: (_, r) => r.targetPrice && formatter.format(r.targetPrice),
            },
            {
              title: 'First Offer Unit Price',

              children: vendors?.map((it) => ({
                align: 'right',
                title: renderVendorTitle(1, it),
                render: (_, r) => renderValue(r, it.id, 1),
              })),
            },
            {
              title: 'Last Offer Unit Price',

              children: vendors?.map((it) => ({
                title: renderVendorTitle(0, it),
                align: 'right',
                render: (_, r) => renderValue(r, it.id, 0),
              })),
            },
          ]}
          summary={renderSummary}
        />
      )}
    </Card>
  );
};
