import { useRef, useEffect } from "react";

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({ form, visible }: { form: any, visible: boolean }) => {
    const prevVisibleRef = useRef<boolean>();
    useEffect(() => {
        prevVisibleRef.current = visible;
    }, [visible]);
    const prevVisible = prevVisibleRef.current;

    useEffect(() => {
        if (!visible && prevVisible) {
            form.resetFields();
        }
    }, [visible]);
};

export default useResetFormOnCloseModal