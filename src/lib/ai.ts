// AI integration for timeline content generation
// Uses Nebius API with OpenAI-compatible configuration

export interface AiGeneratedContent {
    title: string;
    description?: string;
    action?: string;
    comment?: string;
}

interface AiConfig {
    apiKey: string;
    baseUrl?: string;
    model?: string;
}

const DEFAULT_BASE_URL = 'https://api.studio.nebius.com/v1';
const DEFAULT_MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct';

export async function generateTimelineContent(
    prompt: string,
    config: AiConfig
): Promise<AiGeneratedContent> {
    const { apiKey, baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL } = config;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: `あなたはタイムラインコンテンツの作成を手伝うアシスタントです。
ユーザーの入力に基づいて、タイムラインアイテムのコンテンツを生成してください。
JSON形式で以下のフィールドを返してください:
- title: アイテムのタイトル（必須、短く簡潔に）
- description: 詳細な説明（オプション）
- action: アクションタイプ（例：「投稿」「公開」「達成」など、オプション）
- comment: 個人的なコメントや感想（オプション）

必ず有効なJSONのみを返してください。`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No content in AI response');
    }

    try {
        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        // If JSON parsing fails, use the content as title
        return { title: content.trim() };
    }
}

export async function enhanceContent(
    existingContent: string,
    instruction: string,
    config: AiConfig
): Promise<string> {
    const { apiKey, baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL } = config;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'あなたは文章を改善するアシスタントです。指示に従って文章を強化してください。改善された文章のみを返してください。',
                },
                {
                    role: 'user',
                    content: `以下の文章を「${instruction}」してください:\n\n${existingContent}`,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || existingContent;
}
