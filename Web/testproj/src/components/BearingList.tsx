import { useEffect, useState } from 'react';
import { bearingApi } from '../services/api';
import type { Bearing } from '../types';
import toast from 'react-hot-toast';
import BearingForm from './BearingForm';

export default function BearingList() {
    const [bearings, setBearings] = useState<Bearing[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBearing, setEditingBearing] = useState<Bearing | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const loadBearings = async () => {
        setLoading(true);
        try {
            const data = await bearingApi.getAll();
            setBearings(data);
        } catch {
            toast.error('Не удалось загрузить список подшипников');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBearings();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить подшипник? Если он используется в двигателях или истории обслуживания, удаление будет запрещено.')) return;
        try {
            await bearingApi.delete(id);
            toast.success('Подшипник удалён');
            loadBearings();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    return (
        <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-h">Справочник подшипников</h2>
                <button onClick={() => { setEditingBearing(null); setIsFormOpen(true); }} className="btn-primary">
                    + Добавить подшипник
                </button>
            </div>
            <div className="table-container">
                {loading ? (
                    <div className="p-8 text-center">Загрузка...</div>
                ) : bearings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Нет подшипников. Создайте первый.</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Тип</th>
                                <th>Производитель</th>
                                <th>Поставщик</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bearings.map(bearing => (
                                <tr key={bearing.id}>
                                    <td>{bearing.id}</td>
                                    <td className="font-medium">{bearing.type}</td>
                                    <td>{bearing.manufacturer || '—'}</td>
                                    <td>{bearing.supplier || '—'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingBearing(bearing); setIsFormOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Редактировать"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bearing.id)}
                                                className="text-red-600 hover:text-red-800"
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
                )}
            </div>

            {isFormOpen && (
                <BearingForm
                    initialData={editingBearing}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadBearings();
                    }}
                />
            )}
        </div>
    );
}