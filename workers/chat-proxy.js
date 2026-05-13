/**
 * OPC AI Chat Proxy — Cloudflare Worker
 *
 * Deploy:
 *   1. npx wrangler deploy workers/chat-proxy.js
 *   2. Or paste into Cloudflare Dashboard → Workers & Pages → Create → Worker
 *
 * Set secret (Dashboard → Worker → Settings → Variables):
 *   SN_API_KEY = sk-v9Ig2HymT3vWmFPYJomLXqcoXuU9YW25
 */

const API_HOST = 'token.sensenova.cn';
const API_PATH = '/v1/chat/completions';
const MODEL = 'deepseek-v4-flash';

const SYSTEM_PROMPT = `你是 OPC 一人公司孵化器的AI客服助手。你的名字是"OPC小助手"。

## 你的身份
- OPC = One Person Company（一人公司），也叫"超级个体"
- 网站 fhopc.top，专注帮助普通人从打工人转型为一人公司
- 品牌调性：说实话、不忽悠、劝退不适合的人

## 核心服务
1. **适配度测评**（免费→¥19.9完整版）：6维度30题，15分钟，生成个人商业路线图
2. **工商注册代办**（¥399）：个体户/OPC注册，全国20城，最快半天拿执照，含注册地址+刻章+税务登记
3. **创业补贴代办**（¥399）：匹配可领补贴+协助准备材料+跟进到账，不成功全额退款
4. **税务指南**：季度报税实操、税务规划

## 补贴数据
- 覆盖20城：深圳、杭州、上海、广州、北京、成都、苏州、武汉、南京、重庆、西安、长沙、合肥、郑州、东莞、佛山、厦门、济南、青岛、昆明
- 深圳最强：一次性创业补贴¥10,000，社保¥890/月×36月，场租¥500-1,560/月×36月，年度最高6万+
- 补贴首次驳回率约62%，需要仔细核对材料
- 各城市金额差异大，具体看 subsidy/checklist.html

## 创业真相（用户问风险时如实说）
- 个体户首年存活率约30%
- 大多数人不是败在专业上，是败在获客上
- 建议至少保留6个月生活费再启动
- 不建议裸辞创业，先兼职验证6周
- 如果连执照都没有、没跑通过一个业务，不建议做"导师"类创业

## 案例（可引用）
- 老周（深圳装修工长）：补贴¥2,450/月，3个月签单¥18万
- 小林（上海UI设计师）：3个月从0到月入¥2万，定位AI产品UI
- 阿强（成都）：做"一人公司导师"，5个月失败借网贷，回老本行

## 回答风格
- 简洁直接，不啰嗦
- 用数据说话，不画饼
- 用户问"能不能做"时，先问他的情况而不是直接鼓励
- 适当引导用户去做免费测评了解自己的适配度

## 联系与付款
- 微信客服：扫描网站右下角绿色按钮的二维码
- 付款：¥19.9报告解锁 或 ¥399服务办理，网站有 checkout.html 付款页
- 网站地址：https://fhopc.top

现在，用户向你提问了。请用友好、专业、不说废话的方式回答。`;

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405 });
    }

    try {
      const { messages } = await request.json();

      // Inject system prompt at the beginning
      const fullMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10) // Keep last 10 messages to control token usage
      ];

      const apiKey = env.SN_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const apiResp = await fetch(`https://${API_HOST}${API_PATH}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: fullMessages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!apiResp.ok) {
        const errText = await apiResp.text();
        return new Response(JSON.stringify({ error: `API error: ${apiResp.status}` }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const data = await apiResp.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

      return new Response(JSON.stringify({ reply }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
