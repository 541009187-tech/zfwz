import { Injectable } from '@nestjs/common';
import { BaseGateway, CreateGatewayOrderParams, GatewayOrderResult } from './base.gateway';

@Injectable()
export class MockGateway extends BaseGateway {
  readonly name = 'mock' as const;

  async createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    return {
      qrCodeUrl: `/mock-qr/${params.orderNo}`,
      gatewayOrderId: `MOCK${params.orderNo}`,
    };
  }

  async queryOrder(orderNo: string): Promise<{ status: string }> {
    return { status: 'NOTPAY' };
  }
}
