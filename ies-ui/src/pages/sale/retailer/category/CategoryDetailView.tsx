import DescriptionDisplay from '@/components/Descriptions';
import { formatDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { FooterToolbar, ProForm } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Button, Card, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import CategoryFormModal from './CategoryFormModal';
import type { CategoryCreate, CategoryDto } from './data';
import { CategoryServiceAPI } from './services';

interface Props {
  // onEdit: (id: string) => void;
  // onAdd?: () => void;
  id: string;
  category?: CategoryDto;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = CategoryServiceAPI(requestActions);
  const [category, setCategory] = useState<CategoryDto>();
  const [form] = useForm<CategoryDto>();
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit' };
  }>({});
  const [categoryData, setCategoryData] = useState<CategoryDto>();

  const access = useAccess();

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.category}/list`,
      label: 'Category',
    },
    {
      path: `${RetailerPath.category}/${id}`,
      label: 'Detail',
    },
  ];

  const onAddHandler = async () => {
    setCategoryData(undefined);
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };

  const onSaveActionHandler = (data: CategoryCreate) => {
    Modal.confirm({
      title: `${state.visible?.type === 'ADD' ? 'Save' : 'Update'} Category`,
      content: 'Are you sure?',
      onOk: async () => {
        try {
          (await services.save(data)) as {
            data: string;
            message: string;
          };
          setSate((v) => ({ ...v, visible: undefined }));
          if (state.visible?.type === 'ADD') {
            history.push(`${RetailerPath.category}/list`);
          } else {
            const detail = await services.detailCategory(id);
            setCategory(detail);
          }
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to driver.');
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      if (id) {
        const detail = await services.detailCategory(id);
        setCategory(detail);
      }
    })();
  }, []);

  const displayItems = [
    { label: 'Category Name', value: category?.name },
    { label: 'Status', value: category?.status },
    { label: 'Category Code', value: category?.code },
    { label: 'Last modified date', value: formatDateTime(category?.lastModifiedDate) },
    { label: 'Description', value: category?.description },
  ];
  return (
    <ProForm
      form={form}
      {...layout}
      layout="horizontal"
      submitter={{
        render: () => {
          return (
            <FooterToolbar>
              <Button
                onClick={() => {
                  history.push(`${RetailerPath.category}/list`);
                }}
              >
                Back
              </Button>
              {access.canCreateRetailer && (
                <Space>
                  <Button type="default" onClick={() => onAddHandler()}>
                    New
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      onAddHandler();
                      if (category !== undefined)
                        setCategoryData({
                          ...category,
                        });
                    }}
                  >
                    Edit
                  </Button>
                </Space>
              )}
            </FooterToolbar>
          );
        },
      }}
    >
      <BreadCrumbCom separator=">" routes={routes} />

      {/* tags={} */}
      <Card
        // title={<TitleCard title="Category" tagLable="Detail" color={'blue'} />}
        title="General Info"
        size="small"
        style={{ marginTop: 10, marginBottom: 20 }}
      >
        <DescriptionDisplay data={displayItems} column={2} />
      </Card>

      <CategoryFormModal
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={categoryData}
        onSave={onSaveActionHandler}
      />
    </ProForm>
  );
};
