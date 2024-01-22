import { AllocatedLoadingDock } from "@/services/delivery/loading-bay-service-params";
import { DeleteFilled, EllipsisOutlined, PlusCircleFilled } from "@ant-design/icons";
import { CheckCard, ModalForm, ModalFormProps } from "@ant-design/pro-components";
import { Dropdown, Menu, Space, Typography } from "antd";
import { useState } from "react";

interface Props extends ModalFormProps {
    availableLoadingDocks: AllocatedLoadingDock[];
    onSave: (loadingDock: number[]) => Promise<void>;
}

export default ({ onSave, availableLoadingDocks, ...rest }: Props) => {

    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [removedItems, setRemovedItems] = useState<number[]>([])

    const menu = (it: AllocatedLoadingDock) => {

        return <Menu
            onClick={({ key, domEvent }) => {
                domEvent.stopPropagation()
                const id = parseInt(key)
                const removed = removedItems.find(i => i === id)

                if (removed) {
                    setRemovedItems(v => v.filter(i => i !== removed))
                } else {
                    setRemovedItems(v => [...v, id])
                }
            }}
            items={it.combinedLoadingDocks?.filter(it=> it.isTemp)?.map(it => ({
                key: it.id,
                label: it.name,
                icon: removedItems.find(i => i === it.id) ? <PlusCircleFilled /> : <DeleteFilled />
            }))}
        />
    }

    return <ModalForm title='Transfer Loading Dock'
        {...rest}
        submitter = {{
            submitButtonProps: {
                disabled: selectedItems.length ==0
            }
        }}
        onFinish={() => {
            const combinedLoadingDocksId = availableLoadingDocks.filter(it => selectedItems.some(i => i === it.id)).map(it => it.combinedLoadingDocks || []).flatMap(it => it).map(it => it.id)
            return onSave([...selectedItems, ...combinedLoadingDocksId].filter(it => !removedItems.some(i => i === it)))
        }}>
        <CheckCard.Group
            multiple
            onChange={(value) => {
                setSelectedItems(value as number[])
            }}
        >
            {
                availableLoadingDocks.map(it => <CheckCard
                    key={it.id}
                    style={it.allocated ? {
                        background: 'grey'
                    } : {}}
                    title={<Space >
                        <Typography.Title type="success" level={4}>{[it.name, ...(it.combinedLoadingDocks?.filter(i => !removedItems.find(i1 => i1 === i.id))?.map(it => it.name) || [])].join(", ")}</Typography.Title>
                    </Space>}
                    description={[it.ticketNum, it.truckNo].filter(it => it).join("/") || 'Available'}
                    value={it.id}
                    extra={(it.combinedLoadingDocks?.length || 0) > 0 && <Dropdown overlay={menu(it)}>
                        < EllipsisOutlined
                            style={{ fontSize: 22, color: 'rgba(0,0,0,0.5)' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>}

                />)
            }
        </CheckCard.Group>
    </ModalForm>
}