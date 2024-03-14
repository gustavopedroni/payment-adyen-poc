import { Command, Option } from 'commander'

import 'dotenv/config'
import { PaymentMethod } from '~/src/adyen/types'
import { makePayment } from '~/src/commands/make-payment'
import { logger } from '~/src/logger'

const program = new Command()
program.version('1.0.0').description('A simple adyen cli tool')
program
  .command('make:payment')
  .description('Start a transaction on adyen')
  .addOption(
    new Option('-A, --amount <amount>', 'The amount to be paid')
      .argParser(parseFloat)
      .makeOptionMandatory(),
  )
  .addOption(
    new Option('-M, --method <paymentMethod>', 'The payment method')
      .choices(Object.values(PaymentMethod).map((i) => i.toLowerCase()))
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      '-I, --installments <installments>',
      'The number of installments',
    ).argParser(parseInt),
  )
  .action(
    async (params: {
      amount: number
      method: string
      installments?: number
    }) => {
      const paymentMethod = params.method.toUpperCase() as PaymentMethod
      const response = await makePayment({
        amount: params.amount,
        installments: params.installments,
        paymentMethod,
      })

      logger.info(response)
    },
  )

program.parse(process.argv)
