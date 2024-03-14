import 'reflect-metadata'
import 'dotenv/config'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import morgan from 'morgan'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludePrefixes: ['_'],
      },
    }),
  )

  app.use(morgan('dev'))

  await app.listen(3000)
}
bootstrap()
