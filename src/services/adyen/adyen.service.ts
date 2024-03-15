import { ResultType } from '@adyen/api-library/lib/src/typings/terminal/resultType'
import { Injectable, Logger } from '@nestjs/common'

import { AdyenServiceTypes } from '~/src/services/adyen'

import { BaseAdyenService } from './base'

@Injectable()
export class AdyenService extends BaseAdyenService {
  protected readonly logger = new Logger(AdyenService.name)

  async getPaymentMethods(params: AdyenServiceTypes.GetPaymentMethodsParams) {
    const response = await this.getPaymentMethodsRequest(params)

    if (response === null) {
      return {
        result: 'error',
        message: 'Failed to get payment methods',
      }
    }

    return {
      result: 'success',
      message: 'Payment methods retrieved',
      data: response,
    }
  }

  async reversalPayment(params: AdyenServiceTypes.ReversalPaymentParams) {
    const response = await this.reversalPaymentRequest(params)
    const paymentResponse = response?.SaleToPOIResponse?.ReversalResponse

    if (response === null || !paymentResponse) {
      return {
        result: 'error',
        message: 'Failed to reverse payment',
      }
    }

    if (paymentResponse.Response.Result !== ResultType.Success) {
      return {
        result: 'error',
        message: 'Failed to reverse payment',
        error: {
          condition: paymentResponse.Response.ErrorCondition,
          message: paymentResponse.Response.AdditionalResponse,
        },
      }
    }

    const posData = paymentResponse.POIData?.POITransactionID

    return {
      result: 'success',
      message: 'Payment reversed',
      transaction: {
        pspReference: posData?.TransactionID,
        posTransactionId: posData?.TransactionID,
        posTransactionTimeStamp: posData?.TimeStamp,
      },
    }
  }

  async abortPayment(params: AdyenServiceTypes.AbortPaymentParams) {
    const response = await this.abortPaymentRequest(params)
    if (response === null) {
      return {
        result: 'error',
        message: 'Failed to abort payment',
      }
    }

    return {
      result: 'success',
      message: 'Payment aborted',
    }
  }

  async requestPayment(params: AdyenServiceTypes.RequestPaymentParams) {
    const response = await this.requestPaymentRequest(params)
    const paymentResponse = response?.SaleToPOIResponse?.PaymentResponse

    if (response === null || !paymentResponse) {
      return {
        result: 'error',
        message: 'Failed to request payment',
      }
    }

    const posData = paymentResponse.POIData.POITransactionID
    const saleData = paymentResponse.SaleData.SaleTransactionID
    const headers = response.SaleToPOIRequest?.MessageHeader
    const [tenderReference, pspReference] = posData.TransactionID.split('.')

    if (paymentResponse.Response.Result !== ResultType.Success) {
      return {
        result: 'error',
        message: 'Failed to request payment',
        headers: {
          serviceId: headers?.ServiceID,
          saleId: headers?.SaleID,
          posId: headers?.POIID,
        },
        transaction: {
          tenderReference,
          pspReference,
          posTransactionId: posData.TransactionID,
          posTransactionTimeStamp: posData.TimeStamp,
          saleTransactionId: saleData.TransactionID,
          saleTransactionTimeStamp: saleData.TimeStamp,
        },
        error: {
          condition: paymentResponse.Response.ErrorCondition,
          message: paymentResponse.Response.AdditionalResponse,
        },
      }
    }

    return {
      result: 'success',
      message: 'Payment requested',
      headers: {
        serviceId: headers?.ServiceID,
        saleId: headers?.SaleID,
        posId: headers?.POIID,
      },
      transaction: {
        pspReference,
        tenderReference,
        posTransactionId: posData.TransactionID, // nsu
        posTransactionTimeStamp: posData.TimeStamp,
        saleTransactionId: saleData.TransactionID, // tid
        saleTransactionTimeStamp: saleData.TimeStamp,
      },
    }
  }
}
