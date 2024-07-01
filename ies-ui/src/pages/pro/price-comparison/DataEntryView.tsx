import FileUploader from '@/components/Attachment/FileUploader';
import { EmployeeServices } from '@/pages/hrm/services';
import { ProcessFlowModalWrapper } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import { formatter, formatterPercentage } from '@/pages/utils';
import { LookupDataItem } from '@/services/data';
import { RequisitionListItem } from '@/services/pro/data';
import { UserResult } from '@/services/process-workflow/data';
import {
  CheckOutlined,
  ClearOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  PaperClipOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SplitCellsOutlined,
  StockOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  ProCard,
  ProColumns,
  ProForm,
  ProFormMoney,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  App,
  Button,
  Checkbox,
  Dropdown,
  Flex,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import _, { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { createPoService } from '../po/services';
import { QuotationListItem } from '../quotation/data';
import { PriceComparisonSavePayload } from './data';
import ItemFinder from './ItemFinder';
import { PriceComparisonFormNames } from './process-flow/data';
import { createPriceComparisonService } from './service';
import { useInView } from 'react-intersection-observer';

export type PriceOfferType = 'first' | 'last';

export type AddPriceComparisonItem = {
  key: string;
  quotationItemId: number;
  // item: PriceComparisonItemRs;
  itemId: number;
  baseItemId?: number;
  baseType?: string;
  itemCode?: string;
  itemName: string;
  description?: string;
  onRequestQty: number;
  targetPrice?: number;
  qty: number;
  uomId?: number;
  seq: number;
  discountPercentage?: number;
  uomName?: string;
  uomList: LookupDataItem[];
};

type FormType = {
  justifications?: string;
  isService?: boolean;
  numOfVendor: number;
  acceptedBy: string;
};

type EditableState = {
  discount?: boolean;
  freight?: number;
  clearance?: number;
};

type selectedItems = {
  key: string; // support multi item id records
  priceOffer: PriceOfferType;
  quotationId: number;
  quotationItemId: number;
  vendorId: number;
};

export type SummaryTypes =
  | 'subTotal'
  | 'discount'
  | 'total'
  | 'totalAwardedAmount'
  | 'awardedLogisticesFee'
  | 'grantTotal'
  | 'freight'
  | 'clearanceAgent'
  | 'f1'
  | 'f2'
  | 'l1'
  | 'l2'
  | 'l3'
  | 'freightTitle'
  | 'clearanceAgentTitle'
  | 'logisticFee'
  | 'nonPriceCriteria'
  | 'term';


type SummaryValueType = {
  vendorId: number;
  priceOffer: PriceOfferType;
  type: 'string' | 'number';
  numberValue?: number;
  stringValue?: string;
  selected?: boolean;
};

type SummaryRowType = {
  type: SummaryTypes;
  title?: string;
  key?: string;
  align?: 'right' | 'left' | 'center';
  seq?: number;
  colSpan?: number;
  bold?: boolean;
  rowSpan?: number;
  values?: SummaryValueType[];
  action?: React.ReactNode;
};

type QuotationType = QuotationListItem & { priceOffer: PriceOfferType; key: string };

const offerComparisons: { label: string; value: PriceOfferType; id: number }[] = [
  { label: '1st Offer Price', value: 'first', id: 1 },
  { label: 'Last Offer Price', value: 'last', id: 0 },
];

export default ({
  // id,
  onBack,
  onView
  // onEdit,
  // onAdd,
}: {
  id?: number;
  type: 'CREATE' | 'EDIT';
  onBack: () => void;
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
  onView?: (processInstId: string, fornNo: string) => void;
}) => {
  const { message } = App.useApp();
  const priceComparisonSrv = createPriceComparisonService();
  const poSrv = createPoService();

  const [vendors, setVendors] = useState<(LookupDataItem & { key?: string })[]>([]);
  const [form] = useForm<FormType>();
  const [isService, setIsService] = useState(false);

  const [startFormVisible, setStartFormVisible] = useState(false);
  const [items, setItems] = useState<AddPriceComparisonItem[]>([]);
  const [quotations, setQuotations] = useState<QuotationType[]>([]);
  const [itemsSelected, setItemsSelected] = useState<selectedItems[]>([]);

  // const [summaryAmount, setSummaryAmount] = useState<SummaryType[]>();
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [forceCaculate, setForceCaculate] = useState(0);

  const [summary, setSummary] = useState<SummaryRowType[]>([]);
  const [otherCost, setOtherCost] = useState<SummaryRowType[]>([]);

  const [prLinked, setPrLinked] = useState<RequisitionListItem[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();

  const [finderVisible, setFinderVisible] = useState<{
    vendor?: LookupDataItem;
    quotationId?: number;
    priceOffer: PriceOfferType;
    vendorKey?: string;
  }>();

  const { ref, inView } = useInView({});

  const onAddOtherCostHandler = (type: SummaryTypes) => {
    const seq = otherCost.filter((it) => it.type == type).length + 1;
    const key = uniqueId(type);
    setOtherCost((v) => [
      ...v,
      {
        type: type,
        seq: seq,
        key: key,
        colSpan: 2,
        values: offerComparisons.flatMap((po) =>
          vendors.map((vendor) => {
            return {
              priceOffer: po.value,
              vendorId: vendor.id,
              type: 'number',
            } as SummaryValueType;
          }),
        ),
        action: (
          <Popconfirm
            title="Delete Record"
            description="Are you sure?"
            onConfirm={() => {
              setOtherCost((v) => v.filter((it) => it.key != key));
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      },
    ]);
  };

  const calulateSummary = () => {
    const summaries: SummaryRowType[] = [
      {
        type: 'subTotal',
        title: 'Sub Total',
        key: uniqueId('summary'),
        align: 'right',
        colSpan: isService ? 4 : 6,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const total = _.sum(
              items.flatMap((it) =>
                quotations
                  .filter((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                  .flatMap((q) =>
                    q.items.filter((i) => i.itemId == it.itemId && it.baseItemId == i.baseItemId).flatMap((i) => i.price * it.qty),
                  ),
              ),
            );
            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'number',
              numberValue: total,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'discount',
        title: 'Discount',
        key: uniqueId('summary'),
        align: 'right',
        colSpan: isService ? 4 : 6,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const discountAmount = quotations.find(
              (q) => q.priceOffer == po.value && q.vendor.id == v.id,
            )?.discountAmount;
            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'number',
              numberValue: discountAmount,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'total',
        title: 'Total',
        bold: true,
        key: uniqueId('summary'),
        colSpan: isService ? 4 : 6,
        align: 'right',
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const total = _.sum(
              items.flatMap((it) =>
                quotations
                  .filter((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                  .flatMap((q) =>
                    q.items.filter((i) => i.itemId == it.itemId && i.baseItemId == it.baseItemId).flatMap((i) => i.price * it.qty),
                  ),
              ),
            );

            const discountAmount =
              quotations.find((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                ?.discountAmount || 0;

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'number',
              numberValue: total - discountAmount,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'totalAwardedAmount',
        title: 'Total Awarded Amount',
        key: uniqueId('summary'),
        colSpan: isService ? 4 : 6,
        align: 'right',
        bold: true,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const total = _.sum(
              items.flatMap((it) =>
                quotations
                  .filter((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                  .flatMap((q) =>
                    q.items
                      .filter(
                        (i) =>
                          i.itemId == it.itemId && i.baseItemId == it.baseItemId &&
                          itemsSelected.some(
                            (s) =>
                              s.key == it.key &&
                              q.priceOffer == s.priceOffer &&
                              q.vendor.id == s.vendorId &&
                              q.id == s.quotationId,
                          ),
                      )
                      .flatMap((i) => i.price * it.qty),
                  ),
              ),
            );

            const discountAmount =
              quotations.find((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                ?.discountAmount || 0;

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'number',
              numberValue: total - discountAmount,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'logisticFee',
        title: 'Estimated Logistics Fee',
        key: uniqueId('summary'),
        bold: true,
        // align: 'center',
        colSpan: isService ? 2 : 4,
        rowSpan: 3 + otherCost.length,
      },
      {
        type: 'freightTitle',
        title: '1. Freight',
        key: uniqueId('summary'),
        colSpan: 2 + vendors.length * offerComparisons.length,
        action: (
          <Button
            onClick={() => onAddOtherCostHandler('freight')}
            type="link"
            size="small"
            disabled={blockSubmit()}
            icon={<PlusOutlined />}
          />
        ),
      },
      ...otherCost.filter((it) => it.type == 'freight'),
      {
        type: 'clearanceAgentTitle',
        title: '2. Clearance Agent',
        key: uniqueId('summary'),
        colSpan: 2 + vendors.length * offerComparisons.length,
        action: (
          <Button
            onClick={() => onAddOtherCostHandler('clearanceAgent')}
            type="link"
            size="small"
            disabled={blockSubmit()}
            icon={<PlusOutlined />}
          />
        ),
      },
      ...otherCost.filter((it) => it.type == 'clearanceAgent'),
      {
        type: 'awardedLogisticesFee',
        title: 'Estimated Awarded Logistics Fee',
        key: uniqueId('summary'),
        colSpan: isService ? 4 : 6,
        align: 'right',
        bold: true,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const amount = itemsSelected.some(
              (it) => it.priceOffer == po.value && it.vendorId == v.id,
            )
              ? _.sum(
                otherCost.flatMap((it) =>
                  (it.values || [])
                    .filter(
                      (it1) =>
                        it1.priceOffer == po.value &&
                        it1.vendorId == v.id &&
                        (it1.selected ||
                          otherCost.filter((it2) => it2.type == it.type).length == 1),
                    )
                    .flatMap((it1) => it1.numberValue || 0),
                ),
              )
              : undefined;

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'number',
              numberValue: amount,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'grantTotal',
        title: 'Total Price',
        key: uniqueId('summary'),
        colSpan: isService ? 4 : 6,
        align: 'right',
        bold: true,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const logisticsFee = itemsSelected.some(
              (it) => it.priceOffer == po.value && it.vendorId == v.id,
            )
              ? _.sum(
                otherCost.flatMap((it) =>
                  (it.values || [])
                    .filter(
                      (it1) =>
                        it1.priceOffer == po.value &&
                        it1.vendorId == v.id &&
                        (it1.selected ||
                          otherCost.filter((it2) => it2.type == it.type).length == 1),
                    )
                    .flatMap((it1) => it1.numberValue || 0),
                ),
              )
              : 0;

            const total = _.sum(
              items.flatMap((it) =>
                quotations
                  .filter((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                  .flatMap((q) =>
                    q.items
                      .filter(
                        (i) =>
                          i.itemId == it.itemId && i.baseItemId == it.baseItemId &&
                          itemsSelected.some(
                            (s) =>
                              s.key == it.key &&
                              q.priceOffer == s.priceOffer &&
                              q.vendor.id == s.vendorId &&
                              q.id == s.quotationId,
                          ),
                      )
                      .flatMap((i) => i.price * it.qty),
                  ),
              ),
            );

            const discountAmount =
              quotations.find((q) => q.priceOffer == po.value && q.vendor.id == v.id)
                ?.discountAmount || 0;

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'number',
              numberValue: total - discountAmount + logisticsFee,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'nonPriceCriteria',
        key: uniqueId('summary'),
        bold: true,
        title: 'Non-Price Criteria',
        // align: 'center',
        colSpan: isService ? 2 : 4,
        rowSpan: 6,
      },
      {
        type: 'term',
        title: 'Trade Term',
        key: uniqueId('summary'),
        colSpan: 2,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const quotation = quotations.find(
              (q) => q.priceOffer == po.value && q.vendor.id == v.id && q.key,
            );

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'string',
              stringValue: quotation?.tradeTerms,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'term',
        title: 'Delivery Lead Time',
        key: uniqueId('summary'),
        colSpan: 2,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const quotation = quotations.find(
              (q) => q.priceOffer == po.value && q.vendor.id == v.id,
            );

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'string',
              stringValue: quotation?.leadTime,
            } as SummaryValueType;
          }),
        ),
      },
      {
        type: 'term',
        title: 'Payment Term',
        key: uniqueId('summary'),
        colSpan: 2,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const quotation = quotations.find(
              (q) => q.priceOffer == po.value && q.vendor.id == v.id,
            );

            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'string',
              stringValue: quotation?.paymentGroup,
            } as SummaryValueType;
          }),
        ),
      },

      {
        type: 'term',
        title: 'Specifications',
        key: uniqueId('summary'),
        colSpan: 2,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const quotation = quotations.find(
              (q) => q.priceOffer == po.value && q.vendor.id == v.id,
            );
            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'string',
              stringValue: quotation?.specifications,
            } as SummaryValueType;
          }),
        ),
      },

      {
        type: 'term',
        title: 'Warranty',
        key: uniqueId('summary'),
        colSpan: 2,
        values: offerComparisons.flatMap((po) =>
          vendors.map((v) => {
            const quotation = quotations.find(
              (q) => q.priceOffer == po.value && q.vendor.id == v.id,
            );
            return {
              priceOffer: po.value,
              vendorId: v.id,
              type: 'string',
              stringValue: quotation?.warranty,
            } as SummaryValueType;
          }),
        ),
      },
    ];

    setSummary(summaries.map((it, index) => ({ ...it, seq: index + 1 })));
  };

  const onAddQuotatinHandler = (
    quotation: QuotationListItem,
    priceOffer: PriceOfferType,
    vendorKey: string,
  ) => {
    if (quotations.some((it) => it.id == quotation.id)) {
      message.error('Quotation have been added.');
      return;
    }
    setVendors((v) =>
      v.map((it) =>
        it.key == vendorKey && it.id != quotation.vendor.id
          ? {
            ...it,
            id: quotation.vendor.id || 0,
            name: quotation.vendor.name,
            code: quotation.vendor.code,
          }
          : it,
      ),
    );

    setQuotations((v) => [
      ...v,
      { ...quotation, priceOffer: priceOffer, key: uniqueId('quotation') },
    ]);

    const addedItems = quotation.items
      .filter((it) => !items.some((it1) => it1.itemId == it.itemId && it1.baseItemId == it.baseItemId))
      .map(
        (it) =>
        ({
          key: uniqueId('pc-item'),
          quotationItemId: it.id,
          itemId: it.itemId,
          baseItemId: it.baseItemId,
          baseType: it.baseType,
          itemCode: it.itemCode,
          itemName: it.itemName,
          description: it.description,
          onRequestQty: 0,
          targetPrice: 1,
          qty: it.qty,
          seq: 0,
          uomId: it.uomId,
          discountPercentage: it.discountPercentage,
          uomName: it.uomName,
          uomList: it.item.uomList,
        } as AddPriceComparisonItem),
      );


    setItems((v) => [...v, ...addedItems].map((it, index) => ({ ...it, seq: index + 1 })));

    console.log([...items, ...addedItems]);


    setFinderVisible(undefined);
  };

  const renderVendorTitle = (
    priceOffer: PriceOfferType,
    vendor: LookupDataItem,
    quotation?: QuotationType,
  ) => {
    const otherQuotation = quotations.find(
      (i) => i.vendor.id == vendor.id && i.priceOffer != priceOffer,
    );
    return (
      <Space key={`vendor-${priceOffer}-${vendor.key}`}>
        <Dropdown
          key={`menu-${priceOffer}-${vendor.key}`}

          menu={{
            items: [
              {
                label: "Info",
                key: 'detail',
                disabled: !quotation || quotation?.id == 0,
                onClick: () => {
                  quotation?.id && window.open(`./../quotation/detail/${quotation.id}`, '_blank')?.focus();
                },
                icon: <InfoCircleOutlined />
              },
              {
                label: 'Add Quotation',
                onClick: () =>
                  setFinderVisible({
                    vendor: vendor.id != 0 ? vendor : undefined,
                    priceOffer: priceOffer,
                    quotationId: quotation?.id,
                    vendorKey: vendor.key,
                  }),
                key: 'add',
                disabled: vendor.id != 0 && quotation != null,
                icon: <PlusOutlined />,
              },
              {
                label: 'Select All',
                onClick: () => {
                  setItemsSelected(
                    items.map((it) => ({
                      key: it.key,
                      priceOffer: priceOffer,
                      quotationId: quotation?.id || 0,
                      quotationItemId: it.quotationItemId,
                      vendorId: vendor.id,
                    })),
                  );
                  setForceUpdate((v) => v + 1);
                },
                key: 'selectAll',
                disabled: !quotation,
                icon: <CheckOutlined />,
              },

              {
                label: 'Copy From',
                key: 'copyFrom ',
                disabled: vendor.id == 0 || !otherQuotation || otherQuotation.id == quotation?.id,
                onClick: () => {
                  otherQuotation &&
                    setQuotations((v) => [
                      ...v,
                      { ...otherQuotation, priceOffer: priceOffer, key: uniqueId('quotation') },
                    ]);
                  otherQuotation && setForceUpdate((v) => v + 1);
                },
                icon: <CopyOutlined />,
              },

              {
                label: 'Switch Price Offer',
                key: 'switch',
                disabled: !quotation,
                onClick: () => {
                  setQuotations((v) =>
                    v.map((it) =>
                      it.vendor.id == vendor.id
                        ? { ...it, priceOffer: it.priceOffer == 'first' ? 'last' : 'first' }
                        : it,
                    ),
                  );

                  setForceUpdate((v) => v + 1);
                },
                icon: <SwapOutlined />,
              },

              {
                label: 'Remove Quotation',
                key: 'removeQuotation',
                disabled: !quotation,
                danger: true,
                onClick: () => {
                  const newQuotations = quotations.filter((it) => it.key != quotation?.key)
                  setQuotations(newQuotations);
                  setItemsSelected((v) => v.filter((it) => it.quotationId != quotation?.id));
                  setVendors(v => v.map(it => newQuotations.some(it1 => it1.vendor.id == it.id) ? it : ({ ...it, id: 0, name: 'N/A' })))
                  setItems(v => v.filter(it => newQuotations.flatMap(it1 => it1.items).some(it1 => it1.itemId == it.itemId && it1.baseItemId == it.baseItemId)).map((it, index) => ({ ...it, seq: index + 1 })))

                },
                icon: <CloseOutlined />,
              },
              {
                label: 'Remove Vendor',
                key: 'removeVendor',
                disabled: vendors.length < 3,
                danger: true,
                onClick: () => {
                  const newVendors = vendors.filter(it => it.key != vendor.key)
                  setVendors(newVendors)
                  const newQuotations = quotations.filter(it => newVendors.some(it1 => it1.id == it.vendor.id))
                  setQuotations(newQuotations)
                  setItems(v => v.filter(it => newQuotations.flatMap(it1 => it1.items).some(it1 => it1.itemId == it.itemId && it1.baseItemId == it.baseItemId)).map((it, index) => ({ ...it, seq: index + 1 })))

                },
                icon: <DeleteOutlined />,
              },
            ],
          }}
        >
          <Flex align='flex-end' vertical>
            {[<Typography.Link>{vendor.name}</Typography.Link>, <Typography.Text type="secondary"> {quotation?.code}</Typography.Text>].filter(it => it).map((it, index) => (<Flex key={`${vendor.key}-${index}`}> {it}</Flex>))}
          </Flex>

        </Dropdown>
      </Space >
    );
  };

  const initVendor = () => {
    setVendors([
      { id: 0, name: 'N/A', key: uniqueId('vendor') },
      { id: 0, name: 'N/A', key: uniqueId('vendor') },
    ]);
  };

  const fetchHod = async ({ keyWords }: { keyWords?: string }) => {
    const rs = await EmployeeServices.fetchHodOfUsers(
      1,
      keyWords,
      prLinked.map((it) => (it.requestedBy == 'admin' ? 'phanny.ngoun' : it.requestedBy!!)),
    ).query(poSrv.requestAction);
    return rs
      .filter((it) => it.userId)
      .map((it) => ({
        label: [it.employeeCode, `${it.firstName} ${it.lastName}`].join('-'),
        value: it.userId || '',
      }));
  };

  useEffect(() => {
    form.setFieldsValue({ isService: false });
    initVendor();
  }, []);

  useEffect(() => {
    calulateSummary();
  }, [vendors, forceCaculate, isService, itemsSelected, otherCost, quotations]);

  useEffect(() => {
    poSrv
      .listPrByQuotation(
        itemsSelected.map((it) => ({
          quotationId: it.quotationId,
          itemId: items.find((i) => i.key == it.key)?.itemId!!,
        })),
      )
      .then((rs) => {
        setPrLinked(rs);
      });
  }, [itemsSelected]);

  const blockSubmit = () =>
    items.length == 0 ||
    itemsSelected.length == 0 ||
    itemsSelected.length != items.length ||
    vendors.length * offerComparisons.length != quotations.length;

  const onFormValuesChange = (changedValues: any) => {
    const data:
      | {
        layer1: string;
        layer2: string;
        layer3: string;
        layer4: string;
        layer5: string;
        layer6: string;
        value: string;
      }
      | undefined = _.flatMap(changedValues, (value, key) => {
        return _.flatMap(value, (value1, key1) => {
          return _.flatMap(value1, (value2, key2) => {
            return _.flatMap(value2, (value3, key3) => {
              return _.flatMap(value3, (value4, key4) => {
                return _.flatMap(value4, (value5, key5) => {
                  return {
                    layer1: key,
                    layer2: key1,
                    layer3: key2,
                    layer4: key3,
                    layer5: key4,
                    layer6: key5,
                    value: value5,
                  };
                }).findLast((it) => it);
              }).findLast((it) => it);
            }).findLast((it) => it);
          }).findLast((it) => it);
        }).findLast((it) => it);
      }).findLast((it) => it);
    if (data?.layer2 == 'title') {
      setOtherCost((v) =>
        v.map((it) => (it.key == data.layer5 ? { ...it, title: data.value } : it)),
      );
    } else {
      setOtherCost((v) =>
        v.map((it) =>
          it.key == data?.layer5
            ? {
              ...it,
              values: it.values?.map((it1) =>
                it1.priceOffer == data?.layer3 && it1.vendorId.toString() == data.layer4
                  ? { ...it1, numberValue: parseFloat(data.value) }
                  : it1,
              ),
            }
            : it,
        ),
      );
    }
  };

  const onSaveHandler = async (
    processDef: string,
    formKey: string,
    buId: number,
    requestor: UserResult,
    comment?: string,
  ) => {
    const dataForm = await form.validateFields();
    try {
      const acceptedFunction = await EmployeeServices.fetchFunctionByUser(dataForm.acceptedBy).query()
      const saveData: PriceComparisonSavePayload = {
        processDef: processDef,
        formKey: formKey,
        buId: buId,
        isService: isService,
        requestor: requestor.id,
        acceptedBy: dataForm.acceptedBy,
        acceptedFunction: acceptedFunction.name,
        remarks: comment!!,
        justifications: dataForm.justifications,
        items: items.map((it) => {
          const selectedQuotation = quotations.find(q => q.id == itemsSelected.find(it1 => it1.key == it.key)?.quotationId)
          return {
            itemId: it.itemId,
            seq: it.seq,
            baseItemId: selectedQuotation?.items.find(it1 => it1.itemId == it.itemId && it1.baseItemId == it.baseItemId)?.id,
            baseType: 'PQ',
            itemCode: it.itemCode,
            itemName: it.itemName,
            description: it.description,
            qty: it.qty,
            targetPrice: it.targetPrice || 0,
            uomId: it.uomList.find((it) => it.name == it.name)?.id || it.uomId,
            uomName: it.uomName,
            quotationList: quotations.map((q) => ({
              quotationId: q.id,
              quotationNo: q.code,
              vendorId: q.vendor.id || 0,
              vendorCode: q.vendor.code,
              vendorName: q.vendor.name,
              priceOffer: q.priceOffer == 'first' ? 1 : 0,
              selected: itemsSelected.some(
                (it1) => it1.vendorId == q.vendor.id && it1.priceOffer == q.priceOffer && it1.key == it.key,
              ),
              price: q.items.find((it1) => it1.itemId == it.itemId && it1.baseItemId == it.baseItemId)?.price || 0,
            })),
          };
        }),
        otherCostItems: summary.map((it) => ({
          seq: 0,
          type: it.type,
          key: it.key,
          providerName: it.title || '',
          items: (it.values || []).map((it1) => ({
            priceOffer: it1.priceOffer == 'first' ? 1 : 0,
            vendorId: it1.vendorId,
            amount: it1.numberValue,
            selected: it1.selected || false,
            text: it1.stringValue,
          })),
        })),
        files: uploadFiles,
      };
      const rs = await priceComparisonSrv.saveItem(saveData);
      const { processInstId, formNo } = rs;
      onView?.(processInstId, formNo)
      message.success(`Your request is submitted. Please track the request with form no ${formNo}`);
      // history.push(`/data-form/${PriceComparisonFormNames.processDefKey}/${processInstId}`);
    } catch (error: any) {
      message.error(error.message || 'Failed to make request.');
    }
  };
  return (
    <div ref={ref}>
      <ProForm

        form={form}
        submitter={{
          render: () => (
            inView ? <FooterToolbar>
              <Button style={{ marginRight: 10 }} onClick={onBack}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  form.resetFields(['justifications']);
                  setItemsSelected([]);
                  setItems([]);
                  initVendor();
                  setQuotations([]);
                  setOtherCost([]);
                }}
              >
                Clear
              </Button>
              <Button
                disabled={blockSubmit()}
                type="primary"
                onClick={async () => {
                  await form.validateFields();
                  await editableFormRef.current?.validateFields();
                  if (itemsSelected.length != items.length) {
                    message.error('Please select quotation.');
                    return;
                  }
                  setStartFormVisible(true);
                }}
              >
                Submit
              </Button>
            </FooterToolbar> : <></>
          ),
        }}
      />
      <ProCard
        size='small'
        title={<Space><StockOutlined />Quotation Comparison</Space>}
        direction="column"
        extra={
          <Space align="baseline">
            {(vendors?.length || 0) < 3 && (
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                  setVendors((v) => [...v, { id: 0, name: 'N/A', key: uniqueId('vendor') }]);
                }}
              >
                Add More Vendor
              </Button>
            )}
            <Switch
              // name={'isService'}
              onChange={setIsService}
              // isService
              disabled={items.length > 0}
              unCheckedChildren={'Item'}
              checkedChildren={'Service'}
            />
            <Button danger type='link' icon={<ClearOutlined />} onClick={() => {
              setItemsSelected([]);
              setItems([]);
              initVendor();
              setQuotations([]);
              setOtherCost([]);
            }} >Clear</Button>
          </Space>
        }
      >
        <ProCard size="small" bordered style={{ marginBlockStart: 8 }}>
          <EditableProTable<AddPriceComparisonItem>
            search={false}
            pagination={false}
            value={items}
            controlled
            recordCreatorProps={false}
            size="small"
            editableFormRef={editableFormRef}
            rowKey={'key'}
            defaultSize="small"
            bordered
            editable={{
              type: 'multiple',
              editableKeys: items.map((it) => it.key),

              onValuesChange(record, dataSource) {
                const changedQty =
                  dataSource.find((it) => it.key == record.key)?.qty !=
                  items.find((it) => it.key == record.key)?.qty;

                setItems(dataSource);
                changedQty && setForceCaculate((v) => v + 1);
              },
              actionRender: (row) => [
                <Flex key={'action'}>
                  <Flex>
                    <Popconfirm
                      key={`${row.key}-confirm`}
                      title="Delete item"
                      description="Are you sure to delete?"
                      onConfirm={() => {
                        const newItems = items.filter((it) => it.key != row.key);
                        setItems(newItems.map((it, index) => ({ ...it, seq: index + 1 })));
                        setItemsSelected((v) => v.filter((it) => it.key != row.key));
                        const newQuotations = quotations.filter(it => it.items.some(it1 => newItems.some(it2 => it2.itemId == it1.itemId && it2.baseItemId == it1.baseItemId)))
                        setQuotations(newQuotations)
                        setVendors(v => v.map(it => newQuotations.some(it1 => it1.vendor.id == it.id) ? it : ({ ...it, id: 0, name: 'N/A' })))
                        setForceUpdate((v) => v + 1);
                        if (newItems.length == 0) {
                          setOtherCost([]);
                        }
                      }}
                      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                      <Button danger type="link" size="small" icon={<MinusCircleOutlined />} />
                    </Popconfirm>
                  </Flex>
                  {row.qty > 1 && (
                    <Flex>
                      <Popconfirm
                        key={`${row.key}-split`}
                        title="Split item"
                        description="Are you sure to delete?"
                        onConfirm={() => {
                          const first = items.filter((it) => it.seq < row.seq);
                          const last = items.filter((it) => it.seq > row.seq);

                          setItems([
                            ...first,
                            { ...row, qty: row.qty - 1 },
                            { ...row, key: uniqueId('pc-item'), qty: 1, seq: row.seq + 1 },
                            ...last.map((it) => ({ ...it, seq: it.seq + 1 })),
                          ]);

                          setForceUpdate((v) => v + 1);
                        }}
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                      >
                        <Button type="link" size="small" icon={<SplitCellsOutlined />} />
                      </Popconfirm>
                    </Flex>
                  )}
                </Flex>,
              ],
            }}
            columns={[
              {
                title: '#',
                key: `seq-${forceUpdate}`,
                width: 50,
                readonly: true,
                dataIndex: 'seq',
              },
              {
                title: isService ? 'Service' : 'Item',
                // hideInTable: isService,
                readonly: true,
                width: isService ? 250 : undefined,
                responsive: isService ? [] : ['xs', 'md'],
                renderText: (_, r) => (
                  <Flex vertical>
                    <Flex style={{ fontWeight: 'bold' }}>{r.itemCode}</Flex>{' '}
                    <Flex>{r.itemName}</Flex>
                  </Flex>
                ),
              },
              {
                title: 'Description',
                valueType: 'textarea',
                // width: 200,
                // readonly: true,
                dataIndex: 'description',
                responsive: ['xs', 'md'],
                fieldProps: { rows: 1, maxLength: 1000 },
                // colSpan: isService ? 2 : undefined,
                // render: (_, r) => [r.itemName, r.description].filter((it) => it).join(', '),
              },
              //{ title: 'Description', dataIndex: 'description' },
              {
                title: 'Qty',
                // key: `qty-${forceUpdate}`,
                align: 'right',
                hideInTable: isService,
                width: 100,
                dataIndex: 'qty',
              },
              {
                title: 'UoM',
                key: `uom-${forceUpdate}`,
                hideInTable: isService,
                width: 120,
                dataIndex: 'uomName',
                valueType: 'select',
                valueEnum: (r) =>
                  (r.uomList || []).reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {}),
              },
              {
                title: 'Target Price',
                align: 'center',
                valueType: 'money',
                dataIndex: 'targetPrice',
                width: 100,
              },
              ...(offerComparisons.map((oc) => ({
                title: oc.label,
                key: `${oc.value}`,
                children: vendors.map((vendor, vendorIndex) => {
                  const quotation = quotations.find(
                    (q) => q.vendor.id == vendor.id && q.priceOffer == oc.value,
                  );
                  return {
                    title: renderVendorTitle(oc.value, vendor, quotation),
                    align: 'right',
                    readonly: true,
                    key: `${oc.value}-${vendor.key}-${quotation?.id}-${vendorIndex}-${forceUpdate}`,
                    renderText: (_, r) => {
                      const item = quotation?.items.find((it) => it.itemId == r.itemId && it.baseItemId == r.baseItemId);
                      const dis =
                        item?.discountPercentage && item.discountPercentage > 0
                          ? `(Dis. ${formatterPercentage.format(item.discountPercentage / 100)})`
                          : undefined;

                      return (
                        <Space direction="vertical">
                          {item?.price && (
                            <Space>
                              {formatter.format(item.price)}
                              <Checkbox
                                checked={itemsSelected.some(
                                  (it1) =>
                                    it1.key == r.key &&
                                    it1.priceOffer == oc.value &&
                                    it1.quotationId == quotation?.id &&
                                    it1.vendorId == vendor.id,
                                )}
                                onChange={(checked) => {
                                  if (checked) {
                                    setItemsSelected((v) => [
                                      ...v.filter((it) => it.key != r.key),
                                      {
                                        key: r.key,
                                        priceOffer: oc.value,
                                        quotationId: quotation?.id || 0,
                                        quotationItemId: r.quotationItemId,
                                        vendorId: vendor.id,
                                      },
                                    ]);

                                    setForceUpdate((v) => v + 1);
                                  }
                                }}
                              />
                            </Space>
                          )}

                          {dis}
                        </Space>
                      );
                    },
                  } as ProColumns<AddPriceComparisonItem, 'text'>;
                }),
              })) as ProColumns<AddPriceComparisonItem, 'text'>[]),

              {
                valueType: 'option',
                width: 80,
                render: () => {
                  return null;
                },
              },
            ]}
            summary={() => (
              <Table.Summary key={`summary-${forceUpdate}`}>
                {summary.map((sum, index) => {
                  if (sum.type == 'freight' || sum.type == 'clearanceAgent') {
                    return (
                      <Table.Summary.Row
                        style={sum.bold ? { fontWeight: 'bolder' } : {}}
                        key={`row-${sum.type}-${sum.key}}-${index}`}
                      >
                        <Table.Summary.Cell
                          index={index}
                          colSpan={sum.colSpan}
                          align={sum.align}
                          rowSpan={sum.rowSpan}
                        >
                          <ProForm form={form} submitter={false}>
                            <ProFormText
                              rules={[{ required: true }]}
                              fieldProps={{ autoFocus: false }}
                              placeholder={undefined}
                              name={[sum.type, 'title', 'no', '0', sum.key, index]}
                            />
                          </ProForm>
                        </Table.Summary.Cell>
                        {offerComparisons.flatMap((po) => {
                          return vendors.flatMap((vendor, index) => {
                            const disabled = !itemsSelected.some(
                              (is) => is.priceOffer == po.value && is.vendorId == vendor.id,
                            );

                            const mulitProviders =
                              otherCost.filter((it) => it.type == sum.type).length > 1;

                            const selected = otherCost.some(
                              (it) =>
                                it.key == sum.key &&
                                it.values?.some(
                                  (it1) =>
                                    it1.priceOffer == po.value &&
                                    it1.vendorId == vendor.id &&
                                    it1.selected,
                                ),
                            );
                            return (
                              <Table.Summary.Cell
                                align="justify"
                                key={`cell-${sum.type}-${sum.key}-${po.value}-${vendor.id}-${index}}`}
                                index={0}
                              >
                                <ProForm form={form} submitter={false}>
                                  <Space>
                                    <ProFormMoney
                                      placeholder={''}
                                      disabled={disabled}
                                      fieldProps={{ autoFocus: false }}
                                      rules={[{ required: !disabled }]}
                                      name={[
                                        sum.type,
                                        'value',
                                        po.value,
                                        vendor.id,
                                        sum.key,
                                        index,
                                      ]}
                                    />
                                    {mulitProviders && (
                                      <Checkbox
                                        checked={selected}
                                        onChange={(checked) => {
                                          if (!checked) return;
                                          setOtherCost((v) =>
                                            v.map((it) =>
                                              it.key == sum.key
                                                ? {
                                                  ...it,
                                                  values: it.values?.map((it1) =>
                                                    it1.priceOffer == po.value &&
                                                      it1.vendorId == vendor.id
                                                      ? { ...it1, selected: true && !disabled }
                                                      : it1,
                                                  ),
                                                }
                                                : it.type == sum.type
                                                  ? {
                                                    ...it,
                                                    values: it.values?.map((it1) =>
                                                      it1.priceOffer == po.value &&
                                                        it1.vendorId == vendor.id
                                                        ? { ...it1, selected: false }
                                                        : it1,
                                                    ),
                                                  }
                                                  : it,
                                            ),
                                          );

                                          setForceUpdate((v) => v + 1);
                                          setForceCaculate((v) => v + 1);
                                        }}
                                        disabled={disabled}
                                      />
                                    )}
                                  </Space>
                                </ProForm>
                              </Table.Summary.Cell>
                            );
                          });
                        })}
                        <Table.Summary.Cell index={index + 2}>
                          {sum.action && sum.action}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }

                  return (
                    <Table.Summary.Row
                      style={sum.bold ? { fontWeight: 'bolder' } : {}}
                      key={`row-${sum.type}-${sum.key}}`}
                    >
                      <Table.Summary.Cell
                        index={index}
                        colSpan={sum.colSpan}
                        align={sum.align}
                        rowSpan={sum.rowSpan}
                      >
                        {' '}
                        {sum.title}{' '}
                      </Table.Summary.Cell>

                      {![
                        'freightTitle',
                        'clearanceAgentTitle',
                        'nonPriceCriteria',
                        'logisticFee',
                      ].some((t) => t == sum.type) &&
                        offerComparisons.flatMap((po) => {
                          return vendors.flatMap((v, index) => {
                            const data = sum.values?.find(
                              (it) => it.priceOffer == po.value && it.vendorId == v.id,
                            );

                            return (
                              <Table.Summary.Cell
                                key={`cell-${sum.type}-${sum.key}-${po.value}-${v.id}-${index}}`}
                                index={0}
                                align={data?.type == 'number' ? 'right' : 'left'}
                              >
                                {data?.type == 'number'
                                  ? (data?.numberValue || 0) > 0 &&
                                  formatter.format(data?.numberValue || 0)
                                  : data?.stringValue}
                              </Table.Summary.Cell>
                            );
                          });
                        })}

                      {sum.type != 'logisticFee' && sum.type != 'nonPriceCriteria' && (
                        <Table.Summary.Cell index={0}>
                          {sum.action && sum.action}
                        </Table.Summary.Cell>
                      )}
                    </Table.Summary.Row>
                  );
                })}
                <Table.Summary.Row style={{ fontWeight: 'bolder' }}>
                  <Table.Summary.Cell align="center" colSpan={isService ? 2 : 4} index={0}>
                    <Flex>
                      <ProForm.Item
                        colon={false}
                        label="Recommendations and justifications"
                        required
                      />
                    </Flex>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell
                    colSpan={3 + vendors.length * offerComparisons.length}
                    index={1}
                  >
                    <ProForm
                      form={form}
                      submitter={false}
                    // onValuesChange={onFormValuesChange}
                    >
                      <ProFormTextArea
                        fieldProps={{ autoFocus: false }}
                        name={'justifications'}
                        rules={[{ required: true }]}
                      />
                    </ProForm>
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell align="center" colSpan={isService ? 2 : 4} index={0}>
                    <Flex style={{ fontWeight: 'bolder' }}>
                      <ProForm.Item colon={false} label="Request to accept from" required />
                    </Flex>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell
                    colSpan={3 + vendors.length * offerComparisons.length}
                    index={1}
                  >
                    {prLinked.length == 0 && (
                      <ProForm form={form} submitter={false} onValuesChange={onFormValuesChange}>
                        <ProFormSelect
                          allowClear
                          showSearch
                          request={fetchHod}
                          name="acceptedBy"
                          rules={[{ required: true }]}
                          fieldProps={{ autoFocus: false }}
                        />
                      </ProForm>
                    )}

                    {prLinked.length > 0 && (
                      <ProForm form={form} submitter={false} onValuesChange={onFormValuesChange}>
                        <ProFormSelect
                          allowClear
                          showSearch
                          request={fetchHod}
                          name="acceptedBy"
                          rules={[{ required: true }]}
                          fieldProps={{ autoFocus: false }}
                        />
                      </ProForm>
                    )}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </ProCard>

        <ProCard title={<Space size={0}><PaperClipOutlined />Attachment Files</Space>} bordered style={{ marginBlockStart: 8 }}>
          <FileUploader
            multiple
            showTitle={false}
            addFileInfo
            service="FILE"
            onSetFiles={(files) => {
              setUploadFiles(files.map((it) => it.response));
            }}
          />
        </ProCard>
      </ProCard >

      <ProcessFlowModalWrapper
        type="action"
        action="Start"
        loading={false}
        noAttachment
        formKey={PriceComparisonFormNames.start}
        // payload={{ from: 'Requisition', id: id }}
        visible={startFormVisible}
        actionHandlers={{
          onStartWorkflow: onSaveHandler,
          onCancel: (_) => {
            setStartFormVisible(false);
          },
        }}
      />

      <ItemFinder
        selectedItems={quotations.map((it) => it.id)}
        open={!!finderVisible}
        vendorExcluded={quotations
          .filter(
            (it) =>
              it.priceOffer == finderVisible?.priceOffer &&
              it.vendor.id != finderVisible.vendor?.id,
          )
          .map((it) => it.vendor.id || 0)}
        vendor={finderVisible?.vendor}
        onOpenChange={(visible) => !visible && setFinderVisible(undefined)}
        onAddQuotation={(quotation) => {
          finderVisible &&
            onAddQuotatinHandler(
              quotation,
              finderVisible?.priceOffer,
              finderVisible?.vendorKey || '',
            );
        }}
        // onSave={  => onAddItemHandler}
        isService={isService}
      />
    </div >
  );
};
