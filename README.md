# JumpInChat Automated Actions

Automate many actions based on socket events on JumpInChat.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
1. Click [here](https://github.com/Sighmir/JumpInChat-AA/raw/master/JumpInChat-AA.user.js).
1. Hit install.
1. Done.

## Configuration (Advanced)

This script is recommended for advanced users, you must be comfortable with JavaScript and the browser developer tool.  
Open the script on Tampermonkey and edit the "Actions Configuration" however you like.

For example:

```js
// handler function
function hello(data, ws) {
  if (data.handle !== HANDLE) {
    sendMessage(ws, "hello");
  }
}

// adding handlers
eventHandler.add("room::message", hello);

eventHandler.add("room::message", (data, ws) => {
  console.log(data);
});

// removing handlers
eventHandler.del(hello);
```

The handler function has 2 arguments, data and WebSocket, you can use the browser developer tool to dig in and find more about the structure of the data sent and received by the socket, or simply log the data.  
There are already a few actions written as examples.

## License

```
JumpInChat Automated Actions
Copyright (C) 2019  Guilherme Caulada (Sighmir)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
