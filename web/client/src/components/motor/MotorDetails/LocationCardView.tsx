import { format } from 'date-fns';
import {
    FaCheckCircle,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaTachometerAlt,
    FaEdit as Edit,
    FaTrashAlt as Trash2,
} from 'react-icons/fa';
import type { LocationHistoryDto } from '../../../types/motor/motor';
import { motorStatusLabels } from '../../../utils/motor/locales';
import { getStatusColorClasses } from '../../../utils/motor/statusColors';

/**
 * Свойства компонента карточного отображения истории перемещений.
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
 * Карточный режим отображения истории перемещений двигателя.
 * Использует вертикальную временную шкалу с маркерами и градиентами.
 */
export default function LocationCardView({
    items,
    isAdminOrElectric,
    isLastRecord,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="space-y-4">
            {items.map((loc) => {
                const isLast = isLastRecord(loc);
                const isActive = loc.endDate === null;
                const statusDuringPeriod = (loc as any).status || null;
                return (
                    <div key={loc.id} className="relative pl-6 pb-5 last:pb-0">
                        {/* Вертикальная линия с градиентом */}
                        <div className="absolute left-[8px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-500 to-transparent rounded-full"></div>
                        {/* Маркер */}
                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-green-500 ring-2 ring-green-300' : 'bg-blue-500'}`}>
                            {isActive && <FaCheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className={`ml-4 rounded-xl transition-all duration-200 hover:shadow-lg ${isActive ? 'bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 border-l-4 border-green-500' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}>
                            <div className="p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FaMapMarkerAlt className={`flex-shrink-0 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-blue-500 dark:text-blue-400'}`} />
                                        <p className={`font-semibold truncate ${isActive ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {loc.location}
                                        </p>
                                        {isActive && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                <FaCheckCircle size={12} /> Текущее
                                            </span>
                                        )}
                                    </div>
                                    {isAdminOrElectric && (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => onEdit(loc)}
                                                disabled={!isLast}
                                                className={`transition-colors p-1 rounded-md ${!isLast ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                                title={!isLast ? 'Редактирование разрешено только для последней записи' : 'Редактировать местоположение'}
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
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        <FaCalendarAlt size={12} />
                                        <span>{format(new Date(loc.startDate), 'dd.MM.yyyy')}</span>
                                        <FaClock size={12} />
                                        <span>{format(new Date(loc.startDate), 'HH:mm')}</span>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                    {loc.endDate ? (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                            <FaCalendarAlt size={12} />
                                            <span>{format(new Date(loc.endDate), 'dd.MM.yyyy')}</span>
                                            <FaClock size={12} />
                                            <span>{format(new Date(loc.endDate), 'HH:mm')}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">настоящее время</span>
                                    )}
                                    {statusDuringPeriod && (
                                        <div className="flex items-center gap-2 text-sm ml-auto">
                                            <FaTachometerAlt size={14} className="text-gray-500 dark:text-gray-400" />
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(statusDuringPeriod)}`}>
                                                {motorStatusLabels[statusDuringPeriod as keyof typeof motorStatusLabels] || statusDuringPeriod}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}