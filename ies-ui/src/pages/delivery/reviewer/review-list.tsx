import { formatDate } from '@/pages/utils';
import { ReviewListItem } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useEffect, useRef } from 'react';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { Button, message, Modal, Tooltip } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

interface Props extends DrawerFormProps {
  reviwerId: number;
}

const ReviewList: React.FC<Props> = ({ reviwerId, ...props }) => {
  const actionRef = useRef<ActionType>();

  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);

  useEffect(() => {
    props.open && actionRef.current?.reloadAndRest?.();
  }, [props.open]);

  const onRequestHandler = async (pagination?: { pageSize?: number; current?: number }) => {
    const data = await services.listReviewByReviewerId(reviwerId, pagination);

    return {
      success: !!data,
      total: data?.total,
      data: data?.items,
    };
  };

  const onSelectHandler = async (data: ReviewListItem) => {
    Modal.confirm({
      title: 'Assign customer',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          data.customerCode &&
            (await services.assignCustomerToReviewer(reviwerId, data.customerCode));
          props.onVisibleChange?.(false);
        } catch (error: any) {
          message.error(error.message || 'Failed to assign.');
        }
      },
    });
  };
  return (
    <DrawerForm {...props} submitter={false}>
      <ProTable<ReviewListItem>
        actionRef={actionRef}
        columns={[
          { title: 'DN Num', dataIndex: 'dnNum' },
          { title: 'Delevery Date', render: (_, r) => formatDate(r.deliveryDate) },
          { title: 'Customer Code', dataIndex: 'customerCode' },
          { title: 'Customer Name', dataIndex: 'customerName' },
          { title: 'Ship to code', dataIndex: 'shipToCode' },
          { title: 'Driver', dataIndex: 'driver' },
          {
            title: '',
            render: (_, r) => (
              <Tooltip title={`Assign ${r.customerCode}`}>
                <Button
                  onClick={() => onSelectHandler(r)}
                  type="link"
                  icon={<CheckCircleFilled />}
                />{' '}
              </Tooltip>
            ),
          },
        ]}
        search={false}
        options={{
          density: false,
          fullScreen: false,
          reload: false,
          setting: false,
        }}
        request={(param) => onRequestHandler({ pageSize: param.pageSize, current: param.current })}
      />
    </DrawerForm>
  );
};

export default ReviewList;
