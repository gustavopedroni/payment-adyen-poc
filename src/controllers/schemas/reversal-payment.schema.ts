import { IsString } from 'class-validator'

export class ReversalPaymentSchema {
  @IsString()
  posId: string

  @IsString()
  saleId: string

  @IsString()
  posTransactionId: string

  @IsString()
  saleTransactionId: string
}
