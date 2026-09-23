import { format } from 'date-fns';
import {
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaComment,
    FaBolt,
    FaWrench,
    FaCogs,
    FaOilCan,
} from 'react-icons/fa';
import type { MaintenanceReportItemDto } from '../../../types/motor/motor';
import { maintenanceTypeLabels, bearingPositionLabels } from '../../../utils/motor/locales';
import { BearingIcon } from '../../../icons';

/**
 * Свойства компонента карточного отображения детального отчёта по обслуживанию.
 */
interface Props {
    /** Список записей отчёта. */
    items: MaintenanceReportItemDto[];
}

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
 * Карточный режим отображения детального отчёта по обслуживанию.
 */
export default function MaintenanceReportCardView({ items }: Props) {
    return (
        <div className="space-y-4">
            {items.map(item => {
                const workTypeLabel = maintenanceTypeLabels[item.workType] || item.workType;
                const workTypeStyle = getWorkTypeStyle(item.workType);
                const workTypeIcon = getWorkTypeIcon(item.workType);

                return (
                    <div
                        key={item.id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        <div className={`h-1.5 ${item.workType === 'Lubrication' ? 'bg-amber-500' : item.workType === 'BearingReplacement' ? 'bg-indigo-500' : item.workType === 'StatorRewinding' ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>

                        <div className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${workTypeStyle}`}>
                                        {workTypeIcon}
                                        <span>{workTypeLabel}</span>
                                    </div>
                                    {(item.workType === 'Lubrication' || item.workType === 'BearingReplacement') && item.bearingPosition && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            <FaCogs size={12} />
                                            {bearingPositionLabels[item.bearingPosition] || (item.bearingPosition === 'Front' ? 'Передний' : 'Задний')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                    <div className="flex items-center gap-1">
                                        <FaCalendarAlt size={12} />
                                        <span>{format(new Date(item.date), 'dd.MM.yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaClock size={12} />
                                        <span>{format(new Date(item.date), 'HH:mm')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Двигатель: <span className="text-gray-900 dark:text-gray-100">
                                        {item.motorInventoryNumber ? `№${item.motorInventoryNumber}` : `ID ${item.motorId}`}
                                    </span> — {item.motorType} ({item.motorPower} кВт, {item.motorSpeed} об/мин)
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Местоположение: {item.motorCurrentLocation || '—'} | Монтаж: {item.motorMountingType}
                                </div>
                            </div>

                            {item.performedBy && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <FaUser size={14} className="text-gray-400" />
                                    <span className="font-medium">Выполнил:</span>
                                    <span>{item.performedBy}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                {item.workType === 'Lubrication' && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <FaOilCan size={16} className="text-amber-600 dark:text-amber-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Смазка:</span>
                                            <span className="text-gray-900 dark:text-gray-100 font-mono">{item.lubricantTypeName || '—'}</span>
                                        </div>
                                    </div>
                                )}

                                {item.workType === 'BearingReplacement' && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                            {item.oldBearing && (
                                                <div className="flex-1">
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Старый подшипник</div>
                                                    <div className="line-through text-gray-500 dark:text-gray-400 text-sm font-mono bg-white dark:bg-gray-800 rounded-md px-2 py-1">
                                                        {item.oldBearing.type} ({item.oldBearing.manufacturer}, {item.oldBearing.supplier})
                                                    </div>
                                                </div>
                                            )}
                                            {item.oldBearing && item.newBearing && (
                                                <div className="flex-shrink-0 text-blue-500 hidden sm:block">
                                                    <FaCogs size={20} />
                                                </div>
                                            )}
                                            {item.newBearing && (
                                                <div className="flex-1">
                                                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                                        {item.oldBearing ? 'Новый подшипник' : 'Установленный подшипник'}
                                                    </div>
                                                    <div className="font-semibold text-green-700 dark:text-green-300 text-sm font-mono bg-green-50 dark:bg-green-900/20 rounded-md px-2 py-1">
                                                        {item.newBearing.type} ({item.newBearing.manufacturer}, {item.newBearing.supplier})
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {item.comment && (
                                    <div className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                                        <FaComment size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="break-words whitespace-normal text-gray-700 dark:text-gray-300">
                                            {item.comment}
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