export interface ModalProps<T, R>{
    visible: boolean,
    item: T
    onHide: () => void,
    onCompleted: (item: R) => void
}