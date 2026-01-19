import FileUploader from '@/components/Attachment/FileUploader';
import { MultiRequest } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import {
  ProForm,
  ModalFormProps,
  ProCard,
  ProFormGroup,
  ProFormSelect,
  ProFormTextArea,
  FooterToolbar,
} from '@ant-design/pro-components';
import { Button, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { BU, Department, ProbationEvaluationData, SubDepartment } from '../data';
import { EmployeeServices } from '../services';
import ProbationSumbitter from '@/pages/process-flow/components/Submitter/ProbationSumbitter';
import { EmployeeInfResult, ProbationAssessmentList, ProbationEvaluationRef, ProbationFormType } from './data.types';
import { createService } from './services';

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
};
export default ({
                  refreshTable,
                  type,
                  onCloseTab,
                  ...rest
                }: ModalFormProps<ProbationEvaluationData> & {
  refreshTable?: () => void;  
  type: 'CREATE' | 'EDIT';
  onCloseTab?: () => void;
}) => {
  const [form] = useForm<ProbationEvaluationData>();
  const [formSubmittor] = useForm<DataFormType>();
  const requestActions = simpleRequestActions();
  const srv = createService({ request: requestActions });
  const [uploadFileIds, setUploadFileIds] = useState<string[]>([]);
  const [probationEmp, setProbationEmp] = useState<EmployeeInfResult>();
  const [probationFormType,setProbationFormType] = useState<ProbationFormType[]>()
  const [probationRef,setProbationRef] = useState<ProbationEvaluationRef[]>()
  const [probationAssessor,setProbationAssessor] = useState<ProbationAssessmentList[]>()

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
      srv.fetchProbationFormTypeList().then(rs => {
        setProbationFormType(rs)
      })
      setProbationRef([])
      setProbationAssessor([])
      form.setFieldValue('refId',undefined)
      form.setFieldValue('preparationUserId',undefined)
      form.setFieldValue('hodPreparationUserId',undefined)
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
  }, [rest.open]);

  const onChangeSubmitterHandler = async (data: EmployeeInfResult) => {
    setProbationEmp(data)
    form.setFieldValue('refId',undefined)
    form.setFieldValue('formTypeId',probationFormType?.find(r => r.code===data.jobLevelCode)?.id||'')
    form.setFieldValue('preparationUserId',undefined)
    form.setFieldValue('hodPreparationUserId',undefined)
    formSubmittor.setFieldValue('requestorBuId',undefined)
    srv.fetchProbationEvaluationRefList(data.empId).then(rs=> {
      setProbationRef(rs)
    })
    srv.fetchProbationAssessmentEmpList(data.empId).then(rs=>{
      setProbationAssessor(rs)
    })
  }
  const [firstEvaluationUserId, setFirstEvaluationUserId] = useState('')
  // const onSearchHandler = async (searchValue?: string) => {
  //   const it1 = await srv.fetchProbationEmpList(searchValue)
  //   return it1.map((it_1:any) => ({ value: it_1.id, label: it_1.empName }));
  // }

  return (
    <ProForm
      width={970}
      form={form}
      submitter={{
        render: () => (
          <FooterToolbar>
            <Button
              onClick={() => {
                // Reset main form and submittor form
                form.resetFields();
                formSubmittor.resetFields();

                // Clear uploaded files
                setUploadFileIds([]);

                // Reset probation employee selection
                setProbationEmp(undefined);

                // Reset dependent lists
                setProbationRef([]);
                setProbationAssessor([]);
                setFirstEvaluationUserId('');
              }}
            >
              Reset
            </Button>

            <Button
              type="primary"
              onClick={() => form.submit()} // triggers onFinish
            >
              Submit
            </Button>
          </FooterToolbar>
        ),
      }}

      onFinish={async () => {
        const formData = await form.validateFields();
        await formSubmittor.validateFields()
        Modal.confirm({
          title: 'Probation Evaluation Request',
          content: 'Are you sure?',
          onOk: async () => {
            try {
              const data = { ...formData,empId: probationEmp?.empId,buId: probationEmp?.buId, attachedFiles: uploadFileIds } as ProbationEvaluationData;
              const rs = await srv.request(data);
              message.success(
                `Probation Evaluation request is submitted sucessfully.form no: ${rs.data}`,
              );
              refreshTable?.();
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
            <div> Employee Info</div>
          }
          onSetSubmitter={onChangeSubmitterHandler}
        />
        <ProCard size="small" bordered>
          <ProFormGroup size={'small'}>
            <ProFormSelect
              shouldUpdate
              showSearch
              name={'preparationUserId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Preparation User"
              options={probationAssessor?.map((it) => ({ label: it.empName, value: it.userId }))}
              fieldProps={{
                dropdownMatchSelectWidth: 300,
                async onChange(value: any) {
                  form.setFieldValue('hodPreparationUserId',undefined)
                  try{
                    const rs = await srv.fetchHodPreparationUserId(value)
                    setFirstEvaluationUserId(rs.hodEnpNo||'')
                    form.resetFields(['hodPreparationUserId'])
                    form.setFieldValue('hodPreparationUserId',rs.hodUserId)
                  }catch(e){
                    setFirstEvaluationUserId('')
                    form.resetFields(['hodPreparationUserId'])
                  }
                },
              }}
            />
            <ProFormSelect
              shouldUpdate
              showSearch
              name={'hodPreparationUserId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Evaluation User"
              request={ async({ keyWords }) =>{
                const it1 = await srv.fetchEvaluateEmpList(firstEvaluationUserId!==''?firstEvaluationUserId: keyWords)
                setFirstEvaluationUserId('')
                if(it1.length===0){
                  form.setFieldValue('hodPreparationUserId',undefined)
                }
                return it1.map((it_1:any) => ({ value: it_1.userId, label: it_1.empName }));
              }}
            />
            <ProFormSelect
              shouldUpdate
              name={'formTypeId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Form Type"
              options={probationFormType?.map((it) => ({ label: it.description, value: it.id }))}
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
    </ProForm>
  );
};
