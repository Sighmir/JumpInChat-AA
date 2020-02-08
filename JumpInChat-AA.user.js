// ==UserScript==
// @name         JumpInChat Automated Actions
// @namespace    https://github.com/Sighmir
// @version      0.3
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
const HANDLE = window.localStorage.getItem("handle");

// ============================================

// == Event Handler ===========================

const eventHandler = {
    handlers: [],
    add: (event, func) => {
        eventHandler.handlers.push({ event, func });
    },
    del: (func) => {
        eventHandler.handlers = eventHandler.handlers.filter((handler) => handler.func !== func);
    }
};

const commandHandler = {
    add: (command, func) => {
        eventHandler.add("room::message", (data, ws) => {
            const cmd = data.message.slice(0, command.length + 1);
            if (cmd === command || cmd === command + " ") {
                const args = data.message.split(" ").slice(1);
                func(data, args, ws);
            }
        })
    },
    del: (func) => {
        eventHandler.del(func);
    }
};

// ============================================





// == Actions Configuration ===================

// https://www.slickremix.com/docs/get-api-key-for-youtube/
const ytApiKey = "YouTubeAPI-Key";

const blockedWords = [
    "badword",
];

const favoriteVideos = [
    "videoId",
];

eventHandler.add("room::message", (data, ws) => {
    console.log(data.handle, data.message);
});

eventHandler.add("room::message", (data, ws) => {
    if (blockedWords.some((word) => data.message.includes(word))) {
        sendCommand(ws, "ban", data.handle);
    }
});

commandHandler.add("!yt", (data, args, ws) => {
    try {
        const link = args[0];
        if (link) {
            let videoId = null;
            if (link.length === 11) {
                videoId = link;
            } else if (link.includes("youtu.be")) {
                videoId = link.split("youtu.be/")[1];
            } else {
                videoId = link.split("v=")[1].split("&")[0];
            }
            playYouTube(ws, videoId);
        }
    } catch (err) {
        sendMessage(ws, "There was a problem trying to play that youtube video. Check your link or video ID.");
    }
});

commandHandler.add("!ytfav", async (data, args, ws) => {
    console.log(favoriteVideos);
    for (const videoId of favoriteVideos) {
        try {
            playYouTube(ws, videoId);
            await delay(60000);
        } catch (err) {
            console.log(err);
        }
    }
});

// ============================================





// == Utility Functions =======================
function delay(t) {
    return new Promise((resolve, reject) => setTimeout(resolve, t));
}

function playYouTube(ws, videoId) {
    $.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + ytApiKey, (ytData) => {
        const title = ytData.items[0].snippet.title;
        ws.send(`42["youtube::play",{"videoId":"${videoId}","title":"${title}"}]`);
    });
}

function sendMessage(ws, message) {
    return ws.send(`42["room::message",{"message":"${message}","room":"${ROOM}"}]`);
}

function sendCommand(ws, command, value) {
    return ws.send(`42["room::command",{"message":{"command":"${command}","value":" ${value}"},"room":"${ROOM}"}]`);
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
            const messageEvent = message[0];
            const messageData = message[1];
            for (const handler of eventHandler.handlers) {
                if (messageEvent === handler.event) {
                    try {
                        handler.func(messageData, ws);
                    } catch (err) {
                        console.log(err);
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
