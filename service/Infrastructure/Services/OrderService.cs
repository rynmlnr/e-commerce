using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;

namespace Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBasketRepository _basketRepo;

    public OrderService(
        IUnitOfWork unitOfWork,
        IBasketRepository basketRepo
    )
    {
        _unitOfWork = unitOfWork;
        _basketRepo = basketRepo;
    }

    public async Task<Order> CreateOrderAsync(string buyerEmil, int deliveryMethodId, string basketId, Address shippingAddress)
    {
        // get basket
        var basket = await _basketRepo.GetBasketAsync(basketId);

        // get products in the basket from the product repo
        var orderItems = new List<OrderItem>();
        foreach (var item in basket.Items)
        {
            var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
            var itemOrdered = new ProductItemOrdered(productItem.Id, productItem.Name, productItem.PictureUrl);
            var orderItem = new OrderItem(itemOrdered, productItem.Price, item.Quantity);
            orderItems.Add(orderItem);
        }

        // get delivery method
        var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(deliveryMethodId);

        // calculate sub total
        var subtotal = orderItems.Sum(item => item.Price * item.Quantity);

        // create order
        var order = new Order(orderItems, buyerEmil, shippingAddress, deliveryMethod, subtotal);
        _unitOfWork.Repository<Order>().Add(order);
        
        // save to db
        var result = await _unitOfWork.Complete();

        if (result <= 0) return null;

        // delete basket
        await _basketRepo.DeleteBasketAsync(basketId);

        // return order
        return order;
    }

    public async Task<IReadOnlyList<DeliveryMethod>> GetDeliveryMethodsAsync()
    {
        return await _unitOfWork.Repository<DeliveryMethod>().ListAllAsync();
    }

    public async Task<Order> GetOrderByIdAsync(int id, string buyerEmail)
    {
        var spec = new OrdersWithItemsAndOrderingSpecification(id, buyerEmail);

        return await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
    }

    public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail)
    {
        var spec = new OrdersWithItemsAndOrderingSpecification(buyerEmail);

        return await _unitOfWork.Repository<Order>().ListAsync(spec);
    }
}
