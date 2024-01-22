import BaseCrud from '@/components/base-crud';
import { PlusOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { history } from 'umi';
import {
  TransferRequestDetail,
  TransferRequestListItem,
  TransferRequestSavePayload,
  TransferRequestSearchParams,
} from './data';
import { createTransferRequestService } from './service';

export default () => {
  const access = useAccess();
  const srv = createTransferRequestService();

  return (
    <BaseCrud<
      TransferRequestListItem,
      TransferRequestDetail,
      TransferRequestSearchParams,
      TransferRequestSavePayload
    >
      services={srv}
      title={'Inventory Transfer Request'}
      listView={{
        columns: () => [
          {
            title: '#',
            sorter: 'no',
            render(_, entity) {
              return (
                <a
                  onClick={() => {
                    history.push(``);
                  }}
                ></a>
              );
            },
          },
        ],
        quickSearch: true,
        addNewAction: access.canRequestHrStaffProposal
          ? {
              label: 'New Request',
              icon: <PlusOutlined />,
              key: 'new-request',
              onRenderComp(props) {
                return <div></div>;
              },
            }
          : undefined,

        statusProps: {
          defaultValue: 'ALL',
          options: [
            { label: 'All', value: 'ALL' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Rejected', value: 'REJECTED' },
          ],
        },
        subStatusProps: undefined,
        onBeforeSearch: undefined,
      }}
    />
  );
};
