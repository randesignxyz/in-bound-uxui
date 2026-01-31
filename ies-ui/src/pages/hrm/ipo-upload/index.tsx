import React, { useRef, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import {
  EmpISOData,
  EmpISOSearchParams,
  ImportDataItems,
} from '@/pages/hrm/ipo-upload/service/data';
import { ImportOutlined, PlusOutlined} from '@ant-design/icons';
import { useQuery } from '@umijs/max';
import { EmpISOServiceAPI } from '@/pages/hrm/ipo-upload/service/EmpISOService';
import { Button, message, Modal } from 'antd';
import ImportFileButton from '@/components/ImportFileButton';
import { DataResponse, ImportDataItem, ImportDataResponse } from '@/services/shared/data';
import UploadData from '@/pages/hrm/ipo-upload/upload-data';
import { ActionType } from '@ant-design/pro-components';
import { EmployeeListItem } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import { simpleRequestActions } from '@/services/model';

const Index = () => {
  const [importData, setImportData] = useState<DataResponse<ImportDataItem>>();
  const services = EmpISOServiceAPI();
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();
  const { data = [], isLoading } = useQuery(
    ['fetch_ios_emp_master_list'],
    () => services.ListAll(),
  );
  const requestActions = simpleRequestActions();
  const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: EmployeeListItem } | { type: 'EDIT'; payload: EmployeeListItem } >();
  const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
  const saveEmployeeIPOHandler = async (data: EmployeeListItem) => {
    Modal.confirm({
      title: 'Save employee profiles',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await EmployeeServices.EmployeeUpdate(data)(requestActions);
          if (modalVisible?.type === 'EDIT') hideModal();
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to save employee profiles.');
        }
      },
    });
  }
  return (
    <>
      <PageWrapper<EmpISOData, EmpISOSearchParams, undefined>
        tabRender={() => [
          {
            action: "add",
            tabIcon: <PlusOutlined />,
            tabLabel: "Add New",
          },

        ]}
      // actions:[
      // {
      //   key:"sas",
      //   title:"Import",
      //   label:"Import",
      //   icon: <ImportOutlined />,
      //   onClick: () => hideModal(),
      // }
      // ],
        listView={{
          type: "Table",
          title: "ISO List",
          props: {
            toolbar:{
              actions: [
                <ImportFileButton<ImportDataItem>
                  importedKey="IMPORT_EMPLOYEE_IPO"
                  onDataResponse={data => {
                    setImportData(data)
                  }}
                  key={"IMPORT_EMP_IOS_LIST"}
                  onHandleChange={(status) => {
                    if (status === 'done') {
                      message.info('Data uploaded.');
                    }
                  }}
                />
              ]
            },
            dataSource: data,
            loading: isLoading,
            rowKey: "employeeId",
            columns: [
              { title: "#", render: (_, __, index) => index + 1 },
              { title: "Employee Id", dataIndex: "empNo" },
              { title: "Employee Name", dataIndex: "empName" },
              { title: "Company", dataIndex: "bu" },
              { title: "Location", dataIndex: "location" },
              { title: "Function", dataIndex: "dept" },
              { title: "Sub Function", dataIndex: "subdept" },
              { title: "Position", dataIndex: "position" },
              { title: "Job Level", dataIndex: "jobLevel" },
              { title: "Appraiser 1", dataIndex: "appraiser1" },
              { title: "Appraiser 2", dataIndex: "appraiser2" },
              { title: "Status", dataIndex: "status" },
            ],
          },
        }}
      />
      {/*<UploadData title="Imported List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />*/}
      <UploadData title="Imported Review List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />
    </>
    );
};

export default Index;
