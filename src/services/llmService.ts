import { GoogleGenAI } from "@google/genai";
import { LLMConfig } from "../types";

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const { provider, apiKey, modelName, baseUrl } = this.config;

    switch (provider) {
      case 'gemini':
        return this.callGemini(prompt, systemInstruction);
      case 'openai':
        return this.callOpenAI(prompt, systemInstruction);
      case 'anthropic':
        return this.callAnthropic(prompt, systemInstruction);
      case 'ollama':
        return this.callOllama(prompt, systemInstruction);
      case 'custom':
        return this.callCustom(prompt, systemInstruction);
      case 'webgpu':
        return this.callWebGPU(prompt, systemInstruction);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const { provider, apiKey, baseUrl } = this.config;

    if (provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || '' });
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: [text],
      });
      return result.embeddings?.[0]?.values || [];
    } else if (provider === 'openai') {
      const response = await fetch(baseUrl?.replace('/chat/completions', '/embeddings') || 'https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });
      const data = await response.json();
      return data.data?.[0]?.embedding || [];
    } else if (provider === 'ollama') {
      const response = await fetch(baseUrl?.replace('/api/generate', '/api/embeddings') || 'http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.modelName || 'nomic-embed-text',
          prompt: text,
        }),
      });
      const data = await response.json();
      return data.embedding || [];
    }
    
    // Fallback or unsupported
    console.warn(`Embeddings not natively supported for provider: ${provider}, returning empty vector.`);
    return [];
  }

  private async callGemini(prompt: string, systemInstruction?: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: this.config.apiKey || process.env.GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: this.config.modelName || "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text || '';
  }

  private async callOpenAI(prompt: string, systemInstruction?: string): Promise<string> {
    const response = await fetch(this.config.baseUrl || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName || 'gpt-4o',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string, systemInstruction?: string): Promise<string> {
    const response = await fetch(this.config.baseUrl || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.modelName || 'claude-3-5-sonnet-20240620',
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callOllama(prompt: string, systemInstruction?: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl || 'http://localhost:11434'}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.modelName || 'llama3',
        prompt: prompt,
        system: systemInstruction,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  private async callCustom(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.config.baseUrl) throw new Error('Custom provider requires a base URL');

    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Assuming OpenAI-compatible response format for custom endpoints
    return data.choices?.[0]?.message?.content || data.response || JSON.stringify(data);
  }

  private async callWebGPU(prompt: string, systemInstruction?: string): Promise<string> {
    const { localLLM } = await import('./localLLMService');
    return localLLM.generate(prompt, systemInstruction);
  }
}
