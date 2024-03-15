import { Body, Controller, Get, Post } from '@nestjs/common'

import { AbortPaymentSchema } from '~/src/controllers/schemas/abort-payment.schema'
import { CreatePaymentSchema } from '~/src/controllers/schemas/create-payment.schema'
import { ReversalPaymentSchema } from '~/src/controllers/schemas/reversal-payment.schema'
import { AdyenService } from '~/src/services/adyen'

@Controller('/payments')
export class PaymentController {
  constructor(private readonly adyenService: AdyenService) {}

  @Get('/methods')
  async getPaymentMethods() {
    const response = await this.adyenService.getPaymentMethods({
      merchantAccount: 'Infracommerce_Peg2Go',
    })

    return response
  }

  @Post('/create')
  async createPayment(
    @Body()
    { posId, amount, paymentMethod, saleId, installments }: CreatePaymentSchema,
  ) {
    const response = await this.adyenService.requestPayment({
      posId,
      saleId,
      payment: {
        installments,
        amount,
        paymentMethod,
      },
    })

    return response
  }

  @Post('/reversal')
  async reversalPayment(
    @Body()
    {
      posId,
      saleId,
      posTransactionId,
      saleTransactionId,
    }: ReversalPaymentSchema,
  ) {
    const response = await this.adyenService.reversalPayment({
      posId,
      saleId,
      posTransactionId,
      saleTransactionId,
    })

    return response
  }

  @Post('/abort')
  async transactionPayment(
    @Body()
    { posId, saleId, serviceId }: AbortPaymentSchema,
  ) {
    const response = await this.adyenService.abortPayment({
      posId,
      saleId,
      serviceId,
    })

    return response
  }
}
