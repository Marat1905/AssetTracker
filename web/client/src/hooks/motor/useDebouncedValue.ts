import { useEffect, useState } from 'react';

/**
 * Хук debounce для значения.
 * Возвращает значение, которое обновляется не чаще, чем указанная задержка.
 *
 * @param value - Исходное значение.
 * @param delay - Задержка в миллисекундах (по умолчанию 500).
 * @returns Дебаунсированное значение.
 */
export default function useDebouncedValue<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}