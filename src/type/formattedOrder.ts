import { FormattedOrderItem, OrderItemResponse } from './formattedOrderItem';

export class FormattedOrder {
  id: number;
  created_date: string;
  order_status_id: number;
  staff_id: number | null;
  customer_id: number;
  shipping_fullname: string;
  shipping_mobile: string;
  payment_method: number;
  shipping_ward_id: string;
  shipping_housenumber_street: string;
  shipping_fee: number;
  delivered_date: string | null;
  order_items: FormattedOrderItem[];
  status_description: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
}

export class OrderDetailResponse {
  id: number;
  created_date: string;
  order_status_id: number;
  staff_id: number | null;
  customer_id: number;
  shipping_fullname: string;
  shipping_mobile: string;
  payment_method: number;
  shipping_ward_id: string;
  shipping_housenumber_street: string;
  shipping_fee: number;
  delivered_date: string | null;
  order_items: OrderItemResponse[];
  status_description: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
  total_price: number;
}
