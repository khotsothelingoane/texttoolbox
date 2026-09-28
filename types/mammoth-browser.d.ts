declare module "mammoth/mammoth.browser.js" {
  type Input = { arrayBuffer: ArrayBuffer };
  export function convertToHtml(input: Input, options?: Record<string, unknown>): Promise<{ value: string; messages: unknown[] }>;
  export const images: { imgElement(fn: (image: unknown) => Promise<{ src: string }>): unknown };
  const mammoth: { convertToHtml: typeof convertToHtml; images: typeof images };
  export default mammoth;
}
