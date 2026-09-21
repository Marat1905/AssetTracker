// MotorList.tsx
import { useNavigate } from 'react-router';
import type { MotorListItem } from '../../types/motor/motor';
import { useMotorList, useIsMobile } from '../../hooks/motor';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../common/Pagination';
import EditMotorModal from './EditMotorModal';
import { MotorListCardView, MotorListTableView } from './MotorList/';
import {
    FaThLarge as LayoutGrid,
    FaTable as Table,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motorStatusLabels } from '../../utils/motor/locales';

/**
 * Список электродвигателей с возможностью поиска, фильтрации, пагинации
 * и переключения между карточным и табличным режимами отображения.
 * Содержит кнопки редактирования/удаления, доступные только админам и электрикам.
 */
export default function MotorList() {
    const navigate = useNavigate();
    const { isAdminOrElectric } = useAuth();
    const isMobile = useIsMobile();

    const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

    // Принудительное переключение на карточки при мобильном экране
    useEffect(() => {
        if (isMobile && viewMode === 'table') {
            setViewMode('card');
        }
    }, [isMobile, viewMode]);

    const {
        motors,
        loading,
        editingMotor,
        setEditingMotor,
        currentPage,
        totalPages,
        totalCount,
        pageSize,
        setCurrentPage,
        setPageSize,
        localInventory,
        localLocation,
        setLocalInventory,
        setLocalLocation,
        filterStatus,
        setFilterStatus,
        filterHasInventoryNumber,
        setFilterHasInventoryNumber,
        fetchMotors,
        resetFilters,
        deleteMotor,
        openEditModal,
    } = useMotorList();

    const handleRowClick = (id: number) => {
        navigate(`/motors/${id}`);
    };

    const handleEditClick = (motor: MotorListItem, e: React.MouseEvent) => {
        e.stopPropagation();
        openEditModal(motor.id);
    };

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteMotor(id);
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
                                onClick={resetFilters}
                                className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Сброс
                            </button>
                        </div>
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

                {/* Контент: таблица или карточки */}
                {viewMode === 'table' ? (
                    loading && motors.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка данных...</p>
                        </div>
                    ) : (
                        <MotorListTableView
                            motors={motors}
                            isAdminOrElectric={isAdminOrElectric}
                            loading={loading}
                            onRowClick={handleRowClick}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                        />
                    )
                ) : (
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
                            <MotorListCardView
                                motors={motors}
                                isAdminOrElectric={isAdminOrElectric}
                                onCardClick={handleRowClick}
                                onEdit={handleEditClick}
                                onDelete={handleDelete}
                            />
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