/**
 * OPC AI Chat Widget
 * Embedded via app-core.js — appears on all pages
 * Replace CHAT_WORKER_URL with your deployed Cloudflare Worker URL
 */

(function() {
  'use strict';

  // ========== CONFIG ==========
  // !! Replace with your deployed Worker URL after `npx wrangler deploy` !!
  var CHAT_WORKER_URL = 'https://opc-chat.YOUR-SUBDOMAIN.workers.dev';
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

      try {
        var resp = await fetch(CHAT_WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages })
        });

        if (!resp.ok) {
          throw new Error('HTTP ' + resp.status);
        }

        var data = await resp.json();
        if (data.error) {
          throw new Error(data.error);
        }
        addMessage('assistant', data.reply);

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
