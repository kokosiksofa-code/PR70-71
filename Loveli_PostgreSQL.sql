DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
 user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (role IN ('User','Admin')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE categories (
 category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE brands (
 brand_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE products (
 product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 category_id INTEGER NOT NULL REFERENCES categories(category_id),
 brand_id INTEGER NOT NULL REFERENCES brands(brand_id),
 name VARCHAR(200) NOT NULL,
 description TEXT,
 price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
 image_url VARCHAR(500),
 characteristics TEXT,
 stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE favorites (
 favorite_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id, product_id)
);
CREATE TABLE carts (
 cart_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE cart_items (
 cart_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 cart_id INTEGER NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES products(product_id),
 quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
 UNIQUE(cart_id, product_id)
);
CREATE TABLE orders (
 order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES users(user_id),
 delivery_address VARCHAR(500) NOT NULL,
 payment_method VARCHAR(50) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'Новый',
 total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE order_items (
 order_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES products(product_id),
 quantity INTEGER NOT NULL CHECK (quantity > 0),
 price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);
CREATE TABLE reviews (
 review_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
 rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
 comment VARCHAR(1000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id, product_id)
);

INSERT INTO categories (name) VALUES ('Макияж'), ('Уход'), ('Волосы'), ('Ароматы');
INSERT INTO brands (name) VALUES ('Lamel'), ('CeraVe'), ('L''Oreal'), ('Versace');
INSERT INTO products (category_id, brand_id, name, description, price, image_url, characteristics, stock_quantity) VALUES
(1,1,'Тушь для ресниц','Тушь для ежедневного макияжа.',799.00,'/images/mascara.png','Объём; чёрный цвет',20),
(2,2,'Увлажняющий крем','Увлажняющий крем для лица.',1299.00,'/images/cream.png','Для нормальной и сухой кожи',15),
(3,3,'Шампунь для волос','Шампунь для ежедневного ухода.',999.00,'/images/shampoo.png','250 мл',25),
(4,4,'Парфюмерная вода','Женский аромат.',5499.00,'/images/perfume.png','50 мл',8);

SELECT * FROM categories;
SELECT * FROM brands;
SELECT * FROM products;
