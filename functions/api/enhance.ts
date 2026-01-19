interface Env {
    NEBIUS_API_KEY: string;
}

const NEBIUS_API_URL = 'https://api.tokenfactory.nebius.com/v1/chat/completions';
const MODEL = 'google/gemma-3-27b-it-fast';

const SYSTEM_PROMPT = `あなたは文章改善アシスタントです。ユーザーが入力したテキストを、より自然で読みやすい日本語に改善してください。

ルール:
- 元の意味を変えない
- 簡潔で分かりやすい表現にする
- タイトルの場合は短く、説明の場合は適度な長さで
- 絵文字や記号は使わない
- 改善した文章のみを返す（説明や前置きは不要）
- 入力が既に良い場合は、そのまま返す`;

interface EnhanceRequest {
    text: string;
    type: 'title' | 'action' | 'description';
    context?: {
        title?: string;
        action?: string;
        description?: string;
    };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    const apiKey = env.NEBIUS_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
        console.error('NEBIUS_API_KEY is not configured');
        return new Response(JSON.stringify({
            enhancedText: '',
            error: 'API key not configured. Please set NEBIUS_API_KEY in Cloudflare Pages environment variables.'
        }), {
            status: 500,
            headers: corsHeaders
        });
    }

    let body: any;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ enhancedText: '', error: 'Invalid JSON body' }), {
            status: 400,
            headers: corsHeaders
        });
    }

    const { text, type, context: textContext } = body as EnhanceRequest;

    if (!text || !text.trim()) {
        return new Response(JSON.stringify({ enhancedText: '', error: 'Text is required' }), {
            status: 400,
            headers: corsHeaders
        });
    }

    // Build user message with context
    let userMessage = '';

    const typeLabel = {
        title: 'タイトル',
        action: 'アクション（動詞）',
        description: '説明文',
    }[type] || 'テキスト';

    // Add context for better enhancement
    if (textContext) {
        const contextParts = [];
        if (textContext.title && type !== 'title') {
            contextParts.push(`タイトル: ${textContext.title}`);
        }
        if (textContext.action && type !== 'action') {
            contextParts.push(`アクション: ${textContext.action}`);
        }
        if (contextParts.length > 0) {
            userMessage += `参考情報:\n${contextParts.join('\n')}\n\n`;
        }
    }

    userMessage += `以下の${typeLabel}を改善してください:\n\n${text}`;

    try {
        console.log('Calling Nebius API...');

        const response = await fetch(NEBIUS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: [{ type: 'text', text: userMessage }],
                    },
                ],
                max_tokens: 256,
                temperature: 0.7,
            }),
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('Nebius API error:', response.status, responseText);
            return new Response(JSON.stringify({
                enhancedText: '',
                error: `API error: ${response.status} - ${responseText.slice(0, 100)}`,
            }), {
                status: response.status,
                headers: corsHeaders
            });
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response:', responseText);
            return new Response(JSON.stringify({
                enhancedText: '',
                error: 'Failed to parse API response',
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

        const enhancedText = data.choices?.[0]?.message?.content?.trim() || text;

        console.log('Enhanced text:', enhancedText);

        return new Response(JSON.stringify({ enhancedText }), {
            status: 200,
            headers: corsHeaders
        });
    } catch (error) {
        console.error('Enhance API error:', error);
        return new Response(JSON.stringify({
            enhancedText: '',
            error: error instanceof Error ? error.message : 'Failed to enhance text',
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
};
