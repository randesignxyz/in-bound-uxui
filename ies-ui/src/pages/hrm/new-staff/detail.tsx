import { NewStaffListItem } from '@/pages/fma/new-staff/data.types';
import { ITNewStaffFormNames } from '@/pages/ict/new-staff/data.types';
import Form from '@/pages/process-flow/form';
import { FileOutlined} from '@ant-design/icons';
import { TabPaneProps, Tabs } from 'antd';
import { it } from 'node:test';

interface Props {
    item: NewStaffListItem | undefined
}
interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: React.ReactNode;
}
export default ({item}:Props) => {
    const tabList:Tab[] =[
        { key: 'dataFormFMA', icon: <FileOutlined />, tabKey: 'dataFormFMA', label: `FMA - ${item?.formNo}` , children:  <Form openInTab formKey="fma_new_staff_request" id={item?.processInstId}/> },
        { key: 'dataFormICT', icon: <FileOutlined />, tabKey: 'dataFormICT', label: `ICT - ${item?.ref}`, children:  <Form openInTab formKey={ITNewStaffFormNames.processDefKey} id={item?.ictProcessInstId}/> },
    ]
    return(<>
         <Tabs items={tabList} />
    </>)
}