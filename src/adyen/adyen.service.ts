import { Instalment } from '@adyen/api-library/lib/src/typings/terminal/instalment'
import { MessageCategoryType } from '@adyen/api-library/lib/src/typings/terminal/messageCategoryType'
import { MessageClassType } from '@adyen/api-library/lib/src/typings/terminal/messageClassType'
import { MessageType } from '@adyen/api-library/lib/src/typings/terminal/messageType'
import { PaymentData } from '@adyen/api-library/lib/src/typings/terminal/paymentData'

import { BaseAdyenService } from './base'
import { AdyenServiceTypes } from './index'

export class AdyenService extends BaseAdyenService {
  async requestPayment({
    posId,
    saleId,
    applicationId,
    payment,
  }: AdyenServiceTypes.RequestPaymentParams) {
    return this.makeRequest({
      SaleToPOIRequest: {
        MessageHeader: {
          ProtocolVersion: BaseAdyenService.PROTOCOL_VERSION,
          MessageCategory: MessageCategoryType.Payment,
          MessageClass: MessageClassType.Service,
          MessageType: MessageType.Request,
          POIID: posId,
          SaleID: saleId,
          ServiceID: applicationId,
        },
        PaymentRequest: {
          SaleData: {
            SaleTransactionID: {
              TransactionID: new Date().getUTCMilliseconds() + saleId,
              TimeStamp: new Date().toISOString(),
            },
          },
          PaymentTransaction: {
            AmountsReq: {
              Currency: 'BRL',
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
    })
  }
}
