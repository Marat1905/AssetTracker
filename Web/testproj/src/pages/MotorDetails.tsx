// pages/MotorDetails.tsx
/**
 * Страница детальной информации о двигателе.
 * Отображает паспортные данные, историю перемещений и журнал обслуживания в трёх вкладках.
 * Поддерживает добавление/редактирование/удаление записей.
 * Для замены подшипника и истории перемещений разрешает редактирование/удаление только последней записи.
 * Реализована фильтрация журнала обслуживания по типу работ и периоду.
 */
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MotorHistory from '../components/MotorHistory';
import EditMotorModal from '../components/EditMotorModal';
import MoveMotorForm from '../components/MoveMotorForm';
import MaintenanceForm from '../components/MaintenanceForm';
import EditMaintenanceModal from '../components/EditMaintenanceModal';
import EditLocationModal from '../components/EditLocationModal';
import { motorApi } from '../services/api';
import type { MotorFullHistoryDto, LocationHistoryDto, MaintenanceLogDto, MaintenanceType } from '../types';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { maintenanceTypeLabels, bearingPositionLabels } from '../utils/locales';
import { Map, ClipboardList, PlusCircle, ArrowRight, Edit, Trash2, Info, Filter, X, Settings } from 'lucide-react';

export default function MotorDetails() {
    // Получаем идентификатор двигателя из URL
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const motorId = parseInt(id || '0', 10);

    // Состояния данных
    const [motorData, setMotorData] = useState<MotorFullHistoryDto | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'passport' | 'location' | 'maintenance'>('passport');

    // Модальные окна для добавления записей
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // Модальное окно редактирования записи обслуживания
    const [editingLog, setEditingLog] = useState<MaintenanceLogDto | null>(null);

    // Модальное окно редактирования записи перемещения
    const [editingLocation, setEditingLocation] = useState<LocationHistoryDto | null>(null);

    // Пагинация истории перемещений
    const [locationHistory, setLocationHistory] = useState<LocationHistoryDto[]>([]);
    const [locationPage, setLocationPage] = useState(1);
    const [locationTotalPages, setLocationTotalPages] = useState(1);
    const [locationTotalCount, setLocationTotalCount] = useState(0);
    const [locationPageSize, setLocationPageSize] = useState(5);

    // Пагинация и фильтрация журнала обслуживания
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogDto[]>([]);
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);
    const [maintenanceTotalCount, setMaintenanceTotalCount] = useState(0);
    const [maintenancePageSize, setMaintenancePageSize] = useState(5);
    // Фильтры для журнала обслуживания
    const [maintenanceWorkType, setMaintenanceWorkType] = useState<string>('');          // пустая строка = все типы
    const [maintenanceFromDate, setMaintenanceFromDate] = useState<string>('');
    const [maintenanceToDate, setMaintenanceToDate] = useState<string>('');

    /**
     * Загружает паспортные данные двигателя и полную историю (используется для отображения последней смазки и т.д.)
     */
    const loadMotorData = async () => {
        if (isNaN(motorId) || motorId <= 0) return;
        try {
            const data = await motorApi.getFullHistory(motorId);
            setMotorData(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки данных двигателя');
        }
    };

    /**
     * Загружает пагинированную историю перемещений для вкладки "История перемещений"
     */
    const loadLocationHistory = async () => {
        try {
            const data = await motorApi.getLocationHistoryPaged(motorId, locationPage, locationPageSize);
            setLocationHistory(data.items);
            setLocationTotalPages(data.totalPages);
            setLocationTotalCount(data.totalCount);
        } catch (err: any) {
            toast.error('Ошибка загрузки истории перемещений');
        }
    };

    /**
     * Загружает пагинированный журнал обслуживания с учётом фильтров
     */
    const loadMaintenanceLogs = async () => {
        try {
            const data = await motorApi.getMaintenanceLogsPaged(
                motorId,
                maintenancePage,
                maintenancePageSize,
                maintenanceWorkType || undefined,
                maintenanceFromDate || undefined,
                maintenanceToDate || undefined
            );
            setMaintenanceLogs(data.items);
            setMaintenanceTotalPages(data.totalPages);
            setMaintenanceTotalCount(data.totalCount);
        } catch (err: any) {
            toast.error('Ошибка загрузки журнала обслуживания');
        }
    };

    // Загружаем все данные при изменении параметров пагинации, фильтров или ID двигателя
    useEffect(() => {
        if (!isNaN(motorId) && motorId > 0) {
            loadMotorData();
            loadLocationHistory();
            loadMaintenanceLogs();
        }
    }, [motorId, locationPage, locationPageSize, maintenancePage, maintenancePageSize, maintenanceWorkType, maintenanceFromDate, maintenanceToDate]);

    /**
     * Применяет фильтры журнала обслуживания (сбрасывает на первую страницу)
     */
    const handleApplyMaintenanceFilters = () => {
        setMaintenancePage(1);
        // loadMaintenanceLogs вызовется автоматически через useEffect
    };

    /**
     * Сбрасывает все фильтры журнала обслуживания
     */
    const handleResetMaintenanceFilters = () => {
        setMaintenanceWorkType('');
        setMaintenanceFromDate('');
        setMaintenanceToDate('');
        setMaintenancePage(1);
    };

    /**
     * Удаление двигателя (безвозвратно)
     */
    const handleDelete = async () => {
        if (!confirm('Удалить двигатель без возможности восстановления?')) return;
        try {
            await motorApi.deleteMotor(motorId);
            toast.success('Двигатель удалён');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    /**
     * Обновляет все данные после изменений (перемещение, обслуживание, редактирование)
     */
    const refreshAll = () => {
        loadMotorData();
        loadLocationHistory();
        loadMaintenanceLogs();
    };

    /**
     * Проверяет, является ли запись истории перемещений последней (самой новой).
     * Последней считается запись с максимальной датой StartDate.
     * @param location - запись истории перемещений
     * @returns true, если запись последняя
     */
    const isLastLocationRecord = (location: LocationHistoryDto): boolean => {
        if (locationHistory.length === 0) return false;
        // Находим запись с максимальной датой начала
        const lastRecord = locationHistory.reduce((prev, current) =>
            new Date(current.startDate) > new Date(prev.startDate) ? current : prev
        );
        return lastRecord.id === location.id;
    };

    /**
     * Открывает модальное окно редактирования записи истории перемещений.
     * Редактировать можно только последнюю запись (активную или последнюю закрытую).
     * @param location - запись истории перемещений
     */
    const handleEditLocation = (location: LocationHistoryDto) => {
        if (!isLastLocationRecord(location)) {
            toast.error('Редактирование разрешено только для последней записи истории перемещений.');
            return;
        }
        setEditingLocation(location);
    };

    /**
     * Удаляет запись истории перемещений с проверкой целостности временной линии.
     * Удалять можно только последнюю запись (активную или последнюю закрытую).
     * Нельзя удалить единственную запись.
     * При удалении активной записи предыдущая становится активной (бекенд обрабатывает это).
     * @param location - запись истории перемещений
     */
    const handleDeleteLocation = async (location: LocationHistoryDto) => {
        if (locationHistory.length === 1) {
            toast.error('Нельзя удалить единственную запись – двигатель должен иметь текущее местоположение');
            return;
        }
        if (!isLastLocationRecord(location)) {
            toast.error('Удаление разрешено только для последней записи истории перемещений.');
            return;
        }
        if (!confirm('Удалить запись о перемещении? Это может изменить текущее местоположение двигателя.')) return;
        try {
            await motorApi.deleteLocationHistory(motorId, location.id);
            toast.success('Запись перемещения удалена');
            await loadLocationHistory();
            await loadMotorData(); // Обновляем данные, так как текущее местоположение могло измениться
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Ошибка удаления';
            toast.error(errorMsg);
        }
    };

    /**
     * Проверяет, можно ли редактировать или удалять запись замены подшипника.
     * Правило: разрешено только для последней (самой новой) записи замены для данной позиции (передний/задний).
     * @param log - запись обслуживания
     * @returns true, если запись можно редактировать/удалять
     */
    const canEditOrDeleteBearingLog = (log: MaintenanceLogDto): boolean => {
        // Если это не замена подшипника, всегда можно
        if (log.workType !== 'BearingReplacement') return true;

        // Находим все записи замены подшипника для той же позиции и сортируем по дате (сначала новые)
        const samePositionLogs = maintenanceLogs
            .filter(l => l.workType === 'BearingReplacement' && l.bearingPosition === log.bearingPosition)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (samePositionLogs.length === 0) return true;
        // Последняя запись — это первая в отсортированном списке
        const isLast = samePositionLogs[0].id === log.id;
        return isLast;
    };

    /**
     * Открывает модальное окно редактирования записи обслуживания.
     * Для замены подшипника предварительно проверяет, что запись последняя.
     */
    const handleEditLog = (log: MaintenanceLogDto) => {
        if (log.workType === 'BearingReplacement' && !canEditOrDeleteBearingLog(log)) {
            toast.error('Редактирование разрешено только для последней записи замены подшипника. Удалите более поздние записи, чтобы изменить эту.');
            return;
        }
        setEditingLog(log);
    };

    /**
     * Удаляет запись обслуживания.
     * Для замены подшипника проверяет, что запись последняя, иначе отклоняет.
     */
    const handleDeleteLog = async (log: MaintenanceLogDto) => {
        if (log.workType === 'BearingReplacement' && !canEditOrDeleteBearingLog(log)) {
            toast.error('Удаление разрешено только для последней записи замены подшипника. Сначала удалите более поздние записи.');
            return;
        }
        if (!confirm('Удалить запись обслуживания?')) return;
        try {
            await motorApi.deleteMaintenanceLog(motorId, log.id);
            toast.success('Запись удалена');
            loadMaintenanceLogs();
            loadMotorData(); // Обновляем данные, так как мог измениться текущий подшипник (при откате)
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    // Обработка некорректного ID
    if (isNaN(motorId) || motorId <= 0) {
        return (
            <div className="card p-8 text-center">
                <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-text-h mb-2">Неверный идентификатор</h2>
                <p className="text-gray-500 mb-6">Пожалуйста, проверьте номер двигателя</p>
                <Link to="/" className="btn-primary inline-flex">Вернуться к списку</Link>
            </div>
        );
    }

    // Массив типов работ для выпадающего списка фильтра
    const workTypeOptions = [
        { value: '', label: 'Все типы' },
        ...Object.entries(maintenanceTypeLabels).map(([value, label]) => ({ value, label }))
    ];

    return (
        <div className="animate-fade-in">
            {/* Верхняя панель: кнопки назад, редактировать, удалить */}
            <div className="flex justify-between items-center mb-6">
                <Link to="/" className="inline-flex items-center text-accent hover:text-accent-dark transition-colors group">
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Назад к списку
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-secondary inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Редактировать
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-secondary inline-flex items-center gap-1 text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                    </button>
                </div>
            </div>

            {/* Вкладки: паспортные данные, история перемещений, журнал обслуживания */}
            <div className="mt-2">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('passport')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'passport'
                                ? 'border-b-2 border-accent text-accent'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Settings size={18} />
                            Паспортные данные
                        </button>
                        <button
                            onClick={() => setActiveTab('location')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'location'
                                ? 'border-b-2 border-accent text-accent'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Map size={18} />
                            История перемещений
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'maintenance'
                                ? 'border-b-2 border-accent text-accent'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <ClipboardList size={18} />
                            Журнал обслуживания и ремонтов
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {/* Вкладка "Паспортные данные" */}
                    {activeTab === 'passport' && motorData && (
                        <MotorHistory motorData={motorData} onMotorUpdated={refreshAll} />
                    )}

                    {/* Вкладка "История перемещений" */}
                    {activeTab === 'location' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                {/* Подсказка о правиле редактирования истории перемещений */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                    <Info size={14} />
                                    <span>Только последнюю запись истории перемещений можно редактировать/удалять</span>
                                </div>
                                <button
                                    onClick={() => setIsMoveModalOpen(true)}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    <PlusCircle size={18} />
                                    Добавить перемещение
                                </button>
                            </div>
                            <div className="card">
                                <div className="p-6">
                                    {locationHistory.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">Нет записей о перемещениях</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {locationHistory.map((loc) => {
                                                const isLast = isLastLocationRecord(loc);
                                                return (
                                                    <div key={loc.id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-accent/30">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent shadow-md"></div>
                                                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-text-h">{loc.location}</p>
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        {new Date(loc.startDate).toLocaleString('ru-RU')} – {loc.endDate ? new Date(loc.endDate).toLocaleString('ru-RU') : 'настоящее время'}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 ml-4">
                                                                    <button
                                                                        onClick={() => handleEditLocation(loc)}
                                                                        disabled={!isLast}
                                                                        className={`transition-colors ${!isLast
                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                                                            }`}
                                                                        title={!isLast ? 'Редактирование разрешено только для последней записи' : 'Редактировать местоположение'}
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteLocation(loc)}
                                                                        disabled={!isLast}
                                                                        className={`transition-colors ${!isLast
                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                            : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                                                            }`}
                                                                        title={!isLast ? 'Удаление разрешено только для последней записи' : 'Удалить запись'}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <Pagination
                                        currentPage={locationPage}
                                        totalPages={locationTotalPages}
                                        onPageChange={setLocationPage}
                                        pageSize={locationPageSize}
                                        onPageSizeChange={(newSize) => {
                                            setLocationPageSize(newSize);
                                            setLocationPage(1);
                                        }}
                                        totalCount={locationTotalCount}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Вкладка "Журнал обслуживания" */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                {/* Подсказка о правиле редактирования замен подшипников */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                    <Info size={14} />
                                    <span>Только последнюю запись замены подшипника можно редактировать/удалять</span>
                                </div>
                                <button onClick={() => setIsMaintenanceModalOpen(true)} className="btn-primary inline-flex items-center gap-2">
                                    <PlusCircle size={18} /> Добавить запись обслуживания
                                </button>
                            </div>

                            {/* Блок фильтрации */}
                            <div className="card p-4 bg-gray-50 dark:bg-slate-800/30">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="form-label text-xs">Тип работ</label>
                                        <select
                                            value={maintenanceWorkType}
                                            onChange={(e) => setMaintenanceWorkType(e.target.value)}
                                            className="form-input py-1.5"
                                        >
                                            {workTypeOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="form-label text-xs">Дата с</label>
                                        <input
                                            type="date"
                                            value={maintenanceFromDate}
                                            onChange={(e) => setMaintenanceFromDate(e.target.value)}
                                            className="form-input py-1.5"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="form-label text-xs">Дата по</label>
                                        <input
                                            type="date"
                                            value={maintenanceToDate}
                                            onChange={(e) => setMaintenanceToDate(e.target.value)}
                                            className="form-input py-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleApplyMaintenanceFilters} className="btn-primary py-1.5 px-4 inline-flex items-center gap-1">
                                            <Filter size={16} />
                                            Применить
                                        </button>
                                        <button onClick={handleResetMaintenanceFilters} className="btn-secondary py-1.5 px-4 inline-flex items-center gap-1">
                                            <X size={16} />
                                            Сброс
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="p-6">
                                    {maintenanceLogs.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">Нет записей об обслуживании</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {maintenanceLogs.map(log => {
                                                const isEditable = canEditOrDeleteBearingLog(log);
                                                return (
                                                    <div key={log.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                                            <span className="font-semibold text-text-h px-2 py-1 bg-accent/10 rounded-lg text-sm">
                                                                {maintenanceTypeLabels[log.workType] || log.workType}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString('ru-RU')}</span>
                                                                <button
                                                                    onClick={() => handleEditLog(log)}
                                                                    disabled={log.workType === 'BearingReplacement' && !isEditable}
                                                                    className={`transition-colors ${log.workType === 'BearingReplacement' && !isEditable
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                                                        }`}
                                                                    title={log.workType === 'BearingReplacement' && !isEditable ? 'Редактирование только для последней записи' : 'Редактировать запись'}
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLog(log)}
                                                                    disabled={log.workType === 'BearingReplacement' && !isEditable}
                                                                    className={`transition-colors ${log.workType === 'BearingReplacement' && !isEditable
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                                                        }`}
                                                                    title={log.workType === 'BearingReplacement' && !isEditable ? 'Удаление только для последней записи' : 'Удалить запись'}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {/* Отображение для смазки */}
                                                        {log.workType === 'Lubrication' && (
                                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <span className="font-medium">Позиция подшипника:</span> {bearingPositionLabels[log.bearingPosition || ''] || (log.bearingPosition === 'Front' ? 'Передний' : log.bearingPosition === 'Rear' ? 'Задний' : log.bearingPosition || '—')}
                                                                {log.lubricantTypeName && (
                                                                    <> &nbsp;|&nbsp;
                                                                        <span className="font-medium">Смазка:</span> {log.lubricantTypeName}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Отображение для замены подшипника */}
                                                        {log.workType === 'BearingReplacement' && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                                    <span className="font-medium">Позиция:</span>
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700">
                                                                        <span>⚙️</span>
                                                                        {bearingPositionLabels[log.bearingPosition || ''] || (log.bearingPosition === 'Front' ? 'Передний' : log.bearingPosition === 'Rear' ? 'Задний' : log.bearingPosition || '—')}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                                                                    {log.oldBearing && log.newBearing && log.oldBearing.type === log.newBearing.type && log.oldBearing.manufacturer === log.newBearing.manufacturer && log.oldBearing.supplier === log.newBearing.supplier ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="font-medium text-gray-500 dark:text-gray-400">Подшипник:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                                                {log.newBearing.type} ({log.newBearing.manufacturer}, {log.newBearing.supplier})
                                                                            </span>
                                                                            <span className="text-xs text-gray-400 ml-1">(не изменялся)</span>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            {log.oldBearing && (
                                                                                <div className="flex flex-col gap-0.5">
                                                                                    <span className="font-medium text-gray-500 dark:text-gray-400">Старый:</span>
                                                                                    <span className="line-through text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                                                        {log.oldBearing.type} ({log.oldBearing.manufacturer}, {log.oldBearing.supplier})
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {log.oldBearing && log.newBearing && <ArrowRight size={16} className="text-accent flex-shrink-0" />}
                                                                            {log.newBearing && (
                                                                                <div className="flex flex-col gap-0.5">
                                                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                                                        {log.oldBearing ? 'Новый:' : 'Установлен:'}
                                                                                    </span>
                                                                                    <span className="font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-md">
                                                                                        {log.newBearing.type} ({log.newBearing.manufacturer}, {log.newBearing.supplier})
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {log.comment && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pt-1 border-t border-gray-100 dark:border-slate-700">
                                                                {log.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <Pagination
                                        currentPage={maintenancePage}
                                        totalPages={maintenanceTotalPages}
                                        onPageChange={setMaintenancePage}
                                        pageSize={maintenancePageSize}
                                        onPageSizeChange={(newSize) => {
                                            setMaintenancePageSize(newSize);
                                            setMaintenancePage(1);
                                        }}
                                        totalCount={maintenanceTotalCount}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно перемещения */}
            {isMoveModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsMoveModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                                    <Map size={20} className="text-accent" />
                                    Перемещение двигателя
                                </h3>
                            </div>
                            <MoveMotorForm
                                motorId={motorId}
                                currentStatus={motorData?.status}
                                onMoved={() => {
                                    loadLocationHistory();
                                    loadMotorData();
                                    setIsMoveModalOpen(false);
                                }}
                                onCancel={() => setIsMoveModalOpen(false)}
                                isModal={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно добавления обслуживания */}
            {isMaintenanceModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsMaintenanceModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                                    <ClipboardList size={20} className="text-accent" />
                                    Запись обслуживания / ремонта
                                </h3>
                            </div>
                            <MaintenanceForm
                                motorId={motorId}
                                motorData={motorData}
                                onAdded={() => {
                                    loadMaintenanceLogs();
                                    loadMotorData();
                                    setIsMaintenanceModalOpen(false);
                                }}
                                onCancel={() => setIsMaintenanceModalOpen(false)}
                                isModal={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования записи обслуживания */}
            {editingLog && (
                <EditMaintenanceModal
                    isOpen={!!editingLog}
                    motorId={motorId}
                    log={editingLog}
                    onClose={() => setEditingLog(null)}
                    onSuccess={() => {
                        loadMaintenanceLogs();
                        loadMotorData();
                        setEditingLog(null);
                    }}
                />
            )}

            {/* Модальное окно редактирования записи перемещения */}
            {editingLocation && (
                <EditLocationModal
                    isOpen={!!editingLocation}
                    motorId={motorId}
                    location={editingLocation}
                    onClose={() => setEditingLocation(null)}
                    onSuccess={() => {
                        loadLocationHistory();
                        loadMotorData();
                        setEditingLocation(null);
                    }}
                />
            )}

            {/* Модальное окно редактирования двигателя */}
            {motorData && (
                <EditMotorModal
                    motor={motorData}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        loadMotorData();
                    }}
                />
            )}
        </div>
    );
}