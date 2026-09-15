using System.Linq.Expressions;

namespace AssetTracker.Domain.Interfaces;

/// <summary>
/// Базовый интерфейс репозитория с CRUD операциями.
/// </summary>
/// <typeparam name="T">Тип сущности.</typeparam>
public interface IRepository<T> where T : class
{
    /// <summary>Получить сущность по идентификатору.</summary>
    /// <param name="id">Идентификатор.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Получить все сущности.</summary>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Найти сущности по условию.</summary>
    /// <param name="predicate">Условие.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>Добавить новую сущность.</summary>
    /// <param name="entity">Сущность.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>Обновить существующую сущность.</summary>
    /// <param name="entity">Сущность.</param>
    void Update(T entity);

    /// <summary>Удалить сущность.</summary>
    /// <param name="entity">Сущность.</param>
    void Remove(T entity);
}