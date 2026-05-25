import { loadStorage, newChat, sendMessage } from "./functions.js";

loadStorage();

const formMessage = document.getElementById('form-message');
const newChatBtn = document.getElementById('new-chat');

formMessage.addEventListener('submit', sendMessage);
newChatBtn.addEventListener('click', newChat)