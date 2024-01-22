import FileUploader from '@/components/Attachment/FileUploader';
import { ActionCompProps } from '@/components/core/comp';
import { BU, Department } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { MultiRequest } from '@/services/apiGateway';
import { LookupDataItem, LookupDataItem2, LookupDataItem4 } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import {
  EditableFormInstance,
  EditableProTable,
  ModalForm,
  ProCard,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Checkbox, Flex, message, Modal, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { createService as createItService } from '../it-request/services';
import { SavePayLoad } from './data.types';
import { createService } from './services';
import RequestItems from './RequestItems';
import { IncidentServiceAPI } from '@/services/ict/services';
import { ItemServiceAPI } from '@/services/pro/services';

export type ItemType = {
  itemId: number;
  itemName: string;
  itemType?: string;
  itemCategory: string;
  qty: number;
  type?: string;
  remarks?: string;
  checked: boolean;
};

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
  remarks?: string;
  empName: string;
  localName: string;
  empNo?: string;
  jobId: number;
  buId: number;
  departmentId: number;
  workplaceId: number;
  startingDate: Moment;
};

export default ({ visisble, onClose, cb }: ActionCompProps) => {
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [form] = useForm<DataFormType>();
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const requestActions = simpleRequestActions();

  const editableFormRef = useRef<EditableFormInstance>();
  const services = createService(requestActions);
  const itemItIcServices = IncidentServiceAPI(requestActions)
  const [lookupList, setLookupList] = useState<LookupDataItem2[]>([]);
  const [jobTitle, setJobTitle] = useState<string>();
  const [data, setData] = useState<{
    fingerPrintAttendances: ItemType[];
    fingerPrintAccessDoor: ItemType[];
    sharedDrives: ItemType[],
    systems: ItemType[],
    workflows: ItemType[],
    networks: ItemType[],
    buList: BU[];
    departmentList: Department[];
  }>({
    fingerPrintAttendances: [],
    fingerPrintAccessDoor: [],
    sharedDrives: [],
    systems: [],
    workflows: [],
    networks: [],
    buList: [],
    departmentList: [],
  });

  /**
   * 5: Attandances, 6: Access Doors, 7: Shared Drive, 8: Systems Access,  9: Workflow Process:
   */
  const init = async () => {
    // const rs = await itServices.listItemByCategories([5, 6, 7, 8, 9]);
    // setLookupData(rs);
    const rs1 = await MultiRequest<{
      buList: BU[];
      deptList: Department[];
    }>([EmployeeServices.listBu.queryParams, EmployeeServices.listDepartment.queryParams])(
      requestActions,
    );

    const rs2 = await EmployeeServices.listLookupData([
      'WORK_PLACE',
    ]).query(requestActions);

    const itemList = (await itemItIcServices.listLookup([
      'ICT_FORM_FINGER_PRINT_ATTENDANCE',
      'ICT_FORM_FINGER_PRINT_ACCESS_DOOR',
    ])).map((it) => ({
      itemId: it.id,
      itemName: it.name,
      qty: 0,
      checked: false,
      itemType: it.type,
      itemCategory: it.type,
    }))

    setLookupList(rs2)

    setData({
      fingerPrintAttendances: itemList.filter(it => it.itemType == 'ICT_FORM_FINGER_PRINT_ATTENDANCE'),
      fingerPrintAccessDoor: itemList.filter(it => it.itemType == 'ICT_FORM_FINGER_PRINT_ACCESS_DOOR'),
      sharedDrives: itemList.filter(it => it.itemType == 'ICT_FORM_SHARE_DRIVE'),
      systems: itemList.filter(it => it.itemType == 'ICT_FORM_SYSTEM_ACCESS'),
      workflows: itemList.filter(it => it.itemType == 'ICT_FORM_WORKFLOW_ACCESS'),
      networks: itemList.filter(it => it.itemType == 'ICT_FORM_NETWORK_ACCESS'),
      buList: rs1.buList,
      departmentList: rs1.deptList,
    });
  };

  const onSaveHandler = async () => {
    const dataForm = await form.validateFields();
    await editableFormRef.current?.validateFields();
    const itemList = [...data.fingerPrintAttendances, ...data.fingerPrintAccessDoor];

    if (!itemList.some((it) => it.checked)) {
      message.error('No request item.');
      return;
    }
    Modal.confirm({
      title: 'ICT - New Staff Form',
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
            jobTitle: jobTitle!!,
            buId: dataForm.buId,
            bu: data.buList.find((it) => it.id == dataForm.buId)?.name!!,
            departmentId: dataForm.departmentId,
            department: data.departmentList.find((it) => it.id == dataForm.departmentId)?.name!!,
            workplaceId: dataForm.workplaceId,
            workplace: lookupList.find((it) => it.id == dataForm.workplaceId)?.name!!,
            startingDate: dataForm.startingDate,
            hodUserId: emp.userId,
            items: itemList,
            uploadedFiles: uploadFiles,
          };
          const rs = await services.saveItem(saveData);
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
    init();
  }, []);

  return (
    <ModalForm<DataFormType>
      form={form}
      title="ICT - New Staff Support Request Form"
      width={1000}
      open={visisble}
      onOpenChange={(visible) => !visible && onClose?.()}
      onFinish={onSaveHandler}
      submitter={{
        searchConfig: {
          submitText: 'Submit',
        },
        render(props, defaultDoms) {
          if (defaultDoms.length > 1) {
            return [
              defaultDoms[0],
              <Button
                key={'reset-bt'}
                onClick={() => {
                  const key = uniqueId('request-item');
                  // setDataSource([{ key:key , id: 0, categoryId: null } as any])
                  props.form?.resetFields();
                  init();
                  setForceClearUpload((v) => v + 1);
                  setUploadFiles([]);
                  form.setFieldsValue({});
                }}
              >
                Reset
              </Button>,
              defaultDoms[1],
            ];
          } else return defaultDoms;
        },
      }}
    >
      <Flex vertical gap="small">
        <Requestor form={form} />

        <ProCard size="small" title="1. Personal Details (Completed by HR)" bordered>
          <ProFormGroup>
            <ProFormText
              width={'sm'}
              label="Name (Khmer)"
              name={'localName'}
              rules={[{ required: true }]}
            />
            <ProFormText width={'sm'} label="Name (Eng)" name={'empName'} rules={[{ required: true }]} />
            <ProFormText width={'sm'} label="Employee Id" name={'empNo'} />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              width={'sm'}
              showSearch
              allowClear
              name="jobId"
              rules={[{ required: true }]}
              label="Position"
              fieldProps={{
                popupMatchSelectWidth: 400,
                onChange(_, option) {
                  if (option) {
                    const { title, } = option as { title?: string };
                    setJobTitle(title);
                    return
                  }
                  setJobTitle(undefined)
                },
              }}
              request={async ({ keyWords }) => {
                const list = await EmployeeServices.listPageJobTitle(keyWords).query(requestActions)
                return list.items.map(
                  (it) => ({ label: it.name, value: it.id }),
                )
              }}
            />
            <ProFormSelect
              showSearch
              name={'buId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Business Unit"
              options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
            />
            <ProFormSelect
              showSearch
              name={'departmentId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Function"
              options={data?.departmentList.map((it) => ({ label: it.name, value: it.id }))}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDatePicker
              rules={[{ required: true }]}
              width={'sm'}
              name={'startingDate'}
              label="Starting Date"
            />
            <ProFormSelect
              rules={[{ required: true }]}
              width={'sm'}
              label="Location"
              name={'workplaceId'}
              options={lookupList
                ?.filter((it) => it.type == 'WORK_PLACE')
                .map((it) => ({ label: it.name, value: it.id }))}
              fieldProps={{
                popupMatchSelectWidth: 300,
              }}
            />
          </ProFormGroup>
        </ProCard>
        <RequestItems title='2. Fingerprint Attendance (Please √, Initiated by HR, reviewed by hired Function Manager)'
          data={data?.fingerPrintAttendances || []}
          onItemsChange={(items: ItemType[]) => {
            setData((v) => ({ ...v, fingerPrintAttendances: items }))
          }} />

        <RequestItems title='3. Fingerprint Access Door (Please √, Initiated by HR, reviewed by hired Function Manager)'
          data={data?.fingerPrintAccessDoor || []}
          onItemsChange={(items: ItemType[]) => {
            setData((v) => ({ ...v, fingerPrintAccessDoor: items }))
          }} />


        <FileUploader
          key={forceClearUpload}
          multiple
          service="FILE"
          onSetFiles={(files) => {
            setUploadFiles(files.map((it) => it.response));
          }}
        />
      </Flex>
    </ModalForm>
  );
};
