import FileUploader from '@/components/Attachment/FileUploader';
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { MultiRequest } from '@/services/apiGateway';
import { LookupDataItem2 } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import {
  ModalForm,
  ModalFormProps,
  ProCard,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment, { Moment } from 'moment';
import { useEffect, useState } from 'react';
import { BU, Department, ProbationEvaluationData, SubDepartment } from '../data';
import { EmployeeServices } from '../services';
import ProbationSumbitter from '@/pages/process-flow/components/Submitter/ProbationSumbitter';
import { EmployeeInfResult, ProbationEvaluationRef, ProbationFormType } from './data.types';
import { createService } from './services';

type DataFormType = {
    requestorId: string;
    requestorBuId: number;
  };
export default ({
  onRefresh,
  ...rest
}: ModalFormProps<ProbationEvaluationData> & {
  onRefresh?: () => void;
}) => {
  const [form] = useForm<ProbationEvaluationData>();
  const [formSubmittor] = useForm<DataFormType>();
  const requestActions = simpleRequestActions();
  const srv = createService({ request: requestActions });
  const [lookupList, setLookupList] = useState<LookupDataItem2[]>();
  const [uploadFileIds, setUploadFileIds] = useState<string[]>([]);
  const [probationEmp, setProbationEmp] = useState<EmployeeInfResult>();
  const [probationFormType,setProbationFormType] = useState<ProbationFormType[]>()
  const [probationRef,setProbationRef] = useState<ProbationEvaluationRef[]>()

  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();

  const onFindEmployeeHandler = async (
    status: 'ALL' | 'ACTIVE' | 'INACTIVE',
    keywords?: string,
    unknowInclouded: boolean = false,
  ) => {
    const rs = await EmployeeServices.list({
      criteria: {
        searchValue: keywords,
        advanceSearch: {
          status: status,
        },
      },
    }).query(requestActions);

    const dataItems = rs.items.map((it) => ({
      label: [it.employeeCode, [it.firstName, it.lastName].join(' ')].join(' - '),
      value: it.id,
    }));

    if (unknowInclouded) {
      return [{ label: 'Unknown', value: -1 }, ...dataItems];
    }
    return dataItems;
  };

  useEffect(() => {
    (async () => {
      const rs = await EmployeeServices.listLookupData([
        'EMPLOYEE_SEGMENT',
        'EMPLOYEE_CONTRACT_TYPE',
        'REQUISITION_TYPE',
        'WORK_PLACE',
        'WORK_SHIFT',
      ]).query(requestActions);
      setLookupList(rs);
      srv.fetchProbationFormTypeList().then(rs => {
        setProbationFormType(rs)
      })
      setProbationRef([])
      form.setFieldValue('refId',undefined)
    })();
  }, []);

  useEffect(() => {
    if (!rest.open) return;

    (async () => {
      const rs = await MultiRequest<{
        buList: BU[];
        deptList: Department[];
        subDeptList: SubDepartment[];
      }>([
        EmployeeServices.listBu.queryParams,
        EmployeeServices.listDepartment.queryParams,
        EmployeeServices.listSubDepartment.queryParams,
      ])(requestActions);

      setData({
        buList: rs.buList,
        departmentList: rs.deptList,
        subDepartmentList: rs.subDeptList,
      });
    })();

    // form.setFieldsValue({ headcount: 1 });
  }, [rest.open]);

  const fetchJobTitleHandler = async (id: number) => {
    const rs = await EmployeeServices.fetchJobTitle(id).query(requestActions);
    // rs.empSegment?.id && form.setFieldsValue({ segmentId: rs.empSegment.id });
  };

  const onChangeSubmitterHandler = async (data: EmployeeInfResult) => {
    console.log('employee info',data)
    setProbationEmp(data)
    form.setFieldValue('refId',undefined)
    srv.fetchProbationEvaluationRefList(data.empId).then(rs=> {
      setProbationRef(rs)
    })
  }

  return (
    <ModalForm
      form={form}
      onValuesChange={(changedValues) => {
        const { jobId } = changedValues;
        if ('jobId' in changedValues) {
          fetchJobTitleHandler(jobId);
        }
      }}
      onFinish={async () => {
        const formData = await form.validateFields();
        // if (uploadFileIds.length == 0) {
        //   message.error('Please upload job description as support document.');
        //   return;
        // }
        const data1 = { ...formData,empId: probationEmp?.empId, attachedFiles: uploadFileIds };
        console.log('probation payload',data1)
        Modal.confirm({
          title: 'Probation Evaluation Request',
          content: 'Are you sure?',
          onOk: async () => {
            try {
              const data = { ...formData,empId: probationEmp?.empId, attachedFiles: uploadFileIds } as ProbationEvaluationData;
              const rs = await srv.request(data);
              message.success(
                `Probation Evaluation request is submitted sucessfully.form no: ${rs.data}`,
              );
              onRefresh?.();
              rest.onOpenChange?.(false);
            } catch (error: any) {
              message.error(error.message || 'Failed to make request');
            }
          },
        });
      }}
      title="New Probation Evaluation Request Form"
      {...rest}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* <Requestor form={form} /> */}
        <ProbationSumbitter          
          form={formSubmittor}
          title={
            <div> Employee Info
              {/* Employee {checkingForm && <span style={{ color: 'red' }}>: {checkingForm}</span>} */}
            </div>
          }
          onSetSubmitter={onChangeSubmitterHandler}
        />
        <ProCard size="small" bordered>         
          <ProFormGroup size={'small'}>
            <ProFormSelect
              shouldUpdate
              name={'formType'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Form Type"
              options={probationFormType?.map((it) => ({ label: it.name, value: it.code }))}
            />
            <ProFormSelect
              showSearch
              name={'refId'}
              rules={[{ required: false }]}
              width={'sm'}
              label="Ref"
              options={probationRef?.map((it) => ({ label: it.formNo, value: it.id }))}
            />           
          </ProFormGroup>
          <ProFormTextArea name='remarks' label={'Remarks'}/>
        </ProCard>
        <FileUploader
          required={false}
          showTitle
          title="Please upload Job Description and other necessary documents."
          onSetFiles={(files) => setUploadFileIds(files.map((it) => it.response))}
        />
      </Space>
    </ModalForm>
  );
};
