// import BaseCrud from '@/components/base-crud';
// import { PlusOutlined } from '@ant-design/icons';
// import { useAccess } from '@umijs/max';
// import { history } from 'umi';
// import {
//   TransferRequestDetail,
//   TransferRequestListItem,
//   TransferRequestSavePayload,
//   TransferRequestSearchParams,
// } from './data';
// import { createTransferRequestService } from './service';

// export default () => {
//   const access = useAccess();
//   const srv = createTransferRequestService();

//   return (
//     <BaseCrud<
//       TransferRequestListItem,
//       TransferRequestDetail,
//       TransferRequestSearchParams,
//       TransferRequestSavePayload
//     >
//       services={srv}
//       title={'Inventory Transfer Request'}
//       listView={{
//         columns: () => [
//           {
//             title: '#',
//             sorter: 'no',
//             render(_, entity) {
//               return (
//                 <a
//                   onClick={() => {
//                     history.push(``);
//                   }}
//                 ></a>
//               );
//             },
//           },
//         ],
//         quickSearch: true,
//         addNewAction: access.canRequestHrStaffProposal
//           ? {
//               label: 'New Request',
//               icon: <PlusOutlined />,
//               key: 'new-request',
//               onRenderComp(props) {
//                 return <div></div>;
//               },
//             }
//           : undefined,

//         statusProps: {
//           defaultValue: 'ALL',
//           options: [
//             { label: 'All', value: 'ALL' },
//             { label: 'Pending', value: 'PENDING' },
//             { label: 'Completed', value: 'COMPLETED' },
//             { label: 'Rejected', value: 'REJECTED' },
//           ],
//         },
//         subStatusProps: undefined,
//         onBeforeSearch: undefined,
//       }}
//     />
//   );
// };

// export default () => {
//   return <div>inventory transfer</div>;
// };

import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '../..';
import ListView from './WarehouseTransferReqListview';

export default () => {
  return (
    <>
      <CrudWrapper baseURL={ProdPaths.inventoryTransfer}>
        {(view, id, navigate) => {
          return (
            view === 'list' && (
              <ListView
                onAdd={() => navigate?.goToCreate?.()}
                onDetail={(id) => {
                  navigate?.goToDetail?.({ id: id });
                }}
                onEdit={(id) => {
                  navigate?.gotoEdit?.({ id: id });
                }}
              />
            )
            // ||
            // (view === 'create' && <EntryForm  />)

            // ||(view ==="detail" && <DetailView id={id as string} /> )
          );
        }}
      </CrudWrapper>
    </>
  );
};
