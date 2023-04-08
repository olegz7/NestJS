import { Body, ClassSerializerInterceptor, Controller, Get, Post, Put, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';
import { faker } from "@faker-js/faker";


@Controller()

// UseInterceptors is used to exclude some of the data we recieve from BE, 
// applies to all endpoints from here
@UseInterceptors(ClassSerializerInterceptor)

export class AuthController {
  constructor(
    private userService: UserService,
    private jtwService: JwtService) {
  }

  @Post('admin/register')
  async register(@Body() body: RegisterDto) {
    // we can determine what data will be send via post request using Data Transfer Object
    
    // separate password_confirm from other data, cause we don't need to return it
    const {password_confirm, ...data} = body

    if(body.password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!')
    }

    const hashed = await bcrypt.hash(body.password, 12)
    // encrypt the password by creating a hash 

    return this.userService.save({
      ...data,
      password: hashed,
      is_ambassador: false
    })
  }

  @Post('admin/login')
  async login (
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({passthrough: true}) response: Response // passthrough option allows to send cookie from BE to FE
  ) {
    // const user = await this.userService.findOne({email: email}) // we can use simplier syntax below 
    const user = await this.userService.findOne({email})
    
    if(!user) {
      throw new NotFoundException('User not found')
    }

    if(!await bcrypt.compare(password, user.password)) {
      throw new BadRequestException('Invalid credentials')
    }

    // create jwt using service, add user id, scope will be added later
    const jwt = await this.jtwService.signAsync({
      id: user.id
    })

    // store jwt in cookie
    response.cookie('jwt', jwt, {httpOnly: true})

    return {
      message: 'successfully logged in'
    }
  }

  // Add guard on this route if user is logged out
  // Get the authenticated user
  @UseGuards(AuthGuard)
  @Get('admin/user')
  async user(@Req() request: Request) {
    // get cookie with jwt
    // need to install cookie-parser package and add settings to the main.ts file
    const cookie = request.cookies['jwt'];

    // here we get user id that we previously sent as payload in jwt (during login)
    const {id} = await this.jtwService.verifyAsync(cookie)

    // get the user
    return this.userService.findOne({id});

  }

  @UseGuards(AuthGuard) // cannot logout if we havent logged in before
  @Post('admin/logout')
  async logout(@Res({passthrough: true}) response: Response) {
    // if we clear our cookie will mean user will not be authenticated anymore
    response.clearCookie('jwt');

    return {
      message: 'successfully logged out'
    }
  }

  @UseGuards(AuthGuard) // to update smth we user should be authenticated
  @Put('admin/users/info')
  async updateInfo(
    @Req() request: Request,
    @Body('first_name') first_name: string,
    @Body('last_name') last_name: string,
    @Body('email') email: string,
  ) {
    const cookie = request.cookies['jwt'];

    const {id} = await this.jtwService.verifyAsync(cookie);

    await this.userService.update(id, {
      first_name,
      last_name,
      email
    })

    // the userService.update function doesn't return updated user, that's why we need to call findOne
    return this.userService.findOne({id})

  }

  @UseGuards(AuthGuard)
  @Put('admin/users/password')
  async updatePassword(
    @Req() request: Request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {

    if(password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!')
    }

    const cookie = request.cookies['jwt'];

    const {id} = await this.jtwService.verifyAsync(cookie);

    await this.userService.update(id, {
      password: await bcrypt.hash(password, 12),
    })

    return this.userService.findOne({id})

  }


  // Endpoint for creating ambassadors
  @Post('admin/register/ambassadors')
 
  async registerAmbassadors() {
    const registeredAmbassadors = [];
    for(let i = 0; i < 30; i++) {
      const newAmbassador = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: await bcrypt.hash("1234", 12),
        is_ambassador: true
      }
      const savedAmbassador = await this.userService.save(newAmbassador);
      registeredAmbassadors.push(savedAmbassador);
    }
  return registeredAmbassadors;
  }

}
