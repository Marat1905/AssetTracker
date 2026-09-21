import { useEffect, useState } from 'react';

/**
 * Хук для определения мобильного экрана.
 * Возвращает true, если ширина окна меньше указанного брейкпоинта (по умолчанию 768px).
 * Автоматически подписывается на изменение размера окна и отписывается при размонтировании.
 *
 * @param breakpoint - Пороговое значение ширины в пикселях (по умолчанию 768).
 * @returns true, если экран считается мобильным.
 */
export default function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < breakpoint;
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}