import { format } from 'date-fns';
import {
    FaComment,
    FaOilCan,
} from 'react-icons/fa';
import type { MaintenanceReportItemDto } from '../../../types/motor/motor';
import { maintenanceTypeLabels, bearingPositionLabels } from '../../../utils/motor/locales';

/**
 * Свойства компонента табличного отображения детального отчёта по обслуживанию.
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
 * Табличный режим отображения детального отчёта по обслуживанию.
 */
export default function MaintenanceReportTableView({ items }: Props) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[22%]" />
                    <col className="w-[15%]" />
                    <col className="w-[27%]" />
                </colgroup>
                <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Дата</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Тип работ</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Позиция</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Двигатель</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Исполнитель</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Комментарий / Детали</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                {format(new Date(item.date), 'dd.MM.yyyy HH:mm')}
                            </td>
                            <td className="p-3 align-top whitespace-normal break-words">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${getWorkTypeStyle(item.workType)}`}>
                                    {maintenanceTypeLabels[item.workType] || item.workType}
                                </span>
                            </td>
                            <td className="p-3 align-top whitespace-normal break-words text-gray-700 dark:text-gray-300">
                                {(item.workType === 'Lubrication' || item.workType === 'BearingReplacement') && item.bearingPosition ? (
                                    <span className="text-sm">
                                        {bearingPositionLabels[item.bearingPosition] || (item.bearingPosition === 'Front' ? 'Передний' : 'Задний')}
                                    </span>
                                ) : '—'}
                            </td>
                            <td className="p-3 align-top whitespace-normal break-words">
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {item.motorInventoryNumber ? `№${item.motorInventoryNumber}` : `ID ${item.motorId}`}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                        {item.motorType} ({item.motorPower} кВт, {item.motorSpeed} об/мин)
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                        {item.motorCurrentLocation || '—'}
                                    </div>
                                </div>
                            </td>
                            <td className="p-3 align-top whitespace-normal break-words text-gray-700 dark:text-gray-300">
                                {item.performedBy || '—'}
                            </td>
                            <td className="p-3 align-top whitespace-normal break-words">
                                {item.workType === 'Lubrication' && (
                                    <div className="flex items-center gap-1 text-sm">
                                        <FaOilCan size={14} className="text-amber-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{item.lubricantTypeName || '—'}</span>
                                    </div>
                                )}
                                {item.workType === 'BearingReplacement' && (
                                    <div className="text-sm space-y-1">
                                        {item.oldBearing && (
                                            <div className="text-gray-500 line-through">
                                                Старый: {item.oldBearing.type}
                                            </div>
                                        )}
                                        {item.newBearing && (
                                            <div className="text-green-600 dark:text-green-400 font-medium">
                                                Новый: {item.newBearing.type} ({item.newBearing.manufacturer})
                                            </div>
                                        )}
                                    </div>
                                )}
                                {item.comment && (
                                    <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <FaComment size={12} className="mt-0.5 flex-shrink-0" />
                                        <span className="break-words whitespace-normal">{item.comment}</span>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}