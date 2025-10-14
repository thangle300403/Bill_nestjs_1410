// src/utils/format-product.util.ts
import { Product } from 'src/entities/product.entity';

export function formatProduct(item: Product) {
  return {
    id: item.id,
    barcode: item.barcode,
    sku: item.sku,
    name: item.name,
    price: item.price,
    discount_percentage: item.discountPercentage,
    discount_from_date: item.discountFromDate,
    discount_to_date: item.discountToDate,
    featured_image: `${process.env.IMAGE_BASE_URL}${item.featuredImage}`,
    inventory_qty: item.inventoryQty,
    category_id: item.categoryId,
    brand_id: item.brandId,
    created_date: item.createdDate,
    description: item.description || '',
    star: item.star,
    featured: item.featured,
    sale_price:
      item.discountPercentage && item.discountPercentage > 0
        ? Math.floor(
            item.price * (1 - item.discountPercentage / 100),
          ).toString()
        : item.price.toString(),
  };
}

export function formatProducts(items: Product[]) {
  return items.map(formatProduct);
}
