import { GoogleGenAI } from "@google/genai";
import { Scenario } from "../types";

const SLANG_GUIDE = `
CRITICAL VOCABULARY MAPPING (Chinese -> Vietnamese E-commerce Slang):
1. 亲 / 亲爱的 -> "Bạn ơi", "Khách yêu", "Tình yêu ơi" (NEVER use "Thân ái")
2. 免运费 -> "Freeship", "Miễn ship" (NEVER use "Miễn phí vận chuyển")
3. 货到付款 -> "COD", "Ship COD" (NEVER use "Thanh toán khi nhận hàng")
4. 现货 -> "Hàng có sẵn", "Sẵn kho"
5. 正品 -> "Hàng Auth", "Chính hãng 100%"
6. 显瘦 (Clothing) -> "Hack dáng", "Tôn dáng" (NEVER use "Trông gầy")
7. 透气 (Fabric) -> "Thoáng khí", "Thấm hút mồ hôi" (NEVER use "Có thể thở")
8. 下单 -> "Lên đơn", "Chốt đơn", "Săn ngay"
9. 优惠券 -> "Voucher", "Mã giảm giá" (NEVER use "Phiếu giảm giá")
`;

const SYSTEM_INSTRUCTIONS: Record<Scenario, string> = {
  [Scenario.SEO_TITLE]: `You are an expert Shopee/Lazada Vietnam SEO copywriter.
  ${SLANG_GUIDE}

  Task: Translate/Rewrite the Chinese product title into a high-ranking Vietnamese SEO title.
  
  STRICT STRUCTURE RULE:
  [Brand/Core Product Name] + [Model] + [Key Selling Point/Material] + [Target Audience/Usage]
  
  REQUIREMENTS:
  1. Length: Keep it between 100-120 characters.
  2. Keywords: Prioritize high-volume search terms.
  3. Formatting: Do NOT use quotation marks. Remove redundant adjectives.
  4. Suffix: If the input implies a promotion, append " [Freeship]" or " [Có sẵn]" at the end.
  5. Logic: Translate for search intent, not literal meaning.
  6. PRESERVE terms listed in GLOSSARY.`,

  [Scenario.PRODUCT_DETAIL]: `You are a Vietnamese e-commerce listing specialist (Copywriter).
  ${SLANG_GUIDE}

  Task: Transcreate the product description into a persuasive "Selling List".
  
  TRANSFORMATION RULES:
  1. Feature -> Benefit: Don't just list specs. Explain why it matters.
     (e.g., "Cotton material" -> "Vải Cotton mềm mại, thấm hút mồ hôi, an toàn cho da")
  2. Format: Use these specific emojis for bullet points: ✅, ✨, 🔸.
  3. Size Warning: ALWAYS add this tip at the end: "💡 Lưu ý: Kích thước Việt Nam có thể nhỏ hơn tiêu chuẩn Âu/Mỹ, vui lòng check bảng size hoặc inbox Shop tư vấn."
  4. CTA: End with a Call to Action like "Mua ngay để nhận ưu đãi!" or "Số lượng có hạn, chốt đơn ngay!".
  5. Units: Convert 'Jin' (斤) to kg/g. Remove Chinese Yuan symbols.
  6. PRESERVE terms listed in GLOSSARY.`,

  [Scenario.CUSTOMER_SERVICE]: `You are a polite, helpful, and warm Vietnamese Customer Support agent (Southern accent preferred).
  ${SLANG_GUIDE}

  Task: Translate the Chinese reply into natural, soft Vietnamese CS language.
  
  TONE & FORMAT:
  1. Opening: ALWAYS start with "Dạ chào bạn ạ," or "Dạ Shop chào anh/chị,".
  2. Self-reference: Use "Shop" or "Bên em". Refer to customer as "Bạn", "Khách", or "Tình yêu".
  3. Softening: If refusing (e.g., no stock, no refund), apologize profusely and offer an alternative. Never say "No" directly.
  4. Closing: ALWAYS end with "Shop cảm ơn ạ!" or "Inbox Shop để được hỗ trợ ngay nhé!".
  5. PRESERVE terms listed in GLOSSARY.`,

  [Scenario.MARKETING]: `You are a Vietnamese social media marketer (TikTok/Facebook).
  ${SLANG_GUIDE}

  Task: Rewrite the content into a viral, high-energy caption.
  
  STYLE GUIDE:
  1. Mood: FOMO (Fear Of Missing Out), Urgent, Exciting.
  2. Power Words (Use these): "Sale sập sàn", "Giá hủy diệt", "Freeship đơn từ 0đ", "Hàng Hot Trend", "Duy nhất hôm nay".
  3. Hashtags: Add 3-5 relevant hashtags at the bottom (e.g., #Shopee, #Sale, #OOTD).
  4. Structure: Hook -> Key Benefit -> Urgency -> CTA.
  5. PRESERVE terms listed in GLOSSARY.`
};

// Safe environment variable accessor
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

export const generateTranslation = async (
  text: string,
  scenario: Scenario,
  glossary: string,
  keywords: string[],
  model: string,
  apiKey?: string
): Promise<string> => {
  if (!text.trim()) return "";

  // Priority Logic:
  // 1. Use Environment Variable (Process.env) if available (Preferred default)
  // 2. If not, use the Manual Key passed from UI (localStorage)
  const envKey = getEnvVar('API_KEY');
  const activeKey = envKey || apiKey;

  if (!activeKey) {
    // This error is mostly for logging, as UI should intercept this
    throw new Error("API Key is missing. Please configure it in Settings.");
  }

  // Initialize a new instance with the correct key
  const ai = new GoogleGenAI({ apiKey: activeKey });

  const instruction = SYSTEM_INSTRUCTIONS[scenario];
  
  let prompt = `SOURCE TEXT (Chinese): "${text}"\n\n`;
  
  if (glossary.trim()) {
    prompt += `GLOSSARY (Do NOT translate these exact terms): ${glossary}\n`;
  }
  
  if (keywords.length > 0) {
    prompt += `MANDATORY KEYWORDS (Integrate these naturally): ${keywords.join(", ")}\n`;
  }

  prompt += `\nTARGET OUTPUT (Vietnamese):`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.75,
        topP: 0.95,
      }
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Provide more user-friendly error messages
    if (error.message?.includes("API_KEY")) {
      throw new Error("Invalid API Key. Please check your settings.");
    }
    if (error.status === 429) {
      throw new Error("Too many requests. Please wait a moment.");
    }
    throw new Error(error.message || "Translation failed. Please check connection.");
  }
};