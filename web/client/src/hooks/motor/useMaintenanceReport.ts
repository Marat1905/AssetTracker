import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportsApi } from '../../services/motor/api';
import type {
    MaintenanceReportItemDto,
    MaintenanceReportSummaryDto,
    PagedResult,
} from '../../types/motor/motor';

/**
 * Хук управления состоянием отчёта по обслуживанию.
 * Загружает детальный отчёт и сводку, управляет фильтрами и пагинацией.
 */
export function useMaintenanceReport() {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [workType, setWorkType] = useState<string>('');

    const [reportItems, setReportItems] = useState<MaintenanceReportItemDto[]>([]);
    const [summary, setSummary] = useState<MaintenanceReportSummaryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    /**
     * Загружает детальный отчёт с пагинацией.
     */
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

    /**
     * Загружает сводку по типам работ.
     */
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

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, workType, dateRange]);

    useEffect(() => {
        fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, workType]);

    /**
     * Применяет фильтры (сброс на первую страницу).
     */
    const applyFilters = () => {
        setPage(1);
    };

    /**
     * Сбрасывает все фильтры.
     */
    const resetFilters = () => {
        setDateRange([null, null]);
        setWorkType('');
        setPage(1);
    };

    return {
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
    };
}