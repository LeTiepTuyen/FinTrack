<template>
  <section class="ai-assistant">
    <header class="transaction-head-row">
      <div>
        <h3>FinTrack AI Assistant</h3>
        <p>Your virtual financial consultant. (Simulation)</p>
      </div>
    </header>

    <div class="chat-layout panel-card">
      <div class="chat-messages" ref="messageContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div class="message-content">
            <p>{{ msg.text }}</p>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>
        <div v-if="isTyping" class="message assistant typing">
          <div class="message-content">
            <p>FinTrack AI is thinking...</p>
          </div>
        </div>
      </div>

      <div class="chat-suggestions" v-if="messages.length === 1">
        <p>Try asking:</p>
        <div class="suggestion-chips">
          <button v-for="q in sampleQuestions" :key="q" @click="askQuestion(q)">
            {{ q }}
          </button>
        </div>
      </div>

      <form class="chat-input" @submit.prevent="sendMessage">
        <input 
          v-model="userInput" 
          placeholder="Ask something about your finances..." 
          :disabled="isTyping"
        />
        <button type="submit" class="primary-btn" :disabled="!userInput.trim() || isTyping">
          Send
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const messageContainer = ref(null);
const userInput = ref('');
const isTyping = ref(false);

const messages = ref([
  {
    role: 'assistant',
    text: "Hello! I'm your FinTrack AI Assistant. I can help you analyze your spending habits, check your budget status, or provide financial tips. How can I assist you today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]);

const sampleQuestions = [
  "How much did I spend on Food this month?",
  "Am I over my budget in any category?",
  "What was my biggest expense last week?",
  "Give me tips to save more money."
];

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

const sendMessage = () => {
  if (!userInput.value.trim()) return;
  
  const text = userInput.value;
  messages.value.push({
    role: 'user',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  
  userInput.value = '';
  scrollToBottom();
  simulateResponse(text);
};

const askQuestion = (q) => {
  userInput.value = q;
  sendMessage();
};

const simulateResponse = (query) => {
  isTyping.value = true;
  scrollToBottom();

  setTimeout(() => {
    isTyping.value = false;
    let response = "";
    const q = query.toLowerCase();

    if (q.includes('food')) {
      response = "Based on your recent transactions, you've spent approximately $450 on Food this month. This is within your $500 limit, but you've already used 90% of it!";
    } else if (q.includes('budget')) {
      response = "You are currently on track for most categories. However, your 'Entertainment' budget is exceeding the limit by $25. You might want to cut back on leisure spending for the rest of the month.";
    } else if (q.includes('biggest expense')) {
      response = "Your biggest expense last week was $1,200 for 'Rent' on May 1st. Outside of fixed costs, you spent $85 on 'Amazon Shopping'.";
    } else if (q.includes('tips')) {
      response = "To save more money, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. I also noticed you spend a lot on 'Dining Out'—cooking at home twice more per week could save you $150/month!";
    } else {
      response = "That's a great question! As a simulation, I can't access live complex data analysis yet, but I can see you're doing a great job tracking your expenses. Keep it up!";
    }

    messages.value.push({
      role: 'assistant',
      text: response,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    scrollToBottom();
  }, 1500);
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.ai-assistant {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 120px);
}

.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: #0d1214;
  border: 1px solid #2a3336;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.user .message-content {
  background: var(--accent);
  color: white;
  border-bottom-right-radius: 2px;
}

.message.assistant .message-content {
  background: #1a2225;
  color: var(--text);
  border-bottom-left-radius: 2px;
  border: 1px solid #2a3336;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
  display: block;
  margin-top: 4px;
  text-align: right;
}

.typing .message-content p {
  font-style: italic;
  opacity: 0.8;
}

.chat-suggestions {
  padding: 0 20px 15px;
}

.chat-suggestions p {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chips button {
  background: #1a2225;
  border: 1px solid #2a3336;
  color: var(--text-dim);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chips button:hover {
  border-color: var(--accent);
  color: var(--text);
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #2a3336;
  background: #090e10;
}

.chat-input input {
  flex: 1;
  background: #0d1214;
  border: 1px solid #2a3336;
  color: var(--text);
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;
}

.chat-input input:focus {
  border-color: var(--accent);
}

.chat-input button {
  padding: 0 24px;
}
</style>
