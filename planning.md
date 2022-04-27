## Settings
`cutes`
```js
{
  guilds: [],
  channels: [],
  users: [],
  keywords: []
}
```

`meanies`
```js
{
  guilds: [],
  channels: [],
  users: [],
  keywords: []
}
```

`statusOverrides`
```js
{
  all: "default",
  online: "cute",
  idle: "default",
  dnd: "none",
  offline: "cute"
}
```

`keywordDetection`
```js
{
  method: "word" | "substring",
  caseSensitive: true | false
}
```

`mentions`
```js
{
  everyone: true | false,
  roles: true | false
  // Refer to BetterReplies if they want to mess with reply mentions
}
```

`advanced`
```js
{
  highlightKeywords: true | false,
  lurkedGuilds: true | false,
  managedChannels: true | false,
  customFocusDetection: true | false
}
```
