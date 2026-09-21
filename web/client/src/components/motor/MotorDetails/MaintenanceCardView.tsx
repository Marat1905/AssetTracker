import { format } from 'date-fns';
import {
    FaArrowRight as ArrowRight,
    FaEdit as Edit,
    FaTrashAlt as Trash2,
    FaCalendarAlt,
    FaClock,
    FaOilCan,
    FaCogs,
    FaUser,
    FaComment,
} from 'react-icons/fa';
import type { MaintenanceLogDto } from '../../../types/motor/motor';
import { maintenanceTypeLabels, bearingPositionLabels } from '../../../utils/motor/locales';
import { BearingIcon } from '../../../icon';
import { FaBolt, FaWrench } from 'react-icons/fa';

/**
 * Свойства компонента карточного отображения журнала обслуживания.
 */
interface Props {
    /** Список записей обслуживания. */
    items: MaintenanceLogDto[];
    /** Признак, что пользователь является админом или электриком. */
    isAdminOrElectric: boolean;
    /** Функция проверки возможности редактирования записи замены подшипника. */
    isEditable: (log: MaintenanceLogDto) => boolean;
    /** Обработчик клика по кнопке редактирования. */
    onEdit: (log: MaintenanceLogDto) => void;
    /** Обработчик клика по кнопке удаления. */
    onDelete: (log: MaintenanceLogDto) => void;
}

/**
 * Возвращает иконку для типа работ.
 */
const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
        case 'Lubrication': return <FaOilCan className="w-4 h-4" />;
        case 'BearingReplacement': return <BearingIcon className="w-4 h-4" />;
        case 'StatorRewinding': return <FaBolt className="w-4 h-4" />;
        case 'ShaftRepair': return <FaWrench className="w-4 h-4" />;
        default: return <FaCogs className="w-4 h-4" />;
    }
};

/**
 * Возвращает цветовые классы для типа работ.
 */
const getWorkTypeStyle = (workType: string) => {
    switch (workType) {
        case 'Lubrication': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'BearingReplacement': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
        case 'StatorRewinding': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'ShaftRepair': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

/**
 * Карточный режим отображения журнала обслуживания.
 */
export default function MaintenanceCardView({
    items,
    isAdminOrElectric,
    isEditable,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="space-y-4">
            {items.map(log => {
                const editable = isEditable(log);
                const workTypeIcon = getWorkTypeIcon(log.workType);
                const workTypeStyle = getWorkTypeStyle(log.workType);
                const workTypeLabel = maintenanceTypeLabels[log.workType] || log.workType;

                return (
                    <div
                        key={log.id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        <div className={`h-1.5 ${log.workType === 'Lubrication' ? 'bg-amber-500' : log.workType === 'BearingReplacement' ? 'bg-indigo-500' : log.workType === 'StatorRewinding' ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>

                        <div className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${workTypeStyle}`}>
                                        {workTypeIcon}
                                        <span>{workTypeLabel}</span>
                                    </div>
                                    {(log.workType === 'Lubrication' || log.workType === 'BearingReplacement') && log.bearingPosition && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            <FaCogs size={12} />
                                            {bearingPositionLabels[log.bearingPosition] || (log.bearingPosition === 'Front' ? 'Передний' : 'Задний')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                        <div className="flex items-center gap-1">
                                            <FaCalendarAlt size={12} />
                                            <span>{format(new Date(log.date), 'dd.MM.yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FaClock size={12} />
                                            <span>{format(new Date(log.date), 'HH:mm')}</span>
                                        </div>
                                    </div>
                                    {isAdminOrElectric && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onEdit(log)}
                                                disabled={log.workType === 'BearingReplacement' && !editable}
                                                className={`p-1.5 rounded-md transition-colors ${log.workType === 'BearingReplacement' && !editable
                                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                    : 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                                title={log.workType === 'BearingReplacement' && !editable ? 'Редактирование только для последней записи' : 'Редактировать запись'}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(log)}
                                                disabled={log.workType === 'BearingReplacement' && !editable}
                                                className={`p-1.5 rounded-md transition-colors ${log.workType === 'BearingReplacement' && !editable
                                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                    : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                                title={log.workType === 'BearingReplacement' && !editable ? 'Удаление только для последней записи' : 'Удалить запись'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {log.performedBy && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <FaUser size={14} className="text-gray-400" />
                                    <span className="font-medium">Выполнил:</span>
                                    <span>{log.performedBy}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                {log.workType === 'Lubrication' && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <FaOilCan size={16} className="text-amber-600 dark:text-amber-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Смазка:</span>
                                            <span className="text-gray-900 dark:text-gray-100 font-mono">{log.lubricantTypeName || '—'}</span>
                                        </div>
                                    </div>
                                )}

                                {log.workType === 'BearingReplacement' && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-3">
                                        <div className="flex flex-col gap-2">
                                            {log.oldBearing && log.newBearing && log.oldBearing.type === log.newBearing.type &&
                                                log.oldBearing.manufacturer === log.newBearing.manufacturer &&
                                                log.oldBearing.supplier === log.newBearing.supplier ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Подшипник:</span>
                                                    <span className="text-gray-900 dark:text-gray-100 font-mono">
                                                        {log.newBearing.type} ({log.newBearing.manufacturer}, {log.newBearing.supplier})
                                                    </span>
                                                    <span className="text-xs text-gray-500">(не изменялся)</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                    {log.oldBearing && (
                                                        <div className="flex-1">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Старый подшипник</div>
                                                            <div className="line-through text-gray-500 dark:text-gray-400 text-sm font-mono bg-white dark:bg-gray-800 rounded-md px-2 py-1">
                                                                {log.oldBearing.type} ({log.oldBearing.manufacturer}, {log.oldBearing.supplier})
                                                            </div>
                                                        </div>
                                                    )}
                                                    {log.oldBearing && log.newBearing && (
                                                        <div className="flex-shrink-0 text-blue-500 hidden sm:block">
                                                            <ArrowRight size={20} />
                                                        </div>
                                                    )}
                                                    {log.newBearing && (
                                                        <div className="flex-1">
                                                            <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                                                {log.oldBearing ? 'Новый подшипник' : 'Установленный подшипник'}
                                                            </div>
                                                            <div className="font-semibold text-green-700 dark:text-green-300 text-sm font-mono bg-green-50 dark:bg-green-900/20 rounded-md px-2 py-1">
                                                                {log.newBearing.type} ({log.newBearing.manufacturer}, {log.newBearing.supplier})
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {log.comment && (
                                    <div className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                                        <FaComment size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="break-words whitespace-normal text-gray-700 dark:text-gray-300">
                                            {log.comment}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}