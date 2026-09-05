import { pgTable, uuid, varchar, bigint, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const userProfile = (name?: string) =>
  pgTable(
    name ?? 'user_profile',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      email: varchar('email', { length: 255 }),
      name: varchar('name', { length: 255 }),
      avatar: varchar('avatar', { length: 255 }),
      status: varchar('status', { length: 32 }).default('active'),
    },
  );

export const fileAttachment = (name?: string) =>
  pgTable(
    name ?? 'file_attachment',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      bucketId: varchar('bucket_id', { length: 255 }),
      filePath: varchar('file_path', { length: 1024 }),
    },
  );

export const paymentOrder = pgTable(
  'payment_order',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNo: varchar('order_no', { length: 64 }).notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    payMethod: varchar('pay_method', { length: 32 }).notNull().default('alipay'),
    status: varchar('status', { length: 32 }).notNull().default('pending'),
    payGateway: varchar('pay_gateway', { length: 32 }).notNull().default('mock'),
    gatewayOrderId: varchar('gateway_order_id', { length: 255 }),
    qrCodeUrl: text('qr_code_url'),
    paidAt: timestamp('paid_at', { precision: 3, withTimezone: true }),
    callbackRaw: jsonb('callback_raw'),
    remark: varchar('remark', { length: 500 }),
    createdAt: timestamp('_created_at', { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('_updated_at', { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('payment_order_order_no_key').on(table.orderNo),
    index('idx_payment_order_order_no').on(table.orderNo),
    index('idx_payment_order_status').on(table.status),
    index('idx_payment_order_created_at').on(table.createdAt),
  ],
);
