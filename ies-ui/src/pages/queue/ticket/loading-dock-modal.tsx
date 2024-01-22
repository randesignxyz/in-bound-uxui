import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { QueueTicketListItem } from "@/services/delivery/data";

interface Props extends FormModalProps {
    queue: QueueTicketListItem,
    onSave: (id: number, loadingDockId: number) => void;
}

const LoadingDockModal: React.FC<Props> = ({ queue, onSave, ...props }) => {
    return (
        <FormModalComp
            title="Loading Dock"
            {...props}
            onSubmit={() => onSave(queue.id, 0)}
        >

            <div>To be implemented</div>

        </FormModalComp>
    )
}

export default LoadingDockModal