import { NewStaffListItem } from '@/pages/fma/new-staff/data.types';
import Form from '@/pages/process-flow/form';
import { FileOutlined} from '@ant-design/icons';
import { TabPaneProps, Tabs } from 'antd';

interface Props {
    item: NewStaffListItem | undefined
}
interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: React.ReactNode;
}
export default ({item}:Props) => {
    const tabList:Tab[] =[
        { key: 'dataFormFMA', icon: <FileOutlined />, tabKey: 'dataFormFMA', label: 'FMA - Support Request', children:  <Form openInTab formKey="fma_new_staff_request" id={item?.processInstId}/> },
        { key: 'dataFormICT', icon: <FileOutlined />, tabKey: 'dataFormICT', label: 'ICT - Support Request', children:  <Form openInTab formKey="fma_new_staff_request" id={item?.processInstId}/> },
    ]
    return(<>
         <Tabs items={tabList} />
    </>)
}