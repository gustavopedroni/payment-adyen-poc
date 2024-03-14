import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

import { PaymentMethod } from '~/src/services/adyen/types'

export class CreatePaymentSchema {
  @IsString()
  posId: string

  @IsString()
  saleId: string

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @IsNumber()
  amount: number

  @IsNumber()
  @IsOptional()
  installments?: number
}
