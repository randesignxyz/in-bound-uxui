import { simpleRequestActions } from "@/services/model";
import { EditableFormInstance, EditableProTable, FooterToolbar, PageContainer, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Card, Col, Form, Row, Space, Spin, message } from "antd";
import { history } from 'umi';
import { FieldsValidation, AdjRequest, AdjRequestItem, LookupData } from "./data.types";
import { useEffect, useRef, useState } from "react";
import SearchItemList from "./SearchItemList";
import { uniqueId } from "lodash";
import { ClearOutlined, MinusCircleOutlined } from "@ant-design/icons";
import FileUploader from "@/components/Attachment/FileUploader";
import { ProcessFlowModalWrapper } from "@/pages/process-flow/components/ProcessFlowModalWrapper";
import { AdjustmentRequestFormNames } from './process-flow';
import { StartWorkFlowParam } from "@/services/process-workflow/params";
import { createService } from "./services";
import { BudgetCodeListItem } from "@/services/pro/data";
import { RequisitionServiceAPI } from "@/services/pro/services";


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
    // const proServices = RequisitionServiceAPI(requestActions);
    const editableFormRef = useRef<EditableFormInstance>();
    const [form] = Form.useForm<AdjRequest>();
    const [searchVisible, setSearcVisible] = useState(false);
    const [addedItems, setAddedItems] = useState<AdjRequestItem[]>([]);
    const [itemUomList, setItemUomList] = useState<{ itemCode: string; uom: string }[]>([]);
    const [forceClearUpload, setForceClearUpload] = useState(0);
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [startFormVisible, setStartFormVisible] = useState(false);
    const [groupId, setGroupId] = useState<number>(-1);
    const [budgetCodeList, setBudgetCodesList] = useState<BudgetCodeListItem[]>([]);
    const [requestType,setRequestType] = useState<LookupData[]>([]);

    useEffect(()=>{
      // services.listBudgetCode().then(budgetCodes => setBudgetCodesList(budgetCodes)); 
      services.listLookupData({type:'INVENTORY_ADJ_REQUEST_TYPE',searchValue:''}).then(rs=>{setRequestType(rs)})
    },[])

    const onFirstSelectedItem=(itemGroupName: string)=>{
      services.listBudgetCode([itemGroupName]).then(budgetCodes => setBudgetCodesList(budgetCodes)); 
    }
    const clear = () => {
      form.resetFields();
      setAddedItems([]);
      setFileIds([]);
      setForceClearUpload((v) => v + 1);
      setItemUomList([])
      setGroupId(-1)
      setBudgetCodesList([])
    };
    const getDataForm = async () => {
      const dataForm = await form.validateFields();
      await editableFormRef.current?.validateFields();
      const fieldsErr = Array<FieldsValidation>()
      if ((addedItems.length || 0) == 0) {
        message.error('Please add some request items.');
        return Promise.reject();
      }else {
        addedItems.forEach(r=>{
          if(r.requestType=='Write-Off' && r.qty>=0){
             fieldsErr.push({field: r.itemName ,msg: `Qty(${r.qty}) Write-Off is required less than zero.`})
           }
          if(r.requestType=='Adjustment' && r.qty==0){
            fieldsErr.push({field: r.itemName ,msg: `Qty(${r.qty}) Adjustment is required not zero.`})
          }
        })
      }
      if(fieldsErr.length> 0) {        
        message.error(<div>
          {fieldsErr.map(r => {
            return <div>{r.field}: {r.msg}</div>
          })}
        </div>);
        return Promise.reject();
      }
      return {
        ...dataForm,
        id: type == 'EDIT' ? id : undefined,
        groupId: groupId,       
        fileIds: fileIds,
        items: addedItems.map((v, index) => ({ ...v, seqNo: index + 1 })),
      } as AdjRequest;
    };

    return  <Spin spinning={requestActions.request?.loading || false}>
      <PageContainer title="New Inventory Adjustment Request Form" onBack={() => history.back()}>
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
                    const payload = await getDataForm();
                    setStartFormVisible(true);
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
                <ProFormTextArea
                  hasFeedback={false}
                  help={<span />}
                  rules={[{ required: true, whitespace: true }]}
                  label="Requesting Purpose"
                  name={'reason'}
                />
              </Col>
              {/* <Col flex={'200px'}>
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
             <Col flex={'200px'}>     
                {warehouse&&
                <ProFormSelect
                  // initialValue={warehouse?warehouse?.warehouseCode:''}
                  options={warehouse.map(i=>({label:i.warehouseCode, value: i.warehouseCode}))}
                  rules={[{ required: true, whitespace: true }]}
                  label="To Warehouse"
                  name={'warehouseTo'}
                />}       
              </Col>            */}
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
                    setBudgetCodesList([])
                  }}
                />
              </Space>
            }
            size="small"
            style={{ marginTop: 10, marginBottom: 10 }}
          />
          <EditableProTable<AdjRequestItem>
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
              record: () => ({} as AdjRequestItem),
            }}
            columns={[
              { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
              { title: 'Item Code', width: 100, editable: false, dataIndex: 'itemCode' },
              { title: 'Item Name', editable: false, dataIndex: 'itemName' },
              {
                title: 'Request Type',
                valueType: 'select',
                width: 150,
                dataIndex: 'requestType',
                fieldProps: { rows: 1, maxLength: 150 },
                formItemProps: { rules: [{ required: true }] },
                valueEnum: (r) => requestType?.reduce((acc, cur) => ({ ...acc, [cur.code]: cur.name }), {})    
              },           
              {
                title: 'Quantity Requested',
                width: 100,
                dataIndex: 'qty',
                fieldProps: { style: { width: 80}, min:-9999 },
                valueType: 'digit',                
                formItemProps: {rules: [{ required: true}] },
              },
              {
                title: 'UoM',
                width: 130,
                dataIndex: 'uom',
                valueType: 'select',
                formItemProps: { rules: [{ required: false }] },
                valueEnum: (r) => itemUomList.filter(it => it.itemCode == r.itemCode).reduce((acc, cur) => ({ ...acc, [cur.uom]: cur.uom }), {})                
              },{
                title: 'Budget.Code',
                width: 150,
                dataIndex: 'budgetCode',
                fieldProps: { showSearch: true },
                valueType: 'select',
                // request: async (_, r: any) => {
                //   return budgetCodeList.map((it) => ({ label: it.code, value: it.code }));
                // }
                valueEnum: (r) => budgetCodeList.reduce((acc, cur) => ({ ...acc, [cur.code]: cur.code }), {})   
                ,
              }/*,
              {
                title: 'Expected Return Date',
                width: 110,
                dataIndex: 'returnDate',
                fieldProps: { style: { width: 110 }},
                valueType: 'date',                
                formItemProps: {rules:[
                  {
                    required: false,
                  },
                ]},
              }*/,             
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
              onFirstSelectedItem(item.itemGroup.itemGroupName)
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
              } as AdjRequestItem,
            ];
            setAddedItems(itemList);
          }}
        />
        <ProcessFlowModalWrapper
          type="action"
          action="Start"
          loading={false}
          noAttachment
          formKey={AdjustmentRequestFormNames.start}
          visible={startFormVisible}
          actionHandlers={{
            onStartWorkflow: async (processDef, formKey, buId, requestor, comment) => {
              const dataForm = await getDataForm();
              const data: StartWorkFlowParam<AdjRequest> = {
                processDef: processDef,
                formKey: formKey,
                buId: buId,
                requestor: requestor.id,
                comment: comment,
                payload: dataForm,
              };
              try {
                const rs = await services.request(data);
                message.success(`Your request is submitted. Please track the request with form no ${rs.formNo} `,);
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