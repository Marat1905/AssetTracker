// MotorList.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { MotorListItem, MotorFullHistoryDto, MountingType } from '../../types/motor/motor';
import { motorApi } from '../../services/motor/api';
import toast from 'react-hot-toast';
import { motorStatusLabels } from '../../utils/motor/locales';
import EditMotorModal from './EditMotorModal';
import Pagination from '../common/Pagination';
import { useAuth } from '../../context/AuthContext'; // Импортируем хук для получения прав пользователя
import MotorDiagram from './MotorDiagram';
import {
    FaThLarge as LayoutGrid,
    FaTable as Table,
    FaEdit,
    FaTrashAlt,
    FaMapMarkerAlt,
    FaBolt,
    FaTachometerAlt,
    FaHashtag,
    FaInfoCircle,
} from 'react-icons/fa';

export default function MotorList() {
    const navigate = useNavigate();
    const { isAdminOrElectric } = useAuth(); // Получаем флаг: админ или электрик
    const [motors, setMotors] = useState<MotorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMotor, setEditingMotor] = useState<MotorFullHistoryDto | null>(null);

    // Режим отображения: 'card' или 'table'
    const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
    // Флаг для определения мобильного экрана (ширина < 768px)
    const [isMobile, setIsMobile] = useState(false);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Фильтры (реальные, с которыми идут запросы)
    const [filterInventory, setFilterInventory] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterHasInventoryNumber, setFilterHasInventoryNumber] = useState<boolean | null>(null);

    // Локальные состояния для debounce (мгновенный ввод)
    const [localInventory, setLocalInventory] = useState('');
    const [localLocation, setLocalLocation] = useState('');

    // Debounce таймеры
    const inventoryDebounceRef = useRef<NodeJS.Timeout>();
    const locationDebounceRef = useRef<NodeJS.Timeout>();

    // Отслеживание ширины экрана для адаптивности таблицы
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Если экран мобильный, принудительно переключаем на карточки, чтобы избежать горизонтальной прокрутки
            if (mobile && viewMode === 'table') {
                setViewMode('card');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [viewMode]);

    // Синхронизация локальных состояний с реальными фильтрами при монтировании или внешнем изменении
    useEffect(() => {
        setLocalInventory(filterInventory);
    }, [filterInventory]);
    useEffect(() => {
        setLocalLocation(filterLocation);
    }, [filterLocation]);

    // Debounce для filterInventory
    useEffect(() => {
        if (inventoryDebounceRef.current) clearTimeout(inventoryDebounceRef.current);
        inventoryDebounceRef.current = setTimeout(() => {
            setFilterInventory(localInventory);
        }, 500);
        return () => clearTimeout(inventoryDebounceRef.current);
    }, [localInventory]);

    // Debounce для filterLocation
    useEffect(() => {
        if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
        locationDebounceRef.current = setTimeout(() => {
            setFilterLocation(localLocation);
        }, 500);
        return () => clearTimeout(locationDebounceRef.current);
    }, [localLocation]);

    // Загрузка данных при изменении реальных фильтров или пагинации
    const fetchMotors = async () => {
        setLoading(true);
        try {
            const data = await motorApi.getMotorsPaged(
                currentPage,
                pageSize,
                filterInventory || undefined,
                filterLocation || undefined,
                filterStatus || undefined,
                filterHasInventoryNumber
            );
            setMotors(data.items);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        } catch {
            toast.error('Не удалось загрузить список двигателей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMotors();
    }, [currentPage, pageSize, filterInventory, filterLocation, filterStatus, filterHasInventoryNumber]);

    const handleResetFilters = () => {
        setLocalInventory('');
        setLocalLocation('');
        setFilterInventory('');
        setFilterLocation('');
        setFilterStatus('');
        setFilterHasInventoryNumber(null);
        setCurrentPage(1);
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Вы уверены, что хотите удалить двигатель? Все данные будут безвозвратно удалены.')) return;
        try {
            await motorApi.deleteMotor(id);
            toast.success('Двигатель удалён');
            if (motors.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchMotors();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    const handleEditClick = async (motor: MotorListItem, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const fullData = await motorApi.getFullHistory(motor.id);
            setEditingMotor(fullData);
        } catch {
            toast.error('Не удалось загрузить данные для редактирования');
        }
    };

    const handleRowClick = (id: number) => {
        navigate(`/motors/${id}`);
    };

    /**
     * Возвращает CSS-классы для цветового оформления бейджа статуса.
     * @param status - Статус двигателя.
     * @returns Строка с классами Tailwind.
     */
    const getStatusColorClasses = (status: string): string => {
        switch (status) {
            case 'InOperation':
                return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
            case 'InRepair':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
            default:
                return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        }
    };

    return (
        <>
            <div className="card bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Список электродвигателей
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {totalCount}
                        </span>
                    </h2>
                </div>

                {/* Фильтры и переключатель режимов */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Инв. номер
                            </label>
                            <input
                                type="text"
                                value={localInventory}
                                onChange={(e) => setLocalInventory(e.target.value)}
                                placeholder="Поиск по номеру"
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Местоположение
                            </label>
                            <input
                                type="text"
                                value={localLocation}
                                onChange={(e) => setLocalLocation(e.target.value)}
                                placeholder="Цех / агрегат"
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Статус
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                            >
                                <option value="">Все</option>
                                {Object.entries(motorStatusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Инвентарный номер
                            </label>
                            <select
                                value={filterHasInventoryNumber === null ? '' : (filterHasInventoryNumber ? 'yes' : 'no')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') setFilterHasInventoryNumber(null);
                                    else if (val === 'yes') setFilterHasInventoryNumber(true);
                                    else setFilterHasInventoryNumber(false);
                                }}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                            >
                                <option value="">Все</option>
                                <option value="yes">Только с инв. номером</option>
                                <option value="no">Только без инв. номера</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
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

                {/* Контент: таблица или карточки */}
                {viewMode === 'table' ? (
                    // Табличный режим
                    <div className="w-full overflow-x-auto">
                        {loading && motors.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка данных...</p>
                            </div>
                        ) : (
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Инв. номер
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Тип
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Мощность (кВт)
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Статус
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Текущее местоположение
                                        </th>
                                        {/* Колонка "Действия" отображается только для админов и электриков */}
                                        {isAdminOrElectric && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {loading && motors.length > 0 && (
                                        <tr>
                                            <td colSpan={isAdminOrElectric ? 6 : 5} className="text-center py-8">
                                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                                                <span className="ml-2 text-gray-500 dark:text-gray-400">Загрузка...</span>
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && motors.length === 0 && (
                                        <tr>
                                            <td colSpan={isAdminOrElectric ? 6 : 5} className="text-center py-12">
                                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Нет двигателей</h3>
                                                <p className="text-gray-500 dark:text-gray-400">Измените условия поиска или зарегистрируйте новый двигатель</p>
                                            </td>
                                        </tr>
                                    )}
                                    {!loading &&
                                        motors.map((motor) => (
                                            <tr
                                                key={motor.id}
                                                onClick={() => handleRowClick(motor.id)}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {motor.inventoryNumber ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {motor.type}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {motor.power} кВт
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${motor.status === 'InOperation'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : motor.status === 'InRepair'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {motorStatusLabels[motor.status] || motor.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {motor.currentLocation || '—'}
                                                </td>
                                                {/* Блок действий для администратора или электрика */}
                                                {isAdminOrElectric && (
                                                    <td
                                                        className="px-4 py-3 text-sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => handleEditClick(motor, e)}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                                title="Редактировать"
                                                            >
                                                                <FaEdit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(motor.id, e)}
                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                                title="Удалить"
                                                            >
                                                                <FaTrashAlt className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    // Режим карточек
                    <div className="p-4">
                        {loading && motors.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка данных...</p>
                            </div>
                        ) : !loading && motors.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Нет двигателей</h3>
                                <p className="text-gray-500 dark:text-gray-400">Измените условия поиска или зарегистрируйте новый двигатель</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {motors.map((motor) => (
                                    <div
                                        key={motor.id}
                                        onClick={() => handleRowClick(motor.id)}
                                        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Верхняя цветная полоса в зависимости от статуса */}
                                        <div
                                            className={`h-1.5 ${motor.status === 'InOperation'
                                                ? 'bg-green-500'
                                                : motor.status === 'InRepair'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                }`}
                                        ></div>

                                        <div className="p-5">
                                            {/* Шапка карточки: инв. номер и действия */}
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FaHashtag className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {motor.inventoryNumber ? `№${motor.inventoryNumber}` : '—'}
                                                    </span>
                                                </div>
                                                {isAdminOrElectric && (
                                                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => handleEditClick(motor, e)}
                                                            className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                            title="Редактировать"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(motor.id, e)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                            title="Удалить"
                                                        >
                                                            <FaTrashAlt size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Основная информация и диаграмма в две колонки */}
                                            <div className="flex gap-3">
                                                {/* Левая колонка: текстовая информация */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Тип и мощность */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaBolt className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                                        <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
                                                            {motor.type} • {motor.power} кВт
                                                        </span>
                                                    </div>

                                                    {/* Статус */}
                                                    <div className="mb-2">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(
                                                                motor.status
                                                            )}`}
                                                        >
                                                            <FaTachometerAlt className="mr-1.5 h-3 w-3" />
                                                            {motorStatusLabels[motor.status] || motor.status}
                                                        </span>
                                                    </div>

                                                    {/* Местоположение */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <FaMapMarkerAlt className="flex-shrink-0 text-blue-500 dark:text-blue-400" />
                                                        <span className="truncate">{motor.currentLocation || '—'}</span>
                                                    </div>
                                                </div>

                                                {/* Правая колонка: схема двигателя */}
                                                <div className="w-24 flex-shrink-0">
                                                    <MotorDiagram
                                                        mountingType={(motor as any).mountingType || MountingType.Feet}
                                                    />
                                                </div>
                                            </div>

                                            {/* Подсказка о клике */}
                                            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 justify-end">
                                                <FaInfoCircle size={12} />
                                                <span>Нажмите для деталей</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
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

            {editingMotor && (
                <EditMotorModal
                    motor={editingMotor}
                    isOpen={!!editingMotor}
                    onClose={() => setEditingMotor(null)}
                    onSuccess={() => {
                        fetchMotors();
                        setEditingMotor(null);
                    }}
                />
            )}
        </>
    );
}