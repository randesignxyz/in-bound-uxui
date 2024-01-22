import {
  ActionType,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { FolderServiceAPI } from './service';
import { simpleRequestActions } from '@/services/model';
import FolderEntryForm from './EntryForm';
import { MailOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { DMSPaths } from '..';;
import { useParams } from '@umijs/max';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { FolderCreate, FolderDTO } from './data';

interface Props {
  key?: string;

}

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export type TableListItem = {
  key: number;
  name: string;
  createdAt: number;
  progress: number;
};
const tableListDataSource: TableListItem[] = [];

for (let i = 0; i < 2; i += 1) {
  tableListDataSource.push({
    key: i,
    name: `TradeCode ${i}`,
    createdAt: Date.now() - Math.floor(Math.random() * 2000),
    progress: Math.ceil(Math.random() * 100) + 1,
  });
}

const columns: ProColumns<TableListItem>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'index',
    width: 80,
  },
  {
    title: '更新时间',
    key: 'since2',
    dataIndex: 'createdAt',
    valueType: 'date',
  },
  {
    title: '执行进度',
    dataIndex: 'progress',
    valueType: 'progress',
  },
];

export default ({ key }: Props) => {
  const requestAction = simpleRequestActions();
  const actionRef = useRef<ActionType>();


  const [routePath, setRoutePath] = useState<RouteParam[]>([{
    key: 0,
    label: "HOME",
    path: `${DMSPaths.setting}/folder`
  }]);


  const [state, setState] = useState<{
    visible?: {
      name: "modal"
      type: "ADD" | "EDIT";
      payload?: { record: FolderCreate }
    }
  }>();
  const service = FolderServiceAPI(requestAction);

  const [folderList, setFolderList] = useState<FolderDTO[]>([]);

  const onFolderResquest = async(params?:{parentId:number})=>{
    const data = await service.page({
      criteria:{
        advanceSearch:{parentId:params?.parentId},
        searchValue:""
      }
    });

    setFolderList(data.items);
  }

  const [childFolderList, setChildFolderList] = useState<FolderDTO[]>([]);
  const onChildLoad = async(params?:{parentId:number})=>{
    const data = await service.page({
      criteria:{
        advanceSearch:{parentId:params?.parentId},
        searchValue:""
      }
    });

    setChildFolderList(data.items);
  }


  useEffect(()=>{
    onFolderResquest();
  },[]);


  
  return (
    <div
    >

      <BreadCrumbCom
        routes={routePath}
        separator='/'
      />


        <Menu
              style={{ width: 256 }}
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              
              items={
                folderList?.map(it=>({
                  key:it.id, 
                  label:it.name,
                  onTitleClick:(e)=>{
                    onChildLoad({parentId:parseInt(e.key)})
                  },
                  children:it.totalFolder<0?[]:childFolderList.map(itr=>({key:itr.id, label:itr.name}))
                }))
              }
       
            />
      <ProTable<TableListItem>
        columns={columns}
        rowKey="key"
        pagination={{
          showSizeChanger: true,
        }}
        tableRender={(_, dom) => (
          <div
            style={{
              display: 'flex',
              width: '100%',
            }}
          >
            <Menu
              style={{ width: 256 }}
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              
              items={[
                {
                  key: 'sub1',
                  label: (
                    <span>
                      <MailOutlined />
                      <span>Navigation One</span>
                    </span>
                  ),
                  onTitleClick:(e)=>{
                    console.log(e);
                    
                  },
                  onClick:()=>{console.log("ASasa");
                  },
                  children: [
                    {
                      key: 'g1',
                      label: 'Item 1',
                      children: [
                        {
                          key: '1',
                          label: 'Option 1',
                          onClick:()=>{console.log("ASas");
                          }
                        },
                        {
                          key: '2',
                          label: 'Option 2',
                        },
                      ],
                    },
                    {
                      type: 'group',
                      key: 'g2',
                      label: 'Item 2',
                      children: [
                        {
                          key: '3',
                          label: 'Option 3',
                        },
                        {
                          key: '4',
                          label: 'Option 4',
                        },
                      ],
                    },
                  ],
                },
              ]}
            />
            <div
              style={{
                flex: 1,
              }}
            >
              {dom}
            </div>
          </div>
        )}
   
        params={{
          key,
        }}
        request={async () => {
          await waitTime(200);
          return {
            success: true,
            data: tableListDataSource,
          };
        }}
        dateFormatter="string"
        headerTitle="自定义表格主体"
      />




      <FolderEntryForm
        open={state?.visible?.name == "modal"}
        onSave={async (data: FolderCreate) => {
          await service.save(data)
          actionRef.current?.reloadAndRest?.();
        }}
        onCancel={() => setState((v) => ({ ...v, visible: undefined }))}

      />
    </div>
  );
}