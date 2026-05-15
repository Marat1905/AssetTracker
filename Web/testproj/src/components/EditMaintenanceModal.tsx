// components/EditMaintenanceModal.tsx
import { useState, useEffect } from 'react';
import { motorApi, lubricantApi } from '../services/api';
import type { MaintenanceLogDto, LubricantType, UpdateMaintenanceLogDto } from '../types';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    motorId: number;
    log: MaintenanceLogDto;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMaintenanceModal({ isOpen, motorId, log, onClose, onSuccess }: Props) {
    const [comment, setComment] = useState(log.comment || '');
    const [lubricantTypeId, setLubricantTypeId] = useState<number | ''>(log.lubricantTypeId ?? '');
    const [newBearingType, setNewBearingType] = useState(log.newBearingType || '');
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLubricants, setLoadingLubricants] = useState(false);

    // Загружаем список типов смазки, только если работа – смазка
    useEffect(() => {
        if (isOpen && log.workType === 'Lubrication') {
            const fetchLubricants = async () => {
                setLoadingLubricants(true);
                try {
                    const data = await lubricantApi.getAll();
                    setLubricants(data);
                } catch (err) {
                    console.error('Ошибка загрузки типов смазки', err);
                    toast.error('Не удалось загрузить типы смазки');
                } finally {
                    setLoadingLubricants(false);
                }
            };
            fetchLubricants();
        }
    }, [isOpen, log.workType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: UpdateMaintenanceLogDto = {};

            // Комментарий – если изменился
            if (comment !== log.comment) {
                payload.comment = comment;
            }

            // В зависимости от типа работ добавляем специфичные поля
            if (log.workType === 'Lubrication') {
                // Для смазки – обновляем тип смазки, если изменился
                if (lubricantTypeId !== log.lubricantTypeId) {
                    payload.lubricantTypeId = lubricantTypeId === '' ? undefined : Number(lubricantTypeId);
                }
            } else if (log.workType === 'BearingReplacement') {
                // Для замены подшипника – обновляем новый тип подшипника, если изменился
                if (newBearingType.trim() !== (log.newBearingType || '')) {
                    if (!newBearingType.trim()) {
                        toast.error('Тип подшипника не может быть пустым');
                        setLoading(false);
                        return;
                    }
                    payload.newBearingType = newBearingType.trim();
                }
            }

            // Если ничего не изменилось – уведомляем и выходим
            if (Object.keys(payload).length === 0) {
                toast.error('Нет изменений');
                setLoading(false);
                return;
            }

            await motorApi.updateMaintenanceLog(motorId, log.id, payload);
            toast.success('Запись обслуживания обновлена');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isLubrication = log.workType === 'Lubrication';
    const isBearingReplacement = log.workType === 'BearingReplacement';

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
                            Редактирование записи обслуживания
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Тип работ: {log.workType === 'Lubrication' ? 'Смазка' :
                                log.workType === 'BearingReplacement' ? 'Замена подшипника' :
                                    log.workType === 'StatorRewinding' ? 'Перемотка статора' :
                                        log.workType === 'ShaftRepair' ? 'Ремонт вала' : log.workType}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Поле комментария доступно всегда */}
                        <div>
                            <label className="form-label">Комментарий</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="form-input"
                                rows={3}
                                placeholder="Комментарий к работе..."
                            />
                        </div>

                        {/* Для смазки – поле выбора типа смазки */}
                        {isLubrication && (
                            <div>
                                <label className="form-label">Тип смазки</label>
                                {loadingLubricants ? (
                                    <div className="text-gray-500">Загрузка...</div>
                                ) : (
                                    <select
                                        value={lubricantTypeId}
                                        onChange={(e) => setLubricantTypeId(e.target.value ? Number(e.target.value) : '')}
                                        className="form-input"
                                    >
                                        <option value="">-- Выберите тип смазки --</option>
                                        {lubricants.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Для замены подшипника – поле ввода нового типа подшипника */}
                        {isBearingReplacement && (
                            <div>
                                <label className="form-label">Новый тип подшипника</label>
                                <input
                                    type="text"
                                    value={newBearingType}
                                    onChange={(e) => setNewBearingType(e.target.value)}
                                    className="form-input"
                                    placeholder="например: 6310"
                                    required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {log.oldBearingType && (
                                        <span>Старый тип подшипника: <span className="font-mono">{log.oldBearingType}</span></span>
                                    )}
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    Изменение типа подшипника также обновит соответствующий подшипник в паспортных данных двигателя.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Отмена
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}