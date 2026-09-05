import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderResponse,
  MockPayRequest,
  MockPayResponse,
  GatewayConfigResponse,
} from '@shared/api.interface';

export const paymentApi = {
  async getGatewayConfig(): Promise<GatewayConfigResponse['config']> {
    const response = await axiosForBackend.get('/api/payment/gateway-config');
    return response.data.data.config;
  },

  async createOrder(params: CreateOrderRequest): Promise<CreateOrderResponse['order']> {
    const response = await axiosForBackend.post('/api/payment/orders', params);
    return response.data.data.order;
  },

  async getOrder(orderNo: string): Promise<GetOrderResponse['order']> {
    const response = await axiosForBackend.get(`/api/payment/orders/${orderNo}`);
    return response.data.data.order;
  },

  async mockPay(params: MockPayRequest): Promise<MockPayResponse['order']> {
    const response = await axiosForBackend.post('/api/payment/mock-pay', params);
    return response.data.data.order;
  },
};
