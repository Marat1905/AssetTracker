import { useState } from 'react';
import { lubricantApi } from '../services/api';
import type { LubricantType, CreateLubricantTypeDto, UpdateLubricantTypeDto } from '../types';
import toast from 'react-hot-toast';

interface Props {
    initialData?: LubricantType | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LubricantTypeForm({ initialData, onClose, onSuccess }: Props) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Название обязательно');
            return;
        }
        setLoading(true);
        try {
            if (initialData) {
                // Редактирование
                const payload: UpdateLubricantTypeDto = { name: name.trim(), description: description.trim() || undefined };
                await lubricantApi.update(initialData.id, payload);
                toast.success('Тип смазки обновлён');
            } else {
                // Создание
                const payload: CreateLubricantTypeDto = { name: name.trim(), description: description.trim() || undefined };
                await lubricantApi.create(payload);
                toast.success('Тип смазки создан');
            }
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-text-h">
                            {initialData ? 'Редактирование типа смазки' : 'Новый тип смазки'}
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Название *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                placeholder="например: Литол-24"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Описание</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-input"
                                rows={3}
                                placeholder="Необязательное описание"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Отмена
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Сохранение...' : (initialData ? 'Сохранить' : 'Создать')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}