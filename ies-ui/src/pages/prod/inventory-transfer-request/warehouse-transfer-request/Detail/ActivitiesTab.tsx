import { ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import moment from 'moment';
import { ActivitiesItem, TransferRequest, TransferRequestItem } from '../../data';

interface Props extends DrawerFormProps {
    data?: TransferRequest;
}

export default ({ data, ...rest }: Props) => {

    const formatDatewithNumber = (value: moment.Moment) => {
        if (moment(value).fromNow().search('ago') > 0) {
            return moment(value).fromNow().replace('in', '');
        } else {
            return moment(value).fromNow().replace('in', '') + ' from now';
        }
    };
    return (
        <>
            <ProList<ActivitiesItem>
                rowKey="id"
                dataSource={data?.activities}
                metas={{
                    title: {
                        dataIndex: 'activities_name',
                    },
                    subTitle: {
                        render: (_, r) => {
                            return [
                                [r.action, r.actionBy].join(' by '),
                                [' ' + formatDatewithNumber(r.actionDate)],
                            ];
                        },
                    },
                    description: {
                        dataIndex: 'remark',
                    },
                    actions: {
                        render: (_, r) => [moment(r.actionDate).format('YYYY-MM-DD HH:m:ss a')],
                    },
                }}
            />
        </>
    );
};
