import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MotorListItem } from '../types';
import { motorApi } from '../services/api';
import toast from 'react-hot-toast';
import { motorStatusLabels } from '../utils/locales';

export default function MotorList() {
    const [motors, setMotors] = useState<MotorListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await motorApi.getAllMotors();
                setMotors(data);
            } catch {
                toast.error('Не удалось загрузить список двигателей');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

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
                            <tr key={motor.inventoryNumber} className="group">
                                <td className="font-medium text-text-h">{motor.inventoryNumber}</td>
                                <td>{motor.type}</td>
                                <td>{motor.power} кВт</td>
                                <td>
                                    <span className={`status-badge status-badge-${motor.status}`}>
                                        {motorStatusLabels[motor.status] || motor.status}
                                    </span>
                                </td>
                                <td>
                                    <Link
                                        to={`/motors/${motor.inventoryNumber}`}
                                        className="inline-flex items-center text-accent hover:text-accent-dark transition-colors gap-1 group/link"
                                    >
                                        <span>История</span>
                                        <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}