import { EditableFormInstance, FooterToolbar, ProCard, ProForm, ProFormGroup, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Button, Card, Flex, Form, message, Modal, Space, Spin } from "antd"
import { AddresssView, DocRequirementCustomerParams, DoRequireCustomerList, PurchasingPerformanceItem, RcSapEmpSale, RegisterCustomer, RegisterCustomerDetailResponse } from "./data";
import { useEffect, useRef, useState } from "react";
import AddressListView from "./components/AddressListView";
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
import { EditOutlined, FilterOutlined } from "@ant-design/icons";
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe";
import { useForm } from "antd/es/form/Form";

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
  const [formPriceTradeOffer] = useForm<{priceTradeOfferId: number}>()
  const [formPaymentTerm ] = useForm<{paymentTermId: number}>()
  const { ref, inView } = useInView({});
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
  const [vatInv,setVatInv] = useState<string>('N')


  useEffect(() => {   
    initData()
  }, [id]);

  const initData = async () =>{ 
    await actions1.initData("Detail")  
    
    
    if (id && id > 0) {
      const data = await  service.detail(id)
      initFormData(data)
      setPPItems(data?.ppItems?.map((it) => ({...it,key: uniqueId().toString(),itemId: it?.itemId?.toString()}))||[])
      setAddressList(data?.billing?.map(it=>({...it,key: uniqueId().toString()})))
      setShippingAddressList(data?.shipping?.map(it=>({...it,key: uniqueId().toString()})))
      setPersonaList(data?.docPersonalList||[])
      setcoporateList(data?.docCorporateList||[])
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
    formPriceTradeOffer.setFieldValue('priceTradeOfferId',data.priceTradeOfferId||0)
    formPaymentTerm.setFieldValue('paymentTermId',data.paymentTermId||0)  
    setVatInv(data.vatInv||'N')
  }    
    
  const getPayload = async () => {
    const dataForm = await form.validateFields(); 
    const dataPayload = { ...dataForm,
      priceTradeOfferId: data?.priceTradeOfferId,
      paymentTermId: data?.paymentTermId,
      id: id||0,
      customerCode: dataForm.customerCode,
      ppItems:ppItems,
      billing: addressList?.map((it,index)=>({
        id: it.id ||0,
        address: 'B'+(index+1).toString().padStart(2,'0')+(it.address?'-'+it.address:''),
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
      shipping: shippingAddressList?.map((it,index)=>({
        id: it.id ||0,
        address: 'S'+(index+1).toString().padStart(2,'0')+(it.address?'-'+it.address:''),
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
                  return [...list,{id:0,key: uniqueId().toString(),...data,type: addressType}]
                }else{
                  return list.map(it=> {
                    if(it.key===data.key){
                      return {...data,type: addressType}
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
                  return [...list,{id:0,key: uniqueId().toString(),...data,type: addressType}]
                }else{
                  return list.map(it=> {
                    if(it.key===data.key){
                      return {...data,type: addressType}
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
              onClick={() => { onCloseTab?.()}}
            >
              Close
            </Button>
            {(type =='EDIT') && <Button
                onClick={() => {
                  onCancelHandler();
                }}
              >
                Cancel
              </Button>}
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
      onValuesChange={(changedValues) => {
        if (!changedValues.outletTypeId) return
        const outletType = state1.initData?.outletTypeList?.find(
          it => it.id == changedValues.outletTypeId
        )
        const channel = state1.initData?.lookupDataList?.find(
          it => it.id == outletType?.mainChannelId )
        const subChannel = state1.initData?.lookupDataList?.find(
          it => it.id == outletType?.subChannelId
        ) 
        form.setFieldValue('channelId', channel?.id)
        form.setFieldValue('subChannelId', subChannel?.id)
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProCard size="small"                  
          headerBordered
          title='General Infomation'
        >
          <ProFormGroup >
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
            <Flex>              
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
                fieldProps={{
                  onChange: (e:any)=>{
                    setVatInv(e.target.value)    
                  }
                }}
                
              />
              <ProFormText hidden={vatInv!='Y'}
                label={ vatInv=='Y'?'VAT':' '}
                rules={[{ required: vatInv=='Y' }]}
                placeholder={"Please enter VAT description"}
                name={'vatText'}
                allowClear
                width={350}
              />
            </Flex>            
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
              }]}
              width={470}
            />
          
            {type=='CREATE' &&<ProFormSelect
              label="Price & Trade Offer"
              name={'priceTradeOfferId'}
              placeholder={'Price & Trade Offer'}
              showSearch
              rules={[{ required: true }]}
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PRICE_LIST' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />}
            {type=='EDIT' &&<ProFormSelect
              label={<div>
                {`Price & Trade Offer - ${data?.priceTradeOfferName}`}  <PopconfirmMe title="Price & Trade Offer" 
                  icon={<FilterOutlined />}
                  placement="left"               
                  description={
                    <ProForm form={formPriceTradeOffer} submitter={false} style={{width:350}}> 
                      <ProFormSelect
                        name={'priceTradeOfferId'}
                        placeholder={'Price & Trade Offer'}
                        showSearch
                        rules={[{ required: true }]}
                        options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PRICE_LIST' && it?.actived=='Y')?.map((it) => ({
                          label: it.name,
                          value: it.id,
                        }))}
                        width={350}
                      />
                    </ProForm>
                  }
                  onConfirm={async()=>{
                    const formData = await formPriceTradeOffer.validateFields();    
                    const priceTradeOfferName = state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PRICE_LIST' && it?.actived=='Y').find(it=>it.id==formData.priceTradeOfferId)?.name
                    setData((v:any) =>  {
                      return{...v,priceTradeOfferId: formData.priceTradeOfferId||0,priceTradeOfferName: priceTradeOfferName||''}
                    })
                  }}
                >
                  <Button type="link" icon={<EditOutlined />}/>
                </PopconfirmMe>
                </div>}
              name={'sapPriceTradeOfferId'}
              placeholder={'Price & Trade Offer'}
              showSearch
              rules={[{ required: true }]}
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PRICE_LIST_SAP' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />}
             {type=='CREATE' && <ProFormSelect
              label={`Payment Term `}
              name={'paymentTermId'}
              placeholder={'Payment Term'}
              showSearch
              rules={[{ required: true }]}
               options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PAYMENT_TERM' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />}
            {type=='EDIT' && <ProFormSelect
             label={<div>
                {`Payment Term - ${data?.paymentTermName}`}  <PopconfirmMe title="Payment Term" 
                  icon={<FilterOutlined />}
                  placement="left"               
                  description={
                    <ProForm form={formPaymentTerm} submitter={false} style={{width:350}}> 
                      <ProFormSelect
                        name={'paymentTermId'}
                        placeholder={'Payment Term'}
                        showSearch
                        rules={[{ required: true }]}
                        options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PAYMENT_TERM' && it?.actived=='Y')?.map((it) => ({
                          label: it.name,
                          value: it.id,
                        }))}
                        width={350}
                      />
                    </ProForm>
                  }
                  onConfirm={async()=>{
                    const formData = await formPaymentTerm.validateFields();    
                    const paymentTermName = state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PAYMENT_TERM' && it?.actived=='Y').find(it=>it.id==formData.paymentTermId)?.name                   
                    setData((v:any) =>  {
                      return{...v,paymentTermId: formData.paymentTermId||0,paymentTermName: paymentTermName||''}
                    })
                  }}
                >
                  <Button type="link" icon={<EditOutlined />}/>
                </PopconfirmMe>
                </div>}
              name={'sapPaymentTermId'}
              placeholder={'Payment Term'}
              showSearch
              rules={[{ required: true }]}
               options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_PAYMENT_TERM_SAP' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />}
              <ProFormSelect
              label="Outlet Type"
              name={'outletTypeId'}
              showSearch
              rules={[{ required: true }]}
              placeholder={'Outlet Type'}
              fieldProps={{
                dropdownRender: (menu) => (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                      <span>Name</span>
                      <span>Sub / Main Channel</span>
                    </div>
                    {menu}
                  </>
                ),
                optionRender: (option) => (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{option.label}</span>
                    <span style={{ color: '#999' }}>{option.data.subChannel}</span>
                  </div>
                ),
              }}
              options={state1.initData?.outletTypeList?.map((it) => ({
                label: it.name,
                value: it.id,
                subChannel: it.subChannel +' / '+it.mainChannel,
              }))}
              width={470}
            />
            <ProFormSelect
              label="Region"
              name={'regionId'}
              placeholder={'Region'}
              showSearch
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
              showSearch
              rules={[{ required: true }]}
              placeholder={'Division'}
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'CUSTOMER_DIVISION' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />
            
            <ProFormSelect
              label="Sub Channel"
              name={'subChannelId'}
              showSearch
              rules={[{ required: true }]}
              placeholder={'Channel'} //SALE_SUB_CHANNEL
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_SUB_CHANNEL' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            /> 
             <ProFormSelect
              label="Channel"
              name={'channelId'}
              showSearch
              rules={[{ required: true }]}
              placeholder={'Channel'} //SALE_SUB_CHANNEL
              options={state1.initData?.lookupDataList?.filter((it) => it.type === 'SALE_MAIN_CHANNEL' && it?.actived=='Y')?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
              width={470}
            />   
          </ProFormGroup>   
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
              rules={[{ required: true, max:46 }]}
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
              rules={[{ required: true,max:20 }]}
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
              rules={[{ required: true,max:20 }]}
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
                >
                  <AddressListView  addressReadonly={readOnly||false}
                      data={{
                        list: addressList || [],
                        init: {
                          provinceList: state1.initData?.provinceList,
                        },
                        locations: { ...state1.data?.locations },
                      }} actionHandlers={{
                        loadData: async function (): Promise<AddresssView[]> {
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
                          provinceList: state1.initData?.provinceList,
                        },
                        locations: { ...state1.data?.locations },
                      }} actionHandlers={{
                        loadData: async function (): Promise<AddresssView[]> {
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
              showSearch
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