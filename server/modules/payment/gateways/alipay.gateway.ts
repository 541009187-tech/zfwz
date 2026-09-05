import { Injectable, Logger } from '@nestjs/common';
import { BaseGateway, CreateGatewayOrderParams, GatewayOrderResult } from './base.gateway';
import { AlipaySdk, AlipayTradePrecreate } from 'alipay-sdk';

export class AlipayGateway extends BaseGateway {
  readonly name = 'alipay' as const;
  private readonly logger = new Logger(AlipayGateway.name);
  private alipaySdk: AlipaySdk | null = null;

  private getSdk(): AlipaySdk | null {
    if (this.alipaySdk) return this.alipaySdk;

    const appId = process.env.ALIPAY_APP_ID;
    const merchantPrivateKey = process.env.ALIPAY_MERCHANT_PRIVATE_KEY;
    const alipayPublicKey = process.env.ALIPAY_ALIPAY_PUBLIC_KEY;

    if (!appId || !merchantPrivateKey || !alipayPublicKey) {
      return null;
    }

    this.alipaySdk = new AlipaySdk({
      appId,
      privateKey: merchantPrivateKey,
      alipayPublicKey,
    });
    return this.alipaySdk;
  }

  async createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    const sdk = this.getSdk();
    if (!sdk) {
      throw new Error('支付宝未配置：缺少 ALIPAY_APP_ID / ALIPAY_MERCHANT_PRIVATE_KEY / ALIPAY_ALIPAY_PUBLIC_KEY');
    }

    const result = await sdk.exec(new AlipayTradePrecreate(), {
      bizContent: {
        out_trade_no: params.orderNo,
        total_amount: (params.amount / 100).toFixed(2),
        subject: params.productName,
      },
    });

    return {
      qrCodeUrl: result.qr_code,
      gatewayOrderId: result.out_trade_no,
    };
  }

  async queryOrder(orderNo: string): Promise<{ status: string }> {
    const sdk = this.getSdk();
    if (!sdk) {
      throw new Error('支付宝未配置');
    }

    const result = await sdk.exec(new AlipayTradeQuery(), {
      bizContent: { out_trade_no: orderNo },
    });

    return { status: result.trade_status };
  }
}
