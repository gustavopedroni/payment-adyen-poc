import { Client, TerminalCloudAPI } from '@adyen/api-library'
import { TerminalApiRequest } from '@adyen/api-library/lib/src/typings/terminal/terminalApiRequest'

export class BaseAdyenService {
  protected static PROTOCOL_VERSION = '3.0'

  protected createClient() {
    const apiKey = process.env.ADYEN_API_KEY
    if (!apiKey) {
      throw new Error('No Adyen API key found')
    }
    const client = new Client({
      apiKey,
      environment: process.env.ADYEN_ENV?.toUpperCase() as 'TEST' | 'LIVE',
    })
    const terminalCloudAPI = new TerminalCloudAPI(client)

    return terminalCloudAPI
  }

  protected async makeRequest(request: TerminalApiRequest) {
    const client = this.createClient()

    return client.sync(request)
  }
}
