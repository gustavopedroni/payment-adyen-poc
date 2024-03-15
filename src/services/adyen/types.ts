export enum PaymentMethod {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
}

type BasePaymentParams = {
  posId: string
  saleId: string
}

export type GetPaymentMethodsParams = {
  merchantAccount: string
}

export type RequestPaymentParams = BasePaymentParams & {
  payment: {
    currency?: string
    amount: number
    installments?: number
    paymentMethod: PaymentMethod
  }
}

export type AbortPaymentParams = BasePaymentParams & {
  serviceId: string
  abortReason?: string
}

export type ReversalPaymentParams = BasePaymentParams & {
  posTransactionId: string
  saleTransactionId: string
}
