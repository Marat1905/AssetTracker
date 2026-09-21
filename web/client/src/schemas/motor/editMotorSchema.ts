import { z } from 'zod';
import { MountingType } from '../../types/motor/motor';

/**
 * Схема валидации формы редактирования основных характеристик двигателя.
 * Статус не редактируется здесь – он меняется только при перемещении.
 */
export const editMotorSchema = z.object({
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    mountingType: z.nativeEnum(MountingType),
});

/** Тип данных формы редактирования двигателя. */
export type EditMotorFormData = z.infer<typeof editMotorSchema>;