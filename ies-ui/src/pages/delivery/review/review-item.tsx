import { formatDateTime } from '@/pages/utils';
import { ReviewItem } from '@/services/delivery/data';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Card, Rate } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

interface Props extends DrawerFormProps {
  data: ReviewItem[];
  comment?: string,
}

const ReviewItemView: React.FC<Props> = ({ data ,comment, ...props }) => {
  return (
    <DrawerForm {...props} submitter={false}>
      <ProTable<ReviewItem & { seq: number }>
        search={false}
        dataSource={data.map((d, index) => ({ ...d, seq: index + 1 }))}
        columns={[
          { dataIndex: 'seq' },
          { title: 'Question', dataIndex: 'question' },
          {
            title: 'Answer',
            render: (_, r) => {
              if (r.type === 'rating') return <Rate  disabled  value={parseInt(r.answer)} />;
              else if (r.type.toLocaleLowerCase() === 'Yes/No'.toLocaleLowerCase())
                return r.answer.toLocaleLowerCase() === 'yes' ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
              else if (r.answer.toLocaleLowerCase() === 'yes') return <CheckCircleOutlined />;
              else if (r.answer.toLocaleLowerCase() === 'no') return <CloseCircleOutlined />;
              else return r.answer;
            },
          },
          { title: 'From', render: (_, r) => formatDateTime(r.startedDate) },
          { title: 'To', render: (_, r) => formatDateTime(r.endedDate) },
        ]}
        pagination={false}
        options={{
          density: false,
          fullScreen: false,
          reload: false,
          setting: false,
        }}
      />

      <Card title = "Comment" size='small' bordered = {false}>
        <TextArea value={comment}/>
      </Card>
    </DrawerForm>
  );
};

export default ReviewItemView;
