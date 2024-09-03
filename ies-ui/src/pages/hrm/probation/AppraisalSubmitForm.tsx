import FileUploader from '@/components/Attachment/FileUploader';
import Sumbitter from '@/pages/process-flow/components/Submitter/Sumbitter';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined, StarTwoTone } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ModalForm,
  ProCard,
  ProForm,
  ProFormDependency,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Modal, Radio, RadioChangeEvent, Space, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { round, uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import AppraisalInstruction from './components/AppraisalInstruction';
import OveralPerformance from './components/OveralPerformance';
import {
  AppraisalDataLookup,
  AppraisalEmPayload,
  AppraisalEmpImprovement,
  AppraisalEmpSubmissionResult,
  AppraisalEmSubmissionPayLoad,
  AppraisalRating,
  AppraisalRemark,
  AppraisalStyle,
  EmployeeInfResult,
} from './data.types';
import { Model } from './model';
import { createService } from './services';

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
};
interface Props {
  open?: boolean;
  onOpenModalChange: (v: boolean) => void;
  refreshTable: () => void;
}

export default ({ open, onOpenModalChange, refreshTable }: Props) => {
  const [lang, setLang] = useState<string>('ENG');
  const [dataLookup, setDataLookup] = useState<AppraisalDataLookup[]>();
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [formSubmittor] = useForm<DataFormType>();
  const [formRemark] = useForm<AppraisalRemark>();
  const requestActions = simpleRequestActions();
  const [submitter, setSubmitter] = useState<EmployeeInfResult>();
  const [appraisalDimension, setAppraisalDimension] = useState<AppraisalEmpSubmissionResult[]>();
  const [checkingForm, setCheckingForm] = useState<string>('');
  const editableFormRef = useRef<EditableFormInstance>();
  const [improvementRated1List, setImprovementRated1List] = useState<
    (AppraisalEmpImprovement & { key: string })[]
  >([{ key: uniqueId().toString(), id: 0, improvement: null, propose: null } as any]);
  const { actions } = Model();
  const srv = createService({ request: requestActions });

  useEffect(() => {
    srv.fetchAppraisalDataLookupList().then((rs) => {
      setDataLookup(rs);
    });
  }, []);

  const getPayload = async (
    status: string,
    validator?: AppraisalRating[],
  ): Promise<AppraisalEmPayload> => {
    var dataFormRemark = await formRemark.getFieldsValue();
    var submissionList = validator?.map((it) => {
      var appraisalBehavior =
        appraisalDimension
          ?.filter((i) => i.appraisalDimensionId === it.appraisalDimensionId)
          .map((ii) => ii.appraisalBehaviorId) || [];
      return {
        id: it.id,
        appraisalDimensionId: it.appraisalDimensionId,
        appraisalBehavior: appraisalBehavior,
        rating1: it.rating1,
        rating2: it.rating2,
        rating3: it.rating3,
        rating4: it.rating4,
        rating5: it.rating5,
        weight: it.weight,
      } as AppraisalEmSubmissionPayLoad;
    });
    var empPayload = {
      id: 0,
      empId: submitter?.empId || 0,
      empEmail: '',
      submissionList: submissionList,
      improvementRated1List: improvementRated1List.map((it) => ({
        id: it.id,
        appraisalEmpId: it.appraisalEmpId,
        improvement: it.improvement,
        propose: it.propose,
        refCode: 'r1',
      })),
      empComment: dataFormRemark.empComment,
      empStrength: dataFormRemark.empStrength,
      empTrainingNeeded: dataFormRemark.empTrainingNeeded,
      attachedFiles: uploadFiles,
      status: status,
      actionStatus: 'DRAFTED',
      rated1: true,
      rated2: false,
      rated3: false,
      rated4: false,
      rated5: false,
    } as AppraisalEmPayload;
    return empPayload;
  };
  const getValidation = () => {
    var validatorList = Array<AppraisalRating>();
    appraisalDimension?.forEach((it) => {
      if (validatorList?.find((i) => i.appraisalDimensionId === it.appraisalDimensionId)) {
        validatorList = validatorList.map((i) => {
          var i = Object.assign({}, i);
          if (i.appraisalDimensionId === it.appraisalDimensionId && it?.rating1) {
            i.rating1 = it?.rating1;
            i.weight = it?.weight;
          }
          return i;
        });
      } else {
        validatorList.push({
          id: it.appraisalEmpSubmissionId,
          appraisalDimensionId: it.appraisalDimensionId,
          title: it.title,
          title1: it.title1,
          rating1: it?.rating1,
          weight: it?.weight,
        } as AppraisalRating);
      }
      return;
    });
    return validatorList;
  };
  const onSaveHandler = async (status: string) => {
    await formSubmittor.validateFields();
    var title = 'Appraisal Form';
    var contentMsg = 'Are you sure to save draft the form?';
    var validatorList = getValidation();
    if ('SUBMITTED' === status) {
      if (validatorList.find((it) => !it?.rating1)) {
        Modal.warning({
          title: getLable('TITTLE_REQUIRE_RATING'),
          width: lang == 'KH' ? '50%' : '45%',
          content: (
            <div>
              {validatorList.map((it) => {
                if (!it?.rating1 || it?.rating1 == 0) {
                  return (
                    <div>
                      <b style={{ color: 'orange' }}>{lang == 'KH' ? it.title1 : it.title}: </b>
                      <span>
                        {lang == 'KH'
                          ? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING1')}`
                          : `${getLable('TBL_RATING1')} ${getLable('MSG_IS_REQUIRED')}`}
                      </span>
                    </div>
                  );
                }
              })}
            </div>
          ),
        });
        return;
      }
      var requireFields = Array<{ title: string; msg: string }>();
      var validateField = await formRemark.getFieldsValue();
      var areaImprovementMsgCode = 'TITLE_EMP_EM_MY_AREA_IMPROVEMENT';
      var improvementActionMsgCode = 'TITLE_EMP_EM_MY_IMPROVEMENT_ACTION';
      var requireMsgCode = 'MSG_IS_REQUIRED';

      if (!validateField?.empComment) {
        requireFields.push({ title: 'TITLE_EMP_COMMENT', msg: 'MSG_IS_REQUIRED' });
      }
      if (
        improvementRated1List?.length == 0 ||
        (improvementRated1List?.filter((it) => !it.improvement || it.improvement == '') || [])
          .length > 0
      ) {
        requireFields.push({ title: areaImprovementMsgCode, msg: requireMsgCode });
      }
      if (
        improvementRated1List?.length == 0 ||
        (improvementRated1List?.filter((it) => !it.propose || it.propose == '') || []).length > 0
      ) {
        requireFields.push({ title: improvementActionMsgCode, msg: requireMsgCode });
      }
      if (requireFields.length > 0) {
        Modal.warning({
          title: getLable('TITTLE_REQUIRE_FIELD'),
          width: '45%',
          content: (
            <div>
              {requireFields.map((it) => {
                return (
                  <div>
                    <b style={{ color: 'orange' }}>{getLable(it.title)}: </b>
                    <span>{getLable(it.msg)}</span>
                  </div>
                );
              })}
            </div>
          ),
        });
        await formRemark.validateFields();
        return;
      }
      var title = 'Appraisal Form';
      var contentMsg = 'Are you sure to submit the form?';
    }
    Modal.confirm({
      title: title,
      content: contentMsg,
      onOk: async () => {
        try {
          const rs = await srv.saveItem(await getPayload(status, validatorList));
          message.success(`Appraisal Form is ${'SUBMITTED' === status ? 'submitted' : 'saved'}.`);
          onOpenModalChange?.(false);
          refreshTable();
        } catch (error: any) {
          message.error(error.message || 'Failed to submit.');
        }
      },
    });
  };

  const onChangeSubmitterHandler = async (data: EmployeeInfResult) => {
    try {
      const appraisalEmp = await srv.findCurrentAppraisalEmp(data?.empId || 0);
      if (appraisalEmp?.empName) {
        setAppraisalDimension([]);
        setCheckingForm(
          `${appraisalEmp.empNo}- ${appraisalEmp.empName}'s appraisal form is already created.`,
        );
      } else {
        setSubmitter(data);
        const rs = await srv.fetchAppraisalEmpDimensionList(data?.empId || 0);
        setAppraisalDimension(rs);
        setCheckingForm('');
      }
      setImprovementRated1List([
        {
          key: uniqueId().toString(),
          id: 1,
          appraisalEmpId: 0,
          improvement: null,
          propose: null,
        } as any,
      ]);
    } catch (ex: any) {
      message.error(ex);
    }
  };
  const onChange1 = (e: RadioChangeEvent, r: AppraisalEmpSubmissionResult) => {
    var rating = e.target.value;
    setAppraisalDimension((v) => {
      return v?.map((it) => {
        if (
          it.appraisalDimensionId === r.appraisalDimensionId &&
          it.appraisalBehaviorId === r.appraisalBehaviorId
        ) {
          return { ...it, rating1: rating };
        } else if (
          it.appraisalDimensionId === r.appraisalDimensionId &&
          it.appraisalBehaviorId != r.appraisalBehaviorId
        ) {
          return { ...it, rating1: 0 };
        } else {
          return it;
        }
      });
    });
  };
  const rowColr = AppraisalStyle.color1;
  const color3 = AppraisalStyle.color3;
  const border = `solid ${color3} 1px`;

  const onChangeLanglauge = () => {
    setLang((v) => actions.getLangauge(v));
  };
  const getLable = (key: string) => {
    var label = dataLookup?.find((it) => it.code === key);
    return lang == 'KH' ? label?.value1 : label?.value;
  };
  return (
    <ModalForm
      modalProps={{
        maskClosable: false,
      }}
      form={formSubmittor}
      open={open}
      width={'85%'}
      title={<div>New Probation Evaluation Form </div>}
      submitter={{
        searchConfig: {
          submitText: 'Submit',
        },
        render: (_, defaultDoms) => {
          return [
            defaultDoms[0],
            (appraisalDimension?.length || 0 > 0) && (
              <Button
                key="save_draft"
                onClick={() => {
                  onSaveHandler('SUBMITTING');
                }}
              >
                Save Draft
              </Button>
            ),
            (appraisalDimension?.length || 0 > 0) && defaultDoms[1],
          ];
        },
      }}
      onFinish={() => onSaveHandler('SUBMITTED')}
      onOpenChange={(visible) => !visible && onOpenModalChange?.(visible)}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Sumbitter
          form={formSubmittor}
          title={
            <div>
              Employee {checkingForm && <span style={{ color: 'red' }}>: {checkingForm}</span>}
            </div>
          }
          onSetSubmitter={onChangeSubmitterHandler}
        />
        <AppraisalInstruction
          lang={lang}
          getLableName={getLable}
          onChangeLanglauge={onChangeLanglauge}
          appraisalPerformanceId={-1}
        />
        <ProTable<AppraisalEmpSubmissionResult>
          bordered
          pagination={false}
          cardProps={false}
          search={false}
          options={{
            density: false,
            search: false,
            reload: false,
            setting: false,
            fullScreen: false,
          }}
          dataSource={appraisalDimension}
          columns={[
            {
              title: getLable('TBL_DIMENSION'),
              width: '20%',
              render: (r: any) => (
                <>
                  <div>
                    {' '}
                    <b>
                      {' '}
                      {(
                        appraisalDimension?.filter(
                          (it) =>
                            it.appraisalDimensionId === r.appraisalDimensionId && it.rating1 > 0,
                        ) || []
                      ).length > 0 ? (
                        <>
                          <StarTwoTone />
                        </>
                      ) : (
                        <></>
                      )}{' '}
                      {lang == 'KH' ? r.title1 : r.title}
                    </b>
                  </div>
                  <div>{lang == 'KH' ? r.description1 : r.description}</div>
                </>
              ),
              onCell: (record: any) => ({
                rowSpan: record?.gsort === 1 ? record?.gtotal : 0,
                style:
                  record.sort % 2 === 0
                    ? { background: rowColr, border: border }
                    : { border: border },
              }),
            },
            {
              title: getLable('TBL_BEHAVIOR'),
              width: '40%',
              render: (r: any) => {
                var behaviorDescription =
                  lang == 'KH' ? r.behaviorDescription1 : r.behaviorDescription;
                return r?.rating1 > 0 ? <b>{behaviorDescription}</b> : behaviorDescription;
              },
              onCell: (record: any) => ({
                style:
                  record.sort % 2 === 0
                    ? { background: rowColr, border: border }
                    : { border: border },
              }),
            },
            {
              title: getLable('TBL_RATING1'),
              width: '10%',
              render: (r: any) => (
                <Radio
                  value={r.behaviorRate}
                  checked={r.behaviorRate === r.rating1 ? true : false}
                  onChange={(e) => onChange1(e, r)}
                />
              ),
              onCell: (record: any) => ({
                style:
                  record.sort % 2 === 0
                    ? { background: rowColr, textAlign: 'center', border: border }
                    : { textAlign: 'center', border: border },
              }),
            },
          ]}
          summary={(data) => {
            var rating1 = 0;
            data?.forEach((it) => {
              rating1 = rating1 + round(it?.rating1 * it.weight, 2);
            });
            return (
              <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold', border: border }}>
                <Table.Summary.Cell colSpan={2} index={2}>
                  {getLable('LABEL_TOTAL_SCORE')}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  {round(rating1, 2) || 0}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />

        <OveralPerformance lang={lang} getLableName={getLable} appraisalPerformanceId={-1} />
        <ProForm<AppraisalRemark> form={formRemark} submitter={false}>
          {(appraisalDimension?.length || 0 > 0) && (
            <ProCard
              size="small"
              style={{ height: '100%' }}
              headerBordered
              bordered
              title={
                <span>
                  {getLable('TITLE_EMP_COMMENT')}
                  <span style={{ color: 'red' }}>*</span>
                </span>
              }
            >
              <ProFormTextArea name={'empComment'} rules={[{ required: true }]} />
              <Space direction="vertical" style={{ width: '100%' }}>
                <EditableProTable<AppraisalEmpImprovement & { key: string }>
                  style={{ padding: 0, margin: 0 }}
                  cardProps={false}
                  size="small"
                  rowKey="key"
                  controlled
                  editableFormRef={editableFormRef}
                  value={improvementRated1List}
                  maxLength={5}
                  columns={[
                    {
                      title: (
                        <div>
                          {getLable('TITLE_EMP_EM_MY_AREA_IMPROVEMENT')}
                          <span style={{ color: 'red' }}>*</span>
                        </div>
                      ),
                      valueType: 'textarea',
                      width: 300,
                      dataIndex: 'improvement',
                      formItemProps: {
                        rules: [
                          {
                            required: true,
                            transform: (v) => {
                              return v;
                            },
                          },
                        ],
                      },
                    },
                    {
                      title: (
                        <div>
                          {getLable('TITLE_EMP_EM_MY_IMPROVEMENT_ACTION')}{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </div>
                      ),
                      valueType: 'textarea',
                      width: 300,
                      dataIndex: 'propose',
                      formItemProps: {
                        rules: [
                          {
                            required: true,
                            transform: (v) => {
                              return v;
                            },
                          },
                        ],
                      },
                    },
                    {
                      valueType: 'option',
                      width: 18,
                      render: () => {
                        return null;
                      },
                    },
                  ]}
                  recordCreatorProps={{
                    creatorButtonText: getLable('BTN_ADD_MORE'),
                    newRecordType: 'dataSource',
                    record: (index) => {
                      const key = uniqueId('appraisal_emp_improvement_rating1');
                      return {
                        key: key + index,
                        id: 0,
                        appraisalEmpId: 0,
                        implement: null,
                        propose: null,
                      } as any;
                    },
                  }}
                  editable={{
                    type: 'multiple',
                    editableKeys: improvementRated1List?.map((it) => it.key),
                    actionRender: (row, config) => [
                      improvementRated1List?.find((it) => it)?.key != row.key && (
                        <Button
                          onClick={() => {
                            config.onDelete?.(config.recordKey, row);
                          }}
                          type="link"
                          key={`del-${row.id}`}
                          icon={<DeleteOutlined />}
                        />
                      ),
                    ],
                    onValuesChange(record, data) {
                      const changeCateRecord = improvementRated1List?.find(
                        (it) => it.key == record?.key && it.id != record?.id,
                      );
                      setImprovementRated1List(
                        data.map((it) =>
                          it.key == changeCateRecord?.key
                            ? ({ ...it, itemId: null } as any)
                            : { ...it },
                        ),
                      );
                    },
                  }}
                />
                {/* </Col>
                  </Row>       */}
              </Space>
            </ProCard>
          )}
        </ProForm>
        {(appraisalDimension?.length || 0 > 0) && (
          <ProFormDependency rules={[{ required: true }]} name={['segmentId']} ignoreFormListField>
            {({ segmentId }) => {
              return (
                <FileUploader
                  title="Attachment"
                  addFileInfo
                  showTitle={true}
                  required={false}
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
        )}
      </Space>
    </ModalForm>
  );
};
