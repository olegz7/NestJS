import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { UserService } from "../user/user.service";
import { faker } from "@faker-js/faker";
import * as bcrypt from 'bcryptjs'

(async () => {

// async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
 
  const userService = app.get(UserService)

  const password = await bcrypt.hash("1234", 12);

  for(let i = 0; i < 30; i++) {
    await userService.save({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      is_ambassador: true
    })
  }

  // await app.close();
  // this process will keep running if we won't stop it
  process.exit()
})();


// }
// bootstrap();