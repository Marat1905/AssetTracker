namespace AssetTracker.Application.DTOs;

/// <summary>
/// Обёртка для пагинированного результата.
/// </summary>
/// <typeparam name="T">Тип элементов.</typeparam>
public class PagedResult<T>
{
    /// <summary>Элементы текущей страницы.</summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();

    /// <summary>Общее количество записей.</summary>
    public int TotalCount { get; set; }

    /// <summary>Номер текущей страницы.</summary>
    public int PageNumber { get; set; }

    /// <summary>Размер страницы.</summary>
    public int PageSize { get; set; }

    /// <summary>Общее количество страниц.</summary>
    public int TotalPages { get; set; }
}