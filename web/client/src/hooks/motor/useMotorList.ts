import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motorApi } from '../../services/motor/api';
import type { MotorFullHistoryDto, MotorListItem } from '../../types/motor/motor';
import useDebouncedValue from './useDebouncedValue';

/**
 * Хук управления состоянием страницы списка двигателей.
 * Обеспечивает загрузку пагинированного списка, управление фильтрами,
 * debounce ввода и операции редактирования/удаления.
 */
export function useMotorList() {
    const [motors, setMotors] = useState<MotorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMotor, setEditingMotor] = useState<MotorFullHistoryDto | null>(null);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Фильтры
    const [filterInventory, setFilterInventory] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterHasInventoryNumber, setFilterHasInventoryNumber] = useState<boolean | null>(null);

    // Локальные значения для ввода (с debounce)
    const [localInventory, setLocalInventory] = useState('');
    const [localLocation, setLocalLocation] = useState('');

    const debouncedInventory = useDebouncedValue(localInventory, 500);
    const debouncedLocation = useDebouncedValue(localLocation, 500);

    // Синхронизация debounce-значений с реальными фильтрами
    useEffect(() => {
        setFilterInventory(debouncedInventory);
    }, [debouncedInventory]);

    useEffect(() => {
        setFilterLocation(debouncedLocation);
    }, [debouncedLocation]);

    /**
     * Загружает список двигателей с учётом фильтров и пагинации.
     */
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, filterInventory, filterLocation, filterStatus, filterHasInventoryNumber]);

    /**
     * Сбрасывает все фильтры и возвращается на первую страницу.
     */
    const resetFilters = () => {
        setLocalInventory('');
        setLocalLocation('');
        setFilterInventory('');
        setFilterLocation('');
        setFilterStatus('');
        setFilterHasInventoryNumber(null);
        setCurrentPage(1);
    };

    /**
     * Удаляет двигатель с подтверждением.
     */
    const deleteMotor = async (id: number) => {
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

    /**
     * Загружает полную карточку двигателя для редактирования.
     */
    const openEditModal = async (id: number) => {
        try {
            const fullData = await motorApi.getFullHistory(id);
            setEditingMotor(fullData);
        } catch {
            toast.error('Не удалось загрузить данные для редактирования');
        }
    };

    return {
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
    };
}