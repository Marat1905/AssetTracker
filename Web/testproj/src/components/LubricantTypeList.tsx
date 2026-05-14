import { useEffect, useState } from 'react';
import { lubricantApi } from '../services/api';
import type { LubricantType } from '../types';
import toast from 'react-hot-toast';
import LubricantTypeForm from './LubricantTypeForm';

export default function LubricantTypeList() {
    const [types, setTypes] = useState<LubricantType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingType, setEditingType] = useState<LubricantType | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const loadTypes = async () => {
        setLoading(true);
        try {
            const data = await lubricantApi.getAll();
            setTypes(data);
        } catch {
            toast.error('Не удалось загрузить типы смазки');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTypes();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить тип смазки? Все связанные записи обслуживания останутся, но тип смазки будет удалён.')) return;
        try {
            await lubricantApi.delete(id);
            toast.success('Тип смазки удалён');
            loadTypes();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    return (
        <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-h">Типы смазки</h2>
                <button onClick={() => { setEditingType(null); setIsFormOpen(true); }} className="btn-primary">
                    + Добавить тип
                </button>
            </div>
            <div className="table-container">
                {loading ? (
                    <div className="p-8 text-center">Загрузка...</div>
                ) : types.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Нет типов смазки. Создайте первый.</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Описание</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.map(type => (
                                <tr key={type.id}>
                                    <td>{type.id}</td>
                                    <td className="font-medium">{type.name}</td>
                                    <td>{type.description || '—'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingType(type); setIsFormOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Редактировать"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
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
                <LubricantTypeForm
                    initialData={editingType}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadTypes();
                    }}
                />
            )}
        </div>
    );
}