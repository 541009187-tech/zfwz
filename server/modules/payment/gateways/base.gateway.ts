import type { PayMethod } from '@shared/api.interface';

export interface CreateGatewayOrderParams {
  orderNo: string;
  amount: number;
  productName: string;
  payMethod: PayMethod;
}

export interface GatewayOrderResult {
  qrCodeUrl?: string;
  gatewayOrderId?: string;
}

export abstract class BaseGateway {
  abstract readonly name: 'mock' | 'alipay' | 'wechat';

  abstract createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult>;

  abstract queryOrder(orderNo: string): Promise<{ status: string }>;
}
