import DescriptionDisplay from '@/components/Descriptions';
import { simpleRequestActions } from '@/services/model';
import { ProForm } from '@ant-design/pro-components';
import { Button, Card, Row, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import type { IngredientDto } from './data';
import { IngredientServiceAPI } from './services';

interface Props {
  onEdit: (id: string) => void;
  onAdd?: () => void;
  id: string;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default ({ onEdit, id, onAdd }: Props) => {
  const requestActions = simpleRequestActions();
  const services = IngredientServiceAPI(requestActions);
  const [ingredient, setIngredient] = useState<IngredientDto>();
  const [form] = useForm<IngredientDto>();

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.ingredient}/list`,
      label: 'Ingredient',
    },
    {
      path: `${RetailerPath.ingredient}/${id}`,
      label: 'Detail',
    },
  ];

  useEffect(() => {
    (async () => {
      if (id) {
        setIngredient(await services.detailIngredient(id));
      }
    })();
  }, []);

  const displayItems = [
    { label: 'Name', value: ingredient?.name },
    { label: 'Name En', value: ingredient?.nameEn },
    { label: 'Code', value: ingredient?.code },
  ];
  return (
    <ProForm form={form} {...layout} layout="horizontal" submitter={false}>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
        <Space>
          <Button type="default" onClick={() => onAdd?.()}>
            New
          </Button>
          <Button type="primary" onClick={() => onEdit?.(id)}>
            Edit
          </Button>
        </Space>
      </Row>

      {/* tags={} */}
      <Card
        // title={<TitleCard title="Ingredient" tagLable="Detail" color={'blue'} />}
        title="General Info"
        size="small"
        style={{ marginTop: 10, marginBottom: 20 }}
      >
        <DescriptionDisplay data={displayItems} column={1} />
      </Card>
    </ProForm>
  );
};
