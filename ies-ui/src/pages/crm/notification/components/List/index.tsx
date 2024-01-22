import TableView, { TableViewProps } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { Paging } from '@/services/API';
import { NotificationLess } from '@/services/crm/data';
import { SendOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Button, message, Modal, Tooltip } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { useModel } from 'umi';
import { Model } from '../../Model';
import DetailQuickView from '../DetailQickView';
import NotificationEntryModal from '../NotificationEntryModal';

export interface ListProps {
  loading: boolean;
  onDetail?: (data: NotificationLess) => void;
}

export const NotificationListView: React.FC<TableViewProps<NotificationLess>> = ({}) => {
  const { state, actions, modals } = Model();
  const [addModal, setAddModal] = useSetState<{ visible?: boolean }>({});
  //const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');
  const [force, setForce] = useSetState<{ update: number }>({ update: 0 });

  const onRequestHandler = (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions.list(criteria?.searchValue, pagination, sort).then((it: any) => {
      return cacheList.cacheDataList({
        type: 'list-notification',
        criteria: criteria,
        data: it,
      });
    }) as Promise<Paging<NotificationLess>>;
  };

  const onSaveActionHandler = (data: NotificationLess, isSend: boolean) => {
    const msgTitle = `Save ${isSend ? '& Send ' : ''}Notification`;
    const status = isSend ? 'sent' : 'pending';
    Modal.confirm({
      title: msgTitle,
      content: 'Are you sure:',
      onOk: async () => {
        let strMessage = 'Something went worng.';
        try {
          const result = await actions.save({ ...data, isSend, type: '', status });
          console.log(result);
          if (result.message === 'Ok') {
            setAddModal({ visible: false });
            strMessage = `Your notification ${isSend ? 'is sent.' : 'is saved.'}`;
            message.info(strMessage);
            setForce({ update: 1 });
          }
        } catch (e) {
          message.error(strMessage);
        }
      },
    });
  };

  const onSendNotificationHandler = (id: number) => {
    Modal.confirm({
      title: 'Send Notification',
      content: 'Are you sure:',
      onOk: async () => {
        try {
          const result = await actions.sentNotification(id);
          if (result.message === 'Ok' && result.data !== '') message.info(result.data);
          await actions.detail(id);
          setForce({ update: 1 });
        } catch (error) {
          message.error('Something went worng.');
        }
      },
    });
  };

  const onInitializationHandler = () => {};

  return (
    <div>
      <TableView<NotificationLess, { searchValue?: string }>
        cache
        displayOnly={false}
        forceUpdate={force.update}
        actionHandlers={{
          onAdd: () => {
            setAddModal({ visible: true });
          },
          onFirstLoad: () => {
            return cacheList.fetchDataList('list-notification').then((v) => {
              if (v) return v.dataList;
              else return onRequestHandler();
            }) as Promise<Paging<NotificationLess>>;
          },
          onRequest: onRequestHandler,
          onSearchCriteria: (data) => {
            return { searchValue: data };
          },
        }}
        columns={[
          {
            title: 'Subject',
            // dataIndex: 'title',
            render: (_, r) => {
              return (
                <Tooltip placement="top" title="Detail View">
                  <Button
                    type="link"
                    // icon={<EyeOutlined />}
                    title={r.title}
                    onClick={async () => {
                      await actions.detail(r.id);
                      modals.showModal('quick_view');
                    }}
                  >
                    {r.title}
                  </Button>
                </Tooltip>
              );
            },

            // [r.salesperson?.code, r.salesperson.name].filter((it) => it).join(' - '),
            // sorter: 'salespersonName',
          },
          {
            title: 'Message',
            dataIndex: 'body',
          },
          {
            title: 'Status',
            dataIndex: 'status',
          },
          {
            title: 'Created Date',
            render: (_, r) => formatDateTime(r.createdDate),
          },
          {
            title: '',
            render: (_, r) => {
              return (
                <Tooltip placement="top" title="Sent me now">
                  <Button
                    type="link"
                    icon={<SendOutlined />}
                    onClick={() => {
                      onSendNotificationHandler(r.id);
                    }}
                  />
                </Tooltip>
              );
            },
          },
        ]}
      />
      <NotificationEntryModal
        title="Add New Notification"
        open={addModal.visible}
        width={'500px'}
        onCancel={() => setAddModal({ visible: false })}
        lookupDataList={[]}
        actionHandlers={{
          onSave: onSaveActionHandler,
          onLoadInitData: onInitializationHandler,
        }}
      />

      <DetailQuickView
        width="700px"
        placement="right"
        closable
        destroyOnClose
        title="Quick View"
        open={modals.isVisible('quick_view')}
        onClose={() => {
          modals.hideModal('quick_view');
        }}
        notification={state.data?.detail}
        onSentNotification={onSendNotificationHandler}
      />
    </div>
  );
};
