import { ProList } from "@ant-design/pro-components";
import { RelatedObj } from "../../services";
import Link from "antd/lib/typography/Link";
import { openPQ } from "../../quotation/MainPage";
import { openQC } from "../../price-comparison/MainPage";
import { openPR } from "../../requisition/MainPage";
import { Flex } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { formatter } from "@/pages/utils";

export default ({ mainId, items }: { mainId: number; items: RelatedObj[] }) => {
    return <ProList<RelatedObj>
        dataSource={items}
        ghost={true}
        grid={{ gutter: 16, column: 4 }}
        itemCardProps={{
            size: 'small',
            ghost: true
        }}
        metas={{
            title: {
                render: (_, r) => r.type,
            },
            subTitle: {
                render: (_, r) => <Link onClick={() => {

                    if (r.type == 'QC')
                        r.instanceId && openQC(r.instanceId)
                    else if (r.type == 'PQ')
                        openPQ(r.id)
                    else if (r.type == 'PR')
                        r.instanceId && openPR(r.instanceId)
                }} >{r.code}</Link>
            },
            content: {
                render: (_, r) => <>{r.items.map(it => <Flex vertical key={`%${mainId}-${it.id}-${r.type}-${r.id}`}>

                    <Flex gap={5} align="flex-start" justify="flex-start">
                        <Flex> <CaretRightOutlined /> Item: </Flex>
                        {it.itemCode != 'SRV' && <Flex> {`${it.itemCode} - ${it.itemName}`} </Flex>}
                        {it.itemCode == 'SRV' && <Flex> {it.itemName} </Flex>}
                    </Flex>
                    <Flex gap={5} align="flex-start" justify="flex-start">
                        <Flex> <CaretRightOutlined /> Desc: </Flex>
                        <Flex> {it.itemDescription} </Flex>
                    </Flex>
                    {it.itemCode != 'SRV' && <Flex gap={5}>
                        <Flex> <CaretRightOutlined /> Qty: </Flex>
                        <Flex> {it.qty} </Flex>
                        {r.type == 'PR' && <Flex>,Ordered: </Flex>}
                        {r.type == 'PR' && <Flex> {it.orderedQty || 0} </Flex>}
                        {r.type == 'PR' && <Flex>,Purchased: </Flex>}
                        {r.type == 'PR' && <Flex> {it.purchasedQty || 0} </Flex>}
                        {r.type == 'PR' && <Flex>,Available: </Flex>}
                        {r.type == 'PR' && <Flex> {it.availableQty || 0} </Flex>}
                    </Flex>}
                    <Flex gap={5}>
                        <Flex> <CaretRightOutlined /> Price: </Flex>
                        <Flex> {formatter.format(it.price)} </Flex>
                    </Flex>
                </Flex>)}</>
            }
        }}

    />
}