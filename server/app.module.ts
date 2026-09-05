import { Module } from '@nestjs/common';
import { PaymentModule } from './modules/payment/payment.module';
import { ViewModule } from './modules/view/view.module';
import { HelloModule } from './modules/hello/hello.module';

@Module({
  imports: [
    PaymentModule,
    HelloModule,
    ViewModule,
  ],
})
export class AppModule {}
