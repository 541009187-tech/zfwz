import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  CheckCircle,
  Loader2,
  RefreshCw,
  Clock,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/api';
import {
  formatAmount,
  formatOrderNo,
  getPayMethodName,
  getStatusText,
  getGatewayName,
} from '@/utils/payment';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { PaymentOrder, PaymentGatewayConfig } from '@shared/api.interface';

const PayPage = () => {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [countdown, setCountdown] = useState(900);
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderNo) return;
    try {
      const data = await paymentApi.getOrder(orderNo);
      setOrder(data);

      if (data.status === 'paid') {
        navigate(`/pay-success/${orderNo}`);
        return;
      }
    } catch (error) {
      logger.error('获取订单失败', error);
    } finally {
      setLoading(false);
    }
  }, [orderNo, navigate]);

  const fetchGatewayConfig = useCallback(async () => {
    try {
      const config = await paymentApi.getGatewayConfig();
      setGatewayConfig(config);
    } catch (error) {
      logger.error('获取网关配置失败', error);
    }
  }, []);

  useEffect(() => {
    fetchOrder();
    fetchGatewayConfig();
  }, [fetchOrder, fetchGatewayConfig]);

  useEffect(() => {
    if (!order || order.status !== 'paying') return;

    const pollTimer = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => clearInterval(pollTimer);
  }, [order, fetchOrder]);

  useEffect(() => {
    if (countdown <= 0 || !order || order.status !== 'paying') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, order]);

  const handleMockPay = async (success: boolean) => {
    if (!order) return;
    setPaying(true);
    try {
      await paymentApi.mockPay({ orderNo: order.orderNo, success });
      if (success) {
        navigate(`/pay-success/${order.orderNo}`);
      } else {
        fetchOrder();
      }
    } catch (error) {
      logger.error('模拟支付失败', error);
    } finally {
      setPaying(false);
    }
  };

  const handleCopyOrderNo = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('复制失败', error);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1677FF]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">订单不存在</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const isTestMode = gatewayConfig?.mode === 'test';
  const primaryColor = order.payMethod === 'alipay' ? '#1677FF' : '#07C160';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-[480px]">
        {/* 返回按钮 */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        {/* 模式标识 */}
        <div className="text-center mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isTestMode
                ? 'bg-amber-50 text-amber-600'
                : 'bg-green-50 text-green-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isTestMode ? 'bg-amber-500' : 'bg-green-500'
              }`}
            />
            {isTestMode ? '测试模式' : '商户模式'} · {getGatewayName(order.payGateway)}
          </span>
        </div>

        {/* 支付卡片 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 头部 */}
          <div
            className="p-6 text-white text-center"
            style={{ backgroundColor: primaryColor }}
          >
            <p className="text-sm opacity-90 mb-1">支付金额</p>
            <p className="text-4xl font-bold">¥{formatAmount(order.amount)}</p>
          </div>

          {/* 订单信息 */}
          <div className="p-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">商品名称</span>
              <span className="text-gray-900 font-medium truncate ml-4 max-w-[240px]">
                {order.productName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">订单编号</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-600 font-mono">
                  {formatOrderNo(order.orderNo)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNo}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copied ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 pb-6 pt-4">
            <p className="text-center text-sm text-gray-500 mb-4">
              请使用 <span className="font-medium text-gray-700">
                {getPayMethodName(order.payMethod)}
              </span>{' '}
              扫描下方二维码支付
            </p>

            {/* 二维码 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  {order.qrCodeUrl && order.qrCodeUrl.startsWith('http') ? (
                    <QRCodeSVG
                      value={order.qrCodeUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  ) : order.qrCodeUrl && order.qrCodeUrl.startsWith('/') ? (
                    <QRCodeSVG
                      value={`${order.payMethod}://mock-pay/${order.orderNo}`}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-50 rounded">
                      <QrCode className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {order.status === 'paid' && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">支付成功</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 倒计时 */}
            {order.status === 'paying' && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  二维码有效期 {formatCountdown(countdown)}
                  {countdown === 0 && '（已过期）'}
                </span>
                <button
                  type="button"
                  onClick={fetchOrder}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-center text-xs text-gray-400 mt-3">
              订单状态：{getStatusText(order.status)}
            </div>
          </div>
        </div>

        {/* Mock 支付测试按钮（仅测试模式显示） */}
        {isTestMode && order.status === 'paying' && (
          <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-xs text-amber-600 text-center mb-3">
              测试模式：点击下方按钮模拟支付结果
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleMockPay(false)}
                variant="outline"
                className="flex-1 h-10"
                disabled={paying}
              >
                {paying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-500" />
                    模拟支付失败
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleMockPay(true)}
                className={`flex-1 h-10 ${
                  order.payMethod === 'alipay'
                    ? 'bg-[#1677FF] hover:bg-[#0958d9]'
                    : 'bg-[#07C160] hover:bg-[#06ad56]'
                }`}
                disabled={paying}
              >
                {paying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : order.payMethod === 'alipay' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    模拟支付成功（Mock 模式）
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-[#07C160]" />
                    模拟支付成功（Mock 模式）
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 帮助展开区域 */}
        <div className="mt-4 bg-white rounded-xl shadow-sm">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full p-6 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                支付遇到问题？
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showHelp && (
            <div className="px-6 pb-6 text-xs text-gray-500 space-y-2">
              <p>1. 请确认已使用正确的支付 App 扫码。</p>
              <p>2. 如已支付但页面未更新，请稍候几秒，系统会自动检测。</p>
              <p>
                3. 如长时间未收到支付结果，可点击
                <button
                  type="button"
                  onClick={fetchOrder}
                  className="text-primary underline mx-1"
                >
                  手动刷新
                </button>
                查询。
              </p>
              <p>4. 如扣款成功但订单状态未更新，请联系客服。</p>
            </div>
          )}
        </div>

        {/* 返回首页链接 */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayPage;
