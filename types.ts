
export enum Scenario {
  SEO_TITLE = 'SEO_TITLE',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  MARKETING = 'MARKETING'
}

export type ModelType = 'gemini-3-pro-preview' | 'gemini-2.5-flash';

export interface TranslationState {
  input: string;
  output: string;
  glossary: string;
  keywords: string[];
  customTags: string[]; // New field for user-defined tags
  scenario: Scenario;
  model: ModelType;
  isLoading: boolean;
  error: string | null;
}

export interface ScenarioConfig {
  id: Scenario;
  icon: string; // Lucide icon name
  placeholderKey: string; // Key for translation
}

export interface KeywordPreset {
  term: string;
  meaning: string;
}

// Updated with "Vietnamese E-commerce Slang" and Chinese meanings
export const KEYWORD_PRESETS: KeywordPreset[] = [
  { term: "Freeship", meaning: "免运费" },
  { term: "Chính hãng", meaning: "正品" },
  { term: "Hàng có sẵn", meaning: "现货" },
  { term: "Ship COD", meaning: "货到付款" },
  { term: "Hack dáng", meaning: "显瘦 (服饰)" },
  { term: "Thấm hút", meaning: "吸汗透气" },
  { term: "Chốt đơn", meaning: "下单/成交" },
  { term: "Voucher", meaning: "优惠券" },
  { term: "Giá hủy diệt", meaning: "跳楼价" }
];