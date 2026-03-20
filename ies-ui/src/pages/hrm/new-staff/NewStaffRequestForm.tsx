import FileUploader from '@/components/Attachment/FileUploader';
import { ActionCompProps } from '@/components/core/comp';
import { DataFormType, FMANewStaffItem, ItemType, SavePayLoad } from '@/pages/fma/new-staff/data.types';
import { createService } from '@/pages/fma/new-staff/services';
// import { SavePayLoad } from '@/pages/fma/new-staff/data.types';
// import { createService } from '@/pages/fma/new-staff/services';
import { BU, Department } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { MultiRequest } from '@/services/apiGateway';
import { LookupDataItem2 } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { UnorderedListOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  ModalForm,
  ProCard,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Checkbox, Flex, message, Modal, Space, Tabs } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import FMANewStaffForm from './components/FMANewStaffForm';
import ICTNewStaffForm from './components/ICTNewStaffForm';
import { ICTNewStaffItem } from '@/pages/ict/new-staff/data.types';
import { SavePayLoad as SavePayLoadICT } from '@/pages/ict/new-staff/data.types';
import { NewStaffService } from './service';

// type DataFormType = {
//   requestorId: string;
//   requestorBuId: number;
//   remarks?: string;
//   empName: string;
//   localName: string;
//   empNo?: string;
//   jobId: number;
//   buId: number;
//   gender: string;
//   departmentId: number;
//   workplaceId: number;
//   startingDate: Moment;
//   phoneNo?: string;
//   email?: string
//   carModal?: string;
//   carColor?: string;
//   year?: string;
//   plateNumber?: string;
// };

// type ItemType = {
//   itemId: number;
//   itemName: string;
//   itemType?: string;
//   itemCategory: string;
//   qty: number;
//   type?: string;
//   remarks?: string;
//   checked: boolean;
// };

export default ({ visible, onClose, cb}: ActionCompProps ) => {
  const { ref, inView } = useInView({});
  const [activeTab, setActiveTab] = useState<string>("1")

  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [form] = useForm<DataFormType>();
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const requestActions = simpleRequestActions();
  const [lookupList, setLookupList] = useState<LookupDataItem2[]>([]);
  const [itemTaken, setItemTaken] = useState<number[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const [data, setData] = useState<FMANewStaffItem>({
    workplace: [],
    uniform: [],
    accessories: [],
    system: [],
    access: [],
    buList: [],
    departmentList: [],
  });


  /** ICT New Staff Request --------------------------------------------*/
  const [jobTitle, setJobTitle] = useState<string>();
  const [dataICT, setDataICT] = useState<ICTNewStaffItem>({
    fingerPrintAttendances: [],
    fingerPrintAccessDoor: []
  });
   const [uploadFilesICT, setUploadFilesICT] = useState<string[]>([]);
   const [forceClearUploadICT, setForceClearUploadICT] = useState(0);


  // const services = createService(requestActions);
  const onRequestHandler = async () => {
    console.log("onRequestHandler",data)
    const dataForm = await form.validateFields();
    await editableFormRef.current?.validateFields();

    const itemList = [...data.workplace, ...data.accessories, ...data.uniform, ...data.system, ...data.access];

    if (!itemList.some((it) => it.checked)) {
       setActiveTab('1')
      message.error('FMA - No request item.');
      return;
    }

    if (data.access.some(it => it.checked && it.itemId == 2241) && uploadFiles.length == 0) {
      setActiveTab('1')
      message.error('FMA - Attachment file required.');
      return;
    }
    const itemListICT = [...dataICT.fingerPrintAttendances, ...dataICT.fingerPrintAccessDoor];    
    if (!itemListICT.some((it) => it.checked)) {
      setActiveTab('2')
      message.error('ICT - No request item.');
      return;
    }
    Modal.confirm({
      title: 'New Staff Support Request Form',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          const emp = await EmployeeServices.fetchHodByDeptAndBu(dataForm.departmentId, dataForm.buId).query(requestActions)
          if (!emp.userId) {
            message.error("Function head of the employee not found. Please contact with IT team for support.")
            return
          }
          const saveData: SavePayLoad = {
            requestor: dataForm.requestorId,
            requesterBuId: dataForm.requestorBuId,
            empNo: dataForm.empNo,
            empName: dataForm.empName,
            empLocalName: dataForm.localName,
            jobId: dataForm.jobId,
            buId: dataForm.buId,
            gender: dataForm.gender,
            phoneNo: dataForm.phoneNo,
            email: dataForm.email,
            bu: data.buList.find((it) => it.id == dataForm.buId)?.name!!,
            departmentId: dataForm.departmentId,
            department: data.departmentList.find((it) => it.id == dataForm.departmentId)?.name!!,
            workplaceId: dataForm.workplaceId,
            items: itemList,
            hodUserId: emp.userId,
            startingDate: dataForm.startingDate,
            uploadedFiles: uploadFiles,
            carModal: dataForm.carModal,
            carColor: dataForm.carColor,
            year: dataForm.year,
            plateNumber: dataForm.plateNumber,
          };

          const saveDataICT: SavePayLoadICT = {
            requestor: dataForm.requestorId,
            requesterBuId: dataForm.requestorBuId,
            empNo: dataForm.empNo,
            empName: dataForm.empName,
            empLocalName: dataForm.localName,
            jobId: dataForm.jobId,
            jobTitle: jobTitle!!,
            buId: dataForm.buId,
            bu: data.buList.find((it) => it.id == dataForm.buId)?.name!!,
            departmentId: dataForm.departmentId,
            department: data.departmentList.find((it) => it.id == dataForm.departmentId)?.name!!,
            workplaceId: dataForm.workplaceId,
            workplace: lookupList.find((it) => it.id == dataForm.workplaceId)?.name!!,
            startingDate: dataForm.startingDate,
            hodUserId: emp.userId,
            items: itemListICT,
            uploadedFiles: uploadFilesICT,
          };
          console.log("saveDataICT",saveDataICT)
          console.log("saveData",saveData)
          const rs = await NewStaffService.save(saveData)(requestActions)
          // const rs = await services.saveItem(saveData);
          message.success(
            `Your request is submitted. Please track the request with form no ${rs.data}`,
          );
          onClose?.();
          cb?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to make request.');
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      const rs = await EmployeeServices.listLookupData([
        // 'FMA_WORK_PLACE_ARRANGEMENT',
        // 'FMA_ACCESSORY',
        // 'FMA_UNIFORM',
        // 'FMA_SYSTEM',
        'WORK_PLACE'
        // 'FMA_ACCESS'
      ]).query(requestActions);
      setLookupList(rs);

      // const rs1 = await MultiRequest<{
      //   buList: BU[];
      //   deptList: Department[];
      // }>([EmployeeServices.listBu.queryParams, EmployeeServices.listDepartment.queryParams])(
      //   requestActions,
      // );

      // initDataSource(rs, rs1.buList, rs1.deptList);
    })();
  }, []);

  // const initDataSource = (sources: LookupDataItem2[], buList: BU[], deptList: Department[]) => {
  //   setData({
  //     workplace: sources
  //       .filter((it) => it.type == 'FMA_WORK_PLACE_ARRANGEMENT')
  //       .map((it) => ({
  //         itemId: it.id,
  //         itemName: it.name,
  //         qty: 0,
  //         checked: false,
  //         itemCategory: it.type,
  //       })),
  //     uniform: sources
  //       .filter((it) => it.type == 'FMA_UNIFORM')
  //       .map((it) => ({
  //         itemId: it.id,
  //         itemName: it.name,
  //         qty: 0,
  //         checked: false,
  //         itemCategory: it.type,
  //       })),
  //     accessories: sources
  //       .filter((it) => it.type == 'FMA_ACCESSORY')
  //       .map((it) => ({
  //         itemId: it.id,
  //         itemName: it.name,
  //         qty: 0,
  //         checked: false,
  //         itemCategory: it.type,
  //       })),
  //     system: sources
  //       .filter((it) => it.type === 'FMA_SYSTEM')
  //       .map((it) => ({
  //         itemId: it.id,
  //         itemName: it.name,
  //         qty: 0,
  //         checked: false,
  //         itemCategory: it.type,
  //       })),
  //     access: sources
  //       .filter((it) => it.type === 'FMA_ACCESS')
  //       .map((it) => ({
  //         itemId: it.id,
  //         itemName: it.name,
  //         qty: 0,
  //         checked: false,
  //         itemCategory: it.type,
  //       })),
  //     buList: buList,
  //     departmentList: deptList,
  //   });
  // };
  // const onChangeAssessor=(v: number) =>{
  //       if(v>0){
  //           // setSelectedAssessor(data?.assessors.find(it=>(it.id==v))) 
  //           setActiveTab('1')
  //       }
  //   }
  // const onCloseHandler = () => { 
  //     onCloseTab?.()
  // }
  return (<div ref={ref}>
    <ProForm<DataFormType> 
      form={form}
      onFinish={onRequestHandler}
      // submitter={false}   // ✅ disable default buttons
       submitter={{
          render: () => 
            inView ?<FooterToolbar>
              <Button
                onClick={() => {
                  form.resetFields();
                  setUploadFiles([]);
                  setForceClearUpload((v) => v + 1);
                  setItemTaken([]);
                  // initDataSource(lookupList, data.buList, data.departmentList);
                }}
              >
                Reset
              </Button>

              <Button
                type="primary"
                onClick={() => form.submit()}   // ✅ triggers onFinish
              >
                Submit
              </Button>
          </FooterToolbar>:<></>
       }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Requestor form={form} />
        <ProCard size="small" bordered title="1. Personal Details (Completed by HR)">
          <ProFormGroup>
            <ProFormText
              width={'sm'}
              label="Name (Khmer)"
              name={'localName'}
              rules={[{ required: true }]}
            />
            <ProFormText width={'sm'} label="Name (Eng)" name={'empName'} rules={[{ required: true }]} />
            <ProFormText width={'sm'} label="Employee ID" name={'empNo'} rules={[{ required: false }]} />


          </ProFormGroup>
          <ProFormGroup>
            <ProFormText width={'sm'} label="Gender" name={'gender'} rules={[{ required: true }]} />
            <ProFormSelect
              width={'sm'}
              showSearch
              allowClear
              name="jobId"
              rules={[{ required: true }]}
              label="Position"
              fieldProps={{ popupMatchSelectWidth: 400 }}
              request={async ({ keyWords }) =>
                (await EmployeeServices.listPageJobTitle(keyWords).query(requestActions)).items.map(
                  (it) => ({ label: it.name, value: it.id }),
                )
              }
            />
            <ProFormSelect
              showSearch
              name={'buId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Business Unit"
              options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
            />

          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              showSearch
              name={'departmentId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Function"
              options={data?.departmentList.map((it) => ({ label: it.name, value: it.id }))}
            />
            <ProFormDatePicker
              rules={[{ required: true }]}
              width={'sm'}
              name={'startingDate'}
              label="Joining Date"
            />
            <ProFormSelect
              rules={[{ required: true }]}
              width={'sm'}
              label="Base Location"
              name={'workplaceId'}
              options={lookupList
                ?.filter((it) => it.type === 'WORK_PLACE')
                .map((it) => ({ label: it.name, value: it.id }))}
              fieldProps={{
                popupMatchSelectWidth: 300,
                 onChange(_, option) {
                  if (option) {
                    const { title, } = option as { title?: string };
                    setJobTitle(title);
                    return
                  }
                  setJobTitle(undefined)
                },
              }}
            />
          </ProFormGroup>
        </ProCard>
         <Tabs onChange={key => setActiveTab(key)} activeKey={activeTab}  >
          <Tabs.TabPane icon={<UnorderedListOutlined/>} tab={'FMA - New Staff Support Request'} key="1">
              <FMANewStaffForm editableFormRef={editableFormRef} data={data} setData={setData} setUploadFiles={setUploadFiles} setForceClearUpload={setForceClearUpload} forceClearUpload={forceClearUpload}/>
          </Tabs.TabPane>
          <Tabs.TabPane icon={<UnorderedListOutlined/>} tab={'ICT - New Staff Support Request'} key="2">
              <ICTNewStaffForm data={dataICT} setData={setDataICT} setUploadFiles={setUploadFilesICT} setForceClearUpload={setForceClearUploadICT} forceClearUpload={forceClearUploadICT}/>
          </Tabs.TabPane>
         </Tabs>
      </Space>
    </ProForm>
    </div>
  );
};
