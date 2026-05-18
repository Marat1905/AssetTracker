import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motorApi } from '../services/api';
import { MotorStatus, MountingType, type MotorFullHistoryDto, type UpdateMotorRequest } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';

const schema = z.object({
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
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
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: motor.type,
            shaftDiameter: motor.shaftDiameter,
            power: motor.power,
            speed: motor.speed,
            status: motor.status,
            mountingType: motor.mountingType,
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            // Подготовка данных для обновления (подшипники не изменяются через этот API)
            const updateData: UpdateMotorRequest = {
                type: data.type,
                shaftDiameter: data.shaftDiameter,
                power: data.power,
                speed: data.speed,
                // Поля для обратной совместимости (бекенд может их не использовать)
                frontBearingType: motor.frontBearing.type,
                rearBearingType: motor.rearBearing.type,
                status: data.status,
                mountingType: data.mountingType,
            };
            await motorApi.updateMotor(motor.inventoryNumber, updateData);
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
                        <p className="text-sm text-gray-500 mt-1">
                            Изменение подшипников выполняется через «Замену подшипника» в журнале обслуживания.
                        </p>
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
                                {errors.mountingType && <p className="text-danger text-xs mt-1">{errors.mountingType.message}</p>}
                            </div>

                            {/* Информационные блоки о подшипниках (только для чтения) */}
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-2">
                                <h4 className="text-sm font-semibold text-text-h mb-2">Передний подшипник (только для информации)</h4>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm space-y-1">
                                    <div><span className="text-gray-500">Тип:</span> {motor.frontBearing.type}</div>
                                    <div><span className="text-gray-500">Производитель:</span> {motor.frontBearing.manufacturer}</div>
                                    <div><span className="text-gray-500">Поставщик:</span> {motor.frontBearing.supplier}</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-h mb-2">Задний подшипник (только для информации)</h4>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm space-y-1">
                                    <div><span className="text-gray-500">Тип:</span> {motor.rearBearing.type}</div>
                                    <div><span className="text-gray-500">Производитель:</span> {motor.rearBearing.manufacturer}</div>
                                    <div><span className="text-gray-500">Поставщик:</span> {motor.rearBearing.supplier}</div>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                    Для изменения подшипника используйте операцию «Замена подшипника» в журнале обслуживания.
                                </p>
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