import { Body, Controller, Post } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs'

@Controller()
export class AuthController {
  constructor(private userService: UserService) {

  }

  @Post('admin/register')
  async register(@Body() body: RegisterDto) {
    // we can determine what data will be send via post request using Data Transfer Object
    
    // separate password_confirm from other data
    const {password_confirm, ...data} = body

    if(body.password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!')
    }

    const hashed = await bcrypt.hash(body.password, 12)

    // return body;
    return this.userService.save({
      ...data,
      password: hashed,
      is_ambassador: false
    })
  }

  @Post('admin/login')
  async login (
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    // const user = await this.userService.findOne({email: email})
    const user = await this.userService.findOne({email})

    if(!user) {
      throw new NotFoundException('User not found')
    }

    if(!await bcrypt.compare(password, user.password)) {
      throw new BadRequestException('Invalid credentials')
    }
    return user
  }
}
