import TableView from '@/components/DataCrud/TableView';
import { CrmPaths } from '@/pages/crm';
import { ContractServices } from '@/pages/crm/contract/services';
import { formatDate, formatDateTime } from '@/pages/utils';
import { Paging } from '@/services/API';
import { fetchDataListService, MultiRequest } from '@/services/apiGateway';
import { VisitScheduleAdvanceSearchParams, VisitScheduleItem } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  EyeOutlined,
  PaperClipOutlined,
  ScheduleOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { LightFilter, ProFormDatePicker, ProFormSelect } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Button, message, Modal, Radio, Space, Spin, Switch, Tag, Tooltip, Typography } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { Moment } from 'moment';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import { Model } from '../../model';
import CalenderView from '../CalenderView';
import GenerateScheduleModal from '../GenerateScheduleModal';
import QuickView from '../quick-view';
import AdvanceSearch from './AdvanceSearch';

export interface ListProps {
  onDetail?: (data: VisitScheduleItem) => void;
}

interface LightFilterProp {
  hasAttachment: string;
  checkFilter?: string[];
  contractVerified?: string;
  posmVerified?: string;
  month?: Moment;
  divisionIds?: number[];
}

const VisitScheduleListView: React.FC<ListProps> = ({ onDetail }) => {
  const { state, actions, modals } = Model();
  const [lookupData, setLookupData] = useState<{
    contractTypes?: LookupData[];
    lookupList: LookupData[];
  }>();
  const requestActions = simpleRequestActions();
  useEffect(() => {
    (async () => {
      const rs = await MultiRequest<{
        contractTypes: LookupData[];
      }>([ContractServices.listContractType().queryParams])(requestActions);

      const lookupList = await fetchDataListService<LookupData, { list: string[] }>({
        actionName: 'lookupDataList',
        endpoint: 'CRM',
        payload: { list: ['CUSTOMER_DIVISION'] },
      }).query(requestActions);

      setLookupData({
        contractTypes: rs.contractTypes,
        lookupList: lookupList,
      });
    })();
  }, []);
  useEffect(() => {
    actionRef.current?.reload();
    actions.initialData();
  }, []);

  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');
  const { Text } = Typography;

  const [advanceSearchParams, setAdvanceSearchParams] = useState<VisitScheduleAdvanceSearchParams>({
    status: 'COMPLETED',
  });

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: VisitScheduleAdvanceSearchParams },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions
      .loadListItem(criteria || { advanceSearch: advanceSearchParams }, pagination, sort)
      .then((it) => {
        return cacheList.cacheDataList({
          type: 'visit-schedule',
          criteria: criteria?.advanceSearch || advanceSearchParams,
          data: it,
        });
      }) as Promise<Paging<VisitScheduleItem>>;
  };

  const quickViewHandler = async (data: VisitScheduleItem) => {
    await actions.detail(data.id);
    modals.showModal('quick-view');
  };
  const _onChange = (value: boolean) => {
    setAdvanceSearchParams((v) => ({
      ...v,
      hasAttachment: value,
    }));
    actionRef.current?.reloadAndRest?.();
  };
  return (
    <Spin spinning={state.loading}>
      <TableView<
        VisitScheduleItem,
        { searchValue?: string; advanceSearch?: VisitScheduleAdvanceSearchParams }
      >
        cache
        advanceSearch
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some(
          (v) => v !== undefined,
        )}
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              access.canVisitScheduleGen && (
                <Tooltip title="Genderate visit schedule">
                  <Button
                    type="link"
                    onClick={() => modals.showModal('generate-schedule')}
                    icon={<ScheduleOutlined />}
                  />
                </Tooltip>
              ),
            ],
          },
        }}
        extraFilter={
          <Space>
            <Radio.Group
              style={{width: 280}}
              value={advanceSearchParams.status || 'COMPLETED'}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                  hasAttachment: undefined,
                  ...{ planned: undefined, completedDate: undefined },
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="PENDING">Pending</Radio.Button>
              <Radio.Button value="COMPLETED">Completed</Radio.Button>
              <Radio.Button value="CANCELED">Canceled</Radio.Button>
            </Radio.Group>
            {advanceSearchParams.status === 'COMPLETED' && (
              <div>
                <LightFilter<LightFilterProp>
                  onValuesChange={(_, values) => {
                    const hasAttachment =
                      'hasAttachment' in values
                        ? values['hasAttachment'] === 'yes'
                          ? true
                          : values['hasAttachment'] === 'null'
                          ? undefined
                          : false
                        : undefined;

                    setAdvanceSearchParams((v) => ({
                      ...v,
                      hasContractOnly: values.checkFilter?.includes('hasContract'),
                      hasPosmCheckedOnly: values.checkFilter?.includes('hasPosm'),
                      contractVerified: values.contractVerified
                        ? values.contractVerified === 'yes'
                        : undefined,
                      posmVerified: values.posmVerified ? values.posmVerified === 'yes' : undefined,
                      month: values.month,
                      hasAttachment: hasAttachment,
                      divisionIds: values.divisionIds,
                    }));

                    actionRef.current?.reloadAndRest?.();
                  }}
                >
                  <ProFormSelect
                    name="checkFilter"
                    label="For Verify"
                    mode="multiple"
                    options={[
                      { label: 'Has Contract', value: 'hasContract' },
                      { label: 'Has POSM', value: 'hasPosm' },
                    ]}
                  />

                  <ProFormSelect
                    name="contractVerified"
                    label="Contract Verified"
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                  />

                  <ProFormSelect
                    name="posmVerified"
                    label="POSM Verified"
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                  />

                  <ProFormDatePicker.Month name={'month'} label="Month" />

                  <ProFormSelect
                    label="Division"
                    name="divisionIds"
                    mode="multiple"
                    width="md"
                    showSearch
                    allowClear
                    options={lookupData?.lookupList
                      ?.filter((it) => it.type === 'CUSTOMER_DIVISION')
                      ?.map((it) => {
                        return { value: it.id, label: it.name };
                      })}
                  />
                  {advanceSearchParams.status === 'COMPLETED' && (
                    <Space>
                      <Text type="secondary">Has Error Attachment</Text>
                      <Switch
                        onChange={_onChange}
                        defaultChecked={advanceSearchParams.hasAttachment}
                      />
                    </Space>
                  )}
                </LightFilter>
              </div>
            )}
          </Space>
        }
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          // onAdd: actionHandlers?.onAdd,
          onFirstLoad: () =>
            cacheList.fetchDataList('visit-schedule').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<VisitScheduleItem>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        columns={[
          {
            width: 20,
            render: (_, r) => (
              <Space size={1}>
                <Tooltip title="View data in new browser tab.">
                  <Button
                    type="link"
                    size="small"
                    icon={<SelectOutlined />}
                    onClick={async () => {
                      window.open(`./detail/${r.id}`, '_blank')?.focus();
                    }}
                  />
                </Tooltip>
                <Tooltip title="Quick data review">
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => quickViewHandler(r)}
                  />
                </Tooltip>
                {r.status === 'COMPLETED' && r.hasAttachment && (
                  <PaperClipOutlined
                    style={{ color: `${r.hasErrorAttachment === false ? '#A0A0A0' : 'red'}` }}
                  />
                )}
              </Space>
            ),
          },
          {
            title: 'Schedule Date',
            width: 130,
            render: (_, r) => <a onClick={() => onDetail?.(r)}>{formatDate(r.scheduleDate)}</a>,
            sorter: 'scheduleDate',
          },
          {
            title: 'Salesperson',
            render: (_, r) => r.salesperson.name,
            width: 150,
            // [r.salesperson?.code, r.salesperson.name].filter((it) => it).join(' - '),
            sorter: 'salespersonName',
          },
          {
            title: 'Cust. Code',
            render: (_, r) => (
              <a
                onClick={() => {
                  history.push(CrmPaths.customer + `/detail/${r.customer.id}`);
                }}
              >
                {r.customer.code}
              </a>
            ),
            width: 110,
            // [r.customer.code, r.customer.name].filter((it) => it).join(' - ')
            sorter: 'customerCode',
          },
          { title: 'Address', render: (_, r) => r.address.name },
          {
            title: 'Type',
            width: 60,
            render: (_, r) => {
              // let color = r.scheduleType === 'Planned' ? 'green' : 'volcano';
              return <Tag color="warning">{r.scheduleType}</Tag>;
            },
          },
          {
            title: 'Created By',
            width: 120,
            dataIndex: 'createdBy',
            sorter: 'createdBy',
          },
          {
            title: 'Created Date',
            render: (_, r) => formatDateTime(r.createdDate),
            width: 150,
            sorter: 'createdDate',
          },
          {
            title: 'Completed Date',
            render: (_, r) => formatDateTime(r.completedDate),
            width: 150,
            hideInTable: advanceSearchParams.status === 'PENDING',
            sorter: 'completedDate',
          },
          {
            title: 'Verified',
            render: (_, r) => (
              <Space>
                {r.contractChecked && (
                  <Tag icon={<CheckCircleOutlined />} color="#2db7f5">
                    {'Contract'}
                  </Tag>
                )}
                {r.posmChecked && (
                  <Tag icon={<CheckCircleOutlined />} color="#87d068">
                    {'POSM'}
                  </Tag>
                )}
              </Space>
            ),
          },
          // {
          //   title: 'Status',
          //   width: 110,
          //   hideInTable: advanceSearchParams.status != 'COMPLETED',
          //   render: (_, r) => <Status text={r.status}/>,
          // },
        ]}
      />

      <CalenderView
        modalProps={{
          open: modals.isVisible('calender-view'),
          onCancel: () => modals.hideModal('calender-view'),
        }}
        data={{
          scheduleList: state.data?.scheduleList || [],
        }}
        actionHandlers={{
          loadData: actions.loadByDate,
        }}
      />

      <GenerateScheduleModal
        seList={state.initData?.seList || []}
        open={modals.isVisible('generate-schedule')}
        onCancel={() => modals.hideModal('generate-schedule')}
        actionHandlers={{
          onSubmit: (mothCreated, effectiveDate, salespersonId, overwritePending, remarks) => {
            Modal.confirm({
              title: 'Generate Visit Schedule',
              content: 'Are you sure?',
              onOk: async () => {
                const rs = await actions.createSchedule(
                  mothCreated,
                  effectiveDate,
                  salespersonId,
                  overwritePending,
                  remarks,
                );
                modals.hideModal('generate-schedule');
                if (rs.data === 0) {
                  message.warning('No schedule has been generated.');
                } else message.success(`${rs.data} schedules have been generated sucessfully.`);
              },
            });
          },
        }}
      />

      <AdvanceSearch
        width="600px"
        placement="right"
        initData={advanceSearchParams}
        // closable
        title="Advance Search"
        open={modals.isVisible('advanceSearch')}
        onClose={() => modals.hideModal('advanceSearch')}
        seList={state.initData?.seList || []}
        contractTypes={lookupData?.contractTypes || []}
        lookupList={lookupData?.lookupList || []}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({
            ...v,
            ...data,
          }));
          actionRef.current?.reloadAndRest?.();
        }}
        onReset={() => {
          setAdvanceSearchParams((v) => ({ status: v.status }));
          actionRef.current?.reloadAndRest?.();
        }}
      />
      {modals.isVisible('quick-view') && (
        <QuickView
          title="Vsisit Schedule Detail"
          open={modals.isVisible('quick-view')}
          submitter={false}
          detail={state.data?.detail}
          onRefresh={async () => {
            await actions.detail(state.data?.detail?.id || 0);
          }}
          onOpenChange={(v) => !v && modals.hideModal('quick-view')}
        />
      )}
    </Spin>
  );
};

export default VisitScheduleListView;
