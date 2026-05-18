import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motorApi, bearingApi } from '../services/api';
import { MotorStatus, MountingType, type MotorFullHistoryDto, type UpdateMotorRequest, type Bearing } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';
import { useEffect, useState } from 'react';

const schema = z.object({
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    frontBearingId: z.number().optional(),
    rearBearingId: z.number().optional(),
    status: z.nativeEnum(MotorStatus),
    mountingType: z.nativeEnum(MountingType),
});

type FormData = z.infer<typeof schema>;

interface Props {
    motor: MotorFullHistoryDto;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMotorModal({ motor, isOpen, onClose, onSuccess }: Props) {
    const [bearings, setBearings] = useState<Bearing[]>([]);
    const [loadingBearings, setLoadingBearings] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: motor.type,
            shaftDiameter: motor.shaftDiameter,
            power: motor.power,
            speed: motor.speed,
            frontBearingId: motor.frontBearingId,
            rearBearingId: motor.rearBearingId,
            status: motor.status,
            mountingType: motor.mountingType,
        }
    });

    useEffect(() => {
        if (isOpen) {
            const fetchBearings = async () => {
                setLoadingBearings(true);
                try {
                    const data = await bearingApi.getAll();
                    setBearings(data);
                } catch (err) {
                    toast.error('Не удалось загрузить подшипники');
                } finally {
                    setLoadingBearings(false);
                }
            };
            fetchBearings();
            reset({
                type: motor.type,
                shaftDiameter: motor.shaftDiameter,
                power: motor.power,
                speed: motor.speed,
                frontBearingId: motor.frontBearingId,
                rearBearingId: motor.rearBearingId,
                status: motor.status,
                mountingType: motor.mountingType,
            });
        }
    }, [isOpen, motor, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            await motorApi.updateMotor(motor.inventoryNumber, data as UpdateMotorRequest);
            toast.success('Данные двигателя обновлены');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка обновления двигателя');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-text-h">
                            Редактирование двигателя №{motor.inventoryNumber}
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Тип двигателя</label>
                                <input {...register('type')} className="form-input" />
                                {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Диаметр вала (мм)</label>
                                <input type="number" step="0.1" {...register('shaftDiameter', { valueAsNumber: true })} className="form-input" />
                                {errors.shaftDiameter && <p className="text-danger text-xs mt-1">{errors.shaftDiameter.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Мощность (кВт)</label>
                                <input type="number" step="0.1" {...register('power', { valueAsNumber: true })} className="form-input" />
                                {errors.power && <p className="text-danger text-xs mt-1">{errors.power.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Обороты (об/мин)</label>
                                <input type="number" {...register('speed', { valueAsNumber: true })} className="form-input" />
                                {errors.speed && <p className="text-danger text-xs mt-1">{errors.speed.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Передний подшипник</label>
                                <select {...register('frontBearingId', { valueAsNumber: true })} className="form-input">
                                    <option value="">-- Не выбран --</option>
                                    {loadingBearings ? (
                                        <option disabled>Загрузка...</option>
                                    ) : (
                                        bearings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.type} {b.manufacturer ? `(${b.manufacturer})` : ''}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Задний подшипник</label>
                                <select {...register('rearBearingId', { valueAsNumber: true })} className="form-input">
                                    <option value="">-- Не выбран --</option>
                                    {loadingBearings ? (
                                        <option disabled>Загрузка...</option>
                                    ) : (
                                        bearings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.type} {b.manufacturer ? `(${b.manufacturer})` : ''}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Статус</label>
                                <select {...register('status')} className="form-input">
                                    {Object.entries(motorStatusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Тип монтажа</label>
                                <select {...register('mountingType')} className="form-input">
                                    {Object.entries(mountingTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary">
                                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}