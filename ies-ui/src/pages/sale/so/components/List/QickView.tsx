import DescriptionDisplay from "@/components/Descriptions";
import { CrmPaths } from "@/pages/crm";
import { formatDate, formatDateTime, formatter } from "@/pages/utils";
import { SoDetail } from "@/services/sale/data";
import { Card, Drawer, DrawerProps } from "antd";
import { history } from 'umi'

interface Props extends DrawerProps {
    soDetail?: SoDetail,
}

const QuickView: React.FC<Props> = ({ soDetail, ...props }) => {
    return <Drawer {...props}>
        <Card size="small" title="General">
            <DescriptionDisplay
                column={2}
                data={[
                    { label: 'PO #', value: soDetail?.docEntryNum },
                    { label: 'So #', value: soDetail?.soNo },
                    { label: 'Orderd Date', value: formatDate(soDetail?.orderedDate) },
                    {
                        label: 'Customer',
                        onClick: () => {
                            history.push(
                                `${CrmPaths.customer}/detail/${soDetail?.associatedTo.customer.id}`,
                            );
                        },
                        value: [
                            soDetail?.associatedTo.customer.code,
                            soDetail?.associatedTo.customer.name,
                        ]
                            .filter((it) => it)
                            .join('-'),
                    },
                    { label: 'Ref #', value: soDetail?.refNo },

                    { label: 'Budget Code', value: soDetail?.budgetCode },
                    {
                        label: 'Salesperson',
                        value: [
                            soDetail?.associatedTo.salesperson.code,
                            soDetail?.associatedTo.salesperson.name,
                        ].join('-'),
                    },
                    { label: 'Status', value: soDetail?.status },
                    { label: 'Created By', value: soDetail?.createdBy },
                    { label: 'Created Date', value: formatDateTime(soDetail?.createdDate) },
                    { label: 'SAP Posted By', value: soDetail?.postedBy },
                    { label: 'SAP Posted Date', value: formatDateTime(soDetail?.postedDate) },
                    { label: 'Last Modified By', value: soDetail?.lastModifiedBy },
                    {
                        label: 'Last Modifiedd Date',
                        value: formatDateTime(soDetail?.lastModifiedDate),
                    },
                ]}
            />
        </Card>
        <Card style={{ marginTop: '10px' }} size="small" title="Delivery">
            <DescriptionDisplay
                column={1}
                data={[
                    { label: 'Delivery Method', value: soDetail?.associatedTo.deliveryMethod?.name, },
                    { label: 'Delivery Date', value: formatDate(soDetail?.deliveryDate) },
                    { label: 'Shipping Address Code',value: soDetail?.associatedTo.shippingAddress.address, },
                    { label: 'Shipping Address',
                        value: [
                            { name: 'Street', value: soDetail?.associatedTo.shippingAddress.streetNo, },
                            { name: 'House#', value: soDetail?.associatedTo.shippingAddress.houseNo, },
                            { name: 'Village', value: soDetail?.associatedTo.shippingAddress.village, },
                            { name: 'Commune', value: soDetail?.associatedTo.shippingAddress.commune, },
                            { name: 'District', value: soDetail?.associatedTo.shippingAddress.district, },
                            { name: 'Province', value: soDetail?.associatedTo.shippingAddress.province, },
                        ]
                            .filter((it) => it.value)
                            .map((it) => `${it.name} ${it.value}`)
                            .join(', '),
                    },

                    // { label: 'Ship to Name', value: soDetail?.shipToName },
                    // { label: 'Shipp to phone number', value: soDetail?.shipPhoneNumber }
                ]}
            />
        </Card>
        <Card style={{ marginTop: '10px' }} size="small" title="Order Amount">
            <DescriptionDisplay column= {1} data={[
                {label: 'Amount', value: formatter.format(soDetail?.amount || 0)},
                {label: 'Discount Amount', value:  formatter.format(soDetail?.discountAmount|| 0)},
                {label: 'VAT Amount', value:  formatter.format(soDetail?.vatAmount ||0 )},
                {label: 'Total Amount', value:  formatter.format(soDetail?.totalAmount ||0 )},

            ]}/>
        </Card>
        <Card style={{ marginTop: '10px' }} size="small" title="Attachment">
            
        </Card>
    </Drawer>
}

export default QuickView