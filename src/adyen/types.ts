export enum PaymentMethod {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
}

export type RequestPaymentParams = {
  payment: {
    transactionId: string
    amount: number
    installments?: number
    paymentMethod: PaymentMethod
  }
  posId: string
  saleId: string
  applicationId: string
}
