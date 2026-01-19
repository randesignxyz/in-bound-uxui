import { ProFormCascader } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { AllocateServiceAPI } from './service';

const ALL_VALUE = '__ALL__';

export interface SaleAreaOption {
    value: string;       // 🔑 STRING
    label: string;
    isdefault: boolean;
}

interface ExcelSaleAreaFilterProps {
    name?: string;
    width?: number;
    form: any;
    requestActions: any;

    onChange?: (values: string[], options: SaleAreaOption[]) => void;
    onInit?: (values: string[], options: SaleAreaOption[]) => void;

    isSelectAll?: boolean;
    onSelectAllChange?: (v: boolean) => void;
}

const OfficerZoneFilter: React.FC<ExcelSaleAreaFilterProps> = ({
    name = 'zone',
    width = 180,
    form,
    requestActions,
    onChange,
    onInit,
    isSelectAll,
    onSelectAllChange,
}) => {
    const optionsRef = useRef<SaleAreaOption[]>([]);
    const initializedRef = useRef(false);
    const services = AllocateServiceAPI(requestActions);

    /* ================================
     * External Select All controller
     * ================================ */
    useEffect(() => {
        if (!initializedRef.current) return;

        const options = optionsRef.current;
        const realValues = options.map(o => o.value);

        if (isSelectAll === true) {
            form.setFieldsValue({
                [name]: realValues.map(v => [v]),
            });
            onChange?.(realValues, options);
        }

        if (isSelectAll === false) {
            form.setFieldsValue({ [name]: [] });
            onChange?.([], []);
        }
    }, [isSelectAll]);

    /* ================================
     * Sync when parent sets value
     * ================================ */
    useEffect(() => {
        if (!initializedRef.current) return;

        const values: string[] =
            (form.getFieldValue(name) || []).map((v: string[]) => v[0]);

        const options = optionsRef.current.filter(o =>
            values.includes(o.value),
        );

        onChange?.(values, options);
    }, [form.getFieldValue(name)]);

    return (
        <ProFormCascader
            name={name}
            width={width}
            request={async () => {
                const res = await services.list_area();
                if (!Array.isArray(res)) return [];

                const options: SaleAreaOption[] = res.map((a: any) => ({
                    value: a.zone_ids,             // 🔑 STRING
                    label: a.zone_name,
                    isdefault: a.isdefault === '1' || a.is_default === '1',
                }));

                optionsRef.current = options;

                /** Default zones */
                const defaultValues = options
                    .filter(o => o.isdefault)
                    .map(o => o.value);

                if (defaultValues.length) {
                    form.setFieldsValue({
                        [name]: defaultValues.map(v => [v]),
                    });
                    onInit?.(
                        defaultValues,
                        options.filter(o => o.isdefault),
                    );
                }

                initializedRef.current = true;

                return [
                    { value: ALL_VALUE, label: 'Select All' },
                    ...options,
                ];
            }}
            fieldProps={{
                multiple: true,
                maxTagCount: 'responsive',

                onChange: (paths: string[][] = []) => {
                    const values = paths.map(p => p[0]);
                    const options = optionsRef.current;
                    const realValues = options.map(o => o.value);

                    const hasAll = values.includes(ALL_VALUE);
                    const selectedValues = values.filter(v => v !== ALL_VALUE);

                    /** Select All */
                    if (hasAll) {
                        const isAllSelected =
                            selectedValues.length === realValues.length;

                        if (!isAllSelected) {
                            form.setFieldsValue({
                                [name]: realValues.map(v => [v]),
                            });
                            onChange?.(realValues, options);
                            onSelectAllChange?.(true);
                        } else {
                            form.setFieldsValue({ [name]: [] });
                            onChange?.([], []);
                            onSelectAllChange?.(false);
                        }
                        return;
                    }

                    /** Clear */
                    if (paths.length === 0) {
                        onChange?.([], []);
                        onSelectAllChange?.(false);
                        return;
                    }

                    /** Normal select */
                    const selectedOptions = options.filter(o =>
                        selectedValues.includes(o.value),
                    );

                    onChange?.(selectedValues, selectedOptions);

                    onSelectAllChange?.(
                        selectedValues.length === realValues.length,
                    );
                },
            }}
        />
    );
};

export default OfficerZoneFilter;
