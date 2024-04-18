// // export default () => {
// //   return <div>inventory transfer</div>;
// // };

// import CrudWrapper from "@/components/DataCrud/CrudWrapper"
// import { ProdPaths } from "..";
// import ListView from "./Listview";
// import {Typography } from 'antd';
// import EntryForm from "./EntryForm";
// import DetailView from "./DetailView";

// export default () => {
//     const { Text } = Typography;
//     return(
//         <>
//     <CrudWrapper baseURL={ProdPaths.inventoryTransfer} >
//         {(view, id, navigate) => {
//            return (
//             (view == 'list' && (
//                 <ListView
//                        onAdd={() => navigate?.goToCreate?.()}
//                        onDetail={(id) => {
//                            navigate?.goToDetail?.({ id: id });

//                        } }
//                        onEdit={(id) => {
//                            navigate?.gotoEdit?.({ id: id });
//                        } }               />
//             ))
//             // ||
//             // (view === 'create' && <EntryForm  />)

//             ||(view ==="detail" && <DetailView id={id as string} /> )
//         )
//         }}
//     </CrudWrapper>
//     </>
//     )
// }

import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';
export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.transferRequest}>
      {(view) => {
        return view === 'list' && <ListView />;
      }}
    </CrudWrapper>
  );
};
