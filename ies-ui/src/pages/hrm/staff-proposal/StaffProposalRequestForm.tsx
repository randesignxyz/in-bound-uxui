import FileUploader from '@/components/Attachment/FileUploader';
import { ActionCompProps } from '@/components/core/comp';
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { MultiRequest } from '@/services/apiGateway';
import { LookupDataItem2 } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import {
  EditableFormInstance,
  EditableProTable,
  ModalForm,
  ProCard,
  ProDescriptions,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Checkbox, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import _, { uniqueId } from 'lodash';
import { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { BU, Department, RequestItem, StaffRequisitionRequest, SubDepartment } from '../data';
import { EmployeeServices } from '../services';
import { RequestedItem } from './data.types';
import { createService } from './services';

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
  remarks?: string;
  empName: string;
  jobId: number;
  buId: number;
  requisitionId: number;
  departmentId: number;
  subDepartmentId?: number;
  section?: string;
  team?: string;
  directReportTo: number;
  workingShiftId: number;
  dayOffGroupId: number;
  startingDate?: Moment;
  contractTypeId: number;
  contractDate?: Moment[];
  segmentId: number;
};

export default ({ visisble, formKey, onClose, cb }: ActionCompProps & { formKey: string }) => {
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [form] = useForm<DataFormType>();
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const requestActions = simpleRequestActions();
  const [lookupList, setLookupList] = useState<LookupDataItem2[]>();
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [seqmentId, setSeqmentId] = useState<number>();
  const [benefits, setBenefits] = useState<RequestedItem[]>([]);
  const [itemTaken, setItemTaken] = useState<number[]>([]);
  const [requistionDetail, setRequistionDetail] = useState<StaffRequisitionRequest>();

  const editableFormRef = useRef<EditableFormInstance>();
  const srv = createService(requestActions);

  const onFindEmployeeHandler = async (keywords?: string) => {
    const rs = await EmployeeServices.list({
      criteria: {
        searchValue: keywords,
        advanceSearch: {
          status: 'ACTIVE',
        },
      },
    }).query(requestActions);

    return rs.items.map((it) => ({
      label: [it.employeeCode, [it.firstName, it.lastName].join(' ')].join(' - '),
      value: it.id,
    }));
  };

  const onSaveHandler = async () => {
    const dataForm = await form.validateFields();
    await editableFormRef.current?.validateFields();
    if (!benefits.some((it) => it.checked)) {
      message.error('Benefits is required to fill.');
      return;
    }

    const groups = _.groupBy(
      benefits.filter((it) => it.checked),
      'optionGroup',
    );
    for (var key in groups) {
      const options = groups[key];
      if (key.toLocaleLowerCase() != 'null' && !!key && options.length > 1) {
        message.error(`Please select one of ${options.map((it) => it.itemName).join(', ')}`);
        return;
      }
    }

    if (dataForm.segmentId != 2004 && uploadFiles.length == 0) {
      message.error('Please attach interview feedback.');
      return;
    }

    Modal.confirm({
      title: 'Staff Proposal Form',
      content: 'Are you sure to submit the request?',
      onOk: async () => {
        try {
          const rs = await srv.saveItem({
            requestor: dataForm.requestorId,
            requesterBuId: dataForm.requestorBuId,
            empName: dataForm.empName,
            jobId: dataForm.jobId,
            buId: dataForm.buId,
            requisitionId: dataForm.requisitionId,
            departmentId: dataForm.departmentId,
            subDepartmentId: dataForm.subDepartmentId,
            section: dataForm.section,
            team: dataForm.team,
            directReportTo: dataForm.directReportTo,
            workingShiftId: dataForm.workingShiftId,
            dayOffGroupId: dataForm.dayOffGroupId,
            startingDate: dataForm.startingDate,
            contractTypeId: dataForm.contractTypeId,
            contractDateFrom: dataForm.contractDate ? dataForm.contractDate[0] : undefined,
            contractDateTo: dataForm.contractDate ? dataForm.contractDate[1] : undefined,
            segmentId: dataForm.segmentId,
            uploadedFiles: uploadFiles,
            items: benefits,
          });

          message.success(
            `Your request is submitted. Please track the request with form no ${rs.data}`,
          );
          onClose?.();
          cb?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to submit request.');
        }
      },
    });
  };

  useEffect(() => {
    if (!visisble) return;

    (async () => {
      const lk = await EmployeeServices.listLookupData([
        'EMPLOYEE_SEGMENT',
        'EMPLOYEE_CONTRACT_TYPE',
        'REQUISITION_TYPE',
        'WORK_PLACE',
        'WORK_SHIFT',
        'DAY_OFF_GROUP',
      ]).query(requestActions);

      setLookupList(lk);

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

      const items = await EmployeeServices.fetchRequestItemByCategories([1]).query(requestActions);
      setRequestItems(items);
    })();
  }, [visisble]);

  const updateFormData = (item: StaffRequisitionRequest) => {
    form.setFieldsValue({
      jobId: item.positionHired.id,
      segmentId: item.segment.id,
      buId: item.bu.id,
      departmentId: item.department.id,
      subDepartmentId: item?.subDepartment?.id,
      section: item.section,
      team: item.team,
      directReportTo: item.directReportTo.id,
      workingShiftId: item.workingShift.id,
      contractTypeId: item.contractType.id,
    });
  };

  useEffect(() => {
    if (!seqmentId) {
      setBenefits([]);
      return;
    }
    const selector = seqmentId == 2004 ? 'CASUAL_STAFF' : 'NORMAL_STAFF';
    setBenefits(
      requestItems
        .filter((it) => it.selector?.includes(selector))
        .map((it) => ({
          itemId: it.id,
          itemName: it.itemName,
          optionGroup: it.optionGroup,
          selector: it.selector,
          checked: false,
          itemType: 'Benefit',
        })),
    );
  }, [seqmentId]);

  return (
    <ModalForm<DataFormType>
      form={form}
      width={1000}
      title="Staff Proposal Request Form"
      open={visisble}
      onFinish={onSaveHandler}
      onOpenChange={(visible) => !visible && onClose?.()}
      onValuesChange={async (changeValues) => {
        if ('requisitionId' in changeValues) {
          try {
            const { requisitionId } = changeValues;
            const rs = await EmployeeServices.fetchStaffRequisitionRequestById(requisitionId).query(
              requestActions,
            );
            updateFormData(rs);
            setRequistionDetail(rs);
          } catch (error: any) {
            message.error(error.message || 'Failed to fetch data.');
          }
        }
      }}
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
                  props.form?.resetFields();
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
      <Space direction="vertical" style={{ width: '100%' }}>
        <Requestor form={form} title="1. Requestor" />

        <ProCard size="small" bordered>
          <ProFormGroup direction="vertical">
            <ProFormSelect
              rules={[{ required: true }]}
              showSearch
              allowClear
              label="Staff requisition Form No"
              request={async ({ keyWords }) =>
                (await EmployeeServices.requisitionLookup(keyWords).query(requestActions)).map(
                  (it) => ({ label: [it.code, it.name].join(' - '), value: it.id }),
                )
              }
              width={'lg'}
              name={'requisitionId'}
            />

            {requistionDetail && (
              <ProCard collapsible defaultCollapsed title="Staff Requisition Information">
                <ProDescriptions<StaffRequisitionRequest>
                  dataSource={requistionDetail}
                  columns={[
                    { title: 'Position Hired', render: (_, r) => r.positionHired.name },
                    { title: 'Business', render: (_, r) => r.department.name },
                    { title: 'Function', render: (_, r) => r?.subDepartment?.name },
                    { title: 'Section', dataIndex: 'section' },
                    { title: 'Team', dataIndex: 'team' },
                    {
                      title: 'Direct Supervisor',
                      render: (_, r) =>
                        [r?.directReportTo.code, r?.directReportTo.name].join(' - '),
                    },
                    { title: 'Working Shift', render: (_, r) => r.workingShift.name },
                    {
                      title: 'Employee Segment',
                      render: (_, r) => (r?.otherSegment ? r.otherSegment : r.segment.name),
                    },
                    { title: 'Type of Contract', render: (_, r) => r.contractType.name },
                  ]}
                />
              </ProCard>
            )}
          </ProFormGroup>
        </ProCard>

        <ProCard size="small" title="2. Details of Position Hired" bordered>
          <ProFormGroup>
            <ProFormText width={'sm'} label="Name" name={'empName'} rules={[{ required: true }]} />

            <ProFormSelect
              key={`${requistionDetail?.id}_job_id`}
              width={'sm'}
              showSearch
              allowClear
              name="jobId"
              rules={[{ required: true }]}
              label="Position"
              fieldProps={{ popupMatchSelectWidth: 400 }}
              request={async ({ keyWords }) => {
                const items = (
                  await EmployeeServices.listPageJobTitle(keyWords).query(requestActions)
                ).items.map((it) => ({ label: it.name, value: it.id }));
                if (
                  requistionDetail &&
                  !items.some((it) => it.value == requistionDetail.positionHired.id)
                ) {
                  return [
                    {
                      label: requistionDetail.positionHired.name,
                      value: requistionDetail.positionHired.id,
                    },
                    ...items,
                  ];
                }
                return items;
              }}
            />

            <ProFormSelect
              rules={[{ required: true }]}
              name={'segmentId'}
              label="Employee Segment"
              width={'sm'}
              fieldProps={{ popupMatchSelectWidth: 300 }}
              options={lookupList
                ?.filter((it) => it.type == 'EMPLOYEE_SEGMENT')
                .map((it) => ({ label: it.name, value: it.id }))}
            />
          </ProFormGroup>

          <ProFormGroup>
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
                    options={data?.subDepartmentList
                      .filter((it) => it.departmentId == departmentId)
                      ?.filter((it) => it.departmentId == departmentId)
                      .map((it) => ({ label: it.name, value: it.id }))}
                  />
                );
              }}
            </ProFormDependency>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormText name={'section'} width={'sm'} label="Section" />
            <ProFormText name={'team'} width={'sm'} label="Team" />
            <ProFormSelect
              key={`${requistionDetail?.id}_reportto`}
              debounceTime={500}
              showSearch
              allowClear
              fieldProps={{ popupMatchSelectWidth: 400 }}
              request={async ({ keyWords }) => {
                const items = await onFindEmployeeHandler(keyWords);
                if (
                  requistionDetail &&
                  !items.some((it) => it.value == requistionDetail.directReportTo.id)
                ) {
                  return [
                    {
                      label: [
                        requistionDetail.directReportTo?.code,
                        requistionDetail.directReportTo.name,
                      ].join(' - '),
                      value: requistionDetail.directReportTo.id,
                    },
                    ...items,
                  ];
                }
                return items;
              }}
              name={'directReportTo'}
              rules={[{ required: true }]}
              label="Direct Supervisor"
              width={'sm'}
            />
          </ProFormGroup>
          <ProFormGroup>
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
            <ProFormSelect
              showSearch
              name={'dayOffGroupId'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Group day-off"
              fieldProps={{ popupMatchSelectWidth: 400 }}
              options={lookupList
                ?.filter((it) => it.type == 'DAY_OFF_GROUP')
                .map((it) => ({ label: it.name, value: it.id }))}
            />
            <ProFormDatePicker width={'sm'} name={'startingDate'} label="Starting Date" />
          </ProFormGroup>
        </ProCard>
        <ProCard size="small" title="3. Type of Contract" bordered>
          <ProFormGroup>
            <ProFormRadio.Group
              label="Type"
              rules={[{ required: true }]}
              name={'contractTypeId'}
              options={lookupList
                ?.filter((it) => it.type == 'EMPLOYEE_CONTRACT_TYPE')
                .map((it) => ({ label: it.name, value: it.id }))}
            />

            <ProFormDependency name={['contractTypeId']} ignoreFormListField>
              {({ contractTypeId }) => {
                if (contractTypeId && contractTypeId != '2031') {
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
          </ProFormGroup>
        </ProCard>
        <ProCard size="small" title="4. Benefits " bordered>
          <ProFormDependency rules={[{ required: true }]} name={['segmentId']} ignoreFormListField>
            {({ segmentId }) => {
              setSeqmentId(segmentId);
              return <></>;
            }}
          </ProFormDependency>

          <EditableProTable<RequestedItem>
            recordCreatorProps={false}
            editableFormRef={editableFormRef}
            rowKey={'itemId'}
            size="small"
            showHeader={false}
            value={benefits}
            onValuesChange={(values) => {
              const newData = values.map((it) => ({
                ...it,
                amount: it.amount || 0,
                checked: itemTaken.some((i) => i == it.itemId),
              }));
              const groups = _.groupBy(
                newData.filter((it) => it.checked),
                'optionGroup',
              );
              for (var key in groups) {
                const options = groups[key];
                if (key.toLocaleLowerCase() != 'null' && !!key && options.length > 1) {
                  message.error(
                    `Please select one of ${options.map((it) => it.itemName).join(', ')}`,
                  );
                  break;
                }
              }

              setBenefits(newData);
            }}
            columns={[
              {
                dataIndex: 'checked',
                width: 30,
                renderFormItem(_, config, form) {
                  return (
                    <Checkbox
                      disabled={(() => {
                        const disabled = !config.record?.selector
                          ?.toUpperCase()
                          ?.includes(formKey.toUpperCase());
                        if (!disabled) {
                          return benefits.some(
                            (it) =>
                              it.optionGroup != null &&
                              it.checked &&
                              it.optionGroup == config.record?.optionGroup &&
                              it.itemId != config.record.itemId,
                          );
                        }

                        return disabled;
                      })()}
                      key={`checked-${config.record?.itemId}`}
                      onChange={(e) => {
                        if (
                          e.target.checked &&
                          !itemTaken.some((it) => it == config.record?.itemId)
                        ) {
                          setItemTaken((v) => [...v, config.record?.itemId || 0]);
                        }
                        if (!e.target.checked) {
                          setItemTaken((v) => v.filter((it) => it != config.record?.itemId));
                        }

                        form.setFieldValue(config.record?.itemId || '', {
                          ...config.record,
                          checked: e.target.checked,
                        });
                      }}
                    />
                  );
                },
              },
              { dataIndex: 'itemName', width: 300, readonly: true },
              {
                dataIndex: 'amount',
                width: 140,
                valueType: 'money',
                formItemProps(form, config) {
                  const item = form.getFieldValue(config.rowKey || '');
                  const checkOnly = requestItems.some(
                    (it) => it.id == item.itemId && it.selector?.includes('CHECK_ONLY'),
                  );

                  return {
                    ...config,
                    hidden: !item?.checked || checkOnly,
                    rules: [{ required: item?.checked && !checkOnly, message: 'Amount required' }],
                  };
                },
                fieldProps: { rows: 1, placeholder: 'Amount (USD)', style: { width: 120 } },
              },
              {
                dataIndex: 'remarks',
                valueType: 'textarea',
                formItemProps(form, config) {
                  const item = form.getFieldValue(config.rowKey || '');
                  return { ...config, hidden: !item?.checked };
                },
                fieldProps: { rows: 1, placeholder: 'Remarks' },
              },
            ]}
            editable={{
              editableKeys: benefits.map((it) => it.itemId),
              type: 'multiple',
            }}
          />
        </ProCard>
        <ProFormDependency rules={[{ required: true }]} name={['segmentId']} ignoreFormListField>
          {({ segmentId }) => {
            return (
              <FileUploader
                title="Upload Interview Feedback. CV and necessary documents are optional."
                addFileInfo
                showTitle={segmentId != 2004}
                required={segmentId != 2004}
                key={forceClearUpload}
                multiple
                service="FILE"
                onSetFiles={(files) => {
                  setUploadFiles(files.map((it) => it.response));
                }}
              />
            );
          }}
        </ProFormDependency>
      </Space>
    </ModalForm>
  );
};
