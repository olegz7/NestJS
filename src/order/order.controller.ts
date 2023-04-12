import { ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { OrderItemService } from './order-item.service';

@Controller()

export class OrderController {
  constructor(
    private orderService: OrderService,
    private orderItemService: OrderItemService
  ) {
  }
  
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/orders')
  all() {
    return this.orderService.find({
      relations: ['order_items']
    })
  }

  @UseInterceptors(ClassSerializerInterceptor)
  // Endpoint for creating orders
  @Post('admin/register/orders')

  async createOrders() {
    const registeredOrders = [];
    for(let i = 0; i < 30; i++) {
      const order = {
        user_id: randomInt(2, 31),
        code: faker.lorem.slug(2),
        ambassador_email: faker.internet.email(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        complete: true
      };
      const savedOrder = await this.orderService.save(order);
  
      for (let j = 0; j < randomInt(1, 5); j++) {
        const orderItem = {
          order,
          product_title: faker.lorem.words(2),
          price: randomInt(10, 100),
          quantity: randomInt(1, 5),
          admin_revenue: randomInt(10, 100),
          ambassador_revenue: randomInt(1, 10),
        };
        await this.orderItemService.save(orderItem);
      }
      
      registeredOrders.push(savedOrder);
    }
    return registeredOrders;
  }

}
