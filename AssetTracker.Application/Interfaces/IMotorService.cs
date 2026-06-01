using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.Interfaces;

/// <summary>
/// Сервис для работы с электродвигателями.
/// </summary>
public interface IMotorService
{
    /// <summary>
    /// Первичная регистрация нового двигателя.
    /// </summary>
    /// <param name="dto">Данные для создания двигателя.</param>
    /// <returns>Полная карточка созданного двигателя.</returns>
    /// <exception cref="InvalidOperationException">Двигатель с таким инвентарным номером уже существует.</exception>
    Task<MotorFullHistoryDto> CreateMotorAsync(CreateMotorDto dto);

    /// <summary>
    /// Установить или изменить инвентарный номер двигателя.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Новый инвентарный номер (может быть null).</param>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    /// <exception cref="InvalidOperationException">Новый инвентарный номер уже используется другим двигателем.</exception>
    Task SetInventoryNumberAsync(int motorId, SetInventoryNumberDto dto);

    /// <summary>
    /// Перемещение двигателя (автоматически закрывает старую запись в истории перемещений).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Новое местоположение и опционально новый статус.</param>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    Task MoveMotorAsync(int motorId, MoveMotorDto dto);

    /// <summary>
    /// Фиксация факта ремонта или смазки.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Данные о выполненной работе.</param>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    /// <exception cref="ArgumentException">Некорректные данные для типа работы.</exception>
    Task AddMaintenanceAsync(int motorId, MaintenanceDto dto);

    /// <summary>
    /// Получение "карточки жизни" ЭД: где стоял и что с ним делали (без пагинации – для мобильных устройств).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <returns>Полная история двигателя, включая последние 100 записей обслуживания.</returns>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    Task<MotorFullHistoryDto> GetFullHistoryAsync(int motorId);

    /// <summary>
    /// Получение списка всех электродвигателей (без пагинации – для мобильных устройств).
    /// </summary>
    /// <returns>Краткий список двигателей.</returns>
    Task<IEnumerable<MotorListItemDto>> GetAllMotorsAsync();

    /// <summary>
    /// Редактирование основных характеристик двигателя.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Обновлённые характеристики.</param>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    Task UpdateMotorAsync(int motorId, UpdateMotorDto dto);

    /// <summary>
    /// Удаление двигателя (вместе со всей историей перемещений и обслуживания).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    Task DeleteMotorAsync(int motorId);

    /// <summary>
    /// Получение списка электродвигателей с пагинацией и фильтрацией (для UI).
    /// </summary>
    /// <param name="page">Номер страницы (начиная с 1).</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="inventoryNumberFilter">Фильтр по инвентарному номеру (частичное совпадение).</param>
    /// <param name="locationFilter">Фильтр по текущему местоположению (частичное совпадение).</param>
    /// <param name="statusFilter">Фильтр по статусу.</param>
    /// <param name="hasInventoryNumber">//Фильтр по наличию инвентарного номера: true – только с номером, false – только без номера, null – все.</param>
    /// <returns>Страница с результатами и метаинформацией.</returns>
    Task<PagedResult<MotorListItemDto>> GetMotorsPagedAsync(
        int page,
        int pageSize,
        string? inventoryNumberFilter,
        string? locationFilter,
        MotorStatus? statusFilter,
        bool? hasInventoryNumber = null);

    /// <summary>
    /// Получение пагинированной истории перемещений двигателя (для UI).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="page">Номер страницы (начиная с 1).</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <returns>Страница истории перемещений.</returns>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    Task<PagedResult<LocationHistoryDto>> GetMotorLocationHistoryPagedAsync(int motorId, int page, int pageSize);

    /// <summary>
    /// Получение пагинированного журнала обслуживания двигателя с возможностью фильтрации по типу работ и периоду времени (для UI).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="page">Номер страницы (начиная с 1).</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="workType">Фильтр по типу работ (опционально).</param>
    /// <param name="fromDate">Фильтр по дате – записи не ранее указанной даты (опционально).</param>
    /// <param name="toDate">Фильтр по дате – записи не позднее указанной даты (опционально).</param>
    /// <returns>Страница записей обслуживания.</returns>
    /// <exception cref="KeyNotFoundException">Двигатель не найден.</exception>
    /// <exception cref="ArgumentException">Некорректный диапазон дат.</exception>
    Task<PagedResult<MaintenanceLogDto>> GetMotorMaintenanceLogsPagedAsync(
        int motorId,
        int page,
        int pageSize,
        MaintenanceType? workType,
        DateTime? fromDate,
        DateTime? toDate);

    /// <summary>
    /// Редактирование записи обслуживания (разрешены только Comment, PerformedBy и, для смазки, LubricantTypeId).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="logId">ID записи обслуживания.</param>
    /// <param name="dto">Новые данные (комментарий, тип смазки или новый тип подшипника).</param>
    /// <exception cref="KeyNotFoundException">Двигатель или запись не найдены.</exception>
    /// <exception cref="InvalidOperationException">Некорректное изменение для типа работы.</exception>
    /// <exception cref="ArgumentException">Неверный идентификатор типа смазки.</exception>
    Task UpdateMaintenanceLogAsync(int motorId, int logId, UpdateMaintenanceLogDto dto);

    /// <summary>
    /// Удаление записи обслуживания.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="logId">ID записи обслуживания.</param>
    /// <exception cref="KeyNotFoundException">Двигатель или запись не найдены.</exception>
    Task DeleteMaintenanceLogAsync(int motorId, int logId);

    /// <summary>
    /// Редактирование записи истории перемещений (разрешено только изменение Location, даты не редактируются).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="locationHistoryId">ID записи истории перемещений.</param>
    /// <param name="dto">Новое расположение.</param>
    /// <exception cref="KeyNotFoundException">Двигатель или запись не найдены.</exception>
    Task UpdateLocationHistoryAsync(int motorId, int locationHistoryId, UpdateLocationHistoryDto dto);

    /// <summary>
    /// Удаление записи истории перемещений с проверкой целостности временной линии.
    /// Даты не редактируются, удаление возможно только для последней записи или активной записи
    /// (при этом предыдущая запись становится активной).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="locationHistoryId">ID записи истории перемещений.</param>
    /// <exception cref="KeyNotFoundException">Двигатель или запись не найдены.</exception>
    /// <exception cref="InvalidOperationException">Невозможно удалить запись из-за нарушения целостности временной линии.</exception>
    Task DeleteLocationHistoryAsync(int motorId, int locationHistoryId);

    /// <summary>
    /// Получение пагинированного отчёта по обслуживанию за период.
    /// </summary>
    /// <param name="fromDate">Начало периода (включительно).</param>
    /// <param name="toDate">Конец периода (включительно).</param>
    /// <param name="workType">Фильтр по типу работ (опционально).</param>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <returns>Страница с детальными записями обслуживания.</returns>
    Task<PagedResult<MaintenanceReportItemDto>> GetMaintenanceReportPagedAsync(
        DateTime? fromDate,
        DateTime? toDate,
        MaintenanceType? workType,
        int page,
        int pageSize);

    /// <summary>
    /// Получение сводки по обслуживанию за период (количество по типам работ).
    /// </summary>
    /// <param name="fromDate">Начало периода (включительно).</param>
    /// <param name="toDate">Конец периода (включительно).</param>
    /// <returns>Список объектов с типом работы и количеством записей.</returns>
    Task<IEnumerable<MaintenanceReportSummaryDto>> GetMaintenanceReportSummaryAsync(
        DateTime? fromDate,
        DateTime? toDate);
}