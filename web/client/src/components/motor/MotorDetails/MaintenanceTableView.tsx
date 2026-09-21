import { format } from 'date-fns';
import {
    FaArrowRight as ArrowRight,
    FaEdit as Edit,
    FaTrashAlt as Trash2,
} from 'react-icons/fa';
import type { MaintenanceLogDto } from '../../../types/motor/motor';
import { maintenanceTypeLabels, bearingPositionLabels } from '../../../utils/motor/locales';

/**
 * Свойства компонента табличного отображения журнала обслуживания.
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
 * Табличный режим отображения журнала обслуживания.
 * Использует table-layout: fixed и перенос слов для предотвращения горизонтальной прокрутки.
 */
export default function MaintenanceTableView({
    items,
    isAdminOrElectric,
    isEditable,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="w-full">
            <table className="w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                    <col className="w-[20%]" />
                    <col className="w-[12%]" />
                    <col className="w-[24%]" />
                    {isAdminOrElectric && <col className="w-[10%]" />}
                </colgroup>
                <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Дата</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Тип работ</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Позиция</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Смазка / Подшипник</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Исполнитель</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Комментарий</th>
                        {isAdminOrElectric && <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map(log => {
                        const editable = isEditable(log);
                        return (
                            <tr key={log.id} className="border-b border-gray-100 dark:border-slate-700">
                                <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                    {format(new Date(log.date), 'dd.MM.yyyy HH:mm')}
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm">
                                        {maintenanceTypeLabels[log.workType] || log.workType}
                                    </span>
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words text-gray-700 dark:text-gray-300">
                                    {log.bearingPosition ? (
                                        <span className="text-sm">
                                            {bearingPositionLabels[log.bearingPosition] || (log.bearingPosition === 'Front' ? 'Передний' : 'Задний')}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words">
                                    {log.workType === 'Lubrication' && (
                                        <span className="text-sm break-words text-gray-700 dark:text-gray-300">{log.lubricantTypeName || '—'}</span>
                                    )}
                                    {log.workType === 'BearingReplacement' && (
                                        <div className="text-sm flex flex-wrap items-center gap-1 break-words">
                                            {log.oldBearing && log.newBearing && log.oldBearing.type === log.newBearing.type &&
                                                log.oldBearing.manufacturer === log.newBearing.manufacturer &&
                                                log.oldBearing.supplier === log.newBearing.supplier ? (
                                                <span className="text-gray-600 dark:text-gray-400 break-words">
                                                    {log.newBearing.type} ({log.newBearing.manufacturer})
                                                </span>
                                            ) : (
                                                <>
                                                    {log.oldBearing && (
                                                        <span className="line-through text-gray-400 mr-1 break-words">
                                                            {log.oldBearing.type}
                                                        </span>
                                                    )}
                                                    {log.oldBearing && log.newBearing && <ArrowRight size={14} className="inline mx-1 text-blue-500 flex-shrink-0" />}
                                                    {log.newBearing && (
                                                        <span className="font-semibold text-green-600 dark:text-green-400 break-words">
                                                            {log.newBearing.type} ({log.newBearing.manufacturer})
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {log.workType !== 'Lubrication' && log.workType !== 'BearingReplacement' && (
                                        <span className="text-sm text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words text-gray-700 dark:text-gray-300">
                                    {log.performedBy ? (
                                        <span className="text-sm break-words">{log.performedBy}</span>
                                    ) : '—'}
                                </td>
                                <td className="p-3 align-top whitespace-normal break-words">
                                    {log.comment ? (
                                        <span className="text-sm text-gray-600 dark:text-gray-400 break-words whitespace-normal">
                                            {log.comment}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                                    )}
                                </td>
                                {isAdminOrElectric && (
                                    <td className="p-3 align-top whitespace-normal">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(log)}
                                                disabled={log.workType === 'BearingReplacement' && !editable}
                                                className={`transition-colors ${log.workType === 'BearingReplacement' && !editable
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'}`}
                                                title={log.workType === 'BearingReplacement' && !editable ? 'Редактирование только для последней записи' : 'Редактировать запись'}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(log)}
                                                disabled={log.workType === 'BearingReplacement' && !editable}
                                                className={`transition-colors ${log.workType === 'BearingReplacement' && !editable
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'}`}
                                                title={log.workType === 'BearingReplacement' && !editable ? 'Удаление только для последней записи' : 'Удалить запись'}
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