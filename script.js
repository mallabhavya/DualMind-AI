const form = document.getElementById('chatForm');
const input = document.getElementById('userInput');
const chatBox = document.getElementById('chatBox');
const toggle = document.getElementById('modeToggle');
const comfortLabel = document.querySelector('.comfort-label');
const harshLabel = document.querySelector('.harsh-label');

const apiModal = document.getElementById('apiModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const apiError = document.getElementById('apiError');

const streakCounter = document.getElementById('streakCounter');
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisModal = document.getElementById('analysisModal');
const closeAnalysis = document.getElementById('closeAnalysis');
const analysisResult = document.getElementById('analysisResult');

let currentMode = 'comfort';

// Initialization: Check API Key & Load State
let GEMINI_API_KEY = localStorage.getItem('gemini_api_key');
let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];

function init() {
    if (!GEMINI_API_KEY) {
        apiModal.classList.add('active');
    }
    updateStreak();
    renderHistory();
}

saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key.length > 10) {
        localStorage.setItem('gemini_api_key', key);
        GEMINI_API_KEY = key;
        apiModal.classList.remove('active');
        if (chatHistory.length === 0) {
            addMessage("Hi friend! 🎀 Tell me what's on your mind. I'm here to listen!", 'bot', 'comfort');
        }
    } else {
        apiError.style.display = 'block';
    }
});

// Update Streak
function updateStreak() {
    const lastDate = localStorage.getItem('last_worry_date');
    let streak = parseInt(localStorage.getItem('worry_streak')) || 0;
    
    const today = new Date().toDateString();
    
    if (lastDate === today) {
        // Already logged today
        streakCounter.innerText = `🔥 ${streak} Days`;
        return;
    }

    if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
            // Logged yesterday, keep streak alive pending today's log (handled on submit)
        } else {
            // Missed a day
            streak = 0;
            localStorage.setItem('worry_streak', 0);
        }
    }
    
    streakCounter.innerText = `🔥 ${streak} Days`;
}

function incrementStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('last_worry_date');
    if (lastDate !== today) {
        let streak = parseInt(localStorage.getItem('worry_streak')) || 0;
        streak += 1;
        localStorage.setItem('worry_streak', streak);
        localStorage.setItem('last_worry_date', today);
        streakCounter.innerText = `🔥 ${streak} Days`;
    }
}

// Render History
function renderHistory() {
    chatBox.innerHTML = '';
    if (chatHistory.length === 0 && GEMINI_API_KEY) {
        // Initial welcome message
        addMessage("Hi friend! 🎀 Tell me what's on your mind. I'm here to listen!", 'bot', 'comfort', false);
    } else {
        chatHistory.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', msg.role);
            if(msg.role === 'bot') {
                msgDiv.classList.add(msg.mode || 'comfort');
            }
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            bubble.innerText = msg.text;
            msgDiv.appendChild(bubble);
            chatBox.appendChild(msgDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// UI Toggle Theme
toggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        currentMode = 'harsh';
        comfortLabel.classList.remove('active');
        harshLabel.classList.add('active');
        document.body.style.background = 'linear-gradient(135deg, #f0e6ff 0%, #e0c0ff 100%)';
        document.querySelector('.app-header h1').style.color = '#8a2be2';
        document.querySelector('.app-header h1').innerText = 'Reality Check Bot 🐉';
        document.querySelector('.app-container').style.borderColor = '#d8bfd8';
        
        document.querySelectorAll('.app-header, .input-container, .top-bar').forEach(el => {
            el.style.background = 'rgba(230, 230, 250, 0.8)';
        });
        document.querySelector('.app-header').style.borderBottomColor = '#b19cd9';
        document.querySelector('.input-container').style.borderTopColor = '#b19cd9';
        document.getElementById('userInput').style.borderColor = '#b19cd9';
        document.getElementById('sendBtn').style.background = '#8a2be2';
        document.getElementById('streakCounter').style.color = '#8a2be2';
    } else {
        currentMode = 'comfort';
        harshLabel.classList.remove('active');
        comfortLabel.classList.add('active');
        document.body.style.background = 'linear-gradient(135deg, #ffe6ea 0%, #fbd3e9 100%)';
        document.querySelector('.app-header h1').style.color = '#ff6eb4';
        document.querySelector('.app-header h1').innerText = 'Overthinker Bot 🫧';
        document.querySelector('.app-container').style.borderColor = '#ffccde';
        
        document.querySelectorAll('.app-header, .input-container, .top-bar').forEach(el => {
            el.style.background = 'rgba(255, 240, 245, 0.8)';
        });
        document.querySelector('.app-header').style.borderBottomColor = '#ffb6c1';
        document.querySelector('.input-container').style.borderTopColor = '#ffb6c1';
        document.getElementById('userInput').style.borderColor = '#ffb6c1';
        document.getElementById('sendBtn').style.background = '#ff6eb4';
        document.getElementById('streakCounter').style.color = '#ff6eb4';
    }
});

// Chat Output logic
function addMessage(text, sender, modeClass = 'comfort', save = true) {
    if(save) {
        chatHistory.push({role: sender, text: text, mode: modeClass});
        localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    }

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    if (sender === 'bot') {
        msgDiv.classList.add(modeClass);
    }
    
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerText = text;
    
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator(mode) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'bot', mode);
    msgDiv.id = 'typingIndicator';
    
    const bubble = document.createElement('div');
    bubble.classList.add('bubble', 'typing-indicator');
    
    for(let i=0; i<3; i++){
        const dot = document.createElement('div');
        dot.classList.add('dot');
        bubble.appendChild(dot);
    }
    
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// Call Google Gemini API
async function callGemini(userMessage) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    let contextStr = chatHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");
    
    let systemInstruction = "";
    if (currentMode === 'comfort') {
        systemInstruction = "You are a sweet, highly empathetic, and validating best friend helping someone who is overthinking. Keep responses concise (under 3 sentences), use gentle emojis 🎀🌸🥺, and gently reassure them their feelings are valid but it will be okay. Tone: soft, girly, soothing.";
    } else {
        systemInstruction = "You are a brutally honest, logical reality-checker. The user is overthinking irrationally. Dismantle their worry with cold hard facts. Keep it concise (under 3 sentences), use emojis like 💅🐉🙄📉. No sugarcoating. Tell them to snap out of it. Tone: sassy, direct, unbothered.";
    }

    const promptText = `System Instructions: ${systemInstruction}\n\nRecent History:\n${contextStr}\n\nUSER's new worry: ${userMessage}\n\nBOT (Reply appropriately based on system instructions):`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            console.error(await response.text());
            return "Oops... My AI brain had a slight malfunction. 🥺 The API key might be invalid or out of quota!";
        }

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        return reply.replace(/BOT:/g, '').trim();
    } catch (e) {
        console.error(e);
        return "Uh oh, I couldn't connect to the AI! Make sure you are connected to the internet. 🌸";
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!GEMINI_API_KEY) {
        apiModal.classList.add('active');
        return;
    }

    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    incrementStreak();

    const savedMode = currentMode;
    showTypingIndicator(savedMode);

    const botReply = await callGemini(text);
    
    removeTypingIndicator();
    addMessage(botReply, 'bot', savedMode);
});

// Personality Analysis
analyzeBtn.addEventListener('click', async () => {
    if (!GEMINI_API_KEY) {
        apiModal.classList.add('active');
        return;
    }
    
    const userWorryHistory = chatHistory.filter(m => m.role === 'user').map(m => m.text);
    if(userWorryHistory.length < 3) {
        alert("You need to spill at least 3 worries before I can analyze your personality! Keep chatting! 🎀");
        return;
    }

    analysisModal.classList.add('active');
    analysisResult.innerHTML = '<div class="typing-indicator" style="justify-content: center;"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div><p style="text-align: center; margin-top: 10px;">Analyzing your deepest worries...</p>';

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const promptText = `Analyze the following worries from a user. Construct a 3-paragraph "Personality & Empathy Profile". 
Paragraph 1: Their 'Overthinking Style' (e.g. catastrophizing, social anxiety). 
Paragraph 2: Their core strengths based on their worries. 
Paragraph 3: A gentle, uplifting piece of advice. 
Format nicely with bullet points or emojis. 

User Worries:
${userWorryHistory.join("\n")}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        analysisResult.innerHTML = data.candidates[0].content.parts[0].text;
    } catch(e) {
        analysisResult.innerHTML = "<p>Failed to generate analysis. Please try again! 🥺</p>";
    }
});

closeAnalysis.addEventListener('click', () => {
    analysisModal.classList.remove('active');
});

init();
