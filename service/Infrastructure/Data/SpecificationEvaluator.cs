using Core.Entities;
using Core.Specifications;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class SpecificationEvaluator<TEntity> where TEntity : BaseEntity
{
    public static IQueryable<TEntity> GetQuery(
        IQueryable<TEntity> inputQuery,
        ISpecification<TEntity> spec)
    {
        var query = inputQuery;

        // Criteria / Where
        if (spec.Criteria != null)
        {
            query = query.Where(spec.Criteria);
        }

        // Sort Order by ASC
        if (spec.OrderBy != null)
        {
            query = query.OrderBy(spec.OrderBy);
        }

        // Sort Order by DESC
        if (spec.OrderByDescending != null)
        {
            query = query.OrderByDescending(spec.OrderByDescending);
        }

        // Pagination
        if (spec.IsPagingEnabled)
        {
            query = query.Skip(spec.Skip).Take(spec.Take);
        }

        // Include / Join FK
        query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));

        return query;
    }
}
