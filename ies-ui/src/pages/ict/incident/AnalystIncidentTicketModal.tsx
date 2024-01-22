import {
  Category,
  Incident,
  PriorityMatrix,
  WorkgorupMatrix,
  Workgroup,
  WorkgroupCategory,
} from '@/services/ict/data';
import ProForm, {
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Card, Col, Descriptions, message, Modal, Row, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LookupData, LookupDataType } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { IncidentServiceAPI } from '@/services/ict/services';
import { UserResult } from '@/services/process-workflow/data';
import { EditOutlined } from '@ant-design/icons';
import SearchAccountComp from '@/pages/process-flow/components/SearchAccount';
import { SearchAccount } from '@/services/account/data';
import { WorkflowServiceAPI } from '@/services/process-workflow/services';

import { StartWorkFlowParam } from '@/services/process-workflow/params';
import { useForm } from 'antd/lib/form/Form';
import SearchWorkgroupAccComp from './components/SearchWorkgroupAccComp';
import AttachedFileList from '@/components/Attachment/AttachedFileList';
import moment from 'moment';
import { currentDate, wrapLocalDate } from '@/pages/utils';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import FileUploader from '@/components/Attachment/FileUploader';

interface Props extends FormModalProps {
  isAnalyst?: boolean;
  actionType?: string;
}

const AnalystIncidentTicketModal: React.FC<Props> = ({
  isAnalyst,
  actionType,
  ...rest
}) => {
  const DEFAULT_BUSINESS_UNIT_ID = 1; // OFL
  const DEFAULT_WORKGORUP_CODE = 'IT_SERVICE_DESK'; // IT service desk for end user
  const DEFAULT_SOURCE_CODE = 'APPLICATION_WEB';

  const requestActions = simpleRequestActions();

  const services = IncidentServiceAPI(requestActions);

  const [extraRequired, setExtraRequired] = useState<boolean>(false);
  const [initFileIds, setInitFileIds] = useState<string[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);

  // const [files, setFiles] = useState<UploadFile[]>([])

  const [requestor, setRequestor] = useState<UserResult>();
  const [assignee, setAssignee] = useState<UserResult>();

  const [requestorModelVisible, setRequestorModelVisible] = useState(false);
  const [assigneeModelVisible, setAssigneeModelVisible] = useState<boolean>(false);

  const [lookupList, setLookupList] = useState<LookupData[]>([]);

  const [allCategoryList, setAllCategoryList] = useState<Category[]>([]);
  const [classificationList, setClassificationList] = useState<Category[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const [workgroupList, setWorkgroupList] = useState<Workgroup[]>([]);

  const [priorityMatrixList, setPriorityMatrixList] = useState<PriorityMatrix[]>([]);

  const [workgroupMatrixList, setWorkgroupMatrixList] = useState<WorkgorupMatrix[]>([]);
  const [workgroupIdSelected, setWorkgroupIdSelected] = useState<number>(0);
  const [workgroupCategory, setWorkgroupCategory] = useState<WorkgroupCategory[]>([]);
  const [forceClearUpload, setForceClearUpload] = useState(0)
  const { actions } = ProcessFlowModel();

  const [form] = useForm<Incident>();

  const clear = () => {
    form.resetFields();
    setExtraRequired(false);
    setInitFileIds([]);
    setFileIds([])
    setForceClearUpload(v => v + 1)
    setRequestor(undefined);
    setAssignee(undefined);
  };

  useEffect(() => {
    if (!rest.open) return;
    loadData();
  }, [rest.open]);

  const onAddedReportByHandler = async (item: SearchAccount) => {
    try {
      const workflowSerivce = WorkflowServiceAPI(requestActions);
      const userResult = await workflowSerivce.findUser({ id: item.id });
      setRequestor(userResult);
      setRequestorModelVisible(false);
      setExtraRequired(false);
    } catch (error) {
      message.error('Failed to select requestor.');
    }
  };

  const onAddedAssigneeHandler = async (item: SearchAccount) => {
    try {
      const workflowSerivce = WorkflowServiceAPI(requestActions);
      const userResult = await workflowSerivce.findUser({ id: item.id });
      setAssignee(userResult);
      setAssigneeModelVisible(false);
    } catch (error) {
      message.error('Failed to select requestor.');
    }
  };

  const loadData = async () => {
    try {
      const priorityMatrixs = await services.listPriorityMatrix();
      setPriorityMatrixList(priorityMatrixs);

      const workgroupMatrixs = await services.listWorkgroupMatrix();
      setWorkgroupMatrixList(workgroupMatrixs);

      const lookupTypes: LookupDataType[] = [
        'URGENCY',
        'IMPACT',
        'PRIORITY',
        'SOURCE',
        'COMPANY',
        'LOCATION',
      ];
      const lookupDataList = await services.listLookup(lookupTypes);
      setLookupList(lookupDataList);

      const allCategories = await services.listAllCategories();
      setAllCategoryList(allCategories);

      // no default, wait until workgroup change
      // setClassificationList(allCategories.filter(f => f?.parentId === null));
      // setCategoryList(allCategories.filter(f => f?.parentId !== null));

      const workgroups = await services.listWorkgroup();
      setWorkgroupList(workgroups);

      const workgroupCategories = await services.listWorkgroupCategory();
      setWorkgroupCategory(workgroupCategories);

      if (!isAnalyst) {

        const requestor = await actions.getRequestor()
        setRequestor(requestor)
        setClassificationList([]);
        setCategoryList([]);
        setClassificationList(
          allCategories.filter(
            (f) =>
              f.parentId === null &&
              workgroupCategories
                .filter(
                  (ff) =>
                    workgroups.find((wg) => wg.id === ff.workgroupId)?.code ==
                    DEFAULT_WORKGORUP_CODE,
                )
                .map((m) => m.categoryId)
                .includes(f.id),
          ),
        );
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetchdata');
    }
  };

  const getDataForm = async () => {
    if (isAnalyst && (!requestor || requestor === null)) {
      setExtraRequired(true);
      // message.error('Please choose Reported By');
      // return Promise.reject();//'Please choose Reported By');
    }

    const dataForm = await form.validateFields();

    return Promise.resolve({
      ...dataForm,
      requestedBy: requestor?.id || null,
      fileIds: fileIds.filter((fileName) => typeof fileName === 'string'),
    });
  };

  return (
    <Spin spinning={false}>
      <FormModalComp
        {...rest}
        width="1000px"
        onCancel={() => {
          clear();
          rest.onCancel && rest.onCancel();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              clear();
              rest.onCancel && rest.onCancel();
            }}
          >
            Cancel
          </Button>,
          <Button key="reset" onClick={() => clear()}>
            Reset
          </Button>,
          <Button
            title="Logging Incident Ticket..."
            // loading={rest.confirmLoading}
            disabled={rest.disabled}
            key="submitAndSend"
            type="primary"
            onClick={async () => {
              // try{
              const dataForm = await getDataForm();

              Modal.confirm({
                title: 'Create Incident Ticket',
                content: 'Are you sure?',
                onOk: async () => {
                  const payload: StartWorkFlowParam<Incident> = {
                    processDef: 'incident_ticket_process', // IncidentFormNames.processDefKey,
                    formKey: 'incident_ticket_process', // IncidentFormNames.start,
                    buId: DEFAULT_BUSINESS_UNIT_ID,
                    requestor: requestor?.id ?? '',
                    payload: dataForm,
                    comment: '',
                  };
                  try {
                    const rs = await services.request(payload);
                    message.success(
                      `Your request is submitted. Please tracking your request with ticket no ${rs.formNo} `,
                    );
                    clear();
                    rest.onCancel?.();
                    return Promise.resolve();
                  } catch (error: any) {
                    message.error(error.message || 'Failed to start process.');
                    Promise.reject();
                  }
                },
              });

              // }catch(error: any){
              //     console.log('error outside=', error);
              //     message.error(error);
              //     return Promise.reject();
              // }
            }}
          >
            Submit
          </Button>,
        ]}
      >
        <ProForm
          form={form}
          submitter={false}
          autoFocusFirstInput
          onValuesChange={(changeValue, values) => {
            const { urgencyId, impactId, classificationId, workgroupId } = changeValue;

            if ('urgencyId' in changeValue || 'impactId' in changeValue) {
              const urgency = 'urgencyId' in changeValue ? urgencyId : values.urgencyId;
              const impact = 'impactId' in changeValue ? impactId : values.impactId;

              const priorityMatrixFilter = priorityMatrixList.find(
                (f) => f.urgencyId === urgency && f.impactId === impact,
              );
              const priorityId = priorityMatrixFilter?.priorityId;

              form.setFieldsValue({ priorityId });
            }

            if ('workgroupId' in changeValue) {
              setWorkgroupIdSelected(workgroupId);
              setAssignee(undefined);

              //cascade to classification
              setClassificationList([]);
              setCategoryList([]);
              setClassificationList(
                allCategoryList.filter(
                  (f) =>
                    f.parentId === null &&
                    workgroupCategory
                      .filter((ff) => (ff.workgroupId = workgroupId))
                      .map((m) => m.categoryId)
                      .includes(f.id),
                ),
              );
            }

            if ('classificationId' in changeValue) {
              setCategoryList([]);
              setCategoryList(allCategoryList.filter((it) => classificationId === it.parentId));
            }
          }}
        >
          <Card size="small">
            <Row gutter={20} hidden={!isAnalyst}>
              <Col flex="auto">
                <Card
                  bodyStyle={
                    !extraRequired
                      ? { backgroundColor: '#fffbe6' }
                      : { backgroundColor: '#fffbe6', border: '1px solid rgb(237,91,86)' }
                  }
                  size="small"
                >
                  <Descriptions title="" layout="horizontal">
                    <Descriptions.Item label="Reported By">
                      <a
                        onClick={() => {
                          setRequestorModelVisible(true);
                        }}
                      >
                        {requestor?.name || 'N/A'} <EditOutlined />
                      </a>
                      <sup style={{ color: 'rgb(237,91,86)' }}>*</sup>
                    </Descriptions.Item>
                    <Descriptions.Item label="Emp No">
                      <b> {requestor?.employee?.empNo} </b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <b> {requestor?.email} </b>
                    </Descriptions.Item>

                    <Descriptions.Item label="Deptartment">
                      <b> {requestor?.employee?.department} </b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Title">
                      <b> {requestor?.employee?.jobTitle} </b>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            <Row gutter={20} style={{ marginTop: '10px', marginBottom: '0px' }}>
              <Col hidden={!isAnalyst} flex="250">
                <ProFormSelect
                  rules={[{ required: isAnalyst }]}
                  name="sourceId"
                  label="Source"
                  options={lookupList
                    ?.filter((it) => it.type === 'SOURCE' && it.code !== DEFAULT_SOURCE_CODE)
                    .map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                />
              </Col>
              <Col flex="250" hidden={!isAnalyst}>
                <ProFormDatePicker
                  rules={[{ required: isAnalyst }]}
                  label="Reported Date"
                  name={'requestedDate'}
                  fieldProps={{
                    disabledDate: (current) => current.isAfter(new Date())
                  }}
                />
              </Col>
              <Col flex="250" />
            </Row>

            <Row gutter={20}>
              <Col flex="250">
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="companyId"
                  label="Company"
                  options={lookupList
                    ?.filter((it) => it.type === 'COMPANY')
                    .map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                />
              </Col>
              <Col flex="250">
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="locationId"
                  label="Location"
                  options={lookupList
                    ?.filter((it) => it.type === 'LOCATION')
                    .map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                />
              </Col>
              <Col flex="250">
                <ProFormText rules={[{ required: true }]} name="contactNo" label="Contact No" />
              </Col>
            </Row>
          </Card>
          <Card title="" size="small" style={{ marginTop: '10px', marginBottom: '10px' }}>
            <Row gutter={20}>
              <Col flex="250">
                <ProFormSelect
                  rules={[{ required: isAnalyst }]}
                  name="urgencyId"
                  label="Urgency"
                  options={lookupList
                    ?.filter((it) => it.type === 'URGENCY')
                    .map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                />
              </Col>
              <Col flex="250">
                <ProFormSelect
                  rules={[{ required: isAnalyst }]}
                  name="impactId"
                  label="Impact"
                  options={lookupList
                    ?.filter((it) => it.type === 'IMPACT')
                    .map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                />
              </Col>
              <Col flex="250">
                <ProFormSelect
                  name="priorityId"
                  label="Priority"
                  rules={[{ required: isAnalyst }]}
                  readonly={true}
                  disabled={false}
                  options={lookupList
                    ?.filter((it) => it.type === 'PRIORITY')
                    .map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                />
              </Col>
            </Row>
            <Row gutter={20}>
              <Col flex="250" hidden={!isAnalyst}>
                <ProFormSelect
                  rules={[{ required: isAnalyst }]}
                  name="workgroupId"
                  label="Sub Function"
                  options={workgroupList.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
                />
              </Col>
              <Col flex="250">
                <ProFormSelect
                  rules={[{ required: isAnalyst }]}
                  name="classificationId"
                  label="Classification"
                  options={classificationList.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
                />
              </Col>

              <Col flex="250">
                <ProFormSelect
                  rules={[{ required: isAnalyst }]}
                  name="categoryId"
                  label="Category"
                  options={categoryList.map((it) => {
                    return { value: it.id, label: it.name };
                  })}
                />
              </Col>
              <Col hidden={isAnalyst} flex="250" />
            </Row>

            {isAnalyst && <Row gutter={20} hidden={!isAnalyst}>
              <Col flex="250">
                <Card bodyStyle={{ backgroundColor: 'rgb(241,243,244)' }} size="small">
                  <Descriptions title="" layout="horizontal">
                    <Descriptions.Item label="Assigned To">
                      {workgroupIdSelected > 0 ? (
                        <a
                          onClick={() => {
                            setAssigneeModelVisible(true);
                          }}
                        >
                          {assignee?.name || 'N/A'} <EditOutlined />
                        </a>
                      ) : (
                        `${assignee?.name || 'N/A'}`
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Emp No">
                      <b> {assignee?.employee?.empNo} </b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <b> {assignee?.email} </b>
                    </Descriptions.Item>

                    <Descriptions.Item label="Deptartment">
                      <b> {assignee?.employee?.department} </b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Title">
                      <b> {assignee?.employee?.jobTitle} </b>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>}
            {/* <Row gutter={20} hidden={!isAnalyst || (isAnalyst && actionType === 'CREATE')}>
              <Col flex="auto">
                <Descriptions title="" column={4} size="small" bordered layout="vertical">
                  <Descriptions.Item label="Response SLA" span={1}>
                    {' '}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deadline: 2022-07-10 16:30:10">High</Descriptions.Item>
                  <Descriptions.Item label="Actual">30 minutes</Descriptions.Item>
                  <Descriptions.Item label="Violation">
                    <Space style={{ color: 'red' }}>Violated</Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Row
              gutter={20}
              style={{ marginTop: '3px' }}
              hidden={!isAnalyst || (isAnalyst && actionType === 'CREATE')}
            >
              <Col flex="auto">
                <Descriptions title="" column={4} size="small" bordered layout="vertical">
                  <Descriptions.Item label="Resolution SLA" span={1}>
                    {' '}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deadline: 2022-07-10 16:50:10">High</Descriptions.Item>
                  <Descriptions.Item label="Actual">60 minutes</Descriptions.Item>
                  <Descriptions.Item label="Violation">
                    <Space style={{ color: 'green' }}>Normal</Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row> */}
          </Card>

          <Card title="" size="small" style={{ marginTop: '10px', marginBottom: '10px' }}>
            <Row gutter={20}>
              <Col flex="auto">
                <ProFormText
                  hasFeedback={false}
                  help={<span />}
                  rules={[{ required: true }]}
                  label="Issued Statement"
                  name={'symptom'}
                />
              </Col>
            </Row>
            <Row gutter={20}>
              <Col flex="auto">
                <ProFormTextArea
                  rules={[{ required: true }]}
                  label="Description"
                  name={'description'}
                />
              </Col>
            </Row>
          </Card>

          <FileUploader
            key={`fileUpload${forceClearUpload}`}
            multiple
            onSetFiles={files => setFileIds(files.map(it => it.response))}
          />
        </ProForm>
      </FormModalComp>
      <Modal
        title="Search"
        open={requestorModelVisible}
        destroyOnClose
        footer={false}
        onCancel={() => setRequestorModelVisible(false)}
      >
        {
          <SearchAccountComp
            type={'user'}
            approverOnly={false}
            selected={
              requestor
                ? [
                  {
                    ...requestor,
                    type: 'user',
                  },
                ]
                : []
            }
            onAdded={onAddedReportByHandler}
          />
        }
      </Modal>

      <Modal
        title="Search"
        open={assigneeModelVisible}
        destroyOnClose
        footer={false}
        onCancel={() => setAssigneeModelVisible(false)}
      >
        {
          <SearchWorkgroupAccComp
            workgroupMatrixList={workgroupMatrixList.filter(
              (f) => f.workgroupId === workgroupIdSelected,
            )}
            selected={
              assignee
                ? [
                  {
                    ...assignee,
                    type: 'user',
                  },
                ]
                : []
            }
            onAdded={onAddedAssigneeHandler}
          />
        }
      </Modal>
    </Spin>
  );
};

export default AnalystIncidentTicketModal;
