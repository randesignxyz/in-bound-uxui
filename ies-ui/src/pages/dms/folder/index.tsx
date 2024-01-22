
import {
  ActionType,
} from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { FolderServiceAPI } from './service';
import { simpleRequestActions } from '@/services/model';
import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { DMSPaths } from '..';
import EntryForm from '../documentation/EntryForm';
import DetailView from './DetailView';

export default () => {

  const requestAction = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [ListType, setListType] = useState({
    gutter: 16, column: 3
  });
  const [viewState, setViewState] = useState<{ type: "GRID" | "DETAIL" | "LIST" }>();

  const [state, setState] = useState<{
    visible?: {
      name: "modal"
      type: "ADD" | "EDIT";
      payload?: { record: FolderCreate }
    }
  }>();
  const service = FolderServiceAPI(requestAction);

  return (
    <CrudWrapper baseURL={DMSPaths.document}>
      {(view, id, navigate) => {
        return (
          view == 'detail' && (
            <DetailView id={parseInt(`${id}`)} />
            // <ListView
            //   onAdd={() => navigate?.goToCreate?.()}
            //   onDetail={(id) => {
            //     navigate?.goToDetail?.({ id: id });
            //   }}
            //   onEdit={(id) => {
            //     navigate?.gotoEdit?.({ id: id });
            //   }}
            // />

          ) ||
          view == 'create' && (
            <EntryForm
              type='ADD'
            />
          )
        );
      }}
    </CrudWrapper>
  );
  //     return (
  //       <
  //       <div
  //       >

  //       <

  // {/*        
  //         <ProList<FolderDTO>
  //           ghost={true}
  //           itemCardProps={{
  //                 ghost:true,

  //           }}
  //           pagination={{
  //             defaultPageSize: 2,
  //             showSizeChanger: false,
  //           }}
  //           actionRef={actionRef}
  //           showActions="hover"
  //           rowSelection={{
  //             alwaysShowAlert:false,
  //             onSelect:(_,r)=><DetailView/>

  //           }}

  //           grid={ListType}

  //           metas={{
  //             title: {
  //                 dataIndex:"name",
  //             },
  //             subTitle: {
  //                 dataIndex:"description"
  //             },
  //             type: {},
  //             avatar: {
  //                 render:(_,r)=><img src={Cabinets} />
  //             },
  //             content: {},

  //           }}
  //           request={async()=>{
  //             const data = await service.page({
  //                 criteria:{searchValue:""}
  //             });

  //             return Promise.resolve({
  //                 data:data.items,
  //                 success:true
  //             })
  //           }}
  //         />

  //         <ParcelEntryForm
  //             open ={state?.visible?.name=="modal"}
  //             onSave={async (data:FolderCreate)=>{
  //                 await service.save(data)
  //                 actionRef.current?.reloadAndRest?.();
  //             }}
  //             onCancel={()=>setState((v)=>({...v, visible:undefined}))}

  //         /> */}
  //       </div>
  //     );
};
