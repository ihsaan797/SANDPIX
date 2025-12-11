import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceItem } from "../types";

const apiKey = process.env.API_KEY || '';

// Singleton instance retrieval
const getAI = () => new GoogleGenAI({ apiKey });

export const suggestInvoiceItems = async (description: string): Promise<InvoiceItem[]> => {
  if (!description || !apiKey) return [];

  const ai = getAI();
  const prompt = `Create a list of professional invoice line items for a business called "SandPix Maldives" based on this rough description: "${description}". 
  The currency is MVR. Assume reasonable market rates for photography/videography/design services in Maldives if not specified.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Professional service description" },
              quantity: { type: Type.NUMBER, description: "Quantity or hours" },
              rate: { type: Type.NUMBER, description: "Rate in MVR" }
            },
            required: ["description", "quantity", "rate"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const items = JSON.parse(text);
    return items.map((item: any) => ({
      ...item,
      id: crypto.randomUUID()
    }));
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return [];
  }
};

export const generateEmailDraft = async (invoiceData: any): Promise<string> => {
  if (!apiKey) return "";

  const ai = getAI();
  const prompt = `Write a polite, professional email to send invoice #${invoiceData.invoiceNumber} to ${invoiceData.clientName}. 
  The total is MVR ${invoiceData.total}. 
  The business is SandPix Maldives. 
  Keep it brief and friendly.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Please find attached the invoice.";
  }
};