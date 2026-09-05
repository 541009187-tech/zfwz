import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MockPayDto } from './dto/mock-pay.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('gateway-config')
  async getGatewayConfig() {
    return this.paymentService.getGatewayConfig();
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.paymentService.createOrder(dto);
  }

  @Get('orders/:orderNo')
  async getOrder(@Param('orderNo') orderNo: string) {
    return this.paymentService.getOrder(orderNo);
  }

  @Post('mock-pay')
  async mockPay(@Body() dto: MockPayDto) {
    return this.paymentService.mockPay(dto);
  }

  @Post('callback/alipay')
  async alipayCallback(@Body() body: Record<string, unknown>) {
    return this.paymentService.handleAlipayCallback(body);
  }

  @Post('callback/wechat')
  async wechatCallback(@Body() body: Record<string, unknown>) {
    return this.paymentService.handleWechatCallback(body);
  }
}
