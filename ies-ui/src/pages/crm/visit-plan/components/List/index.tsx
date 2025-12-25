import TableView from '@/components/DataCrud/TableView';
import { CrmPaths } from '@/pages/crm';
import { Paging } from '@/services/API';
import {
  CustomerAdvanceSearchParams,
  VisitPlanAdvanceSearchParams,
  VisitPlanListItem,
} from '@/services/crm/data';
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { Button, message, Modal, Space, Spin, Tooltip, Upload } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import { Model } from '../../model';
import DeleteVisitPlanModal from '../DeleteVisitPlanModal';
import ExportVisitPlan from '../ExportVisitPlan';
import UploadedVisitPlanModal from '../UploadedVisitPlanModal';
import VisitPlanModal from '../VisitPlanModal';
import AdvanceSearch from './AdvanceSearch';
import ImportFileButton from '@/components/ImportFileButton';
import { ImportedVisitPlan } from '../../data';
import { DataResponse } from '@/services/shared/data';

export interface ListProps { }

// const excelType = [
//   'application/vnd.ms-excel',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// ];
const VisitPlanListView: React.FC<ListProps> = ({ }) => {
  const { state, actions, modals } = Model();
 

  const [importedData, setImportedData] = useState<DataResponse<ImportedVisitPlan>>()
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    actions.initialData();
  }, []);

  const cacheList = useModel('dataList');
  const actionRef = useRef<ActionType>();

  const [advanceSearchParams, setAdvanceSearchParams] = useState<VisitPlanAdvanceSearchParams>();
  const [confirmImportModal, setConfirmImportModal] = useState(false);

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: VisitPlanAdvanceSearchParams },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions
      .loadListItem?.(criteria || { advanceSearch: advanceSearchParams }, pagination, sort)
      .then((it) => {
        return cacheList.cacheDataList({
          type: 'visit-plan',
          criteria: criteria?.advanceSearch || { advanceSearch: advanceSearchParams },
          data: it,
        });
      }) as Promise<Paging<VisitPlanListItem>>;
  };
  const access = useAccess();

  // const importProps = {
  //   name: 'file',
  //   action: `${getServiceUrl('FILE')}/upload`,
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  //   },
  //   beforeUpload: (file: { type: string; name: any }) => {
  //     const isExslFile = excelType.includes(file.type);
  //     if (!isExslFile) {
  //       message.error(`${file.name} is not a excel file`);
  //     }
  //     return isExslFile ? true : Upload.LIST_IGNORE;
  //   },
  //   showUploadList: false,
  //   onChange(info: any) {
  //     if (info.file.status !== 'uploading') {
  //       //console.log(info.file, info.fileList);
  //     }
  //     if (info.file.status === 'done') {
  //       info.fileList = [];
  //       setResponse(info.file.response);
  //     } else if (info.file.status === 'error') {
  //       message.error(`${info.file.name} file upload failed.`);
  //     }
  //   },
  // };

  const onEditActionHandler = (item: VisitPlanListItem) => {
    try {
      modals.showVisitPlanModal(item);
    } catch (error) {
      message.error('Cannot fetch visit plan');
    }
  };

  const onRemoveActionHandler = (item: VisitPlanListItem) => {
    modals.showDeleteVisitPlanModal(item);
  };

  const onExportVisitPlan = () => {
    modals.showModal('export-visit-plan');
  };

  const onSaveHandler = async (
    data: VisitPlanListItem,
    weekOfTheMonths: number[],
    dayOfTheWeeks: number[],
    numDaysBefore?: number,
    remarks?: string,
  ) => {
    Modal.confirm({
      title: 'Save Visit Plan',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          // await actions.saveVisitPlan(data, weekOfTheMonths, dayOfTheWeeks, autoCreateSchedule,numDaysBefore, remarks)
          await actions.saveVisitPlan(
            data.address.id,
            weekOfTheMonths,
            dayOfTheWeeks,
            data,
            numDaysBefore,
            remarks,
          );
          message.success('Saved successfully.');
          modals.hideModal('visitPlan');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to save');
        }
      },
    });
  };

  return (
    <Spin spinning={state.loading || uploading}>
      <TableView<
        VisitPlanListItem,
        { searchValue?: string; advanceSearch?: CustomerAdvanceSearchParams }
      >
        cache
        advanceSearch
        hasCriteria={!!advanceSearchParams}
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          onAdd: () => modals.showModal('attachments'),
          onFirstLoad: () =>
            cacheList.fetchDataList('visit-plan').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<VisitPlanListItem>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              access.canAccessCRMVisitScheduleMngt && (
                <Tooltip placement="top" title="Import">
                  <ImportFileButton<ImportedVisitPlan> importedKey={'VISIT_PLAN'} onDataResponse={(data) => {
                    setImportedData(data)
                    setConfirmImportModal(true)
                  }} onHandleChange={status => {
                    setUploading(status == 'uploading')
                    if (status == 'done') {

                      message.info("Upload completed.")
                    }
                  }} />

                  {/* <Button type="link" icon={<UploadOutlined />}>
                      Import
                    </Button> */}
                </Tooltip>

              ),
              <Tooltip placement="top" title="Export">
                <Button type="link" onClick={onExportVisitPlan} icon={<CloudDownloadOutlined />}>
                  Export
                </Button>
              </Tooltip>,
            ],
          },
        }}
        columns={[
          {
            title: 'Cust. Code',
            width: 110,
            render: (_, r) => (
              <Space>
                <Button
                  type="link"
                  icon={<SelectOutlined />}
                  onClick={async () => {
                    window.open(`/external/crm/customer/detail/${r.customer.id}`, '_blank')?.focus();
                  }}
                />
                <a onClick={() => history.push(CrmPaths.customer + `/detail/${r.customer.id}`)}>
                  {r.customer.code}
                </a>
              </Space>
            ),
            sorter: 'customerCode',
          },
          { title: 'Cust. Name', render: (_, r) => r.customer.name, sorter: 'customerName' },
          {
            title: 'Salesperson',
            width: 200,
            render: (_, r) => r.salePerson.name,
            // [r.salePerson.code, r.salePerson.name].filter((it) => it).join(' - '),
            sorter: 'salespersonName',
          },
          {
            title: 'Address',
            render: (_, r) => r.address.address,
          },
          {
            title: 'Week Of Month',
            width: 120,
            render: (_, r) =>
              r.visits
                .filter((it) => it.type == 'WEEK_OF_MONTH')
                .map((it) => it.name)
                .join(', '),
          },
          {
            title: 'Day Of Week',
            width: 110,
            render: (_, r) =>
              r.visits
                .filter((it) => it.type == 'DAY_OF_WEEK')
                .map((it) => it.name)
                .join(', '),
          },
          // { title: 'Auto Create', render: (_, r) => r.autoCreateSchedule && `Auto Create (${r.numDaysBefore} days)` },
          { title: 'Remarks', dataIndex: 'remarks' },
          {
            title: 'Actions',
            width: 70,
            render: (_, r) => (
              <Space size={0}>
                <Button
                  disabled={!access.canAccessCRMVisitScheduleMngt}
                  type="link"
                  onClick={() => onEditActionHandler(r)}
                  icon={<EditOutlined />}
                />
                <Button
                  disabled={!access.canAccessCRMVisitScheduleMngt}
                  type="link"
                  onClick={() => onRemoveActionHandler(r)}
                  icon={<DeleteOutlined />}
                />
              </Space>
            ),
          },
        ]}
      />
      <VisitPlanModal
        open={state.data?.selectedItem && modals.isVisible('visitPlan')}
        lookupDataList={state.initData?.lookupDataList || []}
        item={state.data?.selectedItem}
        actionHandlers={{
          onSave: onSaveHandler,
        }}
        onCancel={() => {
          modals.hideModal('visitPlan');
        }}
      />

      <UploadedVisitPlanModal
        // salespersons={state.filter?.salesperson || []}
        // customers={state.filter?.customer || []}
        // weeks={state.initData?.lookupDataList?.filter((it) => it.type == 'WEEK_OF_MONTH') || []}
        // dayOfWeeks={state.initData?.lookupDataList?.filter((it) => it.type == 'DAY_OF_WEEK') || []}
        // onLoadData={() => actions.initialModal(response)}
        // disabled={
        //   state.uploadVisitPlanResponse?.isError ||
        //   state.loading ||
        //   (state.data?.uploadedVisitPlan && state.data?.uploadedVisitPlan?.length <= 0)
        // }

        datasources={importedData}
        onCancel={() => {
          setConfirmImportModal(false);
        }}
        open={confirmImportModal}
      />

      <DeleteVisitPlanModal
        onDelete={(data) => {
          Modal.confirm({
            title: 'Remove Visit Plan',
            content: 'Are you sure?',
            onOk: async () => {
              await actions.deleteVisitPlan(data);
              modals.hideModal('delete-visi-plan');
              actionRef.current?.reloadAndRest?.();
            },
          });
        }}
        title={'Delete Visit Plan'}
        onCancel={() => modals.hideModal('delete-visi-plan')}
        open={modals.isVisible('delete-visi-plan')}
      />
      <AdvanceSearch
        title="Advance Customer Search"
        width="400px"
        placement="right"
        initData={advanceSearchParams}
        open={modals.isVisible('advanceSearch')}
        seList={state.initData?.seList}
        // outletTypeList={state.initData?.outletTypeList}
        regionList={state.initData?.regionList}
        provinceList={state.initData?.provinceList}
        onClose={() => {
          modals.hideModal('advanceSearch');
        }}
        onReset={() => {
          setAdvanceSearchParams(undefined);
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams(data);
          actionRef.current?.reloadAndRest?.();
        }}
      />

      <ExportVisitPlan
        title="Export Visit Plan"
        confirmLoading={state.loading}
        salespersonList={state.initData?.seList || []}
        regionList={state.initData?.regionList || []}
        provinceList={state.initData?.provinceList || []}
        open={modals.isVisible('export-visit-plan')}
        onCancel={() => modals.hideModal('export-visit-plan')}
        onExport={async (regionId, provinceId, salespersonId) => {
          try {
            await actions.downloadVisitPlan(regionId, provinceId, salespersonId);
            message.success('Export successfully.');
          } catch (error: any) {
            message.error(error.message || 'Failed to export.');
          }
        }}
      />
    </Spin>
  );
};

export default VisitPlanListView;
