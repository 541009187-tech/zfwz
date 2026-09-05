export function formatAmount(amount: number): string {
  return (amount / 100).toFixed(2);
}

export function formatOrderNo(orderNo: string): string {
  if (!orderNo) return '';
  if (orderNo.length <= 20) return orderNo;
  return orderNo.slice(0, 10) + '...' + orderNo.slice(-8);
}

export function getPayMethodName(method: string): string {
  switch (method) {
    case 'alipay':
      return '支付宝';
    case 'wechat':
      return '微信支付';
    default:
      return method;
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '待创建';
    case 'paying':
      return '等待支付';
    case 'paid':
      return '支付成功';
    case 'failed':
      return '支付失败';
    case 'closed':
      return '已关闭';
    default:
      return status;
  }
}

export function getGatewayName(gateway: string): string {
  switch (gateway) {
    case 'mock':
      return '测试网关';
    case 'alipay':
      return '支付宝';
    case 'wechat':
      return '微信支付';
    default:
      return gateway;
  }
}
