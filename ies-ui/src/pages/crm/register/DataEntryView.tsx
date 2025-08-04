import { EditableFormInstance, EditableProTable, FooterToolbar, ProCard, ProForm, ProFormGroup, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea, ProTable } from "@ant-design/pro-components"
import { Button, Card, Checkbox, Flex, Form, message, Modal, Space, Spin } from "antd"
import { AddresssView, DocRequirementCustomerParams, DoRequireCustomerList, PurchasingPerformanceItem, RcSapEmpSale, RegisterCustomer, RegisterCustomerDetailResponse } from "./data";
import { useEffect, useRef, useState } from "react";
import AddressListView from "./components/AddressListView";
import { model } from "../customer/model";
import { model as registerModel } from "./model";
import { RegisterCustomerServiceAPI } from "./services";
import { useInView } from "react-intersection-observer";
import PurchasingPerformanceView from "./components/PurchasingPerformanceView";
import { uniqueId } from "lodash";
import FileUploader from "@/components/Attachment/FileUploader";
import AttachedFileList from "@/components/Attachment/AttachedFileList";
import DocmentRequire from "./components/DocmentRequire";
import RemarkCard from "./components/RemarkCard";
import { LookupData } from "@/services/data";

export default({
  id,
  type,
  onCloseTab,
  readOnly
}:{
  id?: number;
  type: 'CREATE' | 'EDIT';
  onCloseTab?: () => void;
   readOnly?: boolean | undefined,
})=>{
  const service = RegisterCustomerServiceAPI()
  const [form] = Form.useForm<RegisterCustomerDetailResponse>();
  const { ref, inView } = useInView({});
  // const { state, ops, actions, modals } = model(0);
  const { state1,actions1 } = registerModel();

  const [addressList, setAddressList] = useState<AddresssView[]>()
  const [shippingAddressList, setShippingAddressList] = useState<AddresssView[]>()
  const editablePPItemFormRef = useRef<EditableFormInstance>();
  const [ppItems, setPPItems] = useState<PurchasingPerformanceItem[]>([])

  const [uploadFileIds, setUploadFileIds] = useState<(string|undefined)[]>([]);
  const[attachedFiles, setAttachedFiles]  = useState<{fileId: string, activity: string}[]>([]); 
  const [personalList, setPersonaList] = useState<DoRequireCustomerList[]>([])
  const [coporateList, setcoporateList] = useState<DoRequireCustomerList[]>([]) 
  const [data, setData] = useState<RegisterCustomerDetailResponse>()
  const [ lookupDataList, setLookupDataList ] = useState<LookupData[]>([])
  const [sale, setSale] = useState<RcSapEmpSale[]>([])


  useEffect(() => {   
    initData()
  }, [id]);

  const initData = async () =>{ 
    const rs = await actions1.initData("Detail")  
    if (id && id > 0) {
      const data = await  service.detail(id)
      initFormData(data)
      setPPItems(data?.ppItems?.map((it) => ({...it,key: uniqueId().toString(),itemId: it?.itemId?.toString()}))||[])
      setAddressList(data?.billing?.map(it=>({...it,key: uniqueId().toString()})))
      setShippingAddressList(data?.shipping?.map(it=>({...it,key: uniqueId().toString()})))
      setPersonaList(data?.docPersonalList||[])
      setcoporateList(data?.docCorporateList||[])
      // setUploadFileIds(data?.attachedFiles||[])
      setAttachedFiles(data?.attachedFiles?.map(it => ({ fileId: it, activity: 'Start' })) || [])
      await service.initCustomerData([{
          actionName: 'lookupDataList',
          payload: {
              list: [
                  'SALE_SAP_SERIES'
              ],
          },
      }]).then((rs)=>{
          setLookupDataList(rs.lookupDataList||[])
      })    
    }else{
      service.listDocRequirement().then(r=>{
        setPersonaList(r.filter(it => it.docSource==='PERSONAL'))
        setcoporateList(r.filter(it => it.docSource==='CORPORATE'))
      })
    }
    service.listRcSapEmployeeSale().then(r=>{
      setSale(r)
    })
  }
  const initFormData = (data: RegisterCustomerDetailResponse) =>{
    setData(data)
    form.setFieldsValue(data);
  }    
    
  const getPayload = async () => {
    const dataForm = await form.validateFields(); 
    const dataPayload = { ...dataForm,
      id: id||0,
      customerCode: dataForm.customerCode,
      ppItems:ppItems,
      billing: addressList?.map(it=>({
        id: it.id ||0,
        address: it.address,
        houseNo: it.houseNo,
        houseNoKh: it.houseNoKh,
        streetNo: it.streetNo,
        streetNoKh: it.streetNoKh,
        streetName: it.streetName,
        streetNameKh: it.streetNameKh,
        latitude: it.latitude,
        longitude: it.longitude,
        provinceId: it.province?.id || 0,
        districtId: it.district?.id || 0,
        communeId: it.commune?.id || 0,
        villageId: it.village?.id,
        hotspot: it.hotspot,
        direction: it.direction,
      }))||[],
      shipping: shippingAddressList?.map(it=>({
        id: it.id ||0,
        address: it.address,
        houseNo: it.houseNo,
        houseNoKh: it.houseNoKh,
        streetNo: it.streetNo,
        streetNoKh: it.streetNoKh,
        streetName: it.streetName,
        streetNameKh: it.streetNameKh,
        latitude: it.latitude,
        longitude: it.longitude,
        provinceId: it.province?.id || 0,
        districtId: it.district?.id || 0,
        communeId: it.commune?.id || 0,
        villageId: it.village?.id,
        hotspot: it.hotspot,
        direction: it.direction,
      }))||[],
      docPersonalList: personalList.map(it => ({
        id:it.id,
        reCustomerId: it.reCustomerId||0,
        reDocRequireId:it.reDocRequireId||0,
        checkList:it.checkList
      } as DocRequirementCustomerParams)),
      docCorporateList: coporateList.map(it => ({
        id:it.id,
        reCustomerId: it.reCustomerId||0,
        reDocRequireId:it.reDocRequireId||0,
        checkList:it.checkList
      } as DocRequirementCustomerParams)),
      attachedFiles: uploadFileIds
    } as RegisterCustomer   
    return dataPayload;
  } 

  const onCancelHandler = () => { 
    if(type=='CREATE') {
      onCloseTab?.()
    }else{
      Modal.confirm({
        title: 'Cancel Register Customer',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            await service.cancelForm(id||0)
            message.success('Cancel successfully.');
            onCloseTab?.()
          } catch (error: any) {
            message.error(error.message || 'Failed to save requisition.');
          }
        },
      });  
    }
    
  };
  const onSaveDraftHandler = async () => {   
    const dataPayload = await getPayload();  
    console.log('register customer', dataPayload)  
    await editablePPItemFormRef.current?.validateFields()    
    Modal.confirm({
      title: 'Save Register Customer',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await service.save(dataPayload)
          message.success('Save successfully.');
          onCloseTab?.()
        } catch (error: any) {
          message.error(error.message || 'Failed to save requisition.');
        }
      },
    });
  }

  const onSubmitHandler = async () => {
    const dataPayload = await getPayload();
    if(addressList?.length==0) {
       message.warning('Billing Address is required.');
    }else if(shippingAddressList?.length==0) {
      message.warning('Shipping Address is required.');
    }else if(ppItems?.length==0) {
      message.warning('Purchasing Performance is required.');
    }else{
      Modal.confirm({
      title: 'Submit Register Customer',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await service.submit(dataPayload)
          message.success('Submit successfully.');
          onCloseTab?.()
        } catch (error: any) {
          message.error(error.message || 'Failed to save requisition.');
        }
      },
    });
    }    
  }   

  const onRemoveShippingAddressHandler = (data: AddresssView) => {
    Modal.confirm({
      title: 'Remove Address',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          setAddressList((prev)=>{
                const list = prev || []
                return list.filter(it=>it.key!==data.key)
          })
          setShippingAddressList((prev)=>{
                const list = prev || []
                return list.filter(it=>it.key!==data.key)
          })

          message.success('Removed successfully.');
        } catch (error) {
          message.error('Failed to delete.');
        }
      },
    });
  }; 
  
  const onSaveShippingAddressHandler = (
      data: AddresssView,
      addressType: string,
      isNew: boolean = true,
      cb?: (sucess: boolean) => void,
    ) => {
      Modal.confirm({
        title: isNew ? 'Add Address' : 'Edit Address',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            if(addressType=='S') {
              setShippingAddressList((prev)=>{
                const list = prev || []
                if(isNew){
                  return [...list,{id:0,key: uniqueId().toString(),...data}]
                }else{
                  return list.map(it=> {
                    if(it.key===data.key){
                      return data
                    }else{
                      return it
                    }                  
                  })
                }
              })
            }
            if(addressType=='B') {
              setAddressList((prev)=>{
                const list = prev || []
                if(isNew){
                  return [...list,{id:0,key: uniqueId().toString(),...data}]
                }else{
                  return list.map(it=> {
                    if(it.key===data.key){
                      return data
                    }else{
                      return it
                    }                  
                  })
                }
              })
            }
            cb?.(true);
            // initAddress()            
            message.success('Updated successfully.');
          } catch (error) {
            cb?.(false);
            message.error('Failed to update');
          }
        },
      });
    };


 

  return (<div ref={ref}>
  <Spin spinning={false} >
    <ProForm dir="vertical"
      form={form}
      submitter={{
        render: () => 
           inView && !readOnly ?<FooterToolbar>
            <Button
                onClick={() => {
                  onCancelHandler();
                }}
              >
                {type=='CREATE'? 'Close':'Cancel'}
              </Button>
              <Button
                onClick={onSaveDraftHandler}
            >
              Save Draft
            </Button>      
            {type=='EDIT' && <Button
                onClick={() => {
                  onSubmitHandler();
                }}
              >
                Submit
              </Button> }
        </FooterToolbar> : <></>
      }}  
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProCard size="small"                  
          headerBordered
          title='General Infomation'
          // style={{ marginBlockStart: 8 }}
          // gutter={8}
          // direction="row"
        >
          <ProFormGroup >
            {/* <ProFormText
              label="Customer's ID"
              disabled
              // rules={[{ required: true }]}
              name={'customerCode'}
              allowClear
              width={470}
            /> */}
            <ProFormSelect
                label="Customer's ID"
                disabled= {(type=='CREATE')}
                name={'seriesId'}
                rules={[{ required: (type=='EDIT') }]}
                placeholder={"Customer's ID"}
                options={lookupDataList?.filter((it) => it.type === 'SALE_SAP_SERIES' && it?.actived=='Y')?.map((it) => ({
                    label: it.name,
                    value: it.id,
                }))}
                width={470}
            />
            <ProFormRadio.Group
              name="vatInv"
              label="VAT Invoice"
              options={[
                {
                  label: 'Yes',
                  value: 'Y',
                },
                {
                  label: 'No',
                  value: 'N',
                }
              ]}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              label="Purpose"
              name={'purpose'}
              placeholder={'Purpose'}
              rules={[{ required: true }]}
              options={[{
                label: 'New Account',
                value: 'New Account',
              }/*,{
                label: 'Add Shipping Address',
                value: 'Add Shipping Address',
              }*/]}
              width={470}
            />
          
            {type=='CREATE' &&<ProFormSelect
              label="Price & Trade Offer"
              name={'priceTradeOfferId'}
              placeholder={'Price & Trade Offer'}
              rules={[{ required: true }]}
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PRICE_LIST' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              // options={[{
              //   label: 'Wholsale',
              //   value: 'Wholsale',
              // },{
              //   label: 'Standard',
              //   value: 'Standard',
              // },{
              //   label: 'Special(Enclose Sales Terms)',
              //   value: 'Special(Enclose Sales Terms)',
              // }]}
              width={470}
            />}
            {type=='EDIT' &&<ProFormSelect
              label={`Price & Trade Offer - ${data?.priceTradeOfferName}`}
              name={'sapPriceTradeOfferId'}
              placeholder={'Price & Trade Offer'}
              rules={[{ required: true }]}
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PRICE_LIST_SAP' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              // options={[{
              //   label: 'Wholsale',
              //   value: 'Wholsale',
              // },{
              //   label: 'Standard',
              //   value: 'Standard',
              // },{
              //   label: 'Special(Enclose Sales Terms)',
              //   value: 'Special(Enclose Sales Terms)',
              // }]}
              width={470}
            />}
             {type=='CREATE' && <ProFormSelect
              label={`Payment Term `}
              name={'paymentTermId'}
              placeholder={'Payment Term'}
              rules={[{ required: true }]}
               options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PAYMENT_TERM' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              // options={[{
              //   label: 'Cashon-Delivery',
              //   value: 'Cashon-Delivery',
              // },{
              //   label: 'Pre-Payment',
              //   value: 'Pre-Payment',
              // },{
              //   label: 'Credit (enclose Credit Appliction form)',
              //   value: 'Credit (enclose Credit Appliction form)',
              // }]}
              width={470}
            />}
            {type=='EDIT' && <ProFormSelect
              label={`Payment Term - ${data?.paymentTermName}`}
              name={'sapPaymentTermId'}
              placeholder={'Payment Term'}
              rules={[{ required: true }]}
               options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PAYMENT_TERM_SAP' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              // options={[{
              //   label: 'Cashon-Delivery',
              //   value: 'Cashon-Delivery',
              // },{
              //   label: 'Pre-Payment',
              //   value: 'Pre-Payment',
              // },{
              //   label: 'Credit (enclose Credit Appliction form)',
              //   value: 'Credit (enclose Credit Appliction form)',
              // }]}
              width={470}
            />}
              <ProFormSelect
              label="Outlet Type"
              name={'outletTypeId'}
              rules={[{ required: true }]}
              placeholder={'Outlet Type'}
              options={state1.initData?.outletTypeList?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />
            <ProFormSelect
              label="Region"
              name={'regionId'}
              placeholder={'Region'}
              rules={[{ required: true }]}
              options={state1.initData?.regionList?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />
              <ProFormSelect
              label="Division"
              name={'divisionId'}
              rules={[{ required: true }]}
              placeholder={'Division'}
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'CUSTOMER_DIVISION' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />
            <ProFormSelect
              label="Channel"
              name={'channelId'}
              rules={[{ required: true }]}
              placeholder={'Channel'} //SALE_SUB_CHANNEL
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_MAIN_CHANNEL' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />    
            <ProFormSelect
              label="Sub Channel"
              name={'subChannelId'}
              rules={[{ required: true }]}
              placeholder={'Channel'} //SALE_SUB_CHANNEL
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_SUB_CHANNEL' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            /> 
          </ProFormGroup>   
          {/* <ProFormText readonly name={'createdBy'} label="Sale Executive"  width={470}/>   */}
          <ProFormSelect
              label="Sale Executive"
              showSearch              
              name={'saleId'}
              rules={[{ required: true }]}
              placeholder={"Customer's ID"}
              options={sale?.filter((it) => it?.status=='ACTIVE')?.map((it) => ({
                  label: it.empName,
                  value: it.empId,
              }))}
              width={470}
          />     
        </ProCard>
        <ProCard size="small"                  
          headerBordered
          title='Business Name'
        >
          <ProFormGroup >
            <ProFormText
              label="Business Name(Khmer)"
              rules={[{ required: true }]}
              name={'buNameKh'}
              allowClear
              width={470}
            />
            <ProFormText
              label="Business Name(English)"
              rules={[{ required: true }]}
              name={'buName'}
              allowClear
              width={470}
            />           
          </ProFormGroup>
          <ProFormGroup >
            <ProFormText
              label="Owner Name(Khmer)"
              rules={[{ required: true }]}
              name={'ownerNameKh'}
              allowClear
              width={470}
            />
            <ProFormText
              label="Owner Name(English)"
              rules={[{ required: true }]}
              name={'ownerName'}
              allowClear
              width={470}
            />
            <ProFormText
              label="Owner Phone Number"
              rules={[{ required: true }]}
              name={'ownerPhone'}
              allowClear
              width={470}
            />
          </ProFormGroup>
          <ProFormGroup >
            <ProFormText
              label="Purchase Name(Khmer)"
              rules={[{ required: true }]}
              name={'purchaseNameKh'}
              allowClear
              width={470}
            />
            <ProFormText
              label="Purchase Name(English)"
              rules={[{ required: true }]}
              name={'purchaseName'}
              allowClear
              width={470}
            />
            <ProFormText
              label="Purchase Phone Number"
              rules={[{ required: true }]}
              name={'purchasePhone'}
              allowClear
              width={470}
            />
          </ProFormGroup>
        </ProCard>
        { <ProCard size="small">
          <Flex vertical>
            <Flex justify="flex-start" gap={25}>
              <Flex vertical style={{width:'100%'}}>
                <ProCard
                  title='Billing Address'
                  headerBordered
                  // style={{ marginBlockStart: 8 }}
                  // gutter={8}
                >
                  <AddressListView  addressReadonly={readOnly||false}
                      data={{
                        list: addressList || [],
                        init: {
                          // lookupDataList: state1.initData?.lookupDataList,
                          provinceList: state1.initData?.provinceList,
                        },
                        locations: { ...state1.data?.locations },
                      }} actionHandlers={{
                        loadData: async function (): Promise<AddresssView[]> {
                          // throw new Error("Function not implemented.");
                          // const rs = await ops.listAddressDetailByCustomerId({ id: state.data?.detail?.id || 0 })
                          // setAddressList(rs)
                          return []
                        },
                        onAdd: (data, cb) => onSaveShippingAddressHandler(data,'B', true, cb),
                        onEdit:(data, cb) => onSaveShippingAddressHandler(data,'B', false, cb),
                        onRemove: onRemoveShippingAddressHandler,
                        onCleaLocation: actions1.clearLocations,               
                        onLoadLocations:  actions1.loadLocations,
                        onLoadMultiLocations: actions1.loadMultiLocations,
                      }}
                  />
                  

                </ProCard>
              </Flex>
              <Flex vertical style={{width:'100%'}}>
                <ProCard
                  title='Shipping Address'
                  headerBordered
                >
                  <AddressListView addressReadonly={readOnly||false}
                      data={{
                        list: shippingAddressList || [],
                        init: {
                          // lookupDataList: state1.initData?.lookupDataList,
                          provinceList: state1.initData?.provinceList,
                        },
                        locations: { ...state1.data?.locations },
                      }} actionHandlers={{
                        loadData: async function (): Promise<AddresssView[]> {
                          // throw new Error("Function not implemented.");
                          // const rs = await ops.listAddressDetailByCustomerId({ id: state.data?.detail?.id || 0 })
                          // setAddressList(rs)
                          return []
                        },
                        onAdd: (data, cb) => onSaveShippingAddressHandler(data,'S', true, cb),
                        onEdit:(data, cb) => onSaveShippingAddressHandler(data,'S', false, cb),
                        onRemove: onRemoveShippingAddressHandler,
                        onCleaLocation: actions1.clearLocations,               
                        onLoadLocations: actions1.loadLocations,
                        onLoadMultiLocations: actions1.loadMultiLocations,
                      }}
                  />
                </ProCard>
              </Flex>
            </Flex>
          </Flex>
        </ProCard>}   
        <ProCard size="small"                  
          headerBordered
          title='Purchasing Performance'
        >
          {ppItems && <PurchasingPerformanceView editableFormRef={editablePPItemFormRef} addedItems={ppItems} onSetAddedItems={setPPItems} readOnly={readOnly} />}
        </ProCard> 
        <Card>
            <ProFormSelect
              label="Frequency of Purchase"
              name={'frequencyPurchase'}
              rules={[{required:true}]}
              placeholder={'Payment Term'}
              options={[
                {
                  label: '1 time/month',
                  value: '1 time/month',
                },{
                  label: '2 time/month',
                  value: '2 time/month',
                },{
                  label: '1 time/week',
                  value: '1 time/week',
                },{
                  label: '2 time/week',
                  value: '2 time/week',
                },{
                  label: 'Daily',
                  value: 'Daily',
                },{
                  label: 'Schedule',
                  value: 'Schedule',
                },{
                  label: 'Other',
                  value: 'Other',
                }
              ]}
              width={470}
            />
            <ProFormTextArea rules={[{required:false}]} label="Remarks" name="remarkFrequencyPurchase" />
        </Card>  
        <ProCard size="small"                  
          headerBordered
          title='Document Requirment'
        >
          <Space direction="vertical" style={{ width: '90%' }}>
            <DocmentRequire readOnly={readOnly} title="1. Persal Identification Documents (ONE OF THE FOLLOWING)" itemList={personalList} onSetItemList={setPersonaList}/>
            <DocmentRequire readOnly={readOnly} title="2. Corporate Documents" itemList={coporateList} onSetItemList={setcoporateList}/>    
            <RemarkCard/>   
          </Space>
        </ProCard>   
        <ProCard size="small"                  
          headerBordered
          title='Attachments'
        >
         {!readOnly&& <FileUploader
            required={false}
            showTitle
            title="Please upload necessary documents."
            onSetFiles={(files) => setUploadFileIds(files.map((it) => it.response))}
          />}
          <AttachedFileList readonly={true}
            removeButton={false}
            onSetUploadFile={files => {}}
            initFiles={[...(attachedFiles || [])]} 
          />
        </ProCard>  
      </Space>
    </ProForm>
  </Spin></div>);
}