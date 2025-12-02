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
import { BU, Department, RequisitionData, SubDepartment } from '../data';
import { EmployeeServices } from '../services';
export default ({
  onRefresh,
  ...rest
}: ModalFormProps<RequisitionData> & {
  onRefresh?: () => void;
}) => {
  const [form] = useForm<RequisitionData>();
  const requestActions = simpleRequestActions();
  const [lookupList, setLookupList] = useState<LookupDataItem2[]>();
  const [uploadFileIds, setUploadFileIds] = useState<string[]>([]);
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

    form.setFieldsValue({ headcount: 1 });
  }, [rest.open]);

  const fetchJobTitleHandler = async (id: number) => {
    const rs = await EmployeeServices.fetchJobTitle(id).query(requestActions);
    rs.empSegment?.id && form.setFieldsValue({ segmentId: rs.empSegment.id });
  };

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
        if (uploadFileIds.length === 0) {
          message.error('Please upload job description as support document.');
          return;
        }
        Modal.confirm({
          title: 'Staff Requisition Request',
          content: 'Are you sure?',
          onOk: async () => {
            try {
              const data = { ...formData, headcount: 1, attachedFiles: uploadFileIds };
              const rs = await EmployeeServices.requisitionRequest(data)(requestActions);
              message.success(
                `Staff requisition request is submitted sucessfully.form no: ${rs.data}`,
              );
              onRefresh?.();
              rest.onOpenChange?.(false);
            } catch (error: any) {
              message.error(error.message || 'Failed to make request');
            }
          },
        });
      }}
      title="Staff Requisition Form"
      {...rest}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Requestor form={form} />
        <ProCard size="small" bordered title="Details of Position Hired">
          <ProFormGroup size={'small'}>
            <ProFormSelect
              showSearch
              allowClear
              name="jobId"
              rules={[{ required: true }]}
              width={'lg'}
              label="Position Hired"
              fieldProps={{ popupMatchSelectWidth: 400 }}
              request={async ({ keyWords }) =>
                (await EmployeeServices.listPageJobTitle(keyWords).query(requestActions)).items.map(
                  (it) => ({ label: it.name, value: it.id }),
                )
              }
            />
          </ProFormGroup>
          <ProFormGroup size={'small'}>
            <ProFormSelect
              shouldUpdate
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
            <ProFormDependency name={['departmentId']}>
              {({ departmentId }) => {
                const subDepartmentList = data?.subDepartmentList.filter(
                  (it) => it.departmentId == departmentId,
                );
                const currentId = form.getFieldValue('subDepartmentId');
                if (!subDepartmentList?.some((it) => it.id == currentId)) {
                  form.resetFields(['subDepartmentId']);
                }
                return (
                  <ProFormSelect
                    showSearch
                    name={'subDepartmentId'}
                    width={'sm'}
                    label="Sub Function"
                    fieldProps={{ popupMatchSelectWidth: 400 }}
                    options={subDepartmentList
                      ?.filter((it) => it.departmentId == departmentId)
                      .map((it) => ({ label: it.name, value: it.id }))}
                  />
                );
              }}
            </ProFormDependency>
          </ProFormGroup>

          <ProFormGroup size={'small'}>
            <ProFormText name={'section'} width={'sm'} label="Section" />
            <ProFormText name={'team'} width={'sm'} label="Team" />
            <ProFormSelect
              debounceTime={500}
              showSearch
              allowClear
              request={({ keyWords }) => onFindEmployeeHandler('ACTIVE', keyWords)}
              fieldProps={{ popupMatchSelectWidth: 400 }}
              name={'directReportTo'}
              rules={[{ required: true }]}
              label="Direct Supervisor"
              width={'sm'}
            />
            <ProFormSelect
              name={'workingShiftId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Working Shift"
              fieldProps={{ popupMatchSelectWidth: 500 }}
              options={lookupList
                ?.filter((it) => it.type == 'WORK_SHIFT')
                .map((it) => ({ label: it.name, value: it.id }))}
            />
          </ProFormGroup>
          <ProFormRadio.Group
            rules={[{ required: true }]}
            name={'segmentId'}
            label="Employee Segment"
            options={lookupList
              ?.filter((it) => it.type == 'EMPLOYEE_SEGMENT')
              .map((it) => ({ label: it.name, value: it.id }))}
          />
          <ProFormDependency rules={[{ required: true }]} name={['segmentId']} ignoreFormListField>
            {({ segmentId }) => {
              if (segmentId == '2021') {
                return (
                  <ProFormText
                    rules={[{ required: true }]}
                    name="otherSegment"
                    width={'sm'}
                    label="Specific Other"
                  />
                );
              }
            }}
          </ProFormDependency>

          <ProFormRadio.Group
            rules={[{ required: true }]}
            name={'contractTypeId'}
            label="Type of Contract"
            options={lookupList
              ?.filter((it) => it.type == 'EMPLOYEE_CONTRACT_TYPE')
              .map((it) => ({ label: it.name, value: it.id }))}
          />
          <ProFormDependency name={['contractTypeId']} ignoreFormListField>
            {({ contractTypeId }) => {
              if (contractTypeId == '2032') {
                return (
                  <ProFormDateRangePicker
                    name={'contractDate'}
                    rules={[{ required: true }]}
                    label="Contract Date"
                  />
                );
              }
            }}
          </ProFormDependency>
        </ProCard>
        <ProCard size="small" bordered title="Type of Requisition">
          <ProFormRadio.Group
            rules={[{ required: true }]}
            name={'requisitionTypeId'}
            options={lookupList
              ?.filter((it) => it.type == 'REQUISITION_TYPE')
              .map((it) => ({ label: it.name, value: it.id }))}
          />

          <ProFormDependency
            rules={[{ required: true }]}
            name={['requisitionTypeId', 'segmentId']}
            ignoreFormListField
          >
            {({ requisitionTypeId, segmentId }) => {
              if (requisitionTypeId == '2041') {
                return (
                  <ProFormGroup>
                    <ProFormSelect
                      debounceTime={500}
                      showSearch
                      allowClear
                      request={({ keyWords }) => onFindEmployeeHandler('ALL', keyWords, true)} //2004 = Casual Staff
                      name={'replacedEmployeeId'}
                      rules={[{ required: true }]}
                      fieldProps={{ popupMatchSelectWidth: 400 }}
                      label="Employee to be replaced"
                      width={'sm'}
                    />

                    <ProFormDependency
                      rules={[{ required: true }]}
                      name={['replacedEmployeeId']}
                      ignoreFormListField
                    >
                      {({ replacedEmployeeId }) => {
                        if (replacedEmployeeId == -1) {
                          if (segmentId != 2004) {
                            message.error(
                              'Employee to be replaced: unknown, Only casual staff is allowed.',
                            );
                            form.resetFields(['replacedEmployeeId']);
                            return;
                          }
                          return (
                            <ProFormText
                              rules={[{ required: true }]}
                              name={'replacedEmployeeName'}
                              label="Employee Name"
                              width={'sm'}
                            />
                          );
                        }
                      }}
                    </ProFormDependency>
                  </ProFormGroup>
                );
              }

              if (requisitionTypeId == '2042') {
                return (
                  <>
                    <ProFormGroup>
                      {/* <ProFormDigit width={'sm'} label='Headcount' name={'headcount'} /> */}
                      <ProFormSelect
                        width={'sm'}
                        label="Location"
                        fieldProps={{ popupMatchSelectWidth: 400 }}
                        name={'workplaceId'}
                        options={lookupList
                          ?.filter((it) => it.type == 'WORK_PLACE')
                          .map((it) => ({ label: it.name, value: it.id }))}
                      />
                    </ProFormGroup>
                    <ProFormTextArea
                      name={'hiredReason'}
                      rules={[{ required: true }]}
                      label="Please indicate why this position is needed"
                    />
                  </>
                );
              }
            }}
          </ProFormDependency>
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
            name={'expectedJoinDate'}
            label="Prefered started date"
          />
          <ProFormTextArea name={'suggestedSourcing'} label="Suggested Sourcing" />
        </ProCard>
        <FileUploader
          required
          showTitle
          title="Please upload Job Description and other necessary documents."
          onSetFiles={(files) => setUploadFileIds(files.map((it) => it.response))}
        />
      </Space>
    </ModalForm>
  );
};
