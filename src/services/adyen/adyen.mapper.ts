import { randomUUID } from 'crypto'

import { Instalment } from '@adyen/api-library/lib/src/typings/terminal/instalment'
import { MessageCategoryType } from '@adyen/api-library/lib/src/typings/terminal/messageCategoryType'
import { MessageClassType } from '@adyen/api-library/lib/src/typings/terminal/messageClassType'
import { MessageReference } from '@adyen/api-library/lib/src/typings/terminal/messageReference'
import { MessageType } from '@adyen/api-library/lib/src/typings/terminal/messageType'
import { PaymentData } from '@adyen/api-library/lib/src/typings/terminal/paymentData'
import { ReversalReasonType } from '@adyen/api-library/lib/src/typings/terminal/reversalReasonType'
import { TerminalApiRequest } from '@adyen/api-library/lib/src/typings/terminal/terminalApiRequest'
import { Injectable } from '@nestjs/common'
import ShortUniqueId from 'short-unique-id'

import { AdyenServiceTypes } from '~/src/services/adyen'

@Injectable()
export class AdyenMapper {
  private static PROTOCOL_VERSION = '3.0'
  private getNewTransactionId(): string {
    return `TID-${randomUUID()}`
  }

  private getNewServiceId(): string {
    return new ShortUniqueId().rnd(10)
  }

  async createReversalPaymentRequest({
    posId,
    saleId,
    posTransactionId,
    saleTransactionId,
  }: AdyenServiceTypes.ReversalPaymentParams): Promise<TerminalApiRequest> {
    return {
      SaleToPOIRequest: {
        MessageHeader: {
          ProtocolVersion: AdyenMapper.PROTOCOL_VERSION,
          MessageClass: MessageClassType.Service,
          MessageCategory: MessageCategoryType.Abort,
          MessageType: MessageType.Request,
          POIID: posId,
          SaleID: saleId,
          ServiceID: this.getNewServiceId(),
        },
        ReversalRequest: {
          ReversalReason: ReversalReasonType.MerchantCancel,
          OriginalPOITransaction: {
            POIID: posId,
            POITransactionID: {
              TransactionID: posTransactionId,
              TimeStamp: new Date().toISOString(),
            },
          },
          SaleData: {
            SaleTransactionID: {
              TransactionID: saleTransactionId,
              TimeStamp: new Date().toISOString(),
            },
          },
        },
      },
    }
  }

  async createAbortPaymentRequest({
    serviceId,
    posId,
    saleId,
    abortReason,
  }: AdyenServiceTypes.AbortPaymentParams): Promise<TerminalApiRequest> {
    return {
      SaleToPOIRequest: {
        MessageHeader: {
          ProtocolVersion: AdyenMapper.PROTOCOL_VERSION,
          MessageClass: MessageClassType.Service,
          MessageCategory: MessageCategoryType.Abort,
          MessageType: MessageType.Request,
          POIID: posId,
          SaleID: saleId,
          ServiceID: this.getNewServiceId(),
        },
        AbortRequest: {
          AbortReason: abortReason || 'MerchantAbort',
          MessageReference: {
            MessageCategory: MessageReference.MessageCategoryEnum.Payment,
            SaleID: saleId,
            ServiceID: serviceId,
            POIID: posId,
          },
        },
      },
    }
  }

  async createPaymentRequest({
    payment,
    posId,
    saleId,
  }: AdyenServiceTypes.RequestPaymentParams): Promise<TerminalApiRequest> {
    return {
      SaleToPOIRequest: {
        MessageHeader: {
          ProtocolVersion: AdyenMapper.PROTOCOL_VERSION,
          MessageCategory: MessageCategoryType.Payment,
          MessageClass: MessageClassType.Service,
          MessageType: MessageType.Request,
          POIID: posId,
          SaleID: saleId,
          ServiceID: this.getNewServiceId(),
        },
        PaymentRequest: {
          SaleData: {
            SaleTransactionID: {
              TransactionID: this.getNewTransactionId(),
              TimeStamp: new Date().toISOString(),
            },
          },
          PaymentTransaction: {
            AmountsReq: {
              Currency: payment.currency || 'BRL',
              RequestedAmount: payment.amount,
            },
            TransactionConditions: {
              DebitPreferredFlag:
                payment.paymentMethod === AdyenServiceTypes.PaymentMethod.DEBIT,
              AllowedPaymentBrand:
                payment.paymentMethod === AdyenServiceTypes.PaymentMethod.PIX
                  ? [AdyenServiceTypes.PaymentMethod.PIX]
                  : [],
            },
          },
          PaymentData: payment.installments
            ? {
                PaymentType: PaymentData.PaymentTypeEnum.Instalment,
                Instalment: {
                  InstalmentType: [
                    Instalment.InstalmentTypeEnum.EqualInstalments,
                  ],
                  TotalNbOfPayments: payment.installments,
                },
              }
            : undefined,
        },
      },
    }
  }
}
