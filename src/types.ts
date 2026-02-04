export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  barcode: string;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  minAmount: number;
  title: string;
  description: string;
  code: string;
}

export interface CouponConfig {
  coupons: Coupon[];
  instructions: string;
}

export interface ProductTemplate {
  barcode: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface ProductsConfig {
  products: ProductTemplate[];
  instructions: string;
}
