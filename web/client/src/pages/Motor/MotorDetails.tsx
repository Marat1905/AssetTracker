/**
 * Страница детальной информации о двигателе.
 * Отображает паспортные данные, историю перемещений и журнал обслуживания в трёх вкладках.
 * Поддерживает добавление/редактирование/удаление записей.
 * Для замены подшипника и истории перемещений разрешает редактирование/удаление только последней записи.
 * Реализована фильтрация журнала обслуживания по типу работ и периоду.
 * Добавлено поле "Кто выполнил" для записей обслуживания.
 * Журнал обслуживания может отображаться в двух режимах: карточки (по умолчанию) и таблица.
 * История перемещений также может отображаться в двух режимах: карточки (по умолчанию) и таблица.
 * На экранах меньше 768px табличный режим недоступен (только карточки) для избежания горизонтальной прокрутки.
 * Табличный режим использует table-layout: fixed и word-break: break-word для предотвращения горизонтальной прокрутки.
 * Переключатель режимов (карточки/таблица) расположен в блоке управления для каждой вкладки.
 * В режиме карточки комментарий переносится на новую строку с помощью break-words.
 * Кнопки редактирования и удаления двигателя перенесены в блок паспортных данных (компонент MotorHistory).
 * Добавлено редактирование инвентарного номера через отдельное модальное окно.
 *
 * Все даты отображаются в формате 'dd.MM.yyyy' и 'HH:mm' с использованием библиотеки date-fns.
 * В истории перемещений дата и время разделены и показаны с иконками.
 *
 * Права доступа:
 * - Редактирование/удаление двигателя, перемещений и записей обслуживания доступно только пользователям с ролью Admin или Electric (isAdminOrElectric).
 * - Кнопка "Добавить запись обслуживания" видна всем авторизованным пользователям.
 * - В истории перемещений кнопки "Добавить перемещение", редактирования и удаления скрыты для обычных пользователей.
 * - В журнале обслуживания кнопки редактирования/удаления и колонка "Действия" скрыты для обычных пользователей.
 */

import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
    MotorHistory,
    EditMotorModal,
    EditInventoryModal,
    MoveMotorForm,
    MaintenanceForm,
    EditMaintenanceModal,
    EditLocationModal,
} from '../../components/motor';
import { motorApi } from '../../services/motor/api';
import type { LocationHistoryDto, MaintenanceLogDto } from '../../types/motor/motor';
import toast from 'react-hot-toast';
import { Pagination, RangeDatePicker } from '../../components/common';
import { maintenanceTypeLabels } from '../../utils/motor/locales';
import { useAuth } from '../../context/AuthContext';
import { useIsMobile, useMotorDetails } from '../../hooks/motor';
import {
    LocationCardView,
    LocationTableView,
    MaintenanceCardView,
    MaintenanceTableView,
} from '../../components/motor/MotorDetails';
import {
    FaMap as Map,
    FaClipboardList as ClipboardList,
    FaPlusCircle as PlusCircle,
    FaFilter as Filter,
    FaTimes as X,
    FaCog as Settings,
    FaThLarge as LayoutGrid,
    FaTable as Table,
    FaInfoCircle as Info,
} from 'react-icons/fa';

/**
 * Страница детальной информации о двигателе.
 * Получает идентификатор из URL, загружает данные через хук useMotorDetails,
 * управляет вкладками, модальными окнами, пагинацией, фильтрацией и режимами отображения.
 */
export default function MotorDetails() {
    // Получаем суррогатный идентификатор двигателя из URL
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const motorId = parseInt(id || '0', 10);

    // Права доступа: админ или электрик
    const { isAdminOrElectric } = useAuth();
    const isMobile = useIsMobile();

    // Хук данных
    const {
        motorData,
        locationHistory,
        maintenanceLogs,
        locationPage,
        locationTotalPages,
        locationTotalCount,
        locationPageSize,
        setLocationPage,
        setLocationPageSize,
        maintenancePage,
        maintenanceTotalPages,
        maintenanceTotalCount,
        maintenancePageSize,
        maintenanceWorkType,
        maintenanceDateRange,
        setMaintenancePage,
        setMaintenancePageSize,
        setMaintenanceWorkType,
        setMaintenanceDateRange,
        loadMotorData,
        loadLocationHistory,
        loadMaintenanceLogs,
        refreshAll,
        applyMaintenanceFilters,
        resetMaintenanceFilters,
        isLastLocationRecord,
        canEditOrDeleteBearingLog,
    } = useMotorDetails(motorId);

    // Активная вкладка
    const [activeTab, setActiveTab] = useState<'passport' | 'location' | 'maintenance'>('passport');

    // Режимы отображения
    const [maintenanceViewMode, setMaintenanceViewMode] = useState<'card' | 'table'>('card');
    const [locationViewMode, setLocationViewMode] = useState<'card' | 'table'>('card');

    // Модальные окна
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<MaintenanceLogDto | null>(null);
    const [editingLocation, setEditingLocation] = useState<LocationHistoryDto | null>(null);

    // Принудительное переключение на карточки при мобильном экране
    useEffect(() => {
        if (isMobile) {
            if (maintenanceViewMode === 'table') setMaintenanceViewMode('card');
            if (locationViewMode === 'table') setLocationViewMode('card');
        }
    }, [isMobile, maintenanceViewMode, locationViewMode]);

    /**
     * Удаление двигателя (безвозвратно).
     */
    const handleDelete = async () => {
        if (!confirm('Удалить двигатель без возможности восстановления?')) return;
        try {
            await motorApi.deleteMotor(motorId);
            toast.success('Двигатель удалён');
            navigate('/motors');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    /**
     * Открывает модальное окно редактирования записи истории перемещений.
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
            await loadMotorData();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Ошибка удаления';
            toast.error(errorMsg);
        }
    };

    /**
     * Открывает модальное окно редактирования записи обслуживания.
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
            loadMotorData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    // Обработка некорректного ID
    if (isNaN(motorId) || motorId <= 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Неверный идентификатор</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Пожалуйста, проверьте номер двигателя</p>
                <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Вернуться к списку
                </Link>
            </div>
        );
    }

    const workTypeOptions = [
        { value: '', label: 'Все типы' },
        ...Object.entries(maintenanceTypeLabels).map(([value, label]) => ({ value, label }))
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Верхняя панель: кнопка "Назад к списку" слева, хлебные крошки справа */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <Link
                        to="/motors"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    >
                        <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Назад к списку
                    </Link>

                    <nav className="flex items-center gap-1.5 text-sm">
                        <Link to="/motors" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            Электродвигатели
                        </Link>
                        <svg className="stroke-current text-gray-400" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-gray-800 dark:text-white/90 font-medium">
                            Двигатель {motorData?.inventoryNumber ? `№${motorData.inventoryNumber}` : `#${motorId}`}
                        </span>
                    </nav>
                </div>

                {/* Вкладки */}
                <div className="mt-2">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex gap-6">
                            <button
                                onClick={() => setActiveTab('passport')}
                                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'passport'
                                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                <Settings size={18} />
                                Паспортные данные
                            </button>
                            <button
                                onClick={() => setActiveTab('location')}
                                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'location'
                                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                <Map size={18} />
                                История перемещений
                            </button>
                            <button
                                onClick={() => setActiveTab('maintenance')}
                                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'maintenance'
                                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                <ClipboardList size={18} />
                                Журнал обслуживания и ремонтов
                            </button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {/* Вкладка "Паспортные данные" */}
                        {activeTab === 'passport' && motorData && (
                            <MotorHistory
                                motorData={motorData}
                                onMotorUpdated={refreshAll}
                                onEdit={isAdminOrElectric ? () => setIsEditModalOpen(true) : undefined}
                                onDelete={isAdminOrElectric ? handleDelete : undefined}
                                onEditInventory={isAdminOrElectric ? () => setIsInventoryModalOpen(true) : undefined}
                            />
                        )}

                        {/* Вкладка "История перемещений" */}
                        {activeTab === 'location' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                        <Info size={14} />
                                        <span>Только последнюю запись истории перемещений можно редактировать/удалять</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!isMobile && (
                                            <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => setLocationViewMode('card')}
                                                    className={`p-1.5 rounded-md transition-colors ${locationViewMode === 'card'
                                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                                    title="Просмотр карточками"
                                                >
                                                    <LayoutGrid size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setLocationViewMode('table')}
                                                    className={`p-1.5 rounded-md transition-colors ${locationViewMode === 'table'
                                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                                    title="Табличный просмотр"
                                                >
                                                    <Table size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {isAdminOrElectric && (
                                            <button
                                                onClick={() => setIsMoveModalOpen(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                <PlusCircle size={18} />
                                                Добавить перемещение
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                                    <div className="p-6">
                                        {locationHistory.length === 0 ? (
                                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет записей о перемещениях</p>
                                        ) : locationViewMode === 'card' ? (
                                            <LocationCardView
                                                items={locationHistory}
                                                isAdminOrElectric={isAdminOrElectric}
                                                isLastRecord={isLastLocationRecord}
                                                onEdit={handleEditLocation}
                                                onDelete={handleDeleteLocation}
                                            />
                                        ) : (
                                            <LocationTableView
                                                items={locationHistory}
                                                isAdminOrElectric={isAdminOrElectric}
                                                isLastRecord={isLastLocationRecord}
                                                onEdit={handleEditLocation}
                                                onDelete={handleDeleteLocation}
                                            />
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
                                            pageSizeOptions={[5, 10, 25, 50, 100]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Вкладка "Журнал обслуживания" */}
                        {activeTab === 'maintenance' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                            <Info size={14} />
                                            <span>Только последнюю запись замены подшипника можно редактировать/удалять</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMaintenanceModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <PlusCircle size={18} /> Добавить запись обслуживания
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-800/30">
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="flex-1 min-w-[220px]">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Диапазон дат</label>
                                            <RangeDatePicker
                                                startDate={maintenanceDateRange[0]}
                                                endDate={maintenanceDateRange[1]}
                                                onChange={setMaintenanceDateRange}
                                                size="sm"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[160px]">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Тип работ</label>
                                            <select
                                                value={maintenanceWorkType}
                                                onChange={(e) => setMaintenanceWorkType(e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                            >
                                                {workTypeOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={applyMaintenanceFilters}
                                                className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                            >
                                                <Filter size={16} />
                                                Применить
                                            </button>
                                            <button
                                                onClick={resetMaintenanceFilters}
                                                className="inline-flex items-center gap-1 px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                                            >
                                                <X size={16} />
                                                Сброс
                                            </button>
                                        </div>
                                        {!isMobile && (
                                            <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-0.5 ml-auto">
                                                <button
                                                    onClick={() => setMaintenanceViewMode('card')}
                                                    className={`p-1.5 rounded-md transition-colors ${maintenanceViewMode === 'card'
                                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                                    title="Просмотр карточками"
                                                >
                                                    <LayoutGrid size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setMaintenanceViewMode('table')}
                                                    className={`p-1.5 rounded-md transition-colors ${maintenanceViewMode === 'table'
                                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                                    title="Табличный просмотр"
                                                >
                                                    <Table size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {maintenanceViewMode === 'card' ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                                        <div className="p-6">
                                            {maintenanceLogs.length === 0 ? (
                                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет записей об обслуживании</p>
                                            ) : (
                                                <MaintenanceCardView
                                                    items={maintenanceLogs}
                                                    isAdminOrElectric={isAdminOrElectric}
                                                    isEditable={canEditOrDeleteBearingLog}
                                                    onEdit={handleEditLog}
                                                    onDelete={handleDeleteLog}
                                                />
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
                                ) : (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <MaintenanceTableView
                                            items={maintenanceLogs}
                                            isAdminOrElectric={isAdminOrElectric}
                                            isEditable={canEditOrDeleteBearingLog}
                                            onEdit={handleEditLog}
                                            onDelete={handleDeleteLog}
                                        />
                                        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700">
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
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Модальные окна */}
                <MoveMotorForm
                    isOpen={isMoveModalOpen}
                    onClose={() => setIsMoveModalOpen(false)}
                    motorId={motorId}
                    currentStatus={motorData?.status}
                    onMoved={() => {
                        loadLocationHistory();
                        loadMotorData();
                    }}
                />

                <MaintenanceForm
                    isOpen={isMaintenanceModalOpen}
                    onClose={() => setIsMaintenanceModalOpen(false)}
                    motorId={motorId}
                    motorData={motorData}
                    onAdded={() => {
                        loadMaintenanceLogs();
                        loadMotorData();
                        setIsMaintenanceModalOpen(false);
                    }}
                />

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

                {motorData && (
                    <EditInventoryModal
                        isOpen={isInventoryModalOpen}
                        motorId={motorId}
                        currentInventoryNumber={motorData.inventoryNumber}
                        onClose={() => setIsInventoryModalOpen(false)}
                        onSuccess={() => {
                            loadMotorData();
                        }}
                    />
                )}
            </div>
        </div>
    );
}