import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motorApi } from '../services/api';
import { MotorStatus, type MotorFullHistoryDto, type UpdateMotorRequest } from '../types';
import { motorStatusLabels } from '../utils/locales';

const schema = z.object({
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    frontBearingType: z.string().min(1, 'Передний подшипник обязателен'),
    rearBearingType: z.string().min(1, 'Задний подшипник обязателен'),
    status: z.nativeEnum(MotorStatus),
});

type FormData = z.infer<typeof schema>;

interface Props {
    motor: MotorFullHistoryDto;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMotorModal({ motor, isOpen, onClose, onSuccess }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: motor.type,
            shaftDiameter: motor.shaftDiameter,
            power: motor.power,
            speed: motor.speed,
            frontBearingType: motor.frontBearingType,
            rearBearingType: motor.rearBearingType,
            status: motor.status,
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            await motorApi.updateMotor(motor.inventoryNumber, data as UpdateMotorRequest);
            toast.success('Данные двигателя обновлены');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Ошибка обновления:', err);
            const message = err.response?.data?.error || 'Ошибка обновления двигателя';
            toast.error(message);
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
                                <input {...register('frontBearingType')} className="form-input" />
                                {errors.frontBearingType && <p className="text-danger text-xs mt-1">{errors.frontBearingType.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Задний подшипник</label>
                                <input {...register('rearBearingType')} className="form-input" />
                                {errors.rearBearingType && <p className="text-danger text-xs mt-1">{errors.rearBearingType.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Статус</label>
                                <select {...register('status')} className="form-input">
                                    {Object.entries(motorStatusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Отмена
                            </button>
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