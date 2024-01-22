import FileUploader from '@/components/Attachment/FileUploader';
import { ActionCompProps } from '@/components/core/comp';
import { BU, Department } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import Requestor from '@/pages/process-flow/components/Requestor/Requestor';
import { MultiRequest } from '@/services/apiGateway';
import { LookupDataItem2 } from '@/services/data';
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
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { SavePayLoad } from './data.types';
import { createService } from './services';

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
  remarks?: string;
  empName: string;
  localName: string;
  empNo?: string;
  jobId: number;
  buId: number;
  gender: string;
  departmentId: number;
  workplaceId: number;
  startingDate: Moment;
  phoneNo?: string;
  email?: string
  carModal?: string;
  carColor?: string;
  year?: string;
  plateNumber?: string;
};

type ItemType = {
  itemId: number;
  itemName: string;
  itemType?: string;
  itemCategory: string;
  qty: number;
  type?: string;
  remarks?: string;
  checked: boolean;
};

export default ({ visisble, onClose, cb }: ActionCompProps) => {
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [form] = useForm<DataFormType>();
  const [forceClearUpload, setForceClearUpload] = useState(0);
  const requestActions = simpleRequestActions();
  const [lookupList, setLookupList] = useState<LookupDataItem2[]>([]);
  const [itemTaken, setItemTaken] = useState<number[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const [data, setData] = useState<{
    workplace: ItemType[];
    uniform: ItemType[];
    accessories: ItemType[];
    system: ItemType[];
    access: ItemType[];
    buList: BU[];
    departmentList: Department[];
  }>({
    workplace: [],
    uniform: [],
    accessories: [],
    system: [],
    access: [],
    buList: [],
    departmentList: [],
  });
  const services = createService(requestActions);

  const onRequestHandler = async () => {
    const dataForm = await form.validateFields();
    await editableFormRef.current?.validateFields();

    const itemList = [...data.workplace, ...data.accessories, ...data.uniform, ...data.system, ...data.access];

    if (!itemList.some((it) => it.checked)) {
      message.error('No request item.');
      return;
    }

    if (data.access.some(it => it.checked && it.itemId == 2241) && uploadFiles.length == 0) {
      message.error('Attachment file required.');
      return;
    }
    Modal.confirm({
      title: 'FMA - New Staff Support Request Form',
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
    (async () => {
      const rs = await EmployeeServices.listLookupData([
        'FMA_WORK_PLACE_ARRANGEMENT',
        'FMA_ACCESSORY',
        'FMA_UNIFORM',
        // 'FMA_SYSTEM',
        'WORK_PLACE',
        'FMA_ACCESS'
      ]).query(requestActions);
      setLookupList(rs);

      const rs1 = await MultiRequest<{
        buList: BU[];
        deptList: Department[];
      }>([EmployeeServices.listBu.queryParams, EmployeeServices.listDepartment.queryParams])(
        requestActions,
      );

      initDataSource(rs, rs1.buList, rs1.deptList);
    })();
  }, []);

  const initDataSource = (sources: LookupDataItem2[], buList: BU[], deptList: Department[]) => {
    setData({
      workplace: sources
        .filter((it) => it.type == 'FMA_WORK_PLACE_ARRANGEMENT')
        .map((it) => ({
          itemId: it.id,
          itemName: it.name,
          qty: 0,
          checked: false,
          itemCategory: it.type,
        })),
      uniform: sources
        .filter((it) => it.type == 'FMA_UNIFORM')
        .map((it) => ({
          itemId: it.id,
          itemName: it.name,
          qty: 0,
          checked: false,
          itemCategory: it.type,
        })),
      accessories: sources
        .filter((it) => it.type == 'FMA_ACCESSORY')
        .map((it) => ({
          itemId: it.id,
          itemName: it.name,
          qty: 0,
          checked: false,
          itemCategory: it.type,
        })),
      system: sources
        .filter((it) => it.type == 'FMA_SYSTEM')
        .map((it) => ({
          itemId: it.id,
          itemName: it.name,
          qty: 0,
          checked: false,
          itemCategory: it.type,
        })),
      access: sources
        .filter((it) => it.type == 'FMA_ACCESS')
        .map((it) => ({
          itemId: it.id,
          itemName: it.name,
          qty: 0,
          checked: false,
          itemCategory: it.type,
        })),
      buList: buList,
      departmentList: deptList,
    });
  };

  return (
    <ModalForm<DataFormType>
      form={form}
      title="FMA - New Staff Support Request Form"
      width={1000}
      open={visisble}

      onOpenChange={(visible) => !visible && onClose?.()}
      onFinish={onRequestHandler}
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
                  // initDataSource(lookupList)
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
                ?.filter((it) => it.type == 'WORK_PLACE')
                .map((it) => ({ label: it.name, value: it.id }))}
              fieldProps={{
                popupMatchSelectWidth: 300,
              }}
            />
          </ProFormGroup>
        </ProCard>

        <ProCard
          size="small"
          bordered
          title="2. Workplace arrangement (Please √, Initiated by HR, reviewed by hired Function Manager"
        >
          <EditableProTable<ItemType>
            recordCreatorProps={false}
            // editableFormRef={editableFormRef}
            rowKey={'itemId'}
            showHeader={false}
            value={data?.workplace}
            onValuesChange={(values) => {
              const newData = values.map((it) => ({
                ...it,
                qty: it.qty || 1,
                checked: itemTaken.some((i) => i == it.itemId),
              }));
              setData((v) => ({ ...v, workplace: newData }));
            }}
            columns={[
              {
                dataIndex: 'checked',
                renderFormItem(schema, config, form, action) {
                  return (
                    <Checkbox
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
              { dataIndex: 'itemName', width: 320, readonly: true },
              {
                width: 550,
                dataIndex: 'remarks',
                valueType: 'textarea',
                formItemProps: (form, config) => {
                  const item = form.getFieldValue(config.rowKey || '');
                  return { ...config.formItemProps, hidden: !item?.checked }
                },
                // formItemProps: (form, config) => {
                //   const item = form.getFieldValue(config.rowKey || '');
                //   return { ...config, hidden: !item?.checked };
                // },
                fieldProps: { rows: 1, placeholder: 'Remarks' },
              },
            ]}
            editable={{
              editableKeys: data?.workplace.map((it) => it.itemId),
              type: 'multiple',
            }}
          />
        </ProCard>
        <ProCard
          size="small"
          bordered
          title="3. Uniform (Please √, Initiated by HR, reviewed by hired Function Manager)"
        >
          <EditableProTable<ItemType>
            editableFormRef={editableFormRef}
            recordCreatorProps={false}
            rowKey={'itemId'}
            showHeader={false}
            value={data?.uniform}
            onValuesChange={(values) => {
              const newData = values.map((it) => ({
                ...it,
                qty: it.qty || 1,
                checked: itemTaken.some((i) => i == it.itemId),
              }));
              setData((v) => ({ ...v, uniform: newData }));
            }}
            columns={[
              {
                dataIndex: 'checked',
                renderFormItem(schema, config, form, action) {
                  return (
                    <Checkbox
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
                dataIndex: 'itemType',
                width: 120,
                valueType: 'select',
                fieldProps: { placeholder: 'Size', title: '' },
                valueEnum: { S: 'S', M: 'M', L: 'L', XL: 'XL', XXL: 'XXL', OTHER: 'Other' },
                formItemProps(form, config) {
                  const item = form.getFieldValue(config.rowKey || 'Number of box');
                  return {
                    ...config.formItemProps,

                    hidden: !item?.checked,

                    rules: [{ required: item?.checked }],
                  };
                },
              },

              {
                dataIndex: 'remarks',
                width: 450,
                valueType: 'textarea',
                fieldProps: { rows: 1, placeholder: 'Remarks' },
                formItemProps(form, config) {
                  const item = form.getFieldValue(config.rowKey || '');
                  return { ...config.formItemProps, hidden: !item?.checked };
                },
              },
            ]}
            editable={{
              editableKeys: data?.uniform.map((it) => it.itemId),
              type: 'multiple',
            }}
          />
        </ProCard>
        <ProCard
          size="small"
          direction='column'
          bordered
          title="4. Accessories (Please √, Initiated by HR, reviewed by hired Function Manager)"
        >
          <EditableProTable<ItemType>
            // editableFormRef={editableFormRef}
            recordCreatorProps={false}
            rowKey={'itemId'}
            showHeader={false}
            value={data?.accessories}
            onValuesChange={(values) => {
              const newData = values.map((it) => ({
                ...it,
                qty: it.qty || 1,
                checked: itemTaken.some((i) => i == it.itemId),
              }));
              setData((v) => ({ ...v, accessories: newData }));
            }}
            columns={[
              {
                dataIndex: 'checked',
                renderFormItem(schema, config, form, action) {
                  return (
                    <Checkbox
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
              { dataIndex: 'itemName', width: 320, readonly: true },
              {
                dataIndex: 'qty',
                fieldProps: { placeholder: 'Box Num' },
                valueType: 'digit',
                width: 150,
                formItemProps(form, config) {
                  const item = form.getFieldValue(config.rowKey || '');
                  return { ...config.formItemProps, hidden: !item?.checked };
                },
              },
              {
                width: 405,
                dataIndex: 'remarks',
                valueType: 'textarea',
                fieldProps: { rows: 1, placeholder: 'Remarks' },
                formItemProps(form, config) {
                  const item = form.getFieldValue(config.rowKey || '');
                  return { ...config.formItemProps, hidden: !item?.checked };
                },
              },
            ]}
            editable={{
              editableKeys: data?.accessories.map((it) => it.itemId),
              type: 'multiple',
            }}
          />
          {data.accessories.some(it => it.checked) && <ProCard >
            <ProFormGroup >
              <ProFormText rules={[{ required: true }]} name={"phoneNo"} label="Phone No" />
              <ProFormText rules={[{ required: true }]} name={"email"} label="Email" />
            </ProFormGroup>
          </ProCard>}

        </ProCard>



        <ProCard
          size="small"
          direction='column'
          bordered
          title="5. System car access/Gate Pass (Please √, Initiated by HR, reviewed by hired Function Manager)"
        >
          <EditableProTable<ItemType>
            // editableFormRef={editableFormRef}
            recordCreatorProps={false}
            rowKey={'itemId'}
            showHeader={false}
            value={data?.access}
            onValuesChange={(values) => {
              const newData = values.map((it) => ({
                ...it,
                qty: it.qty || 1,
                checked: itemTaken.some((i) => i == it.itemId),
              }));
              setData((v) => ({ ...v, access: newData }));
            }}
            columns={[
              {
                dataIndex: 'checked',
                renderFormItem(schema, config, form, action) {
                  return (
                    <Checkbox
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
              { dataIndex: 'itemName', width: 320, readonly: true },
              {
                width: 550,
                dataIndex: 'remarks',
                valueType: 'textarea',
                formItemProps: (form, config) => {
                  const item = form.getFieldValue(config.rowKey || '');
                  return { ...config.formItemProps, hidden: !item?.checked }
                },
                fieldProps: { rows: 1, placeholder: 'Remarks' },
              },
            ]}
            editable={{
              editableKeys: data?.access.map((it) => it.itemId),
              type: 'multiple',
            }}
          />
          {data.access.some(it => it.checked && it.itemId == 2242) && <ProCard >
            <ProFormGroup >
              <ProFormText width={170} rules={[{ required: true }]} name={"carModal"} label="Car Model" />
              <ProFormText width={120} rules={[{ required: true }]} name={"carColor"} label="Color" />
              <ProFormText width={120} rules={[{ required: true }]} name={"year"} label="Year" />
              <ProFormText width={200} rules={[{ required: true }]} name={"plateNumber"} label="Plate Number" />
            </ProFormGroup>
          </ProCard>}

        </ProCard>
        <FileUploader
          key={forceClearUpload}
          multiple
          required={data.access.some(it => it.checked && it.itemId == 2241)}
          service="FILE"
          onSetFiles={(files) => {
            setUploadFiles(files.map((it) => it.response));
          }}
        />
      </Space>
    </ModalForm>
  );
};
