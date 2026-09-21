/**
 * Возвращает CSS-классы Tailwind для цветового оформления бейджа статуса двигателя.
 * Используется в списках, детальной странице и отчётах.
 *
 * @param status - Строковое значение статуса (InOperation, Reserve, Repair, Scrapped, InRepair).
 * @returns Строка с классами для светлой и тёмной темы.
 */
export const getStatusColorClasses = (status: string): string => {
    switch (status) {
        case 'InOperation':
            return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        case 'Reserve':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        case 'Repair':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        case 'Scrapped':
            return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        case 'InRepair':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};