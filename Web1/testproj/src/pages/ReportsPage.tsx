import { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import type { MaintenanceReportItemDto, MaintenanceReportSummaryDto } from '../types';
import { maintenanceTypeLabels, bearingPositionLabels } from '../utils/locales';
import Pagination from '../components/Pagination';
import { Filter, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Страница отчётов по обслуживанию.
 * Позволяет выбрать период и тип работ, отображает сводку и детализированный список с пагинацией.
 */
export default function ReportsPage() {
    // Фильтры
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [workType, setWorkType] = useState<string>('');

    // Данные
    const [summary, setSummary] = useState<MaintenanceReportSummaryDto[]>([]);
    const [items, setItems] = useState<MaintenanceReportItemDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // Загрузка сводки
    const loadSummary = async () => {
        setLoadingSummary(true);
        try {
            const data = await reportsApi.getMaintenanceReportSummary(
                fromDate || undefined,
                toDate || undefined
            );
            setSummary(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки сводки');
        } finally {
            setLoadingSummary(false);
        }
    };

    // Загрузка детализированного отчёта
    const loadReport = async () => {
        setLoading(true);
        try {
            const data = await reportsApi.getMaintenanceReport(
                fromDate || undefined,
                toDate || undefined,
                workType || undefined,
                currentPage,
                pageSize
            );
            setItems(data.items);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки отчёта');
        } finally {
            setLoading(false);
        }
    };

    // При изменении фильтров или пагинации перезагружаем отчёт
    useEffect(() => {
        loadReport();
    }, [fromDate, toDate, workType, currentPage, pageSize]);

    // При изменении фильтров также перезагружаем сводку (и сбрасываем страницу)
    useEffect(() => {
        setCurrentPage(1);
        loadSummary();
    }, [fromDate, toDate]);

    // Применить фильтры (сброс страницы уже выполнен в useEffect)
    const handleApplyFilters = () => {
        setCurrentPage(1);
        // loadReport и loadSummary вызовутся автоматически через useEffect
    };

    // Сброс всех фильтров
    const handleResetFilters = () => {
        setFromDate('');
        setToDate('');
        setWorkType('');
        setCurrentPage(1);
    };

    // Опции для выбора типа работ
    const workTypeOptions = [
        { value: '', label: 'Все типы' },
        ...Object.entries(maintenanceTypeLabels).map(([value, label]) => ({ value, label }))
    ];

    // Форматирование даты для отображения
    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('ru-RU');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-h">Отчёты по обслуживанию</h1>
            </div>

            {/* Блок фильтров */}
            <div className="card p-4 bg-gray-50 dark:bg-slate-800/30">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[160px]">
                        <label className="form-label text-xs">Дата с</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="form-input py-1.5"
                        />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                        <label className="form-label text-xs">Дата по</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="form-input py-1.5"
                        />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                        <label className="form-label text-xs">Тип работ</label>
                        <select
                            value={workType}
                            onChange={(e) => setWorkType(e.target.value)}
                            className="form-input py-1.5"
                        >
                            {workTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleApplyFilters} className="btn-primary py-1.5 px-4 inline-flex items-center gap-1">
                            <Filter size={16} />
                            Применить
                        </button>
                        <button onClick={handleResetFilters} className="btn-secondary py-1.5 px-4 inline-flex items-center gap-1">
                            <X size={16} />
                            Сброс
                        </button>
                    </div>
                </div>
            </div>

            {/* Сводка по типам работ */}
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-text-h">Сводка за период</h2>
                </div>
                <div className="p-6">
                    {loadingSummary ? (
                        <div className="text-center py-4">Загрузка сводки...</div>
                    ) : summary.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">Нет данных за выбранный период</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {summary.map((item) => (
                                <div
                                    key={item.workType}
                                    className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-center"
                                >
                                    <div className="text-2xl font-bold text-accent">{item.count}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {maintenanceTypeLabels[item.workType] || item.workType}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Детализированный отчёт с пагинацией */}
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-lg font-semibold text-text-h">Детализация записей</h2>
                    <div className="text-sm text-gray-500">
                        Найдено записей: {totalCount}
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    {loading && items.length === 0 ? (
                        <div className="p-12 text-center">Загрузка данных...</div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">Нет записей обслуживания за выбранный период</div>
                    ) : (
                        <table className="table w-full min-w-[800px]">
                            <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Тип работ</th>
                                    <th>Двигатель</th>
                                    <th>Позиция подшипника</th>
                                    <th>Смазка / Подшипник</th>
                                    <th>Исполнитель</th>
                                    <th>Комментарий</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="whitespace-nowrap">{formatDateTime(item.date)}</td>
                                        <td>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent-dark text-sm">
                                                {maintenanceTypeLabels[item.workType] || item.workType}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {item.motorInventoryNumber ? `№${item.motorInventoryNumber}` : `ID:${item.motorId}`}
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    {item.motorType}, {item.motorPower} кВт, {item.motorSpeed} об/мин
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    {item.motorCurrentLocation}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {item.bearingPosition ? (
                                                <span className="text-sm">
                                                    {bearingPositionLabels[item.bearingPosition] || item.bearingPosition}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            {item.workType === 'Lubrication' && (
                                                <span className="text-sm">{item.lubricantTypeName || '—'}</span>
                                            )}
                                            {item.workType === 'BearingReplacement' && (
                                                <div className="text-sm flex flex-wrap items-center gap-1">
                                                    {item.oldBearing && item.newBearing &&
                                                        item.oldBearing.type === item.newBearing.type &&
                                                        item.oldBearing.manufacturer === item.newBearing.manufacturer &&
                                                        item.oldBearing.supplier === item.newBearing.supplier ? (
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {item.newBearing.type} ({item.newBearing.manufacturer})
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {item.oldBearing && (
                                                                <span className="line-through text-gray-400 mr-1">
                                                                    {item.oldBearing.type}
                                                                </span>
                                                            )}
                                                            {item.oldBearing && item.newBearing && <ArrowRight size={14} className="inline mx-1 text-accent" />}
                                                            {item.newBearing && (
                                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                                    {item.newBearing.type} ({item.newBearing.manufacturer})
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {item.workType !== 'Lubrication' && item.workType !== 'BearingReplacement' && (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap">{item.performedBy || '—'}</td>
                                        <td className="max-w-xs break-words whitespace-normal">
                                            {item.comment || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(1);
                        }}
                        totalCount={totalCount}
                    />
                </div>
            </div>
        </div>
    );
}