import { IsString } from 'class-validator'

export class AbortPaymentSchema {
  @IsString()
  posId: string

  @IsString()
  saleId: string

  @IsString()
  serviceId: string
}
