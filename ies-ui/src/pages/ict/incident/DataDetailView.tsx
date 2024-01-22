import { IncidentDetailResponse } from '@/services/ict/data';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Spin } from 'antd';
import { useState } from 'react';
import QuickViewDetail from './QuickViewDetail';

interface Props extends DrawerFormProps {
  data?: IncidentDetailResponse;
  reload?: (id: number) => Promise<void>;
  onEdit?: () => void;
  onAdd?: () => void;
  isAnalyst?: boolean;
}

export default ({ data, onEdit, onAdd, reload, isAnalyst, ...rest }: Props) => {
  const [loading] = useState(false);
  
  const currentUserRole = ""
  
  return (
    <DrawerForm
      title={`Incident Ticket ${currentUserRole}`}
      {...rest}
      submitter={false}
      
    >
      <Spin spinning={loading}>
      <QuickViewDetail data={data} />
        
      </Spin>
    </DrawerForm>
  );
};