let bot = {
    prompt: 'eres un agente de atencion al cliente llamado riwibot, debes ayudar a los coders en sus solicitudes, si es nuevo debes ayudarlo con el proceso de inscripcion, si no es nuevo debes ayudarlo con tramites del programa',
    conversations: []
}

let currentConversation = [];
let currentConversationId = '';

export async function sendMessage(event) {

    event.preventDefault();

    const inputMessage = event.target.querySelector('input');

    saveConversation({
        role: 'user',
        content: inputMessage.value,
        datetime: (new Date()).getTime()
    });

    inputMessage.value = '';

    const messages = [
        {
            role: 'user',
            content: bot.prompt
        }, 
        ...currentConversation
    ]

    const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        body: JSON.stringify({
            model: 'gemma2:2b',
            messages,
            stream: false
        }),
    });

    const data = await response.json();

    // currentConversation.push(data.message)

    saveConversation({datetime: (new Date()).getTime(), ...data.message});

}

function saveConversation(message) {
    if (currentConversation.length === 0) {

        currentConversation.push(message);

        const currentConversationId = (new Date()).getTime();

        bot.conversations.push({
            id: currentConversationId,
            messages: currentConversation
        })
        console.log(bot);
        localStorage.setItem('bot', JSON.stringify(bot));
        showConversations();
        renderConversation();
        return;
    }

    currentConversation.push(message);

    bot.conversations = bot.conversations.map(conversation => {
        if (conversation.id === currentConversationId) {
            conversation.messages = currentConversation;
        }

        return conversation;

    })

    console.log(bot);
    localStorage.setItem('bot', JSON.stringify(bot));
    renderConversation();
}

function renderConversation(){
    
    const messageContainer = document.getElementById('messages-container');

    messageContainer.innerHTML = '';

    if(currentConversation.length === 0){
        messageContainer.innerHTML = `<div class="flex h-full w-100 justify-center items-center">
                    <div class="p-4 text-center">
                        <h4 class="font-bold text-xl">¿En qué puedo ayudarte?</h4>
                        <p>pregunta lo que quieras</p>
                    </div>

                </div>`;
    }

    for(let chat of currentConversation){

        const alignClasses = chat.role === 'user' ? 'items-end self-end' : 'items-start' ;
        const colorClass = chat.role === 'user' ? 'user-bubble' : 'ai-bubble' ;

        messageContainer.innerHTML += `<div class="flex flex-col ${alignClasses} max-w-[85%]">
                    <div class="${colorClass} px-bubble-padding-x py-bubble-padding-y rounded-xl rounded-tl-none">
                        <p class="font-body-lg text-body-lg text-on-surface">${chat.content}</p>
                    </div>
                    <span class="mt-2 font-label-sm text-label-sm text-outline px-1">${showDate(chat.datetime,'message')}</span>
                </div>`

    }

}

export function loadStorage(){
    const local = localStorage.getItem('bot');

    if(local){
        bot = JSON.parse(local);
    }

    showConversations();
}

function selectConversation(id){
    
    const conversationFind = bot.conversations.find(conversation => conversation.id === +id);

    currentConversationId = conversationFind.id;
    currentConversation = conversationFind.messages;

    renderConversation();

}

function showConversations(){

    const conversationsContainer = document.getElementById('conversations-container');

    conversationsContainer.innerHTML = '';

    const conversationsReverse = bot.conversations.reverse();

    for(let chat of conversationsReverse){
        conversationsContainer.innerHTML += `<div id="${chat.id}"
                    class="conversation flex items-center gap-3 px-3 py-3 m-1 rounded-lg bg-surface-container-highest text-on-surface font-label-md">
                    <span class="material-symbols-outlined text-xl text-primary">chat_bubble</span>
                    <span class="truncate">${showDate(chat.id)}</span>
                </div>`
    }

    const conversations = document.querySelectorAll('.conversation');

    conversations.forEach(conversation => {
        conversation.addEventListener('click', () => {
            selectConversation(conversation.id);
        })
    })

}

function showDate(timestamps, type = 'conversation'){

    const date = new Date(timestamps);
    const hours = (''+date.getHours()).padStart(2, '0');
    const minutes = (''+date.getMinutes()).padStart(2, '0');

    if(type === 'message'){
        return `${hours}:${minutes}`
    }

    const month = (''+(date.getMonth()+1)).padStart(2, '0');
    const day = (''+date.getDate()).padStart(2, '0');

    return `${day}-${month}-${date.getFullYear()} ${hours}:${minutes}`;

}

export function newChat(){

    currentConversation = [];
    currentConversationId = '';

    renderConversation();
}

