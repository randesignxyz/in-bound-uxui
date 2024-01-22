/**
 * SKH-20230531
 * Validatin settlement DN(s) on Action(`Complete`) with cancelled='Y' or base current amount <=0 or no DN(s) in DN Claimed List.
 */
import { ModalForm, ProDescriptions, ProFormTextArea, ProTable } from "@ant-design/pro-components";
// import { DlvExpenseServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import { Children, useEffect, useState } from "react";
import { DeliveryCost, DeliveryInvoiceItem } from "@/services/del-expense/data";
import { formatDate, formatter } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import { Button, Card, Descriptions, Modal, Spin } from "antd";
import { ContractLess } from "@/services/crm/contract";
import moment from "moment";


export interface DataFormType {
    remarks?: string;
}
export default ({ trigger, contract, onFinish }: { trigger?: JSX.Element, contract: ContractLess, onFinish: (formData: DataFormType, contract: ContractLess, cb: (v: boolean) => void) => void }) => {
    const [form] = useForm<DataFormType>();
    const [open, setOpen] = useState<boolean>(false);
    const [dataV, setDataV] = useState<DeliveryCost[]>([]);
    const [dataInv, setDataInv] = useState<DeliveryInvoiceItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    const requestActions = simpleRequestActions();
    const checkingDNs = async () => {
        // const rs = await DlvExpenseServices.listDNChecking({deliveryId: settlementId}).query(requestActions);
        // setDataV(rs.items);
        setLoading(false);
    };
    const checkingInvItems = async () => {
        // const rs = await DlvExpenseServices.listInvItemBySettledId({deliveryId: settlementId}).query(requestActions);
        // setDataInv(rs.items);
        setLoading(false);
    };
    useEffect(() => {
        if (open) {
            setLoading(true);
            checkingInvItems();
        }
    }, [open]);
    useEffect(() => {
        if (dataInv && dataInv.length > 0) {
            setLoading(true);
            checkingDNs();
        }
    }, [dataInv]);
    return <ModalForm
        trigger={trigger}
        width={'80%'}
        open={open}
        title="Add Contract CheckList"
        form={form}
        submitter={{
            searchConfig: {
                submitText: 'Add',
            },
            // render(_, dom) {  
            //     return ((dataInv && dataInv.length==0)||dataV.length>0)?[dom[0]]:[dom[0],dom[1]];
            // },
        }}

        onFinish={async () => {
            const formData = await form.validateFields();
            onFinish(formData, contract, (v) => {
                setOpen(!v);
            });
        }}
        onOpenChange={(v) => {
            if (!v) {
                setDataV([]);
                form.resetFields();
            }
            setOpen(v);
        }}
    >
        <Spin spinning={requestActions.request?.loading || false} >
            <Card title={`Contract Info | ${contract.contractNo}`} key={'add-contract-checklist'}
                size="small"
                style={{ marginBottom: '10px' }}
            >
                <Descriptions size='small' >
                    {/* <Descriptions.Item label="Agreement No">{ contract.contractNo}</Descriptions.Item> */}
                    <Descriptions.Item label="Customer No">{contract.customer.code}</Descriptions.Item>
                    <Descriptions.Item label="Business Name">{contract.customer.name}</Descriptions.Item>
                </Descriptions>
                <Descriptions size='small'  >
                    <Descriptions.Item label="Agreement Type">{contract.contractType}</Descriptions.Item>
                    <Descriptions.Item label="Brand">{contract.brand}</Descriptions.Item>
                    <Descriptions.Item label="Budget Code">{contract.budgetCode}</Descriptions.Item>
                </Descriptions>
                <Descriptions size='small'>
                    <Descriptions.Item label="Start Date">{contract?.effectiveDate && moment(contract.effectiveDate).format('YYYY-MM-DD')}</Descriptions.Item>
                    <Descriptions.Item label="End Date">{contract?.expiryDate && moment(contract.expiryDate).format('YYYY-MM-DD')}</Descriptions.Item>
                    <Descriptions.Item label="Number of Months">{moment(contract.expiryDate).diff(moment(contract.effectiveDate), 'months')}</Descriptions.Item>
                </Descriptions>
            </Card>
            <ProFormTextArea label="Remarks" name="remarks" />
        </Spin>
    </ModalForm>
};