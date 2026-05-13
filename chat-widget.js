/**
 * OPC AI Chat Widget
 * Embedded via app-core.js — appears on all pages
 * Direct call to SenseNova API (token.sensenova.cn)
 */

(function() {
  'use strict';

  // ========== CONFIG ==========
  var API_URL = 'https://token.sensenova.cn/v1/chat/completions';
  var API_KEY = 'sk-v9Ig2HymT3vWmFPYJomLXqcoXuU9YW25';
  var MODEL = 'deepseek-v4-flash';
  // ============================

  var STORAGE_KEY = 'opc_chat_history';

  // Only init on devices that can reasonably chat
  if (typeof window === 'undefined') return;

  // Delay init to not block page load
  function init() {
    if (document.getElementById('opc-chat-btn')) return; // Already inited

    var isEn = (window.i18n && i18n.getLang && i18n.getLang() === 'en');

    // --- Chat history ---
    var messages = loadHistory();

    // --- Create elements ---
    // Floating button (bottom-left)
    var btn = document.createElement('button');
    btn.id = 'opc-chat-btn';
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    btn.title = isEn ? 'AI Assistant' : 'OPC小助手 · AI客服';
    btn.style.cssText = [
      'position:fixed;bottom:88px;left:24px;z-index:9998;',
      'width:48px;height:48px;border-radius:50%;',
      'background:linear-gradient(135deg,#1a365d,#2c5282);',
      'color:#d4a853;border:2px solid #d4a853;',
      'font-size:1.25rem;cursor:pointer;',
      'box-shadow:0 4px 20px rgba(26,54,93,0.35);',
      'transition:transform 0.2s ease,box-shadow 0.2s ease;',
      'display:flex;align-items:center;justify-content:center;'
    ].join('');

    btn.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.08)'; });
    btn.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });

    // Chat panel
    var panel = document.createElement('div');
    panel.id = 'opc-chat-panel';
    panel.style.cssText = [
      'display:none;position:fixed;bottom:92px;left:24px;z-index:9999;',
      'width:360px;max-width:calc(100vw - 48px);max-height:520px;',
      'background:#fff;border-radius:16px;',
      'box-shadow:0 8px 40px rgba(0,0,0,0.18);',
      'overflow:hidden;',
      'flex-direction:column;'
    ].join('');

    // Panel header
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:linear-gradient(135deg,#1a365d,#2c5282);color:#fff;';
    header.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;">',
        '<div style="width:32px;height:32px;border-radius:50%;background:rgba(212,168,83,0.2);display:flex;align-items:center;justify-content:center;font-size:0.875rem;">🤖</div>',
        '<div>',
          '<div style="font-weight:700;font-size:0.875rem;line-height:1.2;">OPC小助手</div>',
          '<div style="font-size:0.6875rem;color:#a0aec0;line-height:1.2;">' + (isEn ? 'AI Customer Service' : 'AI智能客服') + '</div>',
        '</div>',
      '</div>',
      '<button id="opc-chat-close" style="background:none;border:none;color:#a0aec0;cursor:pointer;font-size:1.25rem;padding:4px;line-height:1;">✕</button>'
    ].join('');

    // Messages area
    var msgArea = document.createElement('div');
    msgArea.id = 'opc-chat-msgs';
    msgArea.style.cssText = 'flex:1;overflow-y:auto;padding:16px;min-height:200px;max-height:340px;background:#faf8f4;';

    // Render saved messages
    messages.forEach(function(m) { msgArea.appendChild(buildBubble(m.role, m.content, isEn)); });
    scrollBottom();

    // Typing indicator
    var typing = document.createElement('div');
    typing.id = 'opc-chat-typing';
    typing.style.cssText = 'display:none;padding:0 16px 8px;background:#faf8f4;';
    typing.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div style="width:28px;height:28px;border-radius:50%;background:#1a365d;display:flex;align-items:center;justify-content:center;font-size:0.7rem;">🤖</div><div style="display:flex;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#d4a853;animation:opc-dot 1.4s infinite;"></span><span style="width:6px;height:6px;border-radius:50%;background:#d4a853;animation:opc-dot 1.4s infinite 0.2s;"></span><span style="width:6px;height:6px;border-radius:50%;background:#d4a853;animation:opc-dot 1.4s infinite 0.4s;"></span></div></div>';

    // Input area
    var inputArea = document.createElement('div');
    inputArea.style.cssText = 'display:flex;gap:8px;padding:12px 16px;border-top:1px solid #e8e4dc;background:#fff;';
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'opc-chat-input';
    input.placeholder = isEn ? 'Ask me anything...' : '输入你的问题...';
    input.style.cssText = 'flex:1;padding:10px 14px;border:1px solid #e8e4dc;border-radius:20px;font-size:0.8125rem;outline:none;font-family:inherit;';
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') send(); });

    var sendBtn = document.createElement('button');
    sendBtn.id = 'opc-chat-send';
    sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
    sendBtn.style.cssText = 'width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#1a365d,#2c5282);color:#d4a853;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    sendBtn.addEventListener('click', send);

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(msgArea);
    panel.appendChild(typing);
    panel.appendChild(inputArea);

    // Toggle panel
    btn.addEventListener('click', function() {
      var isOpen = panel.style.display === 'flex';
      panel.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        input.focus();
        scrollBottom();
      }
    });

    // Close button
    header.querySelector('#opc-chat-close').addEventListener('click', function() {
      panel.style.display = 'none';
    });

    // Append
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // Animation keyframes (inject once)
    if (!document.getElementById('opc-chat-style')) {
      var style = document.createElement('style');
      style.id = 'opc-chat-style';
      style.textContent = [
        '@keyframes opc-dot { 0%,80%,100% { opacity:0.3;transform:scale(0.8); } 40% { opacity:1;transform:scale(1); } }',
        '#opc-chat-btn:hover { box-shadow:0 4px 24px rgba(212,168,83,0.4); }',
        '#opc-chat-msgs::-webkit-scrollbar { width:4px; }',
        '#opc-chat-msgs::-webkit-scrollbar-track { background:transparent; }',
        '#opc-chat-msgs::-webkit-scrollbar-thumb { background:#d4a853;border-radius:2px; }',
        '@media (max-width:480px) { #opc-chat-panel { width:calc(100vw - 40px);left:20px;bottom:84px;max-height:420px; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    // --- Functions ---
    function buildBubble(role, content, isEn) {
      var div = document.createElement('div');
      div.style.cssText = [
        'margin-bottom:12px;display:flex;',
        role === 'user' ? 'justify-content:flex-end;' : 'justify-content:flex-start;'
      ].join('');

      var bubble = document.createElement('div');
      bubble.style.cssText = role === 'user' ? [
        'background:linear-gradient(135deg,#1a365d,#2c5282);color:#fff;',
        'padding:10px 14px;border-radius:18px 18px 4px 18px;',
        'max-width:85%;font-size:0.8125rem;line-height:1.55;',
        'word-break:break-word;'
      ].join('') : [
        'background:#fff;color:#1a1a2e;',
        'padding:10px 14px;border-radius:18px 18px 18px 4px;',
        'max-width:85%;font-size:0.8125rem;line-height:1.55;',
        'border:1px solid #e8e4dc;',
        'word-break:break-word;'
      ].join('');

      bubble.textContent = content;
      div.appendChild(bubble);
      return div;
    }

    function scrollBottom() {
      setTimeout(function() {
        msgArea.scrollTop = msgArea.scrollHeight;
      }, 50);
    }

    function setLoading(loading) {
      typing.style.display = loading ? 'block' : 'none';
      input.disabled = loading;
      sendBtn.disabled = loading;
      sendBtn.style.opacity = loading ? '0.5' : '1';
      scrollBottom();
    }

    var SYSTEM_PROMPT = isEn ? [
      'You are OPC Assistant for OPC Incubator (fhopc.top), helping people transition to one-person companies.',
      'Services: free assessment → full report ¥19.9, business registration ¥399, subsidy application ¥399.',
      '20 cities covered. Shenzhen subsidies best (¥60k+/yr max). First-time subsidy rejection ~62%.',
      'First-year sole proprietor survival ~30%. We recommend 6 months savings before starting.',
      'Tone: warm, honest, like a knowledgeable friend. No corporate-speak. No emoji spam.',
      'When they ask "can I do it", ask about their situation first. Don\'t just encourage blindly.',
      'Mention relevant pages naturally, not like a sales pitch. One link max per response.'
    ].join(' ') : [
      '你是OPC一人公司孵化器(fhopc.top)的AI助手"OPC小助手"。你帮助普通人了解和转型一人公司。',
      '你的知识：免费测评→完整报告¥19.9 | 工商注册代办¥399 | 补贴代办¥399 | 20城补贴数据 | 真实案例（老周装修工长/小林UI设计师成功，阿强做导师失败）',
      '关键数据：深圳补贴年度最高6万+，补贴首次驳回率62%，个体户首年存活率约30%，建议6个月生活费储备。',
      '说话风格：像个懂行的朋友，不端着，不说教，不画饼。问啥答啥，别绕弯子。',
      '遇到问"我能不能干"的——先反问他的情况（什么行业、在职还是裸辞、手头多少钱），别上来就鼓励。你不是鸡汤bot。',
      '用户明显是小白时，建议先做免费测评了解自己适配度。提到具体服务时自然带一下相关页面，但别每句话都甩链接。',
      '回答长度：看问题复杂度。简单问题一两句，复杂问题可以多说几行。不用假装热情。'
    ].join('');

    async function send() {
      var text = input.value.trim();
      if (!text) return;
      if (text.length > 500) {
        addMessage('assistant', isEn ? 'Message too long (max 500 characters).' : '消息太长（最多500字），请简短描述你的问题。');
        return;
      }

      input.value = '';
      addMessage('user', text);
      setLoading(true);

      // Build API messages: system prompt + last 10 messages
      var apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
      var recent = messages.slice(-11); // last exchange + this one
      for (var i = 0; i < recent.length; i++) {
        apiMessages.push({ role: recent[i].role, content: recent[i].content });
      }

      try {
        var resp = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: MODEL,
            messages: apiMessages,
            max_tokens: 600,
            temperature: 0.7
          })
        });

        if (!resp.ok) {
          var errText = await resp.text();
          throw new Error('API ' + resp.status + ': ' + errText.substring(0, 100));
        }

        var data = await resp.json();
        var reply = data.choices?.[0]?.message?.content || (isEn ? 'Sorry, no response.' : '抱歉，没有收到回复。');

        addMessage('assistant', reply);

      } catch (e) {
        console.error('OPC Chat error:', e);
        addMessage('assistant', isEn ?
          'Sorry, I cannot respond right now. Please scan the WeChat QR code (green button, bottom-right) or email us.' :
          '抱歉，AI客服暂时无法响应。请扫描右下角绿色按钮的微信二维码，或稍后再试。');
      }

      setLoading(false);
    }

    function addMessage(role, content) {
      messages.push({ role: role, content: content });
      // Keep max 20 messages
      if (messages.length > 20) messages = messages.slice(-20);
      saveHistory();
      msgArea.appendChild(buildBubble(role, content, isEn));
      scrollBottom();
    }

    function loadHistory() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [{
          role: 'assistant',
          content: isEn ?
            'Hi! I\'m OPC Assistant. I can answer your questions about one-person companies, registration, subsidies, and more. How can I help?' :
            '你好！我是OPC小助手 🤖 可以问我：一人公司怎么注册？能领多少补贴？哪个城市政策最好？要不要先测测适配度？'
        }];
      } catch(e) { return []; }
    }

    function saveHistory() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch(e) {}
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
