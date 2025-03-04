import { Space, Spin, message, Button } from 'antd';
import { useEffect, useState } from 'react';
import { EditFilled, StopOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { simpleRequestActions } from '@/services/model';
import { useSafeState } from 'ahooks';
import { ContractServices } from '../../services';
import { ContractViewData } from '../../types';
import { formatDate } from '@/pages/utils';
import Term from './Term';
import PosmView from '@/pages/crm/components/PosmView';
import ActivityLog from '@/components/ActivityLog';
import { useAccess } from '@umijs/max';
import RemarkModalV2 from '@/components/remark-modal-v2';
import Address from './Address';
import { AddressInfo } from '@/services/crm/data';
import Status from '@/components/Status';
import SpaceReservedView from '../../space-reserve/DetailView';
import moment from 'moment';

const ContactDetailView: React.FC<{
  id: number,
  openInTab?: boolean;
  onRefresh?: () => void,
  onEdit: (id: number, cb?: () => void) => void
}> = ({ id, openInTab, onEdit }) => {
  const requestActions = simpleRequestActions()
  const [data, setData] = useSafeState<ContractViewData>()
  const access = useAccess()
  const [forceUpdate, setForceUpdate] = useState(0)
  const [addressList, setAddressList] = useState<AddressInfo[]>([])

  useEffect(() => {
    try {
      loadData()
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  }, []);

  const loadData = async () => {
    const rs = await ContractServices.detail(id).query(requestActions)
    setData(rs)
    const addresList = await ContractServices.listAvailableAddressByContractId(rs.id).query(requestActions)
    setAddressList(addresList)
  }

  const [activeTab, setActiveTab] = useState<string>('term')
  const onApplyLocation = async (ids: number[]) => {
    try {
      if (!!data) {
        await ContractServices.applyLocationToContract(data?.id, ids)(requestActions)
        setData({ ...data, customerAddressList: ids })
      }
      return true
    } catch (error: any) {
      message.error(error.message || "Failed to save.")
      return false
    }
  }

  return (
    <Spin spinning={requestActions.request?.loading || false}>
      <PageContainer
        breadcrumb={undefined}
        title={
          <Space>
            <div>{`Contract #`}</div>
          </Space>
        }

        subTitle={data?.contractNo || 'n/a'}
        extra={access.crmAdmin && <Space>
          {data?.status != "TERMINATED" && <Button type='link' onClick={() => {
            data && onEdit(data.id, () => {
              loadData()
            })
          }} icon={<EditFilled />} >Edit</Button>
          }
          {data?.status != "TERMINATED" && data && <RemarkModalV2<ContractViewData> required confirm title='Terminate Contracdt'
            trigger={<Button danger type='link' icon={<StopOutlined />}>Termimate</Button>} item={data} onSave={async (item, remarks) => {
              try {
                await ContractServices.terminateContract(item.id, remarks!!)(requestActions)
                loadData()
                return true
              } catch (error: any) {
                message.error(error.message || 'Failed to terminate.')
              }

              return false
            }} />}
        </Space>
        }
        content={<ProCard>
          {data && <ProDescriptions dataSource={data} columns={[
            { label: "Status", render: (_, r) => <Status text={r.status} />, },
            { label: "Contract Type", render: (_, r) => r.contractType.name },
            { label: "Brand", render: (_, r) => r.brand.name },
            { label: "Budget Code", render: (_, r) => r.budgetCode },
            { label: "Customer No", render: (_, r) => r.customer.code },
            { label: "Customer Name", render: (_, r) => r.customer.name },
            { label: "Contract Date", render: (_, r) => formatDate(r.contractDate) },
            { label: "Effective Date", render: (_, r) => formatDate(r.effectiveDate) },
            { label: "Expired Date", render: (_, r) => formatDate(r.expireDate) },
            // { label: "Terms", render: (_, r) => r.terms?.description },
            { label: "Remarks", render: (_, r) => r.remarks },
          ]} />}
        </ProCard>}
        tabList={[
          { tab: "Terms", key: 'term', tabKey: 'term', },
          { tab: "POSM", key: "posm", tabKey: "posm" },
          { tab: "Space Reserved", key: "spaceReserve", tabKey: "spaceReserve" },
          { tab: "Shipping Address", key: "shppingAddress", tabKey: "shppingAddress" },
          { tab: "Activity Log", key: "activityLog", tabKey: "activityLog", }
        ]}
        onTabChange={(key) => {
          setForceUpdate(v => v + 1)
          setActiveTab(key)
        }}
      >

        {(() => {
          if (activeTab == 'term') {
            const term = data?.terms?.name ? (data?.terms?.code + ' - ' + data?.terms?.name) : ''
            return <Term data={{ terms: term }} />
          }
          if (activeTab == "posm") {
            return data?.id && <PosmView requestActions={requestActions} listPosm={() => ContractServices.listContractPOSM(data.id).query(requestActions)}
              onSave={(itemId, qty, id, remarks, installedDate) => ContractServices.savePOSM({
                id: id,
                contractId: data.id,
                itemId: itemId,
                qty: qty,
                remarks: remarks,
                installedDate:installedDate?moment(installedDate):undefined
              })(requestActions)}
              onDelete={(id: number) => ContractServices.deletePOSM(id)(requestActions)}
              addresList={[]}
              initAddressList={async () => { }}
            />
          }

          if (activeTab == "spaceReserve" && data) {
            return <SpaceReservedView
              contractId={data?.id}
              address={addressList} 
              source='CONTRACT'
              />
          }

          if (activeTab == 'shppingAddress' && data) {
            return <Address customerId={data?.customer.id} onApplyLocation={onApplyLocation} addresInfos={addressList} customerAddressList={data?.customerAddressList || []} contractId={data.id} />
          }
          if (activeTab == 'activityLog' && data?.id) {
            return <ActivityLog objectName='CONTRACT' forceUpdate={forceUpdate} objectId={data.id} endpoint='CRM' />
          }
        })()}

      </PageContainer>
    </Spin >
  );
};

export default ContactDetailView;
