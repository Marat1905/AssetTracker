import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MotorListItem, MotorFullHistoryDto } from '../types';
import { motorApi } from '../services/api';
import toast from 'react-hot-toast';
import { motorStatusLabels } from '../utils/locales';
import EditMotorModal from './EditMotorModal';

export default function MotorList() {
    const navigate = useNavigate();
    const [motors, setMotors] = useState<MotorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMotor, setEditingMotor] = useState<MotorFullHistoryDto | null>(null);

    const fetchMotors = async () => {
        try {
            const data = await motorApi.getAllMotors();
            setMotors(data);
        } catch {
            toast.error('Не удалось загрузить список двигателей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMotors();
    }, []);

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем переход по строке
        if (!confirm('Вы уверены, что хотите удалить двигатель? Все данные (история перемещений, обслуживания) будут безвозвратно удалены.')) {
            return;
        }
        try {
            await motorApi.deleteMotor(id);
            toast.success('Двигатель удалён');
            fetchMotors();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    const handleEditClick = async (motor: MotorListItem, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем переход по строке
        try {
            const fullData = await motorApi.getFullHistory(motor.inventoryNumber);
            setEditingMotor(fullData);
        } catch {
            toast.error('Не удалось загрузить данные для редактирования');
        }
    };

    const handleRowClick = (inventoryNumber: number) => {
        navigate(`/motors/${inventoryNumber}`);
    };

    if (loading) {
        return (
            <div className="card p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
                <p className="mt-4 text-gray-500">Загрузка данных...</p>
            </div>
        );
    }

    if (motors.length === 0) {
        return (
            <div className="card p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-semibold text-text-h mb-2">Нет двигателей</h3>
                <p className="text-gray-500">Зарегистрируйте первый двигатель с помощью формы выше</p>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-text-h flex items-center gap-2">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Список электродвигателей
                        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{motors.length}</span>
                    </h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Инв. номер</th>
                                <th>Тип</th>
                                <th>Мощность (кВт)</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {motors.map(motor => (
                                <tr
                                    key={motor.inventoryNumber}
                                    onClick={() => handleRowClick(motor.inventoryNumber)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <td className="font-medium text-text-h">{motor.inventoryNumber}</td>
                                    <td>{motor.type}</td>
                                    <td>{motor.power} кВт</td>
                                    <td>
                                        <span className={`status-badge status-badge-${motor.status}`}>
                                            {motorStatusLabels[motor.status] || motor.status}
                                        </span>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleEditClick(motor, e)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Редактировать"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(motor.inventoryNumber, e)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                title="Удалить"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingMotor && (
                <EditMotorModal
                    motor={editingMotor}
                    isOpen={!!editingMotor}
                    onClose={() => setEditingMotor(null)}
                    onSuccess={fetchMotors}
                />
            )}
        </>
    );
}