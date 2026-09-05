import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { paymentApi } from '@/api';
import { formatAmount, getPayMethodName } from '@/utils/payment';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { PayMethod } from '@shared/api.interface';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: '会员年卡 - 标准版',
    price: 29900,
    desc: '12个月会员权限，畅享全部功能',
    icon: '⭐',
  },
  {
    id: 'p2',
    name: '增值服务包',
    price: 9900,
    desc: '数据导出 + 优先客服支持',
    icon: '🎁',
  },
  {
    id: 'p3',
    name: '企业版升级',
    price: 99900,
    desc: '升级至企业版，无限协作人数',
    icon: '🏢',
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(DEFAULT_PRODUCTS[0]);
  const [payMethod, setPayMethod] = useState<PayMethod>('alipay');
  const [amount, setAmount] = useState(DEFAULT_PRODUCTS[0].price);
  const [customProductName, setCustomProductName] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [gatewayMode, setGatewayMode] = useState<'test' | 'merchant'>('test');

  const handleProductSelect = (product: typeof DEFAULT_PRODUCTS[0]) => {
    setSelectedProduct(product);
    setAmount(product.price);
    setCustomProductName(product.name);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(Math.round(value * 100));
    }
  };

  const handleSubmit = async () => {
    if (!customProductName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const order = await paymentApi.createOrder({
        productName: customProductName || selectedProduct.name,
        amount,
        payMethod,
        remark: remark || undefined,
      });

      logger.info('订单创建成功', order.orderNo);
      navigate(`/pay/${order.orderNo}`);
    } catch (error) {
      logger.error('创建订单失败', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGatewayConfig = async () => {
    try {
      const config = await paymentApi.getGatewayConfig();
      setGatewayMode(config.mode);
    } catch (error) {
      logger.error('获取网关配置失败', error);
    }
  };

  useState(() => {
    loadGatewayConfig();
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-[480px]">
        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677FF] text-xs font-medium mb-3">
            <ShieldCheck className="w-3 h-3" />
            安全支付
            {gatewayMode === 'test' ? '（测试模式）' : '（商户模式）'}
          </div>
          <h1 className="text-xl font-semibold text-gray-900">确认订单</h1>
          <p className="text-sm text-gray-500 mt-1">请确认订单信息并完成支付</p>
        </div>

        {/* 商品选择 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">选择商品</h2>
          </div>
          <div className="space-y-3">
            {DEFAULT_PRODUCTS.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductSelect(product)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedProduct.id === product.id
                    ? 'border-[#1677FF] bg-blue-50/50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">
                        {product.name}
                      </span>
                      <span className="text-[#1677FF] font-semibold ml-2 flex-shrink-0">
                        ¥{formatAmount(product.price)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{product.desc}</p>
                  </div>
                  {selectedProduct.id === product.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#1677FF] flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义金额 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-4">自定义金额</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">商品名称</label>
              <Input
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                placeholder="请输入商品名称"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">支付金额（元）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                <Input
                  type="number"
                  value={formatAmount(amount)}
                  onChange={handleAmountChange}
                  className="pl-7"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">备注（选填）</label>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="订单备注信息"
                className="resize-none h-20"
              />
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">支付方式</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayMethod('alipay')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                payMethod === 'alipay'
                  ? 'border-[#1677FF] bg-blue-50/30'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <Smartphone className="w-6 h-6 text-[#1677FF]" />
              <span className="text-sm font-medium text-gray-900">支付宝</span>
              {payMethod === 'alipay' && (
                <CheckCircle2 className="w-4 h-4 text-[#1677FF]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setPayMethod('wechat')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                payMethod === 'wechat'
                  ? 'border-[#07C160] bg-green-50/30'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <Smartphone className="w-6 h-6 text-[#07C160]" />
              <span className="text-sm font-medium text-gray-900">微信支付</span>
              {payMethod === 'wechat' && (
                <CheckCircle2 className="w-4 h-4 text-[#07C160]" />
              )}
            </button>
          </div>
        </div>

        {/* 底部结算 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">支付金额</span>
            <span className="text-2xl font-bold text-[#FF4D4F]">
              ¥{formatAmount(amount)}
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !customProductName.trim() || amount <= 0}
            className={`w-full h-11 text-base font-medium ${
              payMethod === 'alipay' ? 'bg-[#1677FF] hover:bg-[#0958d9]' : 'bg-[#07C160] hover:bg-[#06ad56]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                创建订单中...
              </>
            ) : (
              <>
                立即支付 · {getPayMethodName(payMethod)}
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400">
            <ShieldCheck className="w-3 h-3" />
            <span>支付安全由银行级加密保障</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
