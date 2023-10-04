"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [responseToken, setResponseToken] = useState("");
  const [responseConversationId, setResponseConversationId] = useState("");
  const [chatInput, setChatInput] = useState("hello");
  const [messages, setMessages] = useState([""]);
  const [usermessage, setusermessage] = useState([""]);
  const [botmessages, setbotmessage] = useState([""]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("messages");
  const [showTyping, setShowTyping] = useState(true);
  const [divClass, setDivClass] = useState("chat-msg-box bot:last-child");
  const [count, setCount] = useState(0); 
  let formattedMessage = "Hi,How can i help you".replace(/\n/gm, "<br />");
  let watermark=0;
  
  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      "https://defaultf6e5d45ded5947788e79db7475c5fb.ef.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr75d_gargashBot/directline/token?api-version=2022-03-01-preview",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setResponseToken(result.token);
        console.log(result.token);
        fetchConversationId(result.token);
      })
      .catch((error) => console.error("error", error));
  };

  const fetchConversationId = (token) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);

    console.log("myHeaders:" + myHeaders);
    var requestOptionsPost = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      "https://europe.directline.botframework.com/v3/directline/conversations",
      requestOptionsPost
    )
      .then((response) => response.json())
      .then((result) => {
        setResponseConversationId(result.conversationId);
        console.log(result.conversationId);
        sendMessage(token, result.conversationId);
      })
      .catch((error) => console.error("error", error));
  };

  const sendMessage = (token, conversationId) => {
    console.log("set"+responseConversationId);
    console.log("conv" + conversationId, chatInput);
    setTyping(true);
    formattedMessage = chatInput.replace(/\n/gm, "<br />");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      type: "message",
      from: {
        id: "userId",
        name: "userName",
      },
      text: chatInput,
      textFormat: "plain",
      locale: "en-US",
    });

    console.log("myHeaders:" + myHeaders);
    var requestOptionsPost = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    fetch(
      "https://europe.directline.botframework.com/v3/directline/conversations/" +
        conversationId +
        "/activities",
      requestOptionsPost
    )
      .then((response) => response.json())
      .then((result) => {
        const conv_id=result.id
        let array_id=conv_id.split("|")
        console.log(array_id)
        watermark=parseInt(array_id[1]);
        // setResponseConversationId(result.conversationId);
        console.log(result);
        setTimeout(function () {
          getmessage(token, conversationId);
        }, 5000);
      })
      .catch((error) => console.error("error", error));
  };

  const getmessage = (token, conversationId) => {
    setTyping(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("Content-Type", "application/json");

    console.log("myHeaders:" + myHeaders);
    var requestOptionsPost = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    fetch(
      "https://europe.directline.botframework.com/v3/directline/conversations/" +
        conversationId +
        "/activities?watermark="+watermark,
      requestOptionsPost
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        
        console.log(
          result.activities[0].text ?? result.activities[0].attachments[0].content.body[0].items[0].text
        );
        addMessage(
          result.activities[0].text ?? result.activities[0].attachments[0].content.body[0].items[0].text
        );
      })
      .catch((error) => console.error("error", error));
  };

  const handleInputChange = (event) => {
    event.preventDefault();
    console.log(event.target.value);
    setChatInput(event.target.value);
  };

  const handlesubmit = (event) => {
    event.preventDefault();
    console.log(chatInput)
    // setusermessage([...messages,event.target.value]);
    console.log(event)
    useraddmessage(chatInput)
    
    // updateDivClass();
    // addMessage(event.target.value);
    sendMessage(responseToken, responseConversationId);
  };

  const addMessage = (message) => {
    const newMessage = message;
    setbotmessage([...messages, newMessage]);
    console.log(messages);
  };

  const useraddmessage=(message)=>{
    const newMessage = message;
    setusermessage([...messages, newMessage]);
    console.log(messages);
    
  }

  const updateDivClass = () => {
    setDivClass("chat-msg-client");
  };
  const incrementCount = () => {
    setCount(count + 1);
  };

  return (
    <>
      <header>
        <div>
          <h2>GARGASH CHAT BOT</h2>
        </div>
      </header>
      <body>
        <div className="main-background">
          <div></div>
          <div>
            {showTyping && <div className="typing">Loading...</div>}
            <main>
              <div className="chat-msg-box">
                <p>{botmessages}</p>
              </div>
              <div className="chat-msg-client">
                <p>{usermessage}</p>
              </div>
            </main>
          </div>
        </div>

        <section className="all-questions">
          <h2>Suggested Chats</h2>
          <div className="questions container"></div>
        </section>

        <footer>
          <form id="chat-form" onSubmit={handlesubmit}>
            <input
              type="text"
              className="chat-input"
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="chat-submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.458 7.227-7.215-1.754 24-12zm-15 16.668v7.332l3.258-4.431-3.258-2.901z" />
              </svg>
            </button>
          </form>
        </footer>
      </body>
    </>
  );
}
