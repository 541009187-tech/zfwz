// 支付订单状态
export type OrderStatus = 'pending' | 'paying' | 'paid' | 'failed' | 'closed';

// 支付方式
export type PayMethod = 'alipay' | 'wechat';

// 支付网关
export type PayGateway = 'mock' | 'alipay' | 'wechat';

// 订单信息
export interface PaymentOrder {
  id: string;
  orderNo: string;
  productName: string;
  amount: number;
  payMethod: PayMethod;
  status: OrderStatus;
  payGateway: PayGateway;
  gatewayOrderId?: string;
  qrCodeUrl?: string;
  paidAt?: string;
  remark?: string;
  createdAt: string;
}

// 创建订单请求
export interface CreateOrderRequest {
  productName: string;
  amount: number;
  payMethod: PayMethod;
  remark?: string;
}

// 创建订单响应
export interface CreateOrderResponse {
  order: PaymentOrder;
}

// 查询订单响应
export interface GetOrderResponse {
  order: PaymentOrder;
}

// 模拟支付请求
export interface MockPayRequest {
  orderNo: string;
  success?: boolean;
}

// 模拟支付响应
export interface MockPayResponse {
  order: PaymentOrder;
}

// 支付网关配置
export interface PaymentGatewayConfig {
  mode: 'test' | 'merchant';
  activeGateway: PayGateway;
  alipayConfigured: boolean;
  wechatConfigured: boolean;
}

// 网关配置响应
export interface GatewayConfigResponse {
  config: PaymentGatewayConfig;
}
