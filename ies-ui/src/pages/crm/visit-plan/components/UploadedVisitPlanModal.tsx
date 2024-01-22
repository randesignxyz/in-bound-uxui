import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Alert, Checkbox, Modal, Space, Tooltip, Typography, message } from 'antd';
import { useState, useEffect } from 'react';
import { ImportedVisitPlan } from '../data';
import { renderFieldInfoText } from '@/components/Component';
import { execDataService } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { toReadable } from '@/pages/utils';
import { ProCard, ProForm, ProFormCheckbox, ProFormDatePicker } from '@ant-design/pro-components';
import { Moment } from 'moment';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { DataResponse } from '@/services/shared/data';

const { Text } = Typography;

interface UploadedModalProps extends FormModalProps {
  datasources?: DataResponse<ImportedVisitPlan>;
}

const UploadedVisitPlanModal: React.FC<UploadedModalProps> = ({
  datasources,
  loading,
  ...rest
}) => {

  const [importedData, setImportedData] = useState<DataResponse<ImportedVisitPlan>>()
  const [data, setData] = useState<ImportedVisitPlan[]>();
  const [dataValidation, setDataValidation] = useState(0)
  const [submited, setSubmited] = useState(false)
  const requestActions = simpleRequestActions()
  const [form] = useForm<{
    effectiveDate: Moment, cleanExisting?: boolean
  }>()

  const init = (items?: ImportedVisitPlan[], submited?: boolean) => {


    setSubmited(submited || false)
    const itemList = items || datasources?.items
    if (items && datasources?.id) {
      setImportedData({ id: datasources.id, items: itemList })
    } else {
      setImportedData(datasources)
    }

    setData(itemList?.map(it => ({ ...it, key: uniqueId() })) || []);
    setDataValidation(itemList?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed))?.length || 0)

  }

  useEffect(() => {

    if (!rest.open) return
    init()
  }, [rest.open]);


  const columns: ProColumns<ImportedVisitPlan>[] = [
    {
      title: 'Customer Code',
      render: (_, r) => renderFieldInfoText(r, 'customerCode', r.customerCode)
    },
    {
      title: 'Salesperson Name',
      dataIndex: 'salespersonName',
      render: (_, r) => renderFieldInfoText(r, 'salespersonName', r.salespersonName)
    },
    {
      title: 'Address',
      render: (_, r) => renderFieldInfoText(r, 'addressCode', r.addressCode)
    },
    {
      title: 'Week of Month',
      dataIndex: 'weeks',
      render: (_, r) => renderFieldInfoText(r, 'weeks', r.weeks)

    },
    {
      title: 'Day',
      render: (_, r) => renderFieldInfoText(r, 'addressCode', [
        { label: 'Monday', value: r.monday },
        { label: 'Tuesday', value: r.tuesday },
        { label: 'Wednesday', value: r.wednesday },
        { label: 'Thursday', value: r.thursday },
        { label: 'Friday', value: r.friday },
        { label: 'Saturday', value: r.saturday },
        { label: 'Sunday', value: r.sunday },
      ].filter(it => it.value).map(it => `${it.label}: ${it.value}`).join(", "))

    },
    {
      title: "Action",
      render: (_, r) => toReadable(r.action)
    }, {
      title: "Error Message",
      render: (_, r) => <Text type="danger">{r.fieldInfoList?.filter(it => it.isFailed).map(it => `${it.fieldDisplay}: ${it.message}`).join(", ")} </Text>
    }
  ];

  return (
    <FormModalComp
      isHiddenReset={true}
      disabled = {submited}
      title="Upload Visit Plan"
      maskClosable={false}
      
      onSubmit={async () => {

        if (submited) {
          message.warning("Imported data is commited.")
          return
        }
        if (dataValidation > 0) {
          message.error("Please resolve all remaining issues")
          return
        }

        const dataForm = await form.validateFields()

        Modal.confirm({
          title: "Commit imported data.",
          content: "Are you sure?",
          onOk: async () => {
            try {``
              if (datasources?.id) {

                const rs = await execDataService<{ data: ImportedVisitPlan[] }, { importedId: number, effectiveDate: Moment, cleanExisting?: boolean }>({
                  actionName: 'commit-imported-visit-plan-data',
                  endpoint: 'FILE',
                  payload: {
                    importedId: datasources?.id,
                    effectiveDate: dataForm.effectiveDate,
                    cleanExisting: dataForm.cleanExisting

                  }
                })(requestActions)
                init(rs.data, true)
                message.success("Data commited.")
              }

            } catch (error: any) {
              message.error(error.message)
            }
          }
        })
      }}
      width="1200px"
      {...rest}
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        {dataValidation > 0 && <Alert type='error' message={`${dataValidation} records is invalid to import.`} showIcon action={[
          <Checkbox onChange={e => {
            if (e.target.checked) {
              setData(importedData?.items?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed)))
            } else {
              setData(importedData?.items)
            }
          }}>Reveal</Checkbox>
        ]} />}

        {submited && dataValidation == 0  && <Alert type='success' message="Data successfully submitted." closable />}
        {!submited && <ProCard bordered title="Generate Schdule">
          <ProForm form={form} submitter={false}>
            <ProForm.Group>
              <ProFormDatePicker rules={[{ required: true }]} width={'md'} name={'effectiveDate'} label="Effective Date" />
              <ProFormCheckbox name={'clean'} label="Clean existing visit schedule" />
            </ProForm.Group>
          </ProForm>
        </ProCard>}


        <ProTable<ImportedVisitPlan>
          columns={columns}
          size='small'
          loading={loading}
          options={false}
          dataSource={data}
          search={false}
          showHeader={true}
          rowKey="key"
        />
      </Space>
    </FormModalComp>

  );
};

export default UploadedVisitPlanModal;
