import { useState, useEffect } from 'react';
import { motorApi, lubricantApi, bearingApi } from '../services/api';
import type { MaintenanceLogDto, LubricantType, Bearing, UpdateMaintenanceLogDto } from '../types';
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
    const [newBearingId, setNewBearingId] = useState<number | ''>(log.newBearingId ?? '');
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [bearings, setBearings] = useState<Bearing[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [lubs, brgs] = await Promise.all([
                        lubricantApi.getAll(),
                        bearingApi.getAll()
                    ]);
                    setLubricants(lubs);
                    setBearings(brgs);
                } catch (err) {
                    toast.error('Ошибка загрузки справочников');
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: UpdateMaintenanceLogDto = {};
            if (comment !== log.comment) payload.comment = comment;
            if (log.workType === 'Lubrication') {
                if (lubricantTypeId !== log.lubricantTypeId) {
                    payload.lubricantTypeId = lubricantTypeId === '' ? undefined : Number(lubricantTypeId);
                }
            } else if (log.workType === 'BearingReplacement') {
                if (newBearingId !== log.newBearingId) {
                    if (!newBearingId) throw new Error('Выберите подшипник');
                    payload.newBearingId = Number(newBearingId);
                }
            }
            if (Object.keys(payload).length === 0) {
                toast.error('Нет изменений');
                return;
            }
            await motorApi.updateMaintenanceLog(motorId, log.id, payload);
            toast.success('Запись обслуживания обновлена');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Ошибка обновления');
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
                        <h3 className="text-lg font-semibold text-text-h">Редактирование записи обслуживания</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Тип работ: {log.workType === 'Lubrication' ? 'Смазка' :
                                log.workType === 'BearingReplacement' ? 'Замена подшипника' :
                                    log.workType === 'StatorRewinding' ? 'Перемотка статора' :
                                        log.workType === 'ShaftRepair' ? 'Ремонт вала' : log.workType}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Комментарий</label>
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="form-input" rows={3} />
                        </div>

                        {isLubrication && (
                            <div>
                                <label className="form-label">Тип смазки</label>
                                {loadingData ? (
                                    <div className="text-gray-500">Загрузка...</div>
                                ) : (
                                    <select value={lubricantTypeId} onChange={(e) => setLubricantTypeId(e.target.value ? Number(e.target.value) : '')} className="form-input">
                                        <option value="">-- Выберите --</option>
                                        {lubricants.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {isBearingReplacement && (
                            <div>
                                <label className="form-label">Новый подшипник</label>
                                {loadingData ? (
                                    <div className="text-gray-500">Загрузка...</div>
                                ) : (
                                    <select value={newBearingId} onChange={(e) => setNewBearingId(e.target.value ? Number(e.target.value) : '')} className="form-input" required>
                                        <option value="">-- Выберите --</option>
                                        {bearings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.type} {b.manufacturer ? `(${b.manufacturer})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {log.oldBearingType && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Старый тип подшипника: <span className="font-mono">{log.oldBearingType}</span>
                                    </div>
                                )}
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    Изменение подшипника также обновит соответствующий подшипник в паспортных данных двигателя.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
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