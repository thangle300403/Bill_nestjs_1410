export class CategoryProduct {
  categoryName: string;
  items: any[]; // or define a proper Product DTO later
  totalItem: number;
  pagination: {
    page: string;
    totalPage: number;
  };
}
