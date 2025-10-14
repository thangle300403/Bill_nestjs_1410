import { get_encoding, Tiktoken } from 'tiktoken';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const encoder: Tiktoken = get_encoding('cl100k_base'); // works for gpt-4/gpt-3.5 + embeddings

export function truncateToMaxTokens(text: string, maxTokens: number): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const tokens: Uint32Array = encoder.encode(text);
  const truncated: Uint32Array = tokens.slice(0, maxTokens);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return new TextDecoder().decode(encoder.decode(truncated));
}
