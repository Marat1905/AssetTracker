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
import { format } from 'date-fns'; // Импорт format из date-fns для форматирования дат
import MotorHistory from '../../components/motor/MotorHistory';
import EditMotorModal from '../../components/motor/EditMotorModal';
import EditInventoryModal from '../../components/motor/EditInventoryModal';
import MoveMotorForm from '../../components/motor/MoveMotorForm';
import MaintenanceForm from '../../components/motor/MaintenanceForm';
import EditMaintenanceModal from '../../components/motor/EditMaintenanceModal';
import EditLocationModal from '../../components/motor/EditLocationModal';
import { motorApi } from '../../services/motor/api';
import type { MotorFullHistoryDto, LocationHistoryDto, MaintenanceLogDto } from '../../types/motor/motor';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import RangeDatePicker from '../../components/common/RangeDatePicker';
import { maintenanceTypeLabels, bearingPositionLabels, motorStatusLabels } from '../../utils/motor/locales';
import { useAuth } from '../../context/AuthContext'; // Импорт контекста авторизации
import { BearingIcon } from '../../icon'; // Импорт иконки подшипника
import {
    FaMap as Map,
    FaClipboardList as ClipboardList,
    FaPlusCircle as PlusCircle,
    FaArrowRight as ArrowRight,
    FaEdit as Edit,
    FaTrashAlt as Trash2,
    FaInfoCircle as Info,
    FaFilter as Filter,
    FaTimes as X,
    FaCog as Settings,
    FaThLarge as LayoutGrid,
    FaTable as Table,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaTachometerAlt,
    FaOilCan,
    FaCogs,
    FaUser,
    FaComment,
    FaBolt,
    FaWrench,
} from 'react-icons/fa';

/**
 * Возвращает CSS-классы для цветового оформления бейджа статуса.
 * @param status - Статус двигателя.
 * @returns Строка с классами Tailwind.
 */
const getStatusColorClasses = (status: string): string => {
    switch (status) {
        case 'InOperation':
            return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        case 'Reserve':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        case 'Repair':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        case 'Scrapped':
            return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

/**
 * Страница детальной информации о двигателе.
 * Получает идентификатор из URL, загружает данные, управляет вкладками,
 * модальными окнами, пагинацией, фильтрацией и режимами отображения.
 */
export default function MotorDetails() {
    // Получаем суррогатный идентификатор двигателя из URL
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const motorId = parseInt(id || '0', 10);

    // Права доступа: админ или электрик
    const { isAdminOrElectric } = useAuth();

    // Состояния данных
    const [motorData, setMotorData] = useState<MotorFullHistoryDto | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'passport' | 'location' | 'maintenance'>('passport');
    // Режим отображения журнала обслуживания: 'card' или 'table'
    const [maintenanceViewMode, setMaintenanceViewMode] = useState<'card' | 'table'>('card');
    // Режим отображения истории перемещений: 'card' или 'table'
    const [locationViewMode, setLocationViewMode] = useState<'card' | 'table'>('card');
    // Флаг для определения мобильного экрана (ширина < 768px)
    const [isMobile, setIsMobile] = useState(false);

    // Отслеживание ширины экрана для адаптивности таблицы
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Если экран мобильный, принудительно переключаем на карточки, чтобы избежать горизонтальной прокрутки
            if (mobile && maintenanceViewMode === 'table') {
                setMaintenanceViewMode('card');
            }
            if (mobile && locationViewMode === 'table') {
                setLocationViewMode('card');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [maintenanceViewMode, locationViewMode]);

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
    const [maintenancePageSize, setMaintenancePageSize] = useState(10);
    // Фильтры для журнала обслуживания
    const [maintenanceWorkType, setMaintenanceWorkType] = useState<string>('');          // пустая строка = все типы
    const [maintenanceDateRange, setMaintenanceDateRange] = useState<[Date | null, Date | null]>([null, null]);

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
            const fromDate = maintenanceDateRange[0] ? maintenanceDateRange[0].toISOString() : undefined;
            const toDate = maintenanceDateRange[1] ? maintenanceDateRange[1].toISOString() : undefined;
            const data = await motorApi.getMaintenanceLogsPaged(
                motorId,
                maintenancePage,
                maintenancePageSize,
                maintenanceWorkType || undefined,
                fromDate,
                toDate
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
    }, [motorId, locationPage, locationPageSize, maintenancePage, maintenancePageSize, maintenanceWorkType, maintenanceDateRange]);

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
        setMaintenanceDateRange([null, null]);
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
            navigate('/electric-motors');
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
     * @param log - запись обслуживания
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
     * @param log - запись обслуживания
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

    // Массив типов работ для выпадающего списка фильтра
    const workTypeOptions = [
        { value: '', label: 'Все типы' },
        ...Object.entries(maintenanceTypeLabels).map(([value, label]) => ({ value, label }))
    ];

    // Функция для получения иконки типа работ
    const getWorkTypeIcon = (workType: string) => {
        switch (workType) {
            case 'Lubrication': return <FaOilCan className="w-4 h-4" />;
            case 'BearingReplacement': return <BearingIcon className="w-4 h-4" />; // Используем BearingIcon
            case 'StatorRewinding': return <FaBolt className="w-4 h-4" />;
            case 'ShaftRepair': return <FaWrench className="w-4 h-4" />;
            default: return <FaCog className="w-4 h-4" />;
        }
    };

    // Функция для получения цвета фона и текста для типа работ
    const getWorkTypeStyle = (workType: string) => {
        switch (workType) {
            case 'Lubrication': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'BearingReplacement': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'StatorRewinding': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'ShaftRepair': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Верхняя панель: кнопка "Назад к списку" слева, хлебные крошки справа */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <Link
                    to="/electric-motors"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                >
                    <svg
                        className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Назад к списку
                </Link>

                {/* Хлебные крошки (справа) */}
                <nav className="flex items-center gap-1.5 text-sm">
                    <Link
                        to="/electric-motors"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Электродвигатели
                    </Link>
                    <svg
                        className="stroke-current text-gray-400"
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-gray-800 dark:text-white/90 font-medium">
                        Двигатель {motorData?.inventoryNumber ? `№${motorData.inventoryNumber}` : `#${motorId}`}
                    </span>
                </nav>
            </div>

            {/* Вкладки: паспортные данные, история перемещений, журнал обслуживания */}
            <div className="mt-2">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('passport')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'passport'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Settings size={18} />
                            Паспортные данные
                        </button>
                        <button
                            onClick={() => setActiveTab('location')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'location'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Map size={18} />
                            История перемещений
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'maintenance'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
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
                                {/* Подсказка о правиле редактирования истории перемещений */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                    <Info size={14} />
                                    <span>Только последнюю запись истории перемещений можно редактировать/удалять</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Переключатель режимов отображения для истории перемещений (только если не мобильный) */}
                                    {!isMobile && (
                                        <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setLocationViewMode('card')}
                                                className={`p-1.5 rounded-md transition-colors ${locationViewMode === 'card'
                                                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                                                    }`}
                                                title="Просмотр карточками"
                                            >
                                                <LayoutGrid size={18} />
                                            </button>
                                            <button
                                                onClick={() => setLocationViewMode('table')}
                                                className={`p-1.5 rounded-md transition-colors ${locationViewMode === 'table'
                                                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                                                    }`}
                                                title="Табличный просмотр"
                                            >
                                                <Table size={18} />
                                            </button>
                                        </div>
                                    )}
                                    {/* Кнопка "Добавить перемещение" видна только администраторам и электрикам */}
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
                                    ) : (
                                        <>
                                            {locationViewMode === 'card' ? (
                                                // Режим карточек
                                                <div className="space-y-4">
                                                    {locationHistory.map((loc) => {
                                                        const isLast = isLastLocationRecord(loc);
                                                        const isActive = loc.endDate === null;
                                                        // Статус в период действия данной записи (предполагается, что API возвращает поле status)
                                                        const statusDuringPeriod = (loc as any).status || null;
                                                        return (
                                                            <div key={loc.id} className="relative pl-6 pb-5 last:pb-0">
                                                                {/* Вертикальная линия с градиентом */}
                                                                <div className="absolute left-[8px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-500 to-transparent rounded-full"></div>
                                                                {/* Маркер */}
                                                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-green-500 ring-2 ring-green-300' : 'bg-blue-500'
                                                                    }`}>
                                                                    {isActive && <FaCheckCircle className="w-3 h-3 text-white" />}
                                                                </div>
                                                                <div className={`ml-4 rounded-xl transition-all duration-200 hover:shadow-lg ${isActive ? 'bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 border-l-4 border-green-500' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                                                    }`}>
                                                                    <div className="p-4">
                                                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                                <FaMapMarkerAlt className={`flex-shrink-0 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-blue-500 dark:text-blue-400'}`} />
                                                                                <p className={`font-semibold truncate ${isActive ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                                                                    {loc.location}
                                                                                </p>
                                                                                {isActive && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                                                        <FaCheckCircle size={12} /> Текущее
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {isAdminOrElectric && (
                                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                                    <button
                                                                                        onClick={() => handleEditLocation(loc)}
                                                                                        disabled={!isLast}
                                                                                        className={`transition-colors p-1 rounded-md ${!isLast
                                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                                            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                                                            }`}
                                                                                        title={!isLast ? 'Редактирование разрешено только для последней записи' : 'Редактировать местоположение'}
                                                                                    >
                                                                                        <Edit size={16} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteLocation(loc)}
                                                                                        disabled={!isLast}
                                                                                        className={`transition-colors p-1 rounded-md ${!isLast
                                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                                            : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                                            }`}
                                                                                        title={!isLast ? 'Удаление разрешено только для последней записи' : 'Удалить запись'}
                                                                                    >
                                                                                        <Trash2 size={16} />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                                                            {/* Начало периода: дата + время */}
                                                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                                                                <FaCalendarAlt size={12} />
                                                                                <span>{format(new Date(loc.startDate), 'dd.MM.yyyy')}</span>
                                                                                <FaClock size={12} />
                                                                                <span>{format(new Date(loc.startDate), 'HH:mm')}</span>
                                                                            </div>
                                                                            {/* Стрелка */}
                                                                            <span className="text-gray-400">→</span>
                                                                            {/* Конец периода: дата + время, если есть, иначе "настоящее время" */}
                                                                            {loc.endDate ? (
                                                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                                                                    <FaCalendarAlt size={12} />
                                                                                    <span>{format(new Date(loc.endDate), 'dd.MM.yyyy')}</span>
                                                                                    <FaClock size={12} />
                                                                                    <span>{format(new Date(loc.endDate), 'HH:mm')}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">настоящее время</span>
                                                                            )}
                                                                            {/* Статус в период */}
                                                                            {statusDuringPeriod && (
                                                                                <div className="flex items-center gap-2 text-sm ml-auto">
                                                                                    <FaTachometerAlt size={14} className="text-gray-500 dark:text-gray-400" />
                                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(statusDuringPeriod)}`}>
                                                                                        {motorStatusLabels[statusDuringPeriod as keyof typeof motorStatusLabels] || statusDuringPeriod}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                // Табличный режим для истории перемещений (только для широких экранов)
                                                <div className="w-full overflow-x-auto">
                                                    <table className="w-full table-fixed border-collapse">
                                                        <colgroup>
                                                            <col className="w-[20%]" />
                                                            <col className="w-[20%]" />
                                                            <col className="w-[30%]" />
                                                            <col className="w-[20%]" />
                                                            {isAdminOrElectric && <col className="w-[10%]" />}
                                                        </colgroup>
                                                        <thead>
                                                            <tr className="bg-gray-50 dark:bg-slate-800">
                                                                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Начало (дата/время)</th>
                                                                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Окончание (дата/время)</th>
                                                                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Местоположение</th>
                                                                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Статус в период</th>
                                                                {isAdminOrElectric && <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Действия</th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {locationHistory.map((loc) => {
                                                                const isLast = isLastLocationRecord(loc);
                                                                const isActive = loc.endDate === null;
                                                                const statusDuringPeriod = (loc as any).status || null;
                                                                return (
                                                                    <tr key={loc.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                                        <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                                                            {format(new Date(loc.startDate), 'dd.MM.yyyy HH:mm')}
                                                                        </td>
                                                                        <td className="p-3 align-top whitespace-normal break-words text-gray-900 dark:text-gray-100">
                                                                            {loc.endDate ? format(new Date(loc.endDate), 'dd.MM.yyyy HH:mm') :
                                                                                <span className="text-green-600 dark:text-green-400 font-medium">настоящее время</span>}
                                                                        </td>
                                                                        <td className="p-3 align-top whitespace-normal break-words">
                                                                            <div className="flex items-center gap-2">
                                                                                <FaMapMarkerAlt className={`flex-shrink-0 ${isActive ? 'text-green-500' : 'text-blue-500'}`} />
                                                                                <span className="font-medium text-gray-800 dark:text-gray-200">{loc.location}</span>
                                                                                {isActive && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                                                        <FaCheckCircle size={12} /> Текущее
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3 align-top whitespace-normal break-words">
                                                                            {statusDuringPeriod ? (
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(statusDuringPeriod)}`}>
                                                                                    {motorStatusLabels[statusDuringPeriod as keyof typeof motorStatusLabels] || statusDuringPeriod}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400">—</span>
                                                                            )}
                                                                        </td>
                                                                        {isAdminOrElectric && (
                                                                            <td className="p-3 align-top whitespace-normal">
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        onClick={() => handleEditLocation(loc)}
                                                                                        disabled={!isLast}
                                                                                        className={`transition-colors p-1 rounded-md ${!isLast
                                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                                            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                                                            }`}
                                                                                        title={!isLast ? 'Редактирование разрешено только для последней записи' : 'Редактировать запись'}
                                                                                    >
                                                                                        <Edit size={16} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteLocation(loc)}
                                                                                        disabled={!isLast}
                                                                                        className={`transition-colors p-1 rounded-md ${!isLast
                                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                                            : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                                            }`}
                                                                                        title={!isLast ? 'Удаление разрешено только для последней записи' : 'Удалить запись'}
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
                                            )}
                                        </>
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
                            {/* Верхняя панель с подсказкой и кнопкой добавления */}
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                        <Info size={14} />
                                        <span>Только последнюю запись замены подшипника можно редактировать/удалять</span>
                                    </div>
                                </div>
                                {/* Кнопка "Добавить запись обслуживания" видна всем авторизованным пользователям */}
                                <button onClick={() => setIsMaintenanceModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    <PlusCircle size={18} /> Добавить запись обслуживания
                                </button>
                            </div>

                            {/* Блок фильтрации с переключателем режимов */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-800/30">
                                <div className="flex flex-wrap items-end gap-4">
                                    {/* RangeDatePicker расположен выше, чем select "Тип работ" */}
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
                                        <button onClick={handleApplyMaintenanceFilters} className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                                            <Filter size={16} />
                                            Применить
                                        </button>
                                        <button onClick={handleResetMaintenanceFilters} className="inline-flex items-center gap-1 px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm">
                                            <X size={16} />
                                            Сброс
                                        </button>
                                    </div>
                                    {/* Переключатель режимов отображения – перенесён ближе к таблице, справа от кнопок фильтрации */}
                                    {!isMobile && (
                                        <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-0.5 ml-auto">
                                            <button
                                                onClick={() => setMaintenanceViewMode('card')}
                                                className={`p-1.5 rounded-md transition-colors ${maintenanceViewMode === 'card'
                                                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                                                    }`}
                                                title="Просмотр карточками"
                                            >
                                                <LayoutGrid size={18} />
                                            </button>
                                            <button
                                                onClick={() => setMaintenanceViewMode('table')}
                                                className={`p-1.5 rounded-md transition-colors ${maintenanceViewMode === 'table'
                                                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
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

                            {/* Рендеринг журнала обслуживания в зависимости от выбранного режима */}
                            {maintenanceViewMode === 'card' ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                                    <div className="p-6">
                                        {maintenanceLogs.length === 0 ? (
                                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет записей об обслуживании</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {maintenanceLogs.map(log => {
                                                    const isEditable = canEditOrDeleteBearingLog(log);
                                                    const workTypeIcon = getWorkTypeIcon(log.workType);
                                                    const workTypeStyle = getWorkTypeStyle(log.workType);
                                                    const workTypeLabel = maintenanceTypeLabels[log.workType] || log.workType;

                                                    return (
                                                        <div
                                                            key={log.id}
                                                            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                                                        >
                                                            {/* Верхняя полоса с цветом типа работ */}
                                                            <div className={`h-1.5 ${log.workType === 'Lubrication' ? 'bg-amber-500' : log.workType === 'BearingReplacement' ? 'bg-indigo-500' : log.workType === 'StatorRewinding' ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>

                                                            <div className="p-5">
                                                                {/* Шапка карточки: тип работ, дата, действия */}
                                                                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${workTypeStyle}`}>
                                                                            {workTypeIcon}
                                                                            <span>{workTypeLabel}</span>
                                                                        </div>
                                                                        {/* Бейдж позиции подшипника (для смазки и замены) */}
                                                                        {(log.workType === 'Lubrication' || log.workType === 'BearingReplacement') && log.bearingPosition && (
                                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                                <FaCogs size={12} />
                                                                                {bearingPositionLabels[log.bearingPosition] || (log.bearingPosition === 'Front' ? 'Передний' : 'Задний')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {/* Новая группировка даты с иконками */}
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
                                                                                    onClick={() => handleEditLog(log)}
                                                                                    disabled={log.workType === 'BearingReplacement' && !isEditable}
                                                                                    className={`p-1.5 rounded-md transition-colors ${log.workType === 'BearingReplacement' && !isEditable
                                                                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                                                        : 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                                                        }`}
                                                                                    title={log.workType === 'BearingReplacement' && !isEditable ? 'Редактирование только для последней записи' : 'Редактировать запись'}
                                                                                >
                                                                                    <Edit size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteLog(log)}
                                                                                    disabled={log.workType === 'BearingReplacement' && !isEditable}
                                                                                    className={`p-1.5 rounded-md transition-colors ${log.workType === 'BearingReplacement' && !isEditable
                                                                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                                                        : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                                        }`}
                                                                                    title={log.workType === 'BearingReplacement' && !isEditable ? 'Удаление только для последней записи' : 'Удалить запись'}
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Исполнитель */}
                                                                {log.performedBy && (
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                                        <FaUser size={14} className="text-gray-400" />
                                                                        <span className="font-medium">Выполнил:</span>
                                                                        <span>{log.performedBy}</span>
                                                                    </div>
                                                                )}

                                                                {/* Детали в зависимости от типа работ */}
                                                                <div className="space-y-3">
                                                                    {/* Смазка */}
                                                                    {log.workType === 'Lubrication' && (
                                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                                                                            <div className="flex items-center gap-2">
                                                                                <FaOilCan size={16} className="text-amber-600 dark:text-amber-400" />
                                                                                <span className="font-medium text-gray-700 dark:text-gray-300">Смазка:</span>
                                                                                <span className="text-gray-900 dark:text-gray-100 font-mono">{log.lubricantTypeName || '—'}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Замена подшипника */}
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

                                                                    {/* Комментарий */}
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
                                // Табличный режим – только для широких экранов, без горизонтальной прокрутки
                                // Используем table-layout: fixed и перенос слов для предотвращения выхода за пределы
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="w-full">
                                        <table className="w-full table-fixed border-collapse">
                                            {/* Задаём ширину колонок в процентах, чтобы таблица не выходила за пределы */}
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
                                                {maintenanceLogs.map(log => {
                                                    const isEditable = canEditOrDeleteBearingLog(log);
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
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
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

            {/* Модальное окно перемещения – теперь полностью внутри MoveMotorForm */}
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

            {/* Модальное окно добавления обслуживания – теперь полностью внутри MaintenanceForm */}
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

            {/* Модальное окно редактирования инвентарного номера */}
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
    );
}