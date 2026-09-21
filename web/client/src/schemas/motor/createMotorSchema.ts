import { z } from 'zod';
import { MotorStatus, MountingType } from '../../types/motor/motor';

/**
 * Схема валидации формы создания нового электродвигателя.
 * Проверяет все обязательные поля, включая данные обоих подшипников.
 */
export const createMotorSchema = z.object({
    inventoryNumber: z.string().optional().nullable(),
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    // Передний подшипник
    frontBearingType: z.string().min(1, 'Тип переднего подшипника обязателен'),
    frontBearingManufacturer: z.string().min(1, 'Производитель переднего подшипника обязателен'),
    frontBearingSupplier: z.string().min(1, 'Поставщик переднего подшипника обязателен'),
    // Задний подшипник
    rearBearingType: z.string().min(1, 'Тип заднего подшипника обязателен'),
    rearBearingManufacturer: z.string().min(1, 'Производитель заднего подшипника обязателен'),
    rearBearingSupplier: z.string().min(1, 'Поставщик заднего подшипника обязателен'),
    status: z.nativeEnum(MotorStatus),
    initialLocation: z.string().min(1, 'Начальное местоположение обязательно'),
    mountingType: z.nativeEnum(MountingType),
});

/** Тип данных формы создания двигателя. */
export type CreateMotorFormData = z.infer<typeof createMotorSchema>;