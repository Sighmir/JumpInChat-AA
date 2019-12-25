// ==UserScript==
// @name         JumpInChat Automated Actions
// @namespace    https://github.com/Sighmir
// @version      0.1
// @description  Automate many actions based on socket events on JumpInChat
// @author       Sighmir
// @match        https://jumpin.chat/*
// @match        https://jumpinchat.com/*
// @grant        none
// @require      https://cdn.rawgit.com/skepticfx/wshook/master/wsHook.js
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @run-at       document-start
// ==/UserScript==

// == Global Variables ========================

const ROOM = document.location.href.split("/").pop().split("?").shift();
const HANDLE = window.localStorage.getItem('handle');

// ============================================

// == Event Handler ===========================

const eventHandler = {
    handlers: [],
    add: (event, func) => {
        eventHandler.handlers.push({ event, func })
    },
    del: (func) => {
        eventHandler.handlers = eventHandler.handlers.filter((handler) => handler.func !== func)
    }
};

// ============================================





// == Actions Configuration ===================

const blockedWords = [
    "badword"
]

eventHandler.add("room::message", (data, ws) => {
    console.log(data.handle, data.message);
});

eventHandler.add("room::message", (data, ws) => {
    if (blockedWords.some((word) => data.message.includes(word))) {
        sendCommand(ws, "ban", data.handle);
    }
});

// ============================================





// == Utility Functions =======================

function sendMessage(ws, message) {
    return ws.send(`42["room::message",{"message":"${message}","room":"${ROOM}"}]`);
}

function sendCommand(ws, command, value) {
    return ws.send(`42["room::command",{"message":{"command":"${command}","value":" ${value}"},"room":"${ROOM}"}]`)
}

// ============================================

// == WebSocket Hook ==========================

wsHook.after = function (event, url, ws) {
    try {
        const data = event.data;
        const messageCode = data.slice(0, 2);
        if (messageCode === "42") {
            const rawMessage = data.slice(2, data.length);
            const message = JSON.parse(rawMessage);
            const messageEvent = message[0]
            const messageData = message[1]
            for (const handler of eventHandler.handlers) {
                if (messageEvent === handler.event) {
                    try {
                        handler.func(messageData, ws);
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
    return event;
}

// ============================================
