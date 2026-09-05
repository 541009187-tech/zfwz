import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, Home, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/api';
import { formatAmount, getPayMethodName, getGatewayName } from '@/utils/payment';
import { logger } from '@lark-apaas/client-toolkit/logger';
import dayjs from 'dayjs';
import type { PaymentOrder } from '@shared/api.interface';

const PaySuccessPage = () => {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNo) return;

    const fetchOrder = async () => {
      try {
        const data = await paymentApi.getOrder(orderNo);
        setOrder(data);
      } catch (error) {
        logger.error('获取订单失败', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#07C160]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">订单不存在</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-[480px]">
        {/* 成功状态 */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isPaid ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <CheckCircle
              className={`w-8 h-8 ${isPaid ? 'text-green-500' : 'text-red-500'}`}
            />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {isPaid ? '支付成功' : '支付失败'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isPaid
              ? '感谢您的支付，订单已确认'
              : '支付未完成，您可以重新发起支付'}
          </p>

          {/* 金额 */}
          <div
            className={`text-3xl font-bold mb-6 ${
              isPaid ? 'text-[#07C160]' : 'text-gray-400'
            }`}
          >
            ¥{formatAmount(order.amount)}
          </div>

          {/* 订单详情 */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">商品名称</span>
              <span className="text-gray-900 font-medium max-w-[200px] truncate">
                {order.productName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">订单编号</span>
              <span className="text-gray-700 font-mono text-xs">
                {order.orderNo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">支付方式</span>
              <span className="text-gray-700">
                {getPayMethodName(order.payMethod)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">支付网关</span>
              <span className="text-gray-700">
                {getGatewayName(order.payGateway)}
              </span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">支付时间</span>
                <span className="text-gray-700">
                  {dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
            )}
            {order.remark && (
              <div className="flex justify-between">
                <span className="text-gray-500">备注</span>
                <span className="text-gray-700 max-w-[200px] truncate">
                  {order.remark}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <Button
            className="flex-1 h-11 bg-[#1677FF] hover:bg-[#0958d9]"
            onClick={() => navigate('/')}
          >
            <FileText className="w-4 h-4 mr-2" />
            查看订单
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 安全提示 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>支付凭证已发送至您的账户</p>
          <p className="mt-1">如有疑问请联系客服</p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">
            继续购物 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaySuccessPage;
