document.addEventListener("DOMContentLoaded", () => {
    const chatbotIcon = document.getElementById("chatbot-icon");
    const chatbotOverlay = document.getElementById("chatbot-overlay");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("chatbot-messages");

    // 챗봇 열기
    chatbotIcon.addEventListener("click", () => {
        console.log("챗봇 아이콘 클릭됨");
        chatbotOverlay.classList.remove("hidden");
        console.log(chatbotOverlay); // null이라면 요소를 찾지 못한 상태
        console.log(chatbotOverlay.classList); // hidden이 제거되었는지 확인

        // 환영 메시지 (최초 열었을 때만)
        console.log(chatbotMessages.children.length)
        if (chatbotMessages.children.length === 0) {
            console.log('test')
            const welcomeMessage = document.createElement("div");
            welcomeMessage.className = "message bot";
            welcomeMessage.innerHTML = `
                <div class="message-icon">🤖</div>
                <div class="message-bubble">안녕하세요! 무엇을 도와드릴까요?</div>
            `;
            chatbotMessages.appendChild(welcomeMessage);
            chatbotOverlay.classList.add("active")
        }
    });

    // 챗봇 닫기
    closeChatbot.addEventListener("click", () => {
        console.log("챗봇 닫기 버튼 클릭됨");
        chatbotOverlay.classList.add("hidden");
        chatbotOverlay.classList.remove("active");
    
        // 대화 내용 및 입력창 초기화
        chatbotMessages.innerHTML = ""; // 메시지 내용 제거
        chatbotInput.value = ""; // 입력창 초기화
    });

    // 메시지 전송
    document.getElementById("send-chatbot").addEventListener("click", () => {
        const userMessage = chatbotInput.value.trim();
        if (userMessage) {
            // 사용자 메시지 추가
            const userBubble = document.createElement("div");
            userBubble.className = "message user";
            userBubble.innerHTML = `
                <div class="message-bubble">${userMessage}</div>
                <div class="message-icon">😊</div>
            `;
            chatbotMessages.appendChild(userBubble);
            userBubble.scrollIntoView({ behavior: "smooth" });

            //서버에 메시지 전송
            fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            })
                
                .then(response => response.json())
                .then(data => {
                    // 챗봇 응답 추가
                    const botBubble = document.createElement("div");
                    botBubble.className = "message bot";
                    botBubble.innerHTML = `
                        <div class="message-icon">🤖</div>
                        <div class="message-bubble">${data.response}</div>
                    `;
                    chatbotMessages.appendChild(botBubble);
                    botBubble.scrollIntoView({ behavior: "smooth" });
                });

            chatbotInput.value = ""; // 입력창 초기화
        }
    });

    // Enter 키로 메시지 전송
    chatbotInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            document.getElementById("send-chatbot").click();
        }
    });
});