import reactotron from 'reactotron-react-js'

let chatClient
let stringeeClient

function setChatClient(_chatClient) {
  chatClient = _chatClient
}

function setStringeeClient(_stringeeClient) {
  stringeeClient = _stringeeClient
}

function getStringeeClient() {
  return stringeeClient
}
function getChatClient() {
  return chatClient
}

export default {
  getChatClient,
  getStringeeClient,
  setChatClient,
  setStringeeClient
}
