import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import { faker } from "@faker-js/faker";
import { randomInt } from 'crypto';

@Controller()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('admin/products')
  async all() {
    return this.productService.find({})
  }

  @Post('admin/products') 
  async create(@Body() body: ProductCreateDto) {
    return this.productService.save(body)
    
  }

  @Get('admin/products/:id') 
  async get(@Param('id') id: number) {
    return this.productService.findOne({id})
  }

  @Put('admin/products/:id')
  async update( 
    @Param('id') id: number,
    @Body() body: ProductCreateDto
  ) {
    await this.productService.update(id, body);

    return this.productService.findOne({id})
  }

  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    return this.productService.delete(id);
  }

  // Endpoint for creating products
  @Post('admin/register/products')

  async registerProducts() {
    const registeredProducts = [];
    for(let i = 0; i < 30; i++) {
      const newProduct = {
        title: faker.lorem.words(2),
        description: faker.lorem.words(10),
        image: faker.image.imageUrl(200, 200, '', true),
        price: randomInt(10, 100)
      };
      const savedProduct = await this.productService.save(newProduct);
      registeredProducts.push(savedProduct);
    }
    return registeredProducts;
  }
    
}
