import {
    FaEdit,
    FaTrashAlt,
} from 'react-icons/fa';
import type { MotorListItem } from '../../../types/motor/motor';
import { motorStatusLabels } from '../../../utils/motor/locales';
import { getStatusColorClasses } from '../../../utils/motor/statusColors';

/**
 * Свойства компонента табличного отображения списка двигателей.
 */
interface Props {
    /** Список двигателей. */
    motors: MotorListItem[];
    /** Признак, что пользователь является админом или электриком. */
    isAdminOrElectric: boolean;
    /** Индикатор загрузки. */
    loading: boolean;
    /** Обработчик клика по строке (переход к деталям). */
    onRowClick: (id: number) => void;
    /** Обработчик клика по кнопке редактирования. */
    onEdit: (motor: MotorListItem, e: React.MouseEvent) => void;
    /** Обработчик клика по кнопке удаления. */
    onDelete: (id: number, e: React.MouseEvent) => void;
}

/**
 * Табличный режим отображения списка двигателей.
 * Колонка "Действия" отображается только для админов/электриков.
 */
export default function MotorListTableView({
    motors,
    isAdminOrElectric,
    loading,
    onRowClick,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Инв. номер</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Тип</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Мощность (кВт)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статус</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Текущее местоположение</th>
                        {isAdminOrElectric && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading && motors.length > 0 && (
                        <tr>
                            <td colSpan={isAdminOrElectric ? 6 : 5} className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                                <span className="ml-2 text-gray-500 dark:text-gray-400">Загрузка...</span>
                            </td>
                        </tr>
                    )}
                    {!loading && motors.length === 0 && (
                        <tr>
                            <td colSpan={isAdminOrElectric ? 6 : 5} className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Нет двигателей</h3>
                                <p className="text-gray-500 dark:text-gray-400">Измените условия поиска или зарегистрируйте новый двигатель</p>
                            </td>
                        </tr>
                    )}
                    {!loading && motors.map((motor) => (
                        <tr
                            key={motor.id}
                            onClick={() => onRowClick(motor.id)}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {motor.inventoryNumber ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {motor.type}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {motor.power} кВт
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(motor.status)}`}>
                                    {motorStatusLabels[motor.status] || motor.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {motor.currentLocation || '—'}
                            </td>
                            {isAdminOrElectric && (
                                <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => onEdit(motor, e)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            title="Редактировать"
                                        >
                                            <FaEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => onDelete(motor.id, e)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            title="Удалить"
                                        >
                                            <FaTrashAlt className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}