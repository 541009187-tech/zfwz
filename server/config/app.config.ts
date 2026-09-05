export const appConfig = {
  port: parseInt(process.env.SERVER_PORT || '3000', 10),
  payment: {
    gateway: process.env.PAYMENT_GATEWAY || 'mock',
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      merchantPrivateKey: process.env.ALIPAY_MERCHANT_PRIVATE_KEY || '',
      alipayPublicKey: process.env.ALIPAY_ALIPAY_PUBLIC_KEY || '',
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    },
    wechat: {
      mchId: process.env.WECHAT_MCH_ID || '',
      appId: process.env.WECHAT_APP_ID || '',
      apiV3Key: process.env.WECHAT_API_V3_KEY || '',
      mchSerialNo: process.env.WECHAT_MCH_SERIAL_NO || '',
      privateKeyPath: process.env.WECHAT_PRIVATE_KEY_PATH || '',
    },
  },
};
