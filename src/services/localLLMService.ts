import { pipeline, TextGenerationPipeline } from '@huggingface/transformers';

class LocalLLMService {
  private static instance: LocalLLMService;
  private generator: any = null;
  private isLoading = false;
  private modelName = 'Xenova/Qwen1.5-0.5B-Chat'; // Default small model for browser

  private constructor() {}

  static getInstance(): LocalLLMService {
    if (!LocalLLMService.instance) {
      LocalLLMService.instance = new LocalLLMService();
    }
    return LocalLLMService.instance;
  }

  async init(modelName?: string) {
    if (this.generator || this.isLoading) return;
    
    this.isLoading = true;
    if (modelName) this.modelName = modelName;

    try {
      console.log(`[LocalLLM] Initializing ${this.modelName} via WebGPU...`);
      this.generator = await (pipeline as any)('text-generation', this.modelName, {
        device: 'webgpu',
      });
      console.log(`[LocalLLM] ${this.modelName} ready.`);
    } catch (err) {
      console.error('[LocalLLM] Initialization failed:', err);
      // Fallback to CPU if WebGPU fails
      try {
        console.log(`[LocalLLM] Falling back to CPU...`);
        this.generator = await (pipeline as any)('text-generation', this.modelName);
      } catch (cpuErr) {
        console.error('[LocalLLM] CPU Fallback failed:', cpuErr);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.generator) {
      await this.init();
    }
    if (!this.generator) throw new Error('Local LLM failed to initialize');

    const fullPrompt = systemInstruction 
      ? `<|im_start|>system\n${systemInstruction}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`
      : prompt;

    const output = await this.generator(fullPrompt, {
      max_new_tokens: 512,
      temperature: 0.7,
      do_sample: true,
      top_k: 50,
    });

    // @ts-ignore
    const text = output[0].generated_text;
    // Remove the prompt from the output if necessary (Transformers.js usually returns full text)
    return text.replace(fullPrompt, '').trim();
  }
}

export const localLLM = LocalLLMService.getInstance();
