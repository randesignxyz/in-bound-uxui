import { simpleRequestActions } from "@/services/model";
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { EditableFormInstance, EditableProTable, FooterToolbar, PageContainer, ProForm, ProFormCheckbox, ProFormDatePicker, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Card, Col, Form, Modal, Row, Space, Spin, message } from "antd";
import { history, useAccess } from 'umi';
import { StockRequest, StockRequestItem, WarehouseGroup } from "./data.types";
import { useEffect, useRef, useState } from "react";
import SearchItemList from "./SearchItemList";
import { uniqueId } from "lodash";
import { ClearOutlined, MinusCircleOutlined } from "@ant-design/icons";
import FileUploader from "@/components/Attachment/FileUploader";
import { ProcessFlowModalWrapper } from "@/pages/process-flow/components/ProcessFlowModalWrapper";
import { StockRequestFormNames } from './process-flow';
import { StartWorkFlowParam } from "@/services/process-workflow/params";
import { createService as createServiceAdj } from "@/pages/fma-stock/adjustment/services";
import { BudgetCodeListItem } from "@/services/pro/data";
import { createService } from "./services";
import { Moment } from "moment";

type DataRequestor = {
  requestorId: string;
  requestorBuId: number;    
};

export default ({
  id,
  type,
  onBack,
}: {
  id?: number;
  type: 'CREATE' | 'EDIT';
  onBack: () => void;
}) => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const servicesAdj = createServiceAdj(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [form] = Form.useForm<StockRequest>();
  // const [formRequestor] = Form.useForm<DataRequestor>();
  const [searchVisible, setSearcVisible] = useState(false);
  const [addedItems, setAddedItems] = useState<StockRequestItem[]>([]);
  const [itemUomList, setItemUomList] = useState<{ itemCode: string; uom: string }[]>([]);
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [startFormVisible, setStartFormVisible] = useState(false);
  const [groupId, setGroupId] = useState<number>(-1);
  const [budgetCodeList, setBudgetCodesList] = useState<BudgetCodeListItem[]>([]);
  const [warehouseGroupList, setWarehouseGroup] = useState<WarehouseGroup[]>([]);



  
  const initData = async () => {
    services.listWarehouseGroup().then(whg => setWarehouseGroup(whg));
  };
  useEffect(() => {
    initData();
  }, [id]);
  const clear = () => {
    form.setFieldValue('reason',undefined)
    form.setFieldValue('warehouseFrom',undefined)
    form.setFieldValue('delivery',false)
    setAddedItems([]);
    setFileIds([]);
    setForceClearUpload((v) => v + 1);
    setItemUomList([])
    setGroupId(-1)
    setBudgetCodesList([])
  };
  const onFirstSelectedItem = (itemGroupName: string) => {
    servicesAdj.listBudgetCode([itemGroupName]).then(budgetCodes => setBudgetCodesList(budgetCodes));
  }
  const getDataForm = async () => {
    const dataForm = await form.validateFields();
    await editableFormRef.current?.validateFields();
    if ((addedItems.length || 0) == 0) {
      message.error('Please add some request items.');
      return Promise.reject();
    }
    return {
      ...dataForm,
      id: type == 'EDIT' ? id : undefined,
      groupId: groupId,
      fileIds: fileIds,
      items: addedItems.map((v, index) => ({ ...v, seqNo: index + 1 })),
    } as StockRequest;
  };

  return <Spin spinning={requestActions.request?.loading || false}>
    <PageContainer title="NCM Request Form" onBack={() => history.back()}>
      <ProForm
        form={form}
        submitter={{
          render: () => (
            <FooterToolbar>
              <Button style={{ marginRight: 10 }} onClick={onBack}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  clear();
                }}
              >
                Clear
              </Button>
              <Button
                type="primary"
                onClick={async () => {
                  const dataForm = await getDataForm();
                  console.log('NCM data form:',dataForm)
                  // setStartFormVisible(true);
                  Modal.confirm({
                    title: 'NCM Stock request',
                    content: 'Are you sure?',
                    onOk: async () => {
                      try {             
                        const rs = await services.submitRequest(dataForm);
                        message.success(
                          `Your request is submitted. Please track the request with form no ${rs.formNo} `,
                        );
                        clear();
                        return Promise.resolve();
                      } catch (error: any) {
                        message.error(error.message || 'Failed to submit.');
                        Promise.reject();
                      }
                    }
                  })
                }}
              >
                Submit
              </Button>
            </FooterToolbar>
          ),
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Requestor onlyCurrentUser={!access.canAccessNCMStoctRequestSalAdmin} form={form} />
          <Card title="General" size="small">
            <Row gutter={20}>
              <Col flex={'400px'}>
                <ProFormTextArea
                  hasFeedback={false}
                  help={<span />}
                  rules={[{ required: true, whitespace: true }]}
                  label="Requesting Purpose"
                  name={'reason'}
                />
              </Col>
              <Col flex={'200px'}>
                <Row>
                  {warehouseGroupList &&
                    <ProFormSelect
                      options={warehouseGroupList.map(i => ({ label: i.name, value: i.code }))}
                      rules={[{ required: true, whitespace: true }]}
                      label="From Warehouse"
                      name={'warehouseFrom'}
                    />}
                </Row>
                <Row>
                  <ProFormCheckbox name={'delivery'}>Delivery</ProFormCheckbox>
                </Row>
              </Col>
            </Row>
          </Card>
          <Card
            title="Line Items"
            extra={
              <Space>
                <Button danger disabled={addedItems.length == 0} icon={<ClearOutlined />}
                  onClick={() => {
                    setAddedItems([])
                    setGroupId(-1)
                    setBudgetCodesList([])
                  }}
                />
              </Space>
            }
            size="small"
            style={{ marginTop: 10, marginBottom: 10 }}
          />
          <EditableProTable<StockRequestItem>
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
                    setAddedItems((v) => {
                      if (v.length == 1) {
                        setGroupId(-1)
                        setBudgetCodesList([])
                      }
                      return v.filter((it) => it.key != row.key)
                    })
                  }}
                  size="small"
                  icon={<MinusCircleOutlined />}
                />,
              ],
              onValuesChange: (_, recordList) => {
                setAddedItems(
                  recordList.map((it) => ({
                    ...it,
                  })),
                );
              },
            }}
            recordCreatorProps={{
              creatorButtonText: 'Add Item ',
              onClick: () => {
                setSearcVisible(true);
              },
              record: () => ({} as StockRequestItem),
            }}
            columns={[
              { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
              { title: 'Item Code', width: 100, editable: false, dataIndex: 'itemCode' },
              { title: 'Item Name', editable: false, dataIndex: 'itemName' },
              {
                title: 'Quantity Requested',
                width: 100,
                dataIndex: 'qty',
                fieldProps: { style: { width: 80 }, min: 1 },
                valueType: 'digit',
                formItemProps: { rules: [{ required: true }] },
              },
              {
                title: 'UoM',
                width: 130,
                dataIndex: 'uom',
                valueType: 'select',
                formItemProps: { rules: [{ required: true }] },
                valueEnum: (r) => itemUomList.filter(it => it.itemCode == r.itemCode).reduce((acc, cur) => ({ ...acc, [cur.uom]: cur.uom }), {})
              }, {
                title: 'Budget.Code',
                width: 150,
                dataIndex: 'budgetCode',
                fieldProps: { showSearch: true },
                formItemProps: { rules: [{ required: true }] },
                valueType: 'select',
                // request: async (_, r: any) => {
                //   return budgetCodeList.map((it) => ({ label: it.code, value: it.code }));
                // },
                valueEnum: (r) => budgetCodeList.reduce((acc, cur) => ({ ...acc, [cur.code]: cur.code }), {})
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
          <FileUploader
            multiple
            key={`uoloadfile${forceClearUpload}`}
            service="FILE"
            onSetFiles={(files) => {
              setFileIds(files.map((it) => it.response));
            }}
          />
        </Space>
      </ProForm>
      <SearchItemList
        width={1200}
        open={searchVisible}
        onOpenChange={setSearcVisible}
        addedItems={addedItems?.map((it) => it.itemId)}
        selectedGroupId={groupId || -1}
        onAddItem={(item) => {
          if (groupId == -1) {
            setGroupId(item.itemGroup.id)
            onFirstSelectedItem(item.itemGroup.itemGroupName)
          }
          if (!itemUomList.some((it) => it.itemCode == item.itemCode)) {
            const newItems = item.uomList.map((it1) => ({ itemCode: item.itemCode, uom: it1 }));
            // setItemUomList((v) => [...v, ...newItems,{itemCode: 'UN00000001',uom: 'Set1' }]);
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
              uom: item.defaultUoM
            } as StockRequestItem,
          ];
          setAddedItems(itemList);
        }}
      />
      {/* <ProcessFlowModalWrapper
        type="action"
        action="Start"
        loading={false}
        noAttachment
        formKey={StockRequestFormNames.start}
        visible={startFormVisible}
        actionHandlers={{
          onStartWorkflow: async (processDef, formKey, buId, requestor, comment) => {
            const dataForm = await getDataForm();
            const data: StartWorkFlowParam<StockRequest> = {
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
              clear();
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
      /> */}
    </PageContainer>
  </Spin>
};