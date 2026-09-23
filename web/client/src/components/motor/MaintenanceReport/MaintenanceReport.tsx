// src/components/motor/MaintenanceReport/MaintenanceReport.tsx

import { useState, useEffect } from 'react';
import { useIsMobile, useMaintenanceReport } from '../../../hooks/motor';
import Pagination from '../../common/Pagination';
import RangeDatePicker from '../../common/RangeDatePicker';
import { maintenanceTypeLabels } from '../../../utils/motor/locales';
import { BearingIcon } from '../../../icons/';
import MaintenanceReportCardView from './MaintenanceReportCardView';
import MaintenanceReportTableView from './MaintenanceReportTableView';
import {
    FaFilter, FaTimes, FaInfoCircle, FaOilCan, FaBolt, FaWrench, FaCogs,
    FaThLarge as LayoutGrid, FaTable as Table,
} from 'react-icons/fa';

/**
 * Возвращает цветовые классы для типа работ (используется в блоке сводки).
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
 * Возвращает иконку для типа работ (используется в блоке сводки).
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
 * Компонент отчёта по обслуживанию электродвигателей.
 * Позволяет выбрать период и тип работ, просмотреть детализированный список
 * записей обслуживания с пагинацией, а также сводку по типам работ.
 * Поддерживает два режима отображения: карточки (по умолчанию) и таблица.
 * На экранах меньше 768px доступен только режим карточек.
 * Полностью поддерживает светлую и тёмную тему.
 */
export default function MaintenanceReport() {
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

    const {
        dateRange,
        setDateRange,
        workType,
        setWorkType,
        reportItems,
        summary,
        loading,
        summaryLoading,
        page,
        pageSize,
        totalPages,
        totalCount,
        setPage,
        setPageSize,
        applyFilters,
        resetFilters,
    } = useMaintenanceReport();

    // Принудительное переключение на карточки при мобильном экране
    useEffect(() => {
        if (isMobile && viewMode === 'table') {
            setViewMode('card');
        }
    }, [isMobile, viewMode]);

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
                            onClick={applyFilters}
                            className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                            <FaFilter size={16} />
                            Применить
                        </button>
                        <button
                            onClick={resetFilters}
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
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                title="Просмотр карточками"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
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
                        <MaintenanceReportCardView items={reportItems} />
                    ) : (
                        <MaintenanceReportTableView items={reportItems} />
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