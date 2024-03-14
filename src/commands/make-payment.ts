import { randomInt, randomUUID } from 'crypto'

import { AdyenService } from '~/src/adyen'
import { RequestPaymentParams } from '~/src/adyen/types'

export async function makePayment({
  amount,
  paymentMethod,
  installments,
}: Omit<RequestPaymentParams['payment'], 'transactionId'>) {
  const adyenService = new AdyenService()

  return adyenService.requestPayment({
    applicationId: process.env.APPLICATION_ID as string,
    posId: 'V240mPlus-542106263',
    saleId: randomInt(100000, 999999).toString(),
    payment: {
      amount,
      paymentMethod,
      transactionId: randomUUID() as string,
      installments,
    },
  })
}
