# 在线支付收银系统（Payment System）

一个真实的支付网站系统：用户下单后扫码支付，后端通过支付网关**真实检测支付结果**（异步通知回调 / 主动查询），确认到账后更新订单状态，前端检测到后端确认后提示"支付成功"。

## 功能特性

- **下单页**：选择商品 / 自定义金额 / 选择支付方式（支付宝、微信）
- **收银台**：动态支付二维码、有效期倒计时、订单状态轮询检测
- **支付成功页**：支付成功提示 + 订单详情（订单号、交易单号、支付时间）
- **网关抽象**：BaseGateway 接口 + 三种实现
  - `mock`：本地测试网关（默认，无需任何配置）
  - `alipay`：支付宝当面付（预下单 + 异步回调 + 主动查单）
  - `wechat`：微信 Native 支付（接入骨架）
- **数据持久化**：PostgreSQL + Drizzle ORM，订单状态全流程流转
- **前端轮询检测**：收银台每 3 秒轮询订单状态接口，后端确认 paid 后自动跳转成功页

## 技术栈

- 后端：NestJS 10 + TypeScript + Drizzle ORM + PostgreSQL
- 前端：React 19 + Vite 6 + Tailwind CSS 4 + react-router
- 支付：alipay-sdk（支付宝）、微信支付 APIv3（需自行实现请求签名）

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式启动（服务端 :3000 + 前端 :8080）
npm run dev

# 3. 生产构建与启动
npm run build
npm start
```

## 配置支付网关（.env）

**测试模式（默认）**：`PAYMENT_GATEWAY=mock`，不填写商户参数。收银台展示 Mock 二维码，可通过「模拟支付成功/失败」按钮走完整检测流程。

**商户模式（支付宝当面付）**：

```env
PAYMENT_GATEWAY=alipay
ALIPAY_APP_ID=你的应用ID
ALIPAY_MERCHANT_PRIVATE_KEY=你的应用私钥
ALIPAY_ALIPAY_PUBLIC_KEY=支付宝公钥
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
APP_BASE_URL=https://你的公网回调域名
```

**商户模式（微信 Native 支付）**：

```env
PAYMENT_GATEWAY=wechat
WECHAT_MCH_ID=商户号
WECHAT_APP_ID=应用ID
WECHAT_API_V3_KEY=APIv3密钥
WECHAT_MCH_SERIAL_NO=商户证书序列号
WECHAT_PRIVATE_KEY_PATH=商户私钥文件路径
```

> 真实支付要求服务器有**公网可访问的 HTTPS 回调地址**（`/api/payment/callback/alipay`、`/api/payment/callback/wechat`）接收支付网关的异步通知；本地开发可用内网穿透工具测试。

## 数据库建表

```sql
CREATE TABLE payment_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(64) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL,
  pay_method VARCHAR(32) NOT NULL DEFAULT 'alipay',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  pay_gateway VARCHAR(32) NOT NULL DEFAULT 'mock',
  gateway_order_id VARCHAR(255),
  qr_code_url TEXT,
  paid_at TIMESTAMPTZ(3),
  callback_raw JSONB,
  remark VARCHAR(500),
  _created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);

CREATE UNIQUE INDEX payment_order_order_no_key ON payment_order(order_no);
CREATE INDEX idx_payment_order_order_no ON payment_order(order_no);
CREATE INDEX idx_payment_order_status ON payment_order(status);
CREATE INDEX idx_payment_order_created_at ON payment_order(_created_at);
```

## 页面路由

| 页面 | 路由 | 说明 |
|------|------|------|
| 下单页 | `/` | 选择商品 / 自定义金额 / 选择支付方式 |
| 收银台 | `/pay/:orderNo` | 展示动态二维码，轮询支付状态 |
| 支付成功页 | `/pay-success/:orderNo` | 展示订单详情 |

## 订单状态流转

```
pending（待创建）→ paying（待支付）→ paid（已支付）
                  ↘ failed（支付失败）↗
                  ↘ closed（已关闭）
```

## 项目结构

```
payment-system/
├── shared/api.interface.ts        # 前后端共享类型
├── server/
│   ├── main.ts                    # NestJS 入口
│   ├── config/app.config.ts       # 环境配置
│   ├── database/schema.ts         # Drizzle 表定义
│   └── modules/
│       ├── payment/               # 支付模块
│       │   ├── payment.controller.ts
│       │   ├── payment.service.ts
│       │   ├── dto/               # 请求 DTO
│       │   └── gateways/          # 网关抽象与实现
│       │       ├── base.gateway.ts
│       │       ├── mock.gateway.ts
│       │       ├── alipay.gateway.ts
│       │       └── wechat.gateway.ts
│       ├── view/                  # 前端页面托管
│       └── hello/                 # 示例模块
└── client/
    └── src/
        ├── api/                   # 前端 API 层
        ├── pages/                 # checkout / pay / pay-success
        ├── components/            # UI 组件
        └── utils/payment.ts       # 支付工具函数
```

## 说明与注意事项

- 本仓库由在线生成的支付系统导出，`@lark-apaas/client-toolkit` 与 `@lark-apaas/fullstack-nestjs-core` 为平台 SDK：在非平台环境独立运行时，需将前端 `api/index.ts` 的 axios 请求替换为普通 axios，将服务端数据库注入（`DRIZZLE_DATABASE`）替换为 Drizzle + postgres 原生连接。
- `client/src/components/business-ui/`（平台业务组件）与 `client/src/components/ui/image.tsx` 未包含在本仓库，如需要可从对应模板同步。
- `server/database/schema.ts` 由 Drizzle ORM 自动生成，修改表结构请走 DDL 流程后重新生成。
