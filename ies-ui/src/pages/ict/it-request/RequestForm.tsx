import FileUploader from '@/components/Attachment/FileUploader';
import { ActionCompProps } from '@/components/core/comp';
import { EmployeeJobDetail } from '@/pages/hrm/data';
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ModalForm,
  ProCard,
  ProFormDateTimeRangePicker,
  ProFormDependency,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Alert, Button, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { ItRequestCategory, ItRequestItem, ItRequestItemData } from './data.types';
import { createService } from './services';

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
  requestTypeId: number;
  cctvLocationId?: number;
  reviewDatetime?: Moment[];
  remarks?: string;
  reason?: string;
};

export const itRequestSessions = [
  { label: 'General Request', value: 1 },
  { label: 'CCTV Review Request', value: 2 },
  { label: 'SAP, Reporting', value: 3 },
  { label: 'Internal System', value: 4 },
];

export default ({ visisble, onClose, cb }: ActionCompProps) => {
  const [form] = useForm<DataFormType>();
  const editableFormRef = useRef<EditableFormInstance>();
  const [dataSource, setDataSource] = useState<(ItRequestItemData & { key: string })[]>([
    { key: uniqueId().toString(), id: 0, categoryId: null } as any,
  ]);
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const [items, setItems] = useState<ItRequestItem[]>([]);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const [itemCategories, setItemCategories] = useState<ItRequestCategory[]>([]);
  const [isSAPReporting, setIsSAPReporting] = useState<boolean>(false);

  useEffect(() => {
    if (!visisble) return;
    (async () => {
      const rs = await services.listItem();
      setItems(rs);
      const categories = await services.listCategory();
      setItemCategories(categories);
    })();

    form.setFieldsValue({ requestTypeId: 1 });
  }, [visisble]);
  const [dates, setDates] = useState<any>(null);
  // const [value, setValue] = useState<any>(null);

  useEffect(() => {
    setIsSAPReporting(
      itemCategories.find(
        (it) => it.id === dataSource.findLast((it) => it.categoryId === 10)?.categoryId,
      )?.name === 'Reporting',
    );
  }, [dataSource]);

  return (
    <ModalForm<DataFormType>
      form={form}
      open={visisble}
      title="IT Request Form"
      width="1000px"
      onValuesChange={(changedValued) => {
        if ('requestTypeId' in changedValued) {
          setDataSource([{ key: uniqueId().toString(), id: 0, categoryId: null } as any]);
        }
      }}
      onFinish={async () => {
        const dataForm = await form.validateFields();
        await editableFormRef.current?.validateFields();
        if (dataSource && dataSource.length == 0) {
          message.error('No request item avaible.');
        } else if (isSAPReporting && dataForm.requestTypeId == 3 && uploadFiles.length == 0) {
          message.error('Attachment is required.');
        } else {
          Modal.confirm({
            title: 'IT request',
            content: 'Are you sure?',
            onOk: async () => {
              if (dataSource && dataForm.requestTypeId == 2 && dataSource.length == 0) {
                message.error('No request item avaible.');
              }
              const requestItems: ItRequestItemData[] =
                dataForm.requestTypeId == 2
                  ? [
                    {
                      categoryId: 0,
                      itemId: dataForm.cctvLocationId || 0,
                      date: dataForm.reviewDatetime?.[0],
                      dateTo: dataForm.reviewDatetime?.[1],
                      remarks: dataForm.remarks,
                      reason: dataForm?.reason,
                    },
                  ]
                  : dataSource;
              //var data = dataForm.requestTypeId == 3 ? { ...dataForm, reason: '' } : dataForm;
              try {
                const rs = await services.submitRequest({
                  ...dataForm,
                  requestItems: requestItems,
                  uploadedFiles: uploadFiles,
                });
                message.success(
                  `Your request is submitted. Please track the request with form no ${rs.formNo}`,
                );
                onClose?.();
                cb?.();
              } catch (error: any) {
                message.error(error.message || 'Failed to submit');
              }
            },
          });
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
                  setDataSource([{ key: key, id: 0, categoryId: null } as any]);
                  props.form?.resetFields();
                  setForceClearUpload((v) => v + 1);
                  setUploadFiles([]);
                  form.setFieldsValue({ requestTypeId: 1 });
                }}
              >
                Reset
              </Button>,
              defaultDoms[1],
            ];
          } else return defaultDoms;
        },
      }}
      onOpenChange={(visible) => !visible && onClose?.()}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Requestor onlyCurrentUser form={form} />

        <ProFormRadio.Group
          name={'requestTypeId'}
          label="Request Session"
          options={itRequestSessions}
        />
        <ProFormDependency name={['requestTypeId']} dependencies={['requestTypeId']}>
          {({ requestTypeId }) => {
            if (requestTypeId == 1) {
              return (
                <Alert type="info" message="Request related to IT Accessories, Software .etc" />
              );
            }

            if (requestTypeId == 2) {
              return <Alert type="info" message="Request related CCTV review." />;
            }

            if (requestTypeId == 3) {
              return <Alert type="info" message="Request related SAP, Reporting system" />;
            }

            if (requestTypeId == 4) {
              return <Alert type="info" message="Request related internal system development" />;
            }
          }}
        </ProFormDependency>

        <ProFormDependency name={['requestTypeId']}>
          {({ requestTypeId }) => {
            if (requestTypeId == 2) {
              return (
                <ProCard size="small" bordered>
                  <ProFormGroup>
                    <ProFormSelect
                      rules={[{ required: true }]}
                      showSearch
                      width={'md'}
                      label="Location"
                      bordered
                      name={'cctvLocationId'}
                      request={async ({ }) =>
                        (await services.listCCTVLocation()).map((it) => ({
                          label: it.name,
                          value: it.id,
                        }))
                      }
                    />
                    <ProFormDateTimeRangePicker
                      fieldProps={{
                        disabledDate: (current) => {
                          if (!dates) {
                            return false;
                          }
                          const tooLate = dates[0] && current.diff(dates[0], 'days') >= 30;
                          const tooEarly = dates[1] && dates[1].diff(current, 'days') >= 30;
                          return !!tooEarly || !!tooLate;
                        },
                        onCalendarChange(val) {
                          setDates(val);
                        },
                        onChange(val) {
                          // setValue(val);
                        },
                        onOpenChange(open) {
                          if (open) {
                            setDates([null, null]);
                          } else {
                            setDates(null);
                          }
                        },
                      }}
                      rules={[{ required: true }]}
                      label="Reviewed Datetime"
                      name={'reviewDatetime'}
                    />
                  </ProFormGroup>
                  <ProFormGroup>
                    <ProFormTextArea width={'lg'} label="Remarks" name="remarks" />
                  </ProFormGroup>
                </ProCard>
              );
            } else {
              return (
                <ProCard size="small" bordered title="Request Item">
                  <EditableProTable<ItRequestItemData & { key: string }>
                    size="small"
                    rowKey="key"
                    editableFormRef={editableFormRef}
                    value={dataSource}
                    controlled
                    columns={[
                      {
                        title: 'Category',
                        width: 300,
                        dataIndex: 'categoryId',
                        fieldProps: {
                          showSearch: true,
                          popupMatchSelectWidth: 300,
                          style: { width: 280 },
                          options: itemCategories
                            .filter((it) => it.typeId == requestTypeId)
                            .map((it) => ({ label: it.name, value: it.id })),
                        },
                        formItemProps: {
                          rules: [{ required: true }],
                        },

                        valueType: 'select',
                      },
                      {
                        title: 'Item',
                        width: 280,
                        dataIndex: 'itemId',
                        fieldProps: {
                          showSearch: true,
                          popupMatchSelectWidth: 310,
                          style: { width: 260 },
                        },

                        formItemProps: { rules: [{ required: true }] },
                        valueType: 'select',
                        valueEnum: (r) =>
                          items
                            .filter((it) => it.categoryId == r.categoryId)
                            .reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {}),
                      },
                      {
                        title: 'Remarks',
                        dataIndex: 'remarks',
                        valueType: 'textarea',
                        fieldProps: { rows: 1 },
                      },
                      {
                        valueType: 'option',
                        width: 50,
                        render: () => {
                          return null;
                        },
                      },
                    ]}
                    recordCreatorProps={{
                      creatorButtonText: 'New Item',
                      newRecordType: 'dataSource',
                      record: (index) => {
                        const key = uniqueId('request-item');
                        return { key: key + index, categoryId: null } as any;
                      },
                    }}
                    editable={{
                      type: 'multiple',
                      editableKeys: dataSource?.map((it) => it.key),
                      actionRender: (row, config) => [
                        <Button
                          onClick={() => {
                            config.onDelete?.(config.recordKey, row);
                          }}
                          type="link"
                          key={`del-${row.id}`}
                          icon={<DeleteOutlined />}
                        />,
                      ],
                      onValuesChange(record, data) {
                        const changeCateRecord = dataSource?.find(
                          (it) => it.key == record?.key && it.categoryId != record?.categoryId,
                        );
                        setDataSource(
                          data.map((it) =>
                            it.key == changeCateRecord?.key
                              ? ({ ...it, itemId: null } as any)
                              : { ...it },
                          ),
                        );
                      },
                    }}
                  />
                </ProCard>
              );
            }
          }}
        </ProFormDependency>

        <ProCard size="small" bordered>
          <ProFormTextArea label="Reason" name={'reason'} rules={[{ required: true }]} />
        </ProCard>
        <FileUploader
          key={forceClearUpload}
          //readOnly={isSAPReporting}
          required={isSAPReporting}
          multiple
          service="FILE"
          onSetFiles={(files) => {
            setUploadFiles(files.map((it) => it.response));
          }}
        />
      </Space>
    </ModalForm>
  );
};
