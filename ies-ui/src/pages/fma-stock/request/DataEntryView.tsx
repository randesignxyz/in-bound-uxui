import { simpleRequestActions } from "@/services/model";
import { EditableFormInstance, EditableProTable, FooterToolbar, PageContainer, ProForm, ProFormCheckbox, ProFormDatePicker, ProFormSwitch, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Card, Col, Form, Modal, Row, Space, Spin, message } from "antd";
import { history } from 'umi';
import { StockRequest, StockRequestItem } from "./data.types";
import { useEffect, useRef, useState } from "react";
import SearchItemList from "./SearchItemList";
import { min, uniqueId } from "lodash";
import { ClearOutlined, MinusCircleOutlined } from "@ant-design/icons";
import FileUploader from "@/components/Attachment/FileUploader";
import { ProcessFlowModalWrapper } from "@/pages/process-flow/components/ProcessFlowModalWrapper";
import { StockRequestFormNames } from './process-flow';
import { StartWorkFlowParam } from "@/services/process-workflow/params";
import { createService } from "./services";
import { Moment } from "moment";
import moment from "moment";

export default ({
    id,
    type,
    onBack,
  }: {
    id?: number;
    type: 'CREATE' | 'EDIT';
    onBack: () => void;
  }) => {
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const editableFormRef = useRef<EditableFormInstance>();
    const [form] = Form.useForm<StockRequest>();
    const [searchVisible, setSearcVisible] = useState(false);
    const [addedItems, setAddedItems] = useState<StockRequestItem[]>([]);
    const [itemUomList, setItemUomList] = useState<{ itemCode: string; uom: string }[]>([]);
    const [forceClearUpload, setForceClearUpload] = useState(0);
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [startFormVisible, setStartFormVisible] = useState(false);
    const [groupId, setGroupId] = useState<number>(-1);

    // useEffect(()=>{
    //   services.listAllIUoMtem().then(rs=>{
    //     setItemUomList(rs)
    //   })
    // },[])
    const clear = () => {
      form.resetFields();
      setAddedItems([]);
      // setAddedServices([]);
      // setInitFileIds([]);
      setFileIds([]);
      setForceClearUpload((v) => v + 1);
      setItemUomList([])
      setGroupId(-1)
      // setIsService(false);
    };
    const getDataForm = async () => {
      const dataForm = await form.validateFields();
      await editableFormRef.current?.validateFields();
      if ((addedItems.length || 0) == 0) {
        message.error('Please add some request items.');
        return Promise.reject();
      }
      // if (dataForm.service && (addedServices.length || 0) == 0) {
      //   message.error('Please add some reqisition service.');
      //   return Promise.reject();
      // }
      return {
        ...dataForm,
        id: type == 'EDIT' ? id : undefined,
        groupId: groupId,       
        fileIds: fileIds,
        items: addedItems.map((v, index) => ({ ...v, seqNo: index + 1 })),
        // services: addedServices.map((v, index) => ({ ...v, seqNo: index + 1 })),
      };
    };

    return  <Spin spinning={requestActions.request?.loading || false}>
      <PageContainer title="NCM Stock Request Form" onBack={() => history.back()}>
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
                {/* <Button
                  onClick={async () => {
                    // const dataForm = await getDataForm();
                    Modal.confirm({
                      title: 'Save Requisition',
                      content: 'Are you sure?',
                      onOk: async () => {
                        try {
                          // await services.save(dataForm);
                          message.success('Save successfully.');
                          // clear();
                        } catch (error: any) {
                          message.error(error.message || 'Failed to save requisition.');
                        }
                      },
                    });
                  }}
                >
                  Save Draft
                </Button> */}
                <Button
                  type="primary"
                  onClick={async () => {
                    const payload = await getDataForm();
                    setStartFormVisible(true);
                    console.log('Payload',payload)
                  }}
                >
                  Submit
                </Button>
              </FooterToolbar>
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
                  name={'requestDate'}
                />               
              </Col>
            </Row>
            <Row gutter={20}>
              <Col flex={'400px'}>
                <ProFormTextArea
                  hasFeedback={false}
                  help={<span />}
                  rules={[{ required: true, whitespace: true }]}
                  label="Reason"
                  name={'reason'}
                />
              </Col>
              <Col flex={'400px'}>
                <ProFormTextArea label="Remarks" name={'remarks'} />
              </Col>
              <Col flex={'Auto'} />
            </Row>
          </Card>
          <Card
            title="Line Items"
            extra={
              <Space>
                <Button danger disabled={ addedItems.length == 0} icon={<ClearOutlined />} 
                  onClick={() => {
                    setAddedItems([])
                    setGroupId(-1)
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
                    setAddedItems((v) =>{
                      if(v.length==1){
                        setGroupId(-1)
                      }
                       return v.filter((it) => it.key != row.key)
                    })
                  }}
                  size="small"
                  icon={<MinusCircleOutlined />}
                />,
              ],
              onValuesChange: (_, recordList) => {
                // form.setFieldsValue({
                //   totalAmount: recordList
                //     .map((it) => (it.qty || 0))
                //     .reduce((p, c) => p + c, 0),
                // });
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
              // {
              //   title: 'Description',
              //   valueType: 'textarea',
              //   fieldProps: { rows: 1, maxLength: 700 },
              //   dataIndex: 'description',
              // },
              {
                title: 'Qty',
                width: 100,
                dataIndex: 'qty',
                fieldProps: { style: { width: 80 }, min: 1},
                valueType: 'digit',                
                formItemProps: {rules: [{ required: true}] },
              },
              {
                title: 'UoM',
                width: 130,
                dataIndex: 'uom',
                valueType: 'select',
                formItemProps: { rules: [{ required: true }] },
                valueEnum: (r) => itemUomList.filter(it => it.itemCode == r.itemCode).reduce((acc, cur) => ({ ...acc, [cur.uom]: cur.uom }), {})
                // request: async (_, { record }: { record: StockRequestItem }) => {
                //   console.log('select uom',itemUomList)
                //   return itemUomList
                //     .filter((it) => it.itemCode == record.itemCode)
                //     .map((it) => ({ label: it.uom, value: it.uom }));
                // },                
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
        </ProForm>
        <SearchItemList
          width={1200}
          open={searchVisible}
          onOpenChange={setSearcVisible}
          addedItems={addedItems?.map((it) => it.itemId)}
          selectedGroupId={groupId||-1}
          onAddItem={(item) => {
            if(groupId==-1){
              setGroupId(item.itemGroup.id)
            }
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
                uom: item.defaultUoM
              } as StockRequestItem,
            ];
            setAddedItems(itemList);
          }}
        />
        <ProcessFlowModalWrapper
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
                console.log('data request item: ',data)
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
        />
      </PageContainer>
    </Spin>
  };