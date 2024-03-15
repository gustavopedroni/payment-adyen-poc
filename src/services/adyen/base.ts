import {
  Client,
  Config,
  TerminalCloudAPI,
  CheckoutAPI,
} from '@adyen/api-library'
import { TerminalApiRequest } from '@adyen/api-library/lib/src/typings/terminal/terminalApiRequest'
import { Logger } from '@nestjs/common'

import { AdyenServiceTypes } from '~/src/services/adyen'
import { AdyenMapper } from '~/src/services/adyen/adyen.mapper'

export class BaseAdyenService {
  protected readonly logger: Logger

  constructor(private readonly adyenMapper: AdyenMapper) {}

  private getConfig() {
    return new Config({
      apiKey: process.env.ADYEN_API_KEY,
      environment: process.env.ADYEN_ENV?.toUpperCase() as 'TEST' | 'LIVE',
    })
  }

  private createClient() {
    return new Client({ config: this.getConfig() })
  }

  private async getCheckoutClient() {
    const client = this.createClient()
    const checkout = new CheckoutAPI(client)

    return checkout
  }

  private async getTerminalClient() {
    const client = this.createClient()
    const terminalClient = new TerminalCloudAPI(client)

    return terminalClient
  }

  private async makeTerminalRequest(request: TerminalApiRequest) {
    const terminal = await this.getTerminalClient()
    try {
      const response = await terminal.sync(request)
      return response
    } catch (err) {
      this.logger.error('Failed to make terminal request', err)
      return null
    }
  }

  protected async getPaymentMethodsRequest({
    merchantAccount,
  }: AdyenServiceTypes.GetPaymentMethodsParams) {
    const checkout = await this.getCheckoutClient()
    try {
      const response = await checkout.PaymentsApi.paymentMethods({
        merchantAccount,
      })
      return response
    } catch (err) {
      this.logger.error('Failed to make checkout request', err)
      return null
    }
  }

  protected async reversalPaymentRequest(
    params: AdyenServiceTypes.ReversalPaymentParams,
  ) {
    const request = await this.adyenMapper.createReversalPaymentRequest(params)

    return this.makeTerminalRequest(request)
  }

  protected async abortPaymentRequest(
    params: AdyenServiceTypes.AbortPaymentParams,
  ) {
    const request = await this.adyenMapper.createAbortPaymentRequest(params)

    return this.makeTerminalRequest(request)
  }

  protected async requestPaymentRequest(
    params: AdyenServiceTypes.RequestPaymentParams,
  ) {
    const request = await this.adyenMapper.createPaymentRequest(params)

    return this.makeTerminalRequest(request)
  }
}
