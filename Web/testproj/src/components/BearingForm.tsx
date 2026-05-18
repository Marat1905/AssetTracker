import { useState } from 'react';
import { bearingApi } from '../services/api';
import type { Bearing, CreateBearingDto, UpdateBearingDto } from '../types';
import toast from 'react-hot-toast';

interface Props {
    initialData?: Bearing | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BearingForm({ initialData, onClose, onSuccess }: Props) {
    const [type, setType] = useState(initialData?.type || '');
    const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '');
    const [supplier, setSupplier] = useState(initialData?.supplier || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type.trim()) {
            toast.error('Тип подшипника обязателен');
            return;
        }
        setLoading(true);
        try {
            if (initialData) {
                const payload: UpdateBearingDto = {
                    type: type.trim(),
                    manufacturer: manufacturer.trim() || undefined,
                    supplier: supplier.trim() || undefined,
                };
                await bearingApi.update(initialData.id, payload);
                toast.success('Подшипник обновлён');
            } else {
                const payload: CreateBearingDto = {
                    type: type.trim(),
                    manufacturer: manufacturer.trim() || undefined,
                    supplier: supplier.trim() || undefined,
                };
                await bearingApi.create(payload);
                toast.success('Подшипник создан');
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
                            {initialData ? 'Редактирование подшипника' : 'Новый подшипник'}
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Тип *</label>
                            <input
                                type="text"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="form-input"
                                placeholder="например: 6308"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Производитель</label>
                            <input
                                type="text"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                className="form-input"
                                placeholder="SKF, FAG, NSK..."
                            />
                        </div>
                        <div>
                            <label className="form-label">Поставщик</label>
                            <input
                                type="text"
                                value={supplier}
                                onChange={(e) => setSupplier(e.target.value)}
                                className="form-input"
                                placeholder="ООО 'ПодшипникСервис'..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
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