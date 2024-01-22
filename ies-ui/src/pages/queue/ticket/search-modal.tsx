import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';

interface Props extends DrawerFormProps {
  onSeach: (data: AdanceSearch) => Promise<boolean | void>;
}

interface AdanceSearch {
  issuedDate: moment.Moment;
}

const SearchModal: React.FC<Props> = ({ onSeach, ...rest }) => {
  const [form] = useForm<AdanceSearch>();
  return (
    <DrawerForm
      drawerProps={{
        destroyOnClose: true,
      }}
      form={form}
      title="Advance Search"
      submitter={{
        searchConfig: {
          resetText: 'Reset',
          submitText: 'Search',
        },
      }}
      onReset={() => form.resetFields()}
      onFinish={async () => {
        const formData = await form.validateFields();
        return await onSeach(formData);
      }}
      {...rest}
    ></DrawerForm>
  );
};

export default SearchModal;
