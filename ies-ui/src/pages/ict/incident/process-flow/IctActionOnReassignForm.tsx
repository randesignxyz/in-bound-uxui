import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionDataFormProps } from '@/pages/process-flow/data';
import { SearchAccount } from '@/services/account/data';

import { simpleRequestActions } from '@/services/model';
import { UserResult } from '@/services/process-workflow/data';
import { WorkflowServiceAPI } from '@/services/process-workflow/services';
import {
  Category,
  Incident,
  IncidentDetailResponse,
  PriorityMatrix,
  WorkgorupMatrix,
  Workgroup,
  WorkgroupCategory,
} from '@/services/ict/data';
import { IncidentServiceAPI } from '@/services/ict/services';
import { EditOutlined } from '@ant-design/icons';
import ProForm, { ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { Card, Col, Descriptions, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';
import { LookupData, LookupDataType } from '@/services/data';
import SearchWorkgroupAccComp from '../components/SearchWorkgroupAccComp';

export default (props: ActionDataFormProps) => {
  const requestActions = simpleRequestActions();
  // const access = useAccess();
  // const accountServices = AccountServiceAPI(requestActions)
  const services = IncidentServiceAPI(requestActions);
  const workflowSerivce = WorkflowServiceAPI(requestActions);

  // const [isAnalyst, setAnalyst] = useState<boolean>(true);

  const [assignee, setAssignee] = useState<UserResult>();
  const [workgroupList, setWorkgroupList] = useState<Workgroup[]>([]);
  const [incident, setIncident] = useState<IncidentDetailResponse>();

  const [assigneeModelVisible, setAssigneeModelVisible] = useState<boolean>(false);

  const [lookupList, setLookupList] = useState<LookupData[]>([]);

  const [allCategoryList, setAllCategoryList] = useState<Category[]>([]);
  const [classificationList, setClassificationList] = useState<Category[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const [priorityMatrixList, setPriorityMatrixList] = useState<PriorityMatrix[]>([]);
  const [workgroupMatrixList, setWorkgroupMatrixList] = useState<WorkgorupMatrix[]>([]);
  const [workgroupIdSelected, setWorkgroupIdSelected] = useState<number>(0);
  const [workgroupCategory, setWorkgroupCategory] = useState<WorkgroupCategory[]>([]);

  const [files, setFiles] = useState<UploadFile[]>([]);

  const [form] = useForm<Incident>();

  useEffect(() => {
    if (!props.visible) return;
    loadData();
    return () => {
      form.resetFields();
      setFiles([]);
    };
  }, [props.visible]);

  const loadData = async () => {
    try {
      if (!props.activityData?.procInstId) return;
      const data = await services.detailByProcessFlow(props.activityData?.procInstId);

      const userResult = await workflowSerivce.findUser({ id: data.assignedTo ?? '' });
      setAssignee(userResult);

      const priorityMatrixs = await services.listPriorityMatrix();
      setPriorityMatrixList(priorityMatrixs);

      const lookupTypes: LookupDataType[] = ['URGENCY', 'IMPACT', 'PRIORITY', 'SOURCE'];
      const lookupDataList = await services.listLookup(lookupTypes);
      setLookupList(lookupDataList);

      const allCategories = await services.listAllCategories();
      setAllCategoryList(allCategories);

      // setClassificationList(allCategories.filter(f => f?.parentId === null));
      // setCategoryList(allCategories.filter(f => f?.parentId !== null));

      const workgroups = await services.listWorkgroup();
      setWorkgroupList(workgroups);

      setWorkgroupIdSelected(data.workgroupId ?? 0);

      const workgroupCategories = await services.listWorkgroupCategory();
      setWorkgroupCategory(workgroupCategories);

      // onWorkgroupChange(data.workgroupId??0);
      setClassificationList(
        allCategories.filter(
          (f) =>
            f.parentId === null &&
            workgroupCategories
              .filter((ff) => ff.workgroupId === data.workgroupId ?? 0)
              .map((m) => m.categoryId)
              .includes(f.id),
        ),
      );

      // onClassificationChange(data.classificationId??0);
      setCategoryList(allCategories.filter((it) => data.classificationId ?? 0 === it.parentId));

      const workgroupMatrixs = await services.listWorkgroupMatrix();
      setWorkgroupMatrixList(workgroupMatrixs);

      setIncident(data);

      form.setFieldsValue({
        ...data,
      });
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetchdata');
    }
  };

  const onWorkgroupChange = (workgroupId: number) => {
    setClassificationList(
      allCategoryList.filter(
        (f) =>
          f.parentId === null &&
          workgroupCategory
            .filter((ff) => ff.workgroupId === workgroupId)
            .map((m) => m.categoryId)
            .includes(f.id),
      ),
    );
  };

  const onClassificationChange = (classificationId: number) => {
    setCategoryList(allCategoryList.filter((it) => classificationId === it.parentId));
  };

  const onAddedHandler = async (item: SearchAccount) => {
    try {
      const userResult = await workflowSerivce.findUser({ id: item.id });
      setAssignee(userResult);
      setAssigneeModelVisible(false);
    } catch (error) {
      message.error('Failed to select assignee.');
    }
  };

  const getDataForm = async () => {
    const dataForm = await form.validateFields();

    return Promise.resolve({ ...dataForm });
  };

  return (
    <ActionFormWrapper
      title="Incident Ticket - On Reassign"
      {...props}
      loading={requestActions.request?.loading}
      width={'1230px'}
      actionHandlers={{
        ...props.actionHandlers,
        onCompleted: async () => {
          if (!incident) return;
          if (!props.activityData?.taskId) {
            message.error('Task Id is not found');
            return;
          }
          const dataForm = await getDataForm();

          Modal.confirm({
            title: 'Reassign the ticket',
            content: 'Are you sure?',
            onOk: async () => {
              try {
                await services.reassignSubFunction({
                  taskId: props.activityData?.taskId || '',
                  actionName: props.action,
                  comment: form.getFieldValue('comment') ?? null,
                  payload: {
                    id: incident?.id || 0,
                    ...dataForm,
                    assignedTo: assignee?.id ?? null,
                    status: 'REASSIGNED',
                    company: null,
                    location: null,
                  },
                  fileIds: files.filter((f) => f.status !== 'error').map((it) => it.response),
                });
                props.actionHandlers?.onCancel?.(true);
              } catch (error: any) {
                message.error(error?.message || 'Failed to submit.');
              }
            },
          });
        },
        onAddFile: (file) => setFiles((v) => [...v, file]),
        onRemoveFile: (file) => setFiles((v) => v.filter((it) => it.uid !== file.uid)),
        onReset: () => {
          setFiles([]);
        },
      }}
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
            onWorkgroupChange(workgroupId);
          }

          if ('classificationId' in changeValue) {
            setCategoryList([]);
            onClassificationChange(classificationId);
          }
        }}
      >
        <Card title="" size="small" style={{ marginTop: '10px', marginBottom: '10px' }}>
          <Row gutter={20}>
            <Col flex="250">
              <ProFormSelect
                rules={[{ required: true }]}
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
                rules={[{ required: true }]}
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
                required={true}
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
            <Col flex="250">
              <ProFormSelect
                rules={[{ required: true }]}
                name="workgroupId"
                label="Sub Function"
                options={workgroupList.map((it) => {
                  return { value: it.id, label: it.name };
                })}
              />
            </Col>
            <Col flex="250">
              <ProFormSelect
                rules={[{ required: true }]}
                name="classificationId"
                label="Classification"
                options={classificationList.map((it) => {
                  return { value: it.id, label: it.name };
                })}
              />
            </Col>

            <Col flex="250">
              <ProFormSelect
                rules={[{ required: true }]}
                name="categoryId"
                label="Category"
                options={categoryList.map((it) => {
                  return { value: it.id, label: it.name };
                })}
              />
            </Col>
            <Col hidden={true} flex="250" />
          </Row>

          <Row gutter={20}>
            <Col flex="250">
              <Card bodyStyle={{ backgroundColor: 'rgb(241,243,244)' }} size="small">
                <Descriptions title="" layout="horizontal">
                  <Descriptions.Item label="Assigned To">
                    <a
                      onClick={() => {
                        setAssigneeModelVisible(true);
                      }}
                    >
                      {assignee?.name || 'N/A'} <EditOutlined />
                    </a>
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
          </Row>
        </Card>
        <Card title="" size="small" style={{ marginTop: '10px', marginBottom: '10px' }}>
          <Row gutter={20}>
            <Col flex="auto">
              <ProFormTextArea rules={[{ required: true }]} label="Comment" name={'comment'} />
            </Col>
          </Row>
        </Card>
      </ProForm>
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
            onAdded={onAddedHandler}
          />
        }
      </Modal>
    </ActionFormWrapper>
  );
};
