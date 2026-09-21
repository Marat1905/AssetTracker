import { format } from 'date-fns';
import {
    FaCheckCircle,
    FaMapMarkerAlt,
    FaEdit as Edit,
    FaTrashAlt as Trash2,
} from 'react-icons/fa';
import type { LocationHistoryDto } from '../../../types/motor/motor';
import { motorStatusLabels } from '../../../utils/motor/locales';
import { getStatusColorClasses } from '../../../utils/motor/statusColors';

/**
 * Свойства компонента табличного отображения истории перемещений.
 */
interface Props {
    /** Список записей истории перемещений на текущей странице. */
    items: LocationHistoryDto[];
    /** Признак, что пользователь является админом или электриком. */
    isAdminOrElectric: boolean;
    /** Функция проверки: является ли запись последней. */
    isLastRecord: (loc: LocationHistoryDto) => boolean;
    /** Обработчик клика по кнопке редактирования. */
    onEdit: (loc: LocationHistoryDto) => void;
    /** Обработчик клика по кнопке удаления. */
    onDelete: (loc: LocationHistoryDto) => void;
}

/**
 * Табличный режим отображения истории перемещений двигателя.
 * Использует table-layout: fixed и перенос слов, чтобы избежать горизонтальной прокрутки.
 */
export default function LocationTableView({
    items,
    isAdminOrElectric,
    isLastRecord,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[30%]" />
                    <col className="w-[20%]" />
                    {isAdminOrElectric && <col className="w-[10%]" />}
                </colgroup>
                <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Начало (дата/время)</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Окончание (дата/время)</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Местоположение</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Статус в период</th>
                        {isAdminOrElectric && <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((loc) => {
                        const isLast = isLastRecord(loc);
                        const isActive = loc.endDate === null;
                        const statusDuringPeriod = (loc as any).status || null;
                        return (
                            <tr key={loc.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                    {format(new Date(loc.startDate), 'dd.MM.yyyy HH:mm')}
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                    {loc.endDate ? format(new Date(loc.endDate), 'dd.MM.yyyy HH:mm') :
                                        <span className="text-green-600 dark:text-green-400 font-medium">настоящее время</span>}
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words">
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className={`flex-shrink-0 ${isActive ? 'text-green-500' : 'text-blue-500'}`} />
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{loc.location}</span>
                                        {isActive && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                <FaCheckCircle size={12} /> Текущее
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words">
                                    {statusDuringPeriod ? (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(statusDuringPeriod)}`}>
                                            {motorStatusLabels[statusDuringPeriod as keyof typeof motorStatusLabels] || statusDuringPeriod}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                {isAdminOrElectric && (
                                    <td className="p-3 align-top whitespace-normal">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(loc)}
                                                disabled={!isLast}
                                                className={`transition-colors p-1 rounded-md ${!isLast ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                                title={!isLast ? 'Редактирование разрешено только для последней записи' : 'Редактировать запись'}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(loc)}
                                                disabled={!isLast}
                                                className={`transition-colors p-1 rounded-md ${!isLast ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                                title={!isLast ? 'Удаление разрешено только для последней записи' : 'Удалить запись'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}