import { CrmPaths } from '@/pages/crm';
import { AddressInfo, AddresssView, BasicData, SettlementPlan } from '@/services/crm/data';
import { useState } from 'react';
import { Button, Card, message, Modal, Space, Spin, Tabs, Typography } from 'antd';
import { useEffect } from 'react';
import { model } from '../../model';
import CustomerVisitListView from '../CustomerVisitListView';
import SaleInfoView from '../SaleInfoView';
import { history, useAccess } from "@umijs/max";
import { ForcastingDetailView } from '../forcasting/ForcastingDetailView';
import ProTable from '@ant-design/pro-table';
import VisitScheduleChangeStatusModal from '../VisitScheduleChangeStatusModal';
import {  encryptToBase64, formatDate, formatMonth } from '@/pages/utils';
import { ProcessFlowModalWrapper } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import { CustomerContractForm } from '@/pages/crm/contract/process-flow';
import AttachmentList from '@/components/Attachment/AttachmentList';
import ContractListView from './ContractListView';
import AddressListView from '../address/AddressListView';
import { ForcastingModalEntry } from '../forcasting/ForcastingModalEntry';
import ContactListView from '../contact/ContactListView';
import BasicInfoView from '../basic/BasicInfoView';
import VisitPlan from '../visit-plan';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import SupplySource from '../SupplySource';
import ActivityLog from '@/components/ActivityLog';
import PosmView from '@/pages/crm/components/PosmView';
import { simpleRequestActions } from '@/services/model';
import { CustomerServices } from '../../services';
import ActionBar from '@/components/ActionBar';
import { CustomerActionController } from '../..';
import POSMDisplayList from '../POSMListDisplay';
import SpaceReservedView from '@/pages/crm/contract/space-reserve/DetailView';
import { LinkOutlined } from '@ant-design/icons';

interface Props {
  id?: number;
  openInTab?: true;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const CustomerDetailView: React.FC<Props & CustomerActionController> = ({ openInTab, getMenuItems, id, actionHandlers, }) => {
  const { state, ops, actions, modals } = model(id);
  const [selectedSchedule, setSelectedSchedule] = useState<{ id: number }>();
  const [addressList, setAddressList] = useState<AddresssView[]>()
  const access = useAccess();
  const requestActions = simpleRequestActions()

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (!id) return;
    try {
      ops.initData('Detail');
      ops.detail(id);
      actions.listVisitScheduleByCustomer(id, 'PENDING');
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data');
    }
  };

  const onSaveBasicHandler = (data: BasicData) => {
    Modal.confirm({
      title: 'Edit Customer Information',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await actions.saveData(data);
          modals.hideModal('editBasicInfo');
          ops.detail(id)
        } catch (error: any) {
          message.error(error?.message || 'Failed to save.')
        }
        ;
      },
    });
  };

  const onSaveAddressHandler = (
    data: AddresssView,
    isNew: boolean = true,
    cb?: (sucess: boolean) => void,
  ) => {
    Modal.confirm({
      title: isNew ? 'Add Address' : 'Edit Address',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await ops.saveAddressData?.(data);
          cb?.(true);
          message.success('Saved successfully.');
        } catch (error) {
          cb?.(false);
          message.error('Failed to save');
        }
      },
    });
  };

  const onRemoveAddressHandler = (data: AddresssView) => {
    Modal.confirm({
      title: 'Delete Address',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await ops.removeAddress?.(data);
          message.success('Deleted successfully.');
        } catch (error) {
          message.error('Failed to delete.');
        }
      },
    });
  };

  const content = <Spin spinning={state.loading}>
    <BasicInfoView
      data={state.data?.detail}
      editProps={{
        layoutConfig: {
          supplySource:
            state.data?.detail?.type?.id == 102 &&
            !!state.data.detail.addressList.find((it) => it.province?.id !== 12),
        },
        init: {
          outletTypeList: state.initData?.outletTypeList,
          seList: state.initData?.seList,
          lookupDataList: state.initData?.lookupDataList,
          supplySourceList: state.initData?.supplySources,
        },
        actionHandlers: {
          onSave: onSaveBasicHandler,
        },
        open: modals.isVisible('editBasicInfo'),
        onCancel: () => modals.hideModal('editBasicInfo'),
      }}
    />

    <Card size="small" style={{ marginTop: '5px' }}>
      <Tabs>
        <Tabs.TabPane key="sale" tab="Sale Info">
          <SaleInfoView data={state.data?.detail?.saleInfo} />
        </Tabs.TabPane>
        <Tabs.TabPane key={"posm"} tab="POSM">
          {/* <POSMDisplayList
            customerId={state.data?.detail?.id || 0}
          /> */}
          {/* <PosmView addresList={addressList || []} requestActions={requestActions}
            // readOnly
            initAddressList={async () => { } }
            onDelete={async () => { } } 
              //   id: it.id,
              //   itemId: it.item.id,
              //   qty: it.qty,
              //   remarks: it.remarks
              // }))} 
            // onSave={function (itemId: number, qty: number, id?: number, remarks?: string): Promise<{ data: number; }> {
            //   throw new Error('Function not implemented.');
            // } }            // initAddressList={async () => {
            //   if (addressList != null) {
            //     return;
            //   }
            //   const rs = await ops.listAddressDetailByCustomerId({ id: state.data?.detail?.id || 0 })
            //   setAddressList(rs)
            // }}
            listPosm={() => Promise.resolve(state.data?.detail?.posmItems?.map(it => ({...it,  })) || [])}

            onSave={(data:any) => {
              if (!state.data?.detail?.id) {
                throw Error("fetch to detect customer.")
              }
              const entry = {
                ...data,
                customerId:id
              } 
              return CustomerServices.customerPOSMContract(entry)(requestActions)
              
              // return CustomerServices.saveCustomerPOSM({
              //   id: id,
              //   itemId: itemId,
              //   qty: qty,
              //   remarks: remarks,
              //   customerId: state.data?.detail?.id || 0
              // })(requestActions)
            }}
            // onDelete={(id) => CustomerServices.deleteCustomerPosm(id)(requestActions)}
          /> */}
          <PosmView requestActions={requestActions}
            listPosm={() => {
              const data =Promise.resolve(
                state.data?.detail?.posmItems?.map(it => ({
                  key:"",
                id: it.id,
                categoryId:0,
                itemId: it.item.id,
                qty: it.qty,
                effectiveDate:it?.effectiveDate,
                installedDate:it?.installedDate,
                expiryDate:it?.expiryDate,
                remarks: it.remarks
              })) || [])
              return data
            }}
            onSave={(data:any) => {
              return CustomerServices.saveCustomerPOSM({
                ...data,
                id: data.id,
                customerId: state.data?.detail?.id || 0
              })(requestActions)
            }}
            onDelete={(id) => CustomerServices.deleteCustomerPosm(id)(requestActions)}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="space" tab="Space Reserve">
          {state.data?.detail?.contracts?.map(p => {
            return <SpaceReservedView contractCode={p.contractNo} address={state.data?.detail?.addressList as AddressInfo[]} contractId={p.id} source='CUSTOMER' />
          })}
        </Tabs.TabPane>
        {state.data?.detail?.id && <Tabs.TabPane key="supplySource" tab="Supply Source">
          <SupplySource customerId={state.data?.detail?.id} />
        </Tabs.TabPane>}
        {state.data?.visitSchedule && (
          <Tabs.TabPane key="visit-schedule" tab="Visit Schedule">
            <CustomerVisitListView
              data={state.data?.visitSchedule}
              onCancel={(data) => {
                setSelectedSchedule({ id: data.id });
                modals.showModal('scheduleStatus');
              }}
              fetchData={(status) =>
                actions.listVisitScheduleByCustomer(state.data?.detail?.id || 0, status)
              }
            />
          </Tabs.TabPane>
        )}
        <Tabs.TabPane key="address" tab="Address">
          <AddressListView
            addressReadonly={state.data?.detail?.source == 'SAP' || !access.saleAdmin}
            data={{
              list: addressList || [],
              init: {
                lookupDataList: state.initData?.lookupDataList,
                provinceList: state.initData?.provinceList,
              },
              locations: { ...state.data?.locations },
            }}
            actionHandlers={{
              loadData: async () => {
                const rs = await ops.listAddressDetailByCustomerId({ id: state.data?.detail?.id || 0 })
                setAddressList(rs)
                return rs
              },
              onAdd: (data, cb) => onSaveAddressHandler(data, true, cb),
              onEdit: (data, cb) => onSaveAddressHandler(data, false, cb),
              onRemove: onRemoveAddressHandler,
              onCleaLocation: actions.clearLocations,
              onLoadLocations: ops.loadLocations,
              onLoadMultiLocations: ops.loadMultiLocations,
            }} />
        </Tabs.TabPane>

        <Tabs.TabPane key={'visitPlan'} tab="Visit Plan">
          <VisitPlan
            lookupDataList={state.initData?.lookupDataList || []}
            list={() => ops.listVisitPlanByCustomerId({ id: id || 0 })}
            onLoadAddressList={() =>
              ops.listAddresssByCustomerId({ id: state.data?.detail?.id || 0 })
            }
            customerId={id || 0}
          />
        </Tabs.TabPane>

        <Tabs.TabPane key={'Contacts'} tab="Contacts">
          <ContactListView
            customerId={id}
            reloadParent={() => ops.detail(id)}
            data={state.data?.detail?.contacts}
            onDetail={(data) => history.push(`${CrmPaths.contact}/detail/${data.id}`)}
          />
        </Tabs.TabPane>

        {state.data?.detail?.purchaseEstList && state.data?.detail?.purchaseEstList.length > 0 && (
          <Tabs.TabPane key="est" tab="Average Purchase">
            <ForcastingDetailView
              data={state.data?.detail?.purchaseEstList}
              itemList={state.initData?.itemList}
            />
          </Tabs.TabPane>
        )}

        {state.data?.detail?.contracts && state.data.detail.contracts.length > 0 && (
          <Tabs.TabPane key={'Contracts'} tab="Contracts">
            <ContractListView data={state.data?.detail?.contracts} />
          </Tabs.TabPane>
        )}

        {state.data?.detail?.settlementList && state.data?.detail?.settlementList.length && (
          <Tabs.TabPane key="settlementPlan" tab="Settlement Plan">
            <ProTable<SettlementPlan>
              bordered
              size="small"
              options={{
                density: false,
                setting: false,
                reload: false,
                fullScreen: false,
              }}
              search={false}
              rowKey="id"
              dataSource={state.data?.detail?.settlementList || []}
              columns={[
                { title: 'Contract No', render: (_, r) => r.contract.name },
                {
                  title: 'Schedule Date',
                  align: 'right',
                  width: '200',
                  render: (_, rd) => formatMonth(rd.scheduledDate),
                },
                {
                  title: 'Settled On',
                  align: 'right',
                  width: '200',
                  render: (_, rd) => formatDate(rd.settledDate) || 'Planned',
                },
                {
                  title: 'Sponsored Item',
                  align: 'left',
                  render: (_, rd) =>
                    rd.itemList?.map((it) => `${it.item.name}:  ${it.qty}`).join(','),
                },
                { title: 'Total', align: 'right', width: '150', dataIndex: 'total' },
                {
                  title: 'Comment',
                  render: (_, rd) =>
                    [rd.comment, rd.commentInternal].filter((it) => it).join('/'),
                },
              ]}
            />
          </Tabs.TabPane>
        )}
        {state.data?.detail?.attachmentFileIds &&
          state.data?.detail?.attachmentFileIds.length > 0 && (
            <Tabs.TabPane key="attachment" tab="Attached Files">
              <AttachmentList
                fileIds={state.data?.detail?.attachmentFileIds}
                attachmentFiles={[]}
              />
            </Tabs.TabPane>
          )}
        {state.data?.detail && <Tabs.TabPane key="log" tab="Activity Log">
          <ActivityLog objectName='CUSTOMER' objectId={state.data?.detail.id} endpoint='CRM' />
        </Tabs.TabPane>}
      </Tabs>
    </Card>

    <ProcessFlowModalWrapper
      type="action"
      action="Start"
      loading={false}
      formKey={CustomerContractForm.startWithPayload}
      payload={{ from: 'Customer', id: id }}
      visible={modals.isVisible('requestContract')}
      actionHandlers={{
        onCancel: (reloadRequired) => {
          modals.hideModal('requestContract');
          reloadRequired && ops.detail(id);
        },
      }}
    />

    <ForcastingModalEntry
      data={{
        domain: state.data?.detail?.purchaseEstList,
        itemList: state.initData?.itemList,
      }}
      open={modals.isVisible('purchaseEst')}
      onCancel={() => modals.hideModal('purchaseEst')}
      actionHandlers={{
        onDirectSave: (data) => actions.saveForcasting(data, true),
      }}
    />

    <VisitScheduleChangeStatusModal
      open={modals.isVisible('scheduleStatus')}
      onCancel={() => modals.hideModal('scheduleStatus')}
      onSubmit={(remarks) => {
        Modal.confirm({
          title: 'Schedule Cancellation',
          content: 'Are you sure?',
          onOk: async () => {
            try {
              selectedSchedule && (await ops.cancelVisitSchedule(selectedSchedule.id, remarks));
              await ops.detail(id);
              modals.hideModal('scheduleStatus');
              message.success('Visit schedule is cancelled successfully.');
            } catch (error) {
              message.error('Failed to cancel.');
            }
          },
        });
      }}
    />

  </Spin>


  return openInTab ? <ProCard title={<Space># <Typography.Text strong copyable >{state.data?.detail?.code}</Typography.Text>
  
    <Button icon={<LinkOutlined/>} type='link' onClick={()=>{ 
      const encrypted = encryptToBase64(state.data?.detail?.code || "n/a");
      
      window.open(`http://10.0.13.247:3301/customer-view/${encrypted}`, '_blank');
      navigator.clipboard?.writeText(`http://10.0.13.247:3301/customer-view/${encrypted}`)
  
      .then(() => {
        window.open(`http://10.0.13.247:3301/customer-view/${encrypted}`, '_blank');
      })
      .catch((err) => {
      }); 
      }} />
  </Space>}
    extra={<ActionBar actions={state.data?.detail && getMenuItems(state.data?.detail, 'Detail', () => {
      ops.detail(state.data?.detail?.id)
    }).filter(it => it.visible) || []} numOfActionOnBar={4} />
    }>
    {content}
  </ProCard> : (

    <PageContainer
      // breadcrumb={undefined}
      title="Customer #"
      subTitle={state.data?.detail?.code}
      breadcrumbRender={openInTab ? false : undefined}
      // onBack={actionHandlers?.onBack}
      extra={<ActionBar actions={state.data?.detail && getMenuItems(state.data?.detail, 'Detail', () => {
        ops.detail(state.data?.detail?.id)
      }).filter(it => it.visible) || []} numOfActionOnBar={4} />
      }
    >
      {content}

    </PageContainer>
  );
};

export default CustomerDetailView;
