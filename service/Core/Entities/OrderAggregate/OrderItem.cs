using System;

namespace Core.Entities.OrderAggregate
{
    public class OrderItem: BaseEntity
    {
        public OrderItem()
        {
        }
        
        public OrderItem(ProductItemOrdered itemOrdered, decimal price, int quatity)
        {
            ItemOrdered = itemOrdered;
            Price = price;
            Quatity = quatity;
        }

        public ProductItemOrdered ItemOrdered { get; set; }
        public decimal Price { get; set; }
        public int Quatity { get; set; }
    }
}
