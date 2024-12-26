-- UUID拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- customersテーブルのサンプルデータ
INSERT INTO customers (customer_id, customer_name, contact_info) VALUES
(uuid_generate_v4(), '株式会社山田商事', '{"email": "yamada@example.com", "phone": "03-1234-5678", "address": "東京都新宿区西新宿1-1-1"}'),
(uuid_generate_v4(), '大阪物産株式会社', '{"email": "osaka@example.com", "phone": "06-2345-6789", "address": "大阪府大阪市中央区本町2-2-2"}'),
(uuid_generate_v4(), '九州貿易株式会社', '{"email": "kyushu@example.com", "phone": "092-345-6789", "address": "福岡県福岡市博多区博多駅前3-3-3"}'),
(uuid_generate_v4(), '北海道産業株式会社', '{"email": "hokkaido@example.com", "phone": "011-456-7890", "address": "北海道札幌市中央区北4条西4-4-4"}'),
(uuid_generate_v4(), '名古屋商工株式会社', '{"email": "nagoya@example.com", "phone": "052-567-8901", "address": "愛知県名古屋市中区栄5-5-5"}');

-- suppliersテーブルのサンプルデータ
INSERT INTO suppliers (supplier_id, supplier_name, contact_info) VALUES
(uuid_generate_v4(), '東京製造株式会社', '{"email": "tokyo-mfg@example.com", "phone": "03-9876-5432", "address": "東京都大田区大森1-1-1"}'),
(uuid_generate_v4(), '京都工業株式会社', '{"email": "kyoto-ind@example.com", "phone": "075-876-5432", "address": "京都府京都市下京区烏丸通2-2-2"}'),
(uuid_generate_v4(), '浜松製作所', '{"email": "hamamatsu@example.com", "phone": "053-765-4321", "address": "静岡県浜松市中区砂山町3-3-3"}'),
(uuid_generate_v4(), '広島機械工業', '{"email": "hiroshima@example.com", "phone": "082-654-3210", "address": "広島県広島市南区松原町4-4-4"}'),
(uuid_generate_v4(), '仙台精密株式会社', '{"email": "sendai@example.com", "phone": "022-543-2109", "address": "宮城県仙台市青葉区一番町5-5-5"}');

-- productsテーブルのサンプルデータ
INSERT INTO products (product_id, product_name, unit_price) VALUES
(uuid_generate_v4(), '高性能レーザーカッター', 1250000),
(uuid_generate_v4(), '産業用ロボットアーム', 2800000),
(uuid_generate_v4(), 'IoTセンサーユニット', 45000),
(uuid_generate_v4(), '制御用マイコンボード', 12800),
(uuid_generate_v4(), '電動モーターセット', 68000);

-- ordersテーブルのサンプルデータ
INSERT INTO orders (order_id, customer_id, order_date, order_status)
SELECT 
    uuid_generate_v4(),
    customer_id,
    now() - (random() * interval '30 days'),
    (ARRAY['Pending', 'Confirmed', 'Shipped', 'Completed'])[floor(random() * 4 + 1)]
FROM customers
LIMIT 5;

-- order_itemsテーブルのサンプルデータ
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
SELECT 
    uuid_generate_v4(),
    o.order_id,
    p.product_id,
    floor(random() * 10 + 1)::integer,
    p.unit_price
FROM orders o
CROSS JOIN products p
LIMIT 5;

-- purchase_ordersテーブルのサンプルデータ
INSERT INTO purchase_orders (purchase_order_id, supplier_id, order_date, order_status)
SELECT 
    uuid_generate_v4(),
    supplier_id,
    now() - (random() * interval '30 days'),
    (ARRAY['Pending', 'Confirmed', 'Shipped', 'Completed'])[floor(random() * 4 + 1)]
FROM suppliers
LIMIT 5;

-- purchase_order_itemsテーブルのサンプルデータ
INSERT INTO purchase_order_items (purchase_order_item_id, purchase_order_id, product_id, quantity, unit_price)
SELECT 
    uuid_generate_v4(),
    po.purchase_order_id,
    p.product_id,
    floor(random() * 20 + 1)::integer,
    p.unit_price * 0.8
FROM purchase_orders po
CROSS JOIN products p
LIMIT 5;

-- quotesテーブルのサンプルデータ
INSERT INTO quotes (quote_id, supplier_id, quote_date, valid_until)
SELECT 
    uuid_generate_v4(),
    supplier_id,
    now() - (random() * interval '30 days'),
    now() + interval '30 days'
FROM suppliers
LIMIT 5;

-- quote_itemsテーブルのサンプルデータ
INSERT INTO quote_items (quote_item_id, quote_id, product_id, quantity, unit_price)
SELECT 
    uuid_generate_v4(),
    q.quote_id,
    p.product_id,
    floor(random() * 15 + 1)::integer,
    p.unit_price * 0.9
FROM quotes q
CROSS JOIN products p
LIMIT 5;

-- inventoryテーブルのサンプルデータ
INSERT INTO inventory (inventory_id, product_id, stock_quantity)
SELECT 
    uuid_generate_v4(),
    product_id,
    floor(random() * 100 + 1)::integer
FROM products;

-- ai_agents_logテーブルのサンプルデータ
INSERT INTO ai_agents_log (log_id, agent_type, log_time, log_message, related_order_id, related_purchase_order_id, related_quote_id)
SELECT 
    uuid_generate_v4(),
    (ARRAY['販売AI', '仕入AI'])[floor(random() * 2 + 1)],
    now() - (random() * interval '30 days'),
    CASE floor(random() * 3 + 1)::integer
        WHEN 1 THEN '受注処理を実行しました'
        WHEN 2 THEN '在庫確認を実施しました'
        WHEN 3 THEN '発注提案を生成しました'
    END,
    (SELECT order_id FROM orders LIMIT 1),
    (SELECT purchase_order_id FROM purchase_orders LIMIT 1),
    (SELECT quote_id FROM quotes LIMIT 1)
FROM generate_series(1, 5);