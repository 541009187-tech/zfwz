import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MockGateway } from './gateways/mock.gateway';
import { AlipayGateway } from './gateways/alipay.gateway';
import { WechatGateway } from './gateways/wechat.gateway';
import type { BaseGateway } from './gateways/base.gateway';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { MockPayDto } from './dto/mock-pay.dto';
import type { PaymentOrder } from '@shared/api.interface';

const ORDER_STORE = new Map<string, any>();

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly mockGateway: MockGateway,
    private readonly alipayGateway: AlipayGateway,
    private readonly wechatGateway: WechatGateway,
  ) {}

  private get gateway(): BaseGateway {
    switch (this.activeGateway()) {
      case 'alipay':
        return this.alipayGateway;
      case 'wechat':
        return this.wechatGateway;
      default:
        return this.mockGateway;
    }
  }

  private activeGateway(): string {
    const gateway = process.env.PAYMENT_GATEWAY || 'mock';
    if (gateway === 'alipay' || gateway === 'wechat') {
      return gateway;
    }
    return 'mock';
  }

  getGatewayConfig() {
    const gateway = this.activeGateway();
    return {
      code: 0,
      message: 'success',
      data: {
        config: {
          mode: gateway === 'mock' ? 'test' : 'merchant',
          activeGateway: gateway,
          alipayConfigured: !!(process.env.ALIPAY_APP_ID && process.env.ALIPAY_MERCHANT_PRIVATE_KEY),
          wechatConfigured: !!(process.env.WECHAT_MCH_ID && process.env.WECHAT_API_V3_KEY),
        },
      },
    };
  }

  async createOrder(dto: CreateOrderDto) {
    const orderNo = this.generateOrderNo();
    const now = new Date().toISOString();

    const order = {
      id: randomUUID(),
      orderNo,
      productName: dto.productName,
      amount: dto.amount,
      payMethod: dto.payMethod,
      status: 'paying',
      payGateway: this.activeGateway(),
      qrCodeUrl: '',
      remark: dto.remark,
      createdAt: now,
    };

    try {
      const gatewayOrder = await this.gateway.createOrder({
        orderNo,
        amount: dto.amount,
        productName: dto.productName,
        payMethod: dto.payMethod,
      });
      order.qrCodeUrl = gatewayOrder.qrCodeUrl || '';
      order.gatewayOrderId = gatewayOrder.gatewayOrderId;
    } catch (error) {
      this.logger.error(`网关下单失败: ${(error as Error).message}`);
    }

    ORDER_STORE.set(orderNo, order);

    return {
      code: 0,
      message: 'success',
      data: { order },
    };
  }

  async getOrder(orderNo: string) {
    const order = ORDER_STORE.get(orderNo);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return {
      code: 0,
      message: 'success',
      data: { order },
    };
  }

  async mockPay(dto: MockPayDto) {
    const order = ORDER_STORE.get(dto.orderNo);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const success = dto.success !== false;
    order.status = success ? 'paid' : 'failed';
    if (success) {
      order.paidAt = new Date().toISOString();
    }
    ORDER_STORE.set(dto.orderNo, order);

    return {
      code: 0,
      message: 'success',
      data: { order },
    };
  }

  async handleAlipayCallback(body: Record<string, unknown>) {
    this.logger.log('收到支付宝回调', body);
    const orderNo = (body.out_trade_no as string) || '';
    const tradeStatus = (body.trade_status as string) || '';

    if (orderNo && tradeStatus === 'TRADE_SUCCESS') {
      const order = ORDER_STORE.get(orderNo);
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.callbackRaw = body;
        ORDER_STORE.set(orderNo, order);
        this.logger.log(`订单 ${orderNo} 已由支付宝回调确认为支付成功`);
      }
    }

    return { code: '10000', msg: 'Success' };
  }

  async handleWechatCallback(body: Record<string, unknown>) {
    this.logger.log('收到微信支付回调', body);
    const orderNo = (body.out_trade_no as string) || '';
    const tradeState = (body.trade_state as string) || '';

    if (orderNo && tradeState === 'SUCCESS') {
      const order = ORDER_STORE.get(orderNo);
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.callbackRaw = body;
        ORDER_STORE.set(orderNo, order);
        this.logger.log(`订单 ${orderNo} 已由微信回调确认为支付成功`);
      }
    }

    return { code: 'SUCCESS', message: 'OK' };
  }

  private generateOrderNo(): string {
    const now = new Date();
    const y = now.getFullYear().toString().padStart(4, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${y}${m}${d}${h}${min}${s}${rand}`;
  }
}
