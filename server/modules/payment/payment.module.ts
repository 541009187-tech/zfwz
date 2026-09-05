import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MockGateway } from './gateways/mock.gateway';
import { AlipayGateway } from './gateways/alipay.gateway';
import { WechatGateway } from './gateways/wechat.gateway';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, MockGateway, AlipayGateway, WechatGateway],
})
export class PaymentModule {}
