export class CategoryProduct {
  categoryName: string;
  items: any[];
  totalItem: number;
  pagination: {
    page: string;
    totalPage: number;
  };
}

export class ProductResponse {
  id: number;
  name: string;
  featured_image: string;
  price: number;
  sale_price: number;
}
