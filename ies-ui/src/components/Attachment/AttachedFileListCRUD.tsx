import { downloadUploadFileV2 } from '@/services/apiGateway';
import { AttachmentFile } from '@/services/data';
import { FileServiceAPI } from '@/services/files/service';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined, PaperClipOutlined, UpCircleFilled } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { Button, Card } from 'antd';
import moment from 'moment';
import {  useRef, useState } from 'react';
import FileUploader, { UploadType } from './FileUploader';
import { ActionType, ProDescriptions } from '@ant-design/pro-components';
import PopconfirmMsg from '../Popconfirm';

export interface Props {
  initFiles?: {fileId: string, activity: string}[];
  onSetFileIds?: (fileIds: string[]) => void;
  onUploadFileId?: (fileId: string) => void;
  onRemoveFileId?: (fileId: string) => void;
  readonly?: true | false;
  removeButton?: true | false;
  removeAbleButtom?:(createdBy:string)=>boolean
}

/**
 * Use Files service instead of Workflow service
 */
export default ({ initFiles, readonly, onUploadFileId, onRemoveFileId, onSetFileIds,removeButton,removeAbleButtom }: Props) => {
 
  const [attachFiles, setAttachFiles] = useState<AttachmentFile[]>([]);
  const [files,setFiles] = useState<string[]>([])
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = FileServiceAPI(requestActions);
  const setUpladFileHandle=(ploadFiles: UploadType[])=>{
    var fileId=''
    if(ploadFiles.filter(it=> (it?.title))?.length>0){
      ploadFiles.filter(it=> (it?.title)).map(i=>{
        setFiles(v=> {
          if(v?.filter(it=> (it === i?.response))?.length===0){
            fileId = i?.response||''
            return [...v,fileId]
          }
         return v
       })
      })
    }
    if(fileId && fileId!=''){
      onUploadFileId?.(fileId)
      actionRef.current?.reload()
    }
    // console.log('ploadFiles',ploadFiles)
    // onSetFileIds?.(files)
   
  }

  return (
    <Card
      title={!readonly && 'Attachment'}
      size="small"
      extra={
        !readonly && (
          <FileUploader required={false} addFileInfo showTitle={false} service="FILE" onSetFiles={f=>setUpladFileHandle?.(f)} showUploadList={false}/>
        )
      }
    >
      <ProList<AttachmentFile>
        actionRef={actionRef}
        request={async (params)=>{
          const rs = await services.list(initFiles?.map(it => it.fileId)||[]);
          setAttachFiles(rs);
          return Promise.resolve({
            data: rs,
            success: true,
          });
        }}
        showActions="hover"
        loading={requestActions.request?.loading}
        // extra={<Button type="link" icon={<UpCircleFilled />} />}
        metas={{
          title: {
            render: (_, r) => (
              <a onClick={() => downloadUploadFileV2()(r.id, r.fileName)}>{r.fileName}</a>
            ),
          },          
          avatar:{render: (_,r) =>  <PaperClipOutlined />  },
          subTitle: {render: (_,r) => moment(r.createdDate).toNow()  },
          description: { render: (_, r) =>  <ProDescriptions>
            {r.title && <ProDescriptions.Item  label = "File Title">{r.title}</ProDescriptions.Item>}
            {r.title && <ProDescriptions.Item  label = "File Description">{r.description}</ProDescriptions.Item>}
            {r.createdBy && <ProDescriptions.Item  label = "Attached By">{r.createdBy}</ProDescriptions.Item>}
          </ProDescriptions> },
          actions: {
            render: (_, r) => {
              var remove = removeAbleButtom?removeAbleButtom?.(r?.createdBy||''): true
              return !readonly && removeButton  && remove &&
              <PopconfirmMsg title={'Are you sure to remove?'} 
                placement= 'leftTop'
                onConfirm={()=> {
                  const items = attachFiles.filter((it) => it.id !== r.id);
                  setAttachFiles(items);
                  onSetFileIds?.(items.map((it) => it.id));
                  onRemoveFileId?.(r.id)
                  actionRef.current?.reload()
                }}
              > 
                <Button type='link' danger icon={<DeleteOutlined/>} size='small'/>              
              </PopconfirmMsg>          
            }   
          },
        }}
      />
    </Card>
  );
};

