import FileUploader from '@/components/Attachment/FileUploader';
import { ProcessFlowModalWrapper } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import { formatter } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import {
  BudgetCodeListItem,
  RequisitionDetailResponse,
  RequisitionItem,
  RequisitionService,
  Requistion,
} from '@/services/pro/data';
import { RequisitionServiceAPI } from '@/services/pro/services';
import { StartWorkFlowParam } from '@/services/process-workflow/params';
import { ClearOutlined, MinusCircleOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  PageContainer,
} from '@ant-design/pro-components';
import ProForm, {
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormMoney,
  ProFormSwitch,
  ProFormTextArea,
} from '@ant-design/pro-form';
import {
  Button, Card, Col,
  Divider, Form, message,
  Modal, Row, Space, Spin
} from 'antd';
import { uniqueId } from 'lodash';
import moment, { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { history } from "@umijs/max";
import SearchItemList from './components/SearchItemList';
import { AcquisitionFormNames } from './process-flow';
import { useInView } from 'react-intersection-observer';

export default ({
  id,
  type,
  openInTab,
  onCloseTab,
}: {
  id?: number;
  type: 'CREATE' | 'EDIT';
  openInTab?: true;
  onCloseTab?: () => void;
  onBack?: () => void;
}) => {
  const [form] = Form.useForm<Requistion>();
  const editableFormRef = useRef<EditableFormInstance>();

  const [searchVisible, setSearcVisible] = useState(false);
  const [startFormVisible, setStartFormVisible] = useState(false);
  const [addedItems, setAddedItems] = useState<RequisitionItem[]>([]);
  const [addedServices, setAddedServices] = useState<RequisitionService[]>([]);

  const requestActions = simpleRequestActions();
  const services = RequisitionServiceAPI(requestActions);
  const [isService, setIsService] = useState<boolean>(false);
  const [requiredBudgetCode, setRequiredBudgetCode] = useState<boolean>(false);
  const [budgetCodeList, setBudgetCodesList] = useState<BudgetCodeListItem[]>([]);
  const [itemUomList, setItemUomList] = useState<{ itemCode: string; uom: string }[]>([]);

  const [forceClearUpload, setForceClearUpload] = useState(0);
  const [fileIds, setFileIds] = useState<string[]>([]);

  const { ref, inView } = useInView({});

  const clear = () => {
    form.resetFields();
    setAddedItems([]);
    setAddedServices([]);
    // setInitFileIds([]);
    setFileIds([]);
    setForceClearUpload((v) => v + 1);
    setIsService(false);
  };


  const initData = async () => {
    services.listBudgetCode().then(budgetCodes => setBudgetCodesList(budgetCodes));

    if (id && id > 0) {
      const data = await services.detail(id);
      initFormData(data);
    }
  };

  useEffect(() => {
    initData();
  }, [id]);


  const initFormData = (data: RequisitionDetailResponse) => {
    const dataForm: Requistion = {
      id: type == 'EDIT' ? data.id : 0,
      acquisitionDate: moment(data.acquisitionDate),
      budgetCodeRequired: data.budgetCodeRequired,
      totalAmount: data.totalAmount,
      reason: data.reason,
      remarks: data.remarks,
      service: data.service,
      fileIds: data.fileIds || [],
      items: data.items.map((it) => ({
        id: it.id,
        key: uniqueId(),
        itemId: it.itemId,
        itemCode: it.itemCode,
        itemName: it.itemName,
        description: it.description,
        qty: it.qty,
        unitPrice: it.unitPrice,
        uom: it.uom,
        amount: it.amount,
        budgetCode: it.budgetCode,
        remarks: it.remarks,
      })),
      services: data.services.map((it) => ({
        id: it.id,
        key: uniqueId().toString(),
        serviceName: it.serviceName,
        description: it.description,
        amount: it.amount,
        budgetCode: it.budgetCode,
        remarks: it.remarks,
      })),
    };
    setRequiredBudgetCode(data.budgetCodeRequired);
    setIsService(data.service);
    // setInitFileIds(data.fileIds || []);
    setFileIds(data.fileIds || []);
    setAddedItems(dataForm.items);
    setAddedServices(dataForm.services);
    form.setFieldsValue(dataForm);
  };

  const getDataForm = async () => {
    const dataForm = await form.validateFields();
    await editableFormRef.current?.validateFields();
    if (!dataForm.service && (addedItems.length || 0) == 0) {
      message.error('Please add some reqisition items.');
      return Promise.reject();
    }

    if (dataForm.service && (addedServices.length || 0) == 0) {
      message.error('Please add some reqisition service.');
      return Promise.reject();
    }

    return {
      ...dataForm,
      id: type == 'EDIT' ? id : undefined,
      fileIds: fileIds,
      items: addedItems.map((v, index) => ({ ...v, seqNo: index + 1 })),
      services: addedServices.map((v, index) => ({ ...v, seqNo: index + 1 })),
    };
  };

  const layout = <div ref={ref}><ProForm

    form={form}

    onValuesChange={(changeValue, values) => {
      const { budgetCodeRequired, service } = changeValue;

      if ('service' in changeValue) {
        setIsService(service);
      }
      if ('budgetCodeRequired' in changeValue) {
        setRequiredBudgetCode(budgetCodeRequired);
      }
    }}
    submitter={{
      render: () => (
        inView ? <FooterToolbar>
          {!openInTab && <Button style={{ marginRight: 10 }} onClick={() => history.back()}>
            Cancel
          </Button>}

          {!openInTab && <Button
            onClick={() => {
              clear();
            }}
          >
            Clear
          </Button>}
          <Button
            onClick={async () => {
              const dataForm = await getDataForm();
              Modal.confirm({
                title: 'Save Requisition',
                content: 'Are you sure?',
                onOk: async () => {
                  try {
                    await services.save(dataForm);
                    message.success('Save successfully.');

                    !openInTab && clear();
                    openInTab && onCloseTab?.()
                  } catch (error: any) {
                    message.error(error.message || 'Failed to save requisition.');
                  }
                },
              });
            }}
          >
            Save Draft
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              await getDataForm();
              setStartFormVisible(true);
            }}
          >
            Submit
          </Button>
        </FooterToolbar> : <></>
      ),
    }}
  >
    <Card title="General" size="small">
      <Row gutter={20}>
        <Col flex={'400px'}>
          <ProFormDatePicker
            rules={[
              {
                required: true,
                validator: (rules, value) => {
                  if ((value as Moment).startOf('day').isBefore(moment().startOf('day'))) {
                    return Promise.reject('Request date cannot be back date.');
                  } else {
                    return Promise.resolve();
                  }
                },
              },
            ]}
            label=" Expected date"
            name={'acquisitionDate'}
          />
          <ProFormTextArea
            hasFeedback={false}
            help={<span />}
            rules={[{ required: true, whitespace: true }]}
            label="Reason"
            name={'reason'}
          />
        </Col>
        <Col flex={'400px'}>
          <ProFormCheckbox
            labelAlign="left"
            label="Budget Code Required"
            name={'budgetCodeRequired'}
          />
          <ProFormTextArea label="Remarks" name={'remarks'} />
        </Col>
        <Col flex={'Auto'} />
      </Row>
    </Card>
    <Card
      title="Line Items"
      extra={
        <Space>
          <ProFormSwitch
            disabled={addedItems.length > 0 || addedServices.length > 0}
            fieldProps={{}}
            labelCol={{ flex: 1 }}
            unCheckedChildren={'Item'}
            checkedChildren={'Service'}
            name={'service'}
          />
          <Button danger disabled={isService ? addedServices.length == 0 : addedItems.length == 0} icon={<ClearOutlined />} onClick={() => {
            setAddedItems([])
            setAddedServices([])
          }} />
        </Space>
      }
      size="small"
      style={{ marginTop: 10, marginBottom: 10 }}
    >
      {!isService && (
        <EditableProTable<RequisitionItem>
          value={addedItems}
          editableFormRef={editableFormRef}
          rowKey="key"
          size="small"
          editable={{
            type: 'multiple',
            editableKeys: addedItems.map((it) => it.key),
            actionRender: (row) => [
              <Button
                type="link"
                danger
                onClick={() => {
                  setAddedItems((v) => v.filter((it) => it.key != row.key));
                  form.setFieldsValue({
                    totalAmount: addedItems
                      .filter((it) => it.key != row.key)
                      .map((it) => (it.qty || 0) * (it.unitPrice || 0))
                      .reduce((p, c) => p + c, 0),
                  });
                }}
                size="small"
                icon={<MinusCircleOutlined />}
              />,
            ],
            onValuesChange: (_, recordList) => {
              form.setFieldsValue({
                totalAmount: recordList
                  .map((it) => (it.qty || 0) * (it.unitPrice || 0))
                  .reduce((p, c) => p + c, 0),
              });
              setAddedItems(
                recordList.map((it) => ({
                  ...it,
                  amount: (it.qty || 0) * (it.unitPrice || 0),
                })),
              );
            },
          }}
          recordCreatorProps={{
            creatorButtonText: 'Add Item ',

            onClick: () => {
              setSearcVisible(true);
            },

            record: () => ({} as RequisitionItem),
          }}
          columns={[
            { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
            { title: 'Item Code', width: 100, editable: false, dataIndex: 'itemCode' },
            { title: 'Item Name', editable: false, dataIndex: 'itemName' },
            {
              title: 'Description',
              valueType: 'textarea',
              fieldProps: { rows: 1, maxLength: 700 },
              dataIndex: 'description',
            },
            {
              title: 'Qty',
              width: 100,
              dataIndex: 'qty',
              fieldProps: { style: { width: 80 } },
              valueType: 'digit',
              formItemProps: { rules: [{ required: true }] },
            },
            {
              title: 'UoM',
              width: 130,
              dataIndex: 'uom',
              valueType: 'select',
              formItemProps: { rules: [{ required: true }] },
              request: async (_, { record }: { record: RequisitionItem }) => {
                return itemUomList
                  .filter((it) => it.itemCode == record.itemCode)
                  .map((it) => ({ label: it.uom, value: it.uom }));
              },
            },
            {
              title: 'Unit Price',
              dataIndex: 'unitPrice',
              width: 130,
              fieldProps: { style: { width: 120 } },
              valueType: 'money',
              formItemProps: { rules: [{ required: true }], style: { width: '130px' } },
            },
            {
              title: 'Amount',
              width: 130,
              align: 'right',
              editable: false,
              renderText: (_, record) => formatter.format(record.qty * record.unitPrice),
            },
            {
              title: 'Budget.Code',
              width: 150,
              dataIndex: 'budgetCode',
              fieldProps: { showSearch: true },
              valueType: 'select',
              request: async (_, { record }: { record: RequisitionItem }) => {
                return budgetCodeList.map((it) => ({ label: it.code, value: it.code }));
              },
            },
            {
              title: 'Remarks',
              valueType: 'textarea',
              dataIndex: 'remarks',
              fieldProps: { rows: 1, maxLength: 200 },
            },
            {
              valueType: 'option',
              width: 50,
              render: () => {
                return null;
              },
            },
          ]}
        />
      )}

      {isService && (
        <EditableProTable<RequisitionService>
          value={addedServices}
          rowKey="key"
          size="small"
          editableFormRef={editableFormRef}
          editable={{
            type: 'multiple',
            editableKeys: addedServices.map((it) => it.key),
            actionRender: (row) => [
              <Button
                type="link"
                onClick={() => {
                  setAddedServices((v) => v.filter((it) => it.key != row.key));
                  form.setFieldsValue({
                    totalAmount: addedServices
                      .filter((it) => it.key != row.key)
                      .map((it) => it.amount || 0)
                      .reduce((p, c) => p + c, 0),
                  });
                }}
                size="small"
                danger
                icon={<MinusCircleOutlined />}
              />,
            ],
            onValuesChange: (_, recordList) => {
              form.setFieldsValue({
                totalAmount: recordList
                  .map((it) => it.amount || 0)
                  .reduce((p, c) => p + c, 0),
              });
              setAddedServices(recordList);
            },
          }}
          recordCreatorProps={{
            creatorButtonText: 'Add Service ',
            newRecordType: 'dataSource',
            record: (index, datas) =>
            ({
              key: uniqueId().toString() + index,
              serviceName: '',
              amount: 0,
            } as RequisitionService),
          }}
          columns={[
            { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
            {
              title: 'Service Name',
              dataIndex: 'serviceName',
              formItemProps: { rules: [{ required: true, whitespace: true }] },
            },
            { title: 'Description', valueType: 'text', dataIndex: 'description' },
            {
              title: 'Amount',
              valueType: 'money',
              width: 155,
              dataIndex: 'amount',
              fieldProps: { style: { width: 150 } },
              formItemProps: { rules: [{ required: true }] },
            },
            {
              title: 'Budget.Code',
              width: 150,
              fieldProps: { showSearch: true },
              dataIndex: 'budgetCode',
              valueType: 'select',
              valueEnum: (_) =>
                budgetCodeList.reduce((acc, cur) => ({ ...acc, [cur.code]: cur.code }), {}),
              formItemProps: { rules: [{ required: requiredBudgetCode }] },
            },
            { title: 'Remarks', valueType: 'text', dataIndex: 'remarks' },
            {
              valueType: 'option',
              width: 50,
              render: () => {
                return null;
              },
            },
          ]}
        />
      )}

      <Divider />
      <Row style={{ alignItems: 'center' }}>
        <Col flex={'Auto'} />
        <Col flex={'100px'}>
          <b>Total Amount:</b>{' '}
        </Col>
        <Col flex={'200px'}>
          <ProFormMoney
            placeholder={''}
            fieldProps={{ readOnly: true }}
            name={'totalAmount'}
          />
        </Col>
      </Row>
    </Card>

    <FileUploader
      multiple
      key={`uoloadfile${forceClearUpload}`}
      service="FILE"
      onSetFiles={(files) => {
        setFileIds(files.map((it) => it.response));
      }}
    />
  </ProForm>
  </div>
  return (
    <Spin spinning={requestActions.request?.loading}>

      {openInTab ? layout : <PageContainer title="Purchase Requisition Form" onBack={() => history.back()}>
        {layout}
      </PageContainer>}
      <SearchItemList
        width={1000}
        open={searchVisible}
        onOpenChange={setSearcVisible}
        addedItems={addedItems?.map((it) => it.itemId)}
        onAddItem={(item) => {
          if (!itemUomList.some((it) => it.itemCode == item.itemCode)) {
            const newItems = item.uomList.map((it1) => ({ itemCode: item.itemCode, uom: it1 }));
            setItemUomList((v) => [...v, ...newItems]);
          }
          const itemList = [
            ...addedItems,
            {
              itemId: item.id,
              key: uniqueId().toString(),
              itemCode: item.itemCode,
              itemName: item.itemName,
              qty: 1,
              unitPrice: item.lastPurchasePrice,
              uom: item.buyUoM,
              amount: item.lastPurchasePrice,
            } as RequisitionItem,
          ];
          form.setFieldsValue({
            totalAmount: itemList.map((it) => it.amount).reduce((p, c) => p + c, 0),
          });
          setAddedItems(itemList);
        }}
      />

      <ProcessFlowModalWrapper
        type="action"
        action="Start"
        loading={false}
        noAttachment
        formKey={AcquisitionFormNames.start}
        // payload={{ from: 'Requisition', id: id }}
        visible={startFormVisible}
        actionHandlers={{
          onStartWorkflow: async (processDef, formKey, buId, requestor, comment) => {
            const dataForm = await getDataForm();
            const data: StartWorkFlowParam<Requistion> = {
              processDef: processDef,
              formKey: formKey,
              buId: buId,
              requestor: requestor.id,
              comment: comment,
              payload: dataForm,
            };

            try {
              const rs = await services.request(data);
              message.success(
                `Your request is submitted. Please track the request with form no ${rs.formNo} `,
              );
              !openInTab && clear();
              openInTab && onCloseTab?.()
              return Promise.resolve();
            } catch (error: any) {
              message.error(error.message || 'Failed to submit.');
              Promise.reject();
            }
          },
          onCancel: (_) => {
            setStartFormVisible(false);
          },
        }}
      />
    </Spin>
  );
};
