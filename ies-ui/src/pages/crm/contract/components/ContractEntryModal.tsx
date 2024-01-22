import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ContractData, SubContractType } from '@/services/crm/contract';
import { ContractDetail, CustomerItemLess, IncentiveScheme } from '@/services/crm/data';
import { LookupData, LookupDataItem } from '@/services/data';
import { Form, message, Modal } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';
import { ContactType, LayoutConfig } from '../model';
import ContractEntryWrapper from './ContractEntryWrapper';
import { ModalForm } from '@ant-design/pro-components';

interface Props extends FormModalProps {
  trigger?: JSX.Element,
  data?: ContractDetail;
  initData?: {
    customer?: CustomerItemLess;
    lookupDataList?: LookupData[];
    productList?: LookupDataItem[];
    itemList?: LookupDataItem[];
    shippingChannelList?: LookupDataItem[];
    subContractTypeList?: SubContractType[];
    incentiveSchemeList?: IncentiveScheme[];
  };
  layoutConfig?: LayoutConfig;
  actionHandlers?: {
    applyLayoutConfig?: (contactType: ContactType, incentive?: boolean) => void;
    listSubContract?: (contractId: number) => void;
    enableIncentiveEntry?: (enabled: boolean) => void;
    onSave?: (data: ContractData) => void;
  };
}

const ContractEntryModal: React.FC<Props> = ({
  trigger,
  data,
  initData,
  layoutConfig,
  actionHandlers,
  ...props
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<ContractData>();
  const [forceUpdate, setForceUpdate] = useState<number>(1);
  useEffect(() => {
    if (!props.open) return;
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  return (
    <ModalForm title = {`${data?'Edit contract':'Add contracg' }`} trigger={ trigger}>
        
    </ModalForm>
  );
};

export default ContractEntryModal;
