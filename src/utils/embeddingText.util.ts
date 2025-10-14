import { Product } from 'src/entities/product.entity';

export function toEmbeddingText(product: Product): string {
  return `${product.name}. ${product.description || ''}`;
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}
