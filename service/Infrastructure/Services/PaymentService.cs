using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IBasketRepository _basketRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public PaymentService(
        IBasketRepository basketRepository,
        IUnitOfWork unitOfWork,
        IConfiguration config)
    {
        _basketRepository = basketRepository;
        _unitOfWork = unitOfWork;
        _config = config;
    }
    public async Task<CustomerBasket> CreateOrUpdatePaymentIntent(string basketId)
    {
        StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

        // get cart details
        var basket = await _basketRepository.GetBasketAsync(basketId);

        if (basket == null) return null;

        var shippingPrice = 0m;

        // check if a delivery method has been selected
        if (basket.DeliveryMethodId.HasValue)
        {
            // get delivery method and shipping price
            var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(basket.DeliveryMethodId.Value);
            shippingPrice = deliveryMethod.Price;
        }

        foreach (var item in basket.Items)
        {
            // update item price in cart based on updated product price
            var productItem = await _unitOfWork.Repository<Core.Entities.Product>().GetByIdAsync(item.Id);
            if (item.Price != productItem.Price)
            {
                item.Price = productItem.Price;
            }
        }

        var service = new PaymentIntentService();

        PaymentIntent intent;

        // check if payment intent has been created
        if (string.IsNullOrEmpty(basket.PaymentIntentId))
        {
            // create new payment intent
            var options = new PaymentIntentCreateOptions
            {
                Amount = ((long)basket.Items.Sum(i => i.Quantity * (i.Price * 100))) + ((long)shippingPrice * 100),
                Currency = "usd",
                PaymentMethodTypes = new List<string> {"card"}
            };

            intent = await service.CreateAsync(options);
            basket.PaymentIntentId = intent.Id;
            basket.ClientSecret = intent.ClientSecret;
        }
        else 
        {
            // update payment intent details
            var options = new PaymentIntentUpdateOptions
            {
                Amount = ((long)basket.Items.Sum(i => i.Quantity * (i.Price * 100))) + ((long)shippingPrice * 100)
            };
            await service.UpdateAsync(basket.PaymentIntentId, options);
        }

        // update cart details
        await _basketRepository.UpdateBasketAsync(basket);

        return basket;
    }

    public async Task<Core.Entities.OrderAggregate.Order> UpdateOrderPaymentFailed(string paymentIntentId)
    {
        var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
        var order = await _unitOfWork.Repository<Core.Entities.OrderAggregate.Order>().GetEntityWithSpec(spec);

        if (order == null) return null;

        order.Status = OrderStatus.PaymentFailed;
        _unitOfWork.Repository<Core.Entities.OrderAggregate.Order>().Update(order);

        await _unitOfWork.Complete();

        return order;
    }

    public async Task<Core.Entities.OrderAggregate.Order> UpdateOrderPaymentSucceeded(string paymentIntentId)
    {
        var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
        var order = await _unitOfWork.Repository<Core.Entities.OrderAggregate.Order>().GetEntityWithSpec(spec);

        if (order == null) return null;

        order.Status = OrderStatus.PaymentReceived;
        _unitOfWork.Repository<Core.Entities.OrderAggregate.Order>().Update(order);

        await _unitOfWork.Complete();

        return order;
    }
}
