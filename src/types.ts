export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  qrCode: string;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
