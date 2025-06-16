import { ProductResponse } from './product';

export class FormattedOrderItem {
  product_id: number;
  order_id: number;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    featured_image: string;
    price: number;
    sale_price: number | null;
  };
}

export class OrderItemResponse {
  product_id: number;
  order_id: number;
  qty: number;
  unit_price: number;
  total_price: number;
  product: ProductResponse;
}

export class CartItem {
  id: number;
  qty: number;
  sale_price: number;
  featured_image?: string;
  name?: string;
}
