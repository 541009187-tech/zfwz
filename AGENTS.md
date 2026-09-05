# 支付系统 AGENTS.md

## 项目概览
一个真实的支付网站系统，支持支付宝/微信支付接入和本地测试网关模式。

## 设计规范
- 主色调：蓝色系（支付宝蓝 `#1677FF`、微信绿 `#07C160`）
- 背景：浅灰 `#F5F7FA`，卡片白色背景
- 圆角：12px
- 阴影：`0 2px 12px rgba(0,0,0,0.06)`
- 内容最大宽度：480px（支付场景以窄屏居中为主）
- 间距：内边距 24px，区块间距 16px
- 字体：系统默认，标题 18px/600，正文 14px/400，辅助文字 12px/400
- 按钮：高度 44px，圆角 8px，主按钮实色填充

## 状态流转
pending（待创建）→ paying（待支付）→ paid（已支付）
                  ↘ failed（支付失败）↗
                  ↘ closed（已关闭）

## 模块结构
- server/modules/payment/ - 支付模块
  - payment.module.ts
  - payment.controller.ts
  - payment.service.ts
  - dto/ - 请求 DTO
  - gateways/ - 支付网关抽象与实现
    - base.gateway.ts - 网关抽象基类
    - mock.gateway.ts - 本地测试网关
    - alipay.gateway.ts - 支付宝适配器
    - wechat.gateway.ts - 微信支付适配器
- client/src/pages/
  - checkout/ - 商品下单页
  - pay/ - 扫码支付收银台
  - pay-success/ - 支付成功页
