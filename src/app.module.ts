import { Module } from '@nestjs/common'

import { PaymentController } from '~/src/controllers/payment.controller'
import { AdyenMapper, AdyenService } from '~/src/services/adyen'

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [AdyenService, AdyenMapper],
})
export class AppModule {}
