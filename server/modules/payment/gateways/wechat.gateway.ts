import { Injectable, Logger } from '@nestjs/common';
import { BaseGateway, CreateGatewayOrderParams, GatewayOrderResult } from './base.gateway';

export class WechatGateway extends BaseGateway {
  readonly name = 'wechat' as const;
  private readonly logger = new Logger(WechatGateway.name);

  async createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    const mchId = process.env.WECHAT_MCH_ID;
    const appId = process.env.WECHAT_APP_ID;
    const apiV3Key = process.env.WECHAT_API_V3_KEY;

    if (!mchId || !appId || !apiV3Key) {
      throw new Error('微信支付未配置：缺少 WECHAT_MCH_ID / WECHAT_APP_ID / WECHAT_API_V3_KEY');
    }

    throw new Error('微信 Native 支付需实现 APIv3 下单与回调验签（本仓库提供接入骨架）');
  }

  async queryOrder(orderNo: string): Promise<{ status: string }> {
    throw new Error('微信支付主动查单需实现 APIv3 接口调用');
  }
}
