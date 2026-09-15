// src/components/motor/MaintenanceReport.tsx

import { useState, useEffect } from 'react';
import { reportsApi } from '../../services/motor/api';
import type { MaintenanceReportItemDto, MaintenanceReportSummaryDto, PagedResult } from '../../types/motor/motor';
import { maintenanceTypeLabels, bearingPositionLabels, motorStatusLabels } from '../../utils/motor/locales';
import Pagination from '../common/Pagination';
import RangeDatePicker from '../common/RangeDatePicker';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    FaFilter, FaTimes, FaInfoCircle, FaCalendarAlt, FaClock, FaUser, FaComment,
    FaBolt, FaWrench, FaCogs, FaOilCan, FaThLarge as LayoutGrid, FaTable as Table
} from 'react-icons/fa';
import { BearingIcon } from '../../icon/';

/**
 * Компонент отчёта по обслуживанию электродвигателей.
 * Позволяет выбрать период и тип работ, просмотреть детализированный список
 * записей обслуживания с пагинацией, а также сводку по типам работ.
 * Поддерживает два режима отображения: карточки (по умолчанию) и таблица.
 * На экранах меньше 768px доступен только режим карточек.
 * Полностью поддерживает светлую и тёмную тему.
 */
export default function MaintenanceReport() {
    // Состояния фильтров
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [workType, setWorkType] = useState<string>(''); // пустая строка = все типы

    // Состояния пагинации и данных отчёта
    const [reportItems, setReportItems] = useState<MaintenanceReportItemDto[]>([]);
    const [summary, setSummary] = useState<MaintenanceReportSummaryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Пагинация
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Режим отображения: 'card' или 'table'
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    // Флаг для определения мобильного экрана (ширина < 768px)
    const [isMobile, setIsMobile] = useState(false);

    // Отслеживание ширины экрана для адаптивности таблицы
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Если экран мобильный, принудительно переключаем на карточки
            if (mobile && viewMode === 'table') {
                setViewMode('card');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [viewMode]);

    // Загрузка детального отчёта
    const fetchReport = async () => {
        setLoading(true);
        try {
            const fromDate = dateRange[0] ? dateRange[0].toISOString() : undefined;
            const toDate = dateRange[1] ? dateRange[1].toISOString() : undefined;
            const data: PagedResult<MaintenanceReportItemDto> = await reportsApi.getMaintenanceReport(
                fromDate,
                toDate,
                workType || undefined,
                page,
                pageSize
            );
            setReportItems(data.items);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки отчёта');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка сводки
    const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
            const fromDate = dateRange[0] ? dateRange[0].toISOString() : undefined;
            const toDate = dateRange[1] ? dateRange[1].toISOString() : undefined;
            const data = await reportsApi.getMaintenanceReportSummary(fromDate, toDate);
            setSummary(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки сводки');
        } finally {
            setSummaryLoading(false);
        }
    };

    // При изменении фильтров или пагинации загружаем отчёт и сводку
    useEffect(() => {
        fetchReport();
    }, [page, pageSize, workType, dateRange]);

    useEffect(() => {
        fetchSummary();
    }, [dateRange, workType]);

    // Применение фильтров (сброс на первую страницу)
    const handleApplyFilters = () => {
        setPage(1);
        // fetchReport вызовется автоматически через useEffect
    };

    // Сброс всех фильтров
    const handleResetFilters = () => {
        setDateRange([null, null]);
        setWorkType('');
        setPage(1);
    };

    // Возвращает CSS-классы для цветового оформления типа работ
    const getWorkTypeStyle = (workType: string) => {
        switch (workType) {
            case 'Lubrication': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'BearingReplacement': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'StatorRewinding': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'ShaftRepair': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Иконка типа работ
    const getWorkTypeIcon = (workType: string) => {
        switch (workType) {
            case 'Lubrication': return <FaOilCan className="w-4 h-4" />;
            case 'BearingReplacement': return <BearingIcon className="w-4 h-4" />;
            case 'StatorRewinding': return <FaBolt className="w-4 h-4" />;
            case 'ShaftRepair': return <FaWrench className="w-4 h-4" />;
            default: return <FaCogs className="w-4 h-4" />;
        }
    };

    // Опции для выпадающего списка типов работ
    const workTypeOptions = [
        { value: '', label: 'Все типы' },
        ...Object.entries(maintenanceTypeLabels).map(([value, label]) => ({ value, label }))
    ];

    return (
        <div className="space-y-6">
            {/* Блок фильтрации */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-800/30">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Диапазон дат
                        </label>
                        <RangeDatePicker
                            startDate={dateRange[0]}
                            endDate={dateRange[1]}
                            onChange={setDateRange}
                            size="sm"
                        />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Тип работ
                        </label>
                        <select
                            value={workType}
                            onChange={(e) => setWorkType(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            {workTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                            <FaFilter size={16} />
                            Применить
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1 px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                        >
                            <FaTimes size={16} />
                            Сброс
                        </button>
                    </div>
                    {/* Переключатель режимов отображения (только если не мобильный) */}
                    {!isMobile && (
                        <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5 ml-auto">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'card'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                title="Просмотр карточками"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                title="Табличный просмотр"
                            >
                                <Table size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Сводка по типам работ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FaInfoCircle className="text-blue-500" />
                        Сводка за период
                    </h3>
                </div>
                <div className="p-4">
                    {summaryLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : summary.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет данных за выбранный период</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {summary.map(item => (
                                <div
                                    key={item.workType}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getWorkTypeStyle(item.workType)}`}
                                >
                                    {getWorkTypeIcon(item.workType)}
                                    <span>{maintenanceTypeLabels[item.workType] || item.workType}</span>
                                    <span className="ml-1 font-bold">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Детальный отчёт */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Детали записей обслуживания
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Всего записей: {totalCount}
                    </p>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : reportItems.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет записей обслуживания за выбранный период</p>
                    ) : viewMode === 'card' ? (
                        // Режим карточек
                        <div className="space-y-4">
                            {reportItems.map(item => {
                                const workTypeLabel = maintenanceTypeLabels[item.workType] || item.workType;
                                const workTypeStyle = getWorkTypeStyle(item.workType);
                                const workTypeIcon = getWorkTypeIcon(item.workType);

                                return (
                                    <div
                                        key={item.id}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Верхняя полоса с цветом типа работ */}
                                        <div className={`h-1.5 ${item.workType === 'Lubrication' ? 'bg-amber-500' :
                                            item.workType === 'BearingReplacement' ? 'bg-indigo-500' :
                                                item.workType === 'StatorRewinding' ? 'bg-purple-500' : 'bg-cyan-500'
                                            }`}></div>

                                        <div className="p-5">
                                            {/* Шапка: тип работ, дата, позиция подшипника */}
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

                                            {/* Информация о двигателе */}
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

                                            {/* Исполнитель */}
                                            {item.performedBy && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                    <FaUser size={14} className="text-gray-400" />
                                                    <span className="font-medium">Выполнил:</span>
                                                    <span>{item.performedBy}</span>
                                                </div>
                                            )}

                                            {/* Детали в зависимости от типа работ */}
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
                    ) : (
                        // Табличный режим
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
                                    {reportItems.map(item => (
                                        <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                                {format(new Date(item.date), 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="p-3 align-top whitespace-normal break-words">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${getWorkTypeStyle(item.workType)}`}>
                                                    {getWorkTypeIcon(item.workType)}
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
                    )}
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setPage(1);
                        }}
                        totalCount={totalCount}
                        pageSizeOptions={[5, 10, 25, 50, 100]}
                    />
                </div>
            </div>
        </div>
    );
}