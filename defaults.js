module.exports = {
  cutes: {
    guilds: [],
    channels: [],
    users: [],
    keywords: []
  },
  meanies: {
    guilds: [],
    channels: [],
    users: [],
    keywords: []
  },
  statusOverrides: {
    enabled: true,
    online: 'cute',
    idle: 'cute',
    dnd: 'only-cute',
    streaming: 'only-cute',
    invisible: 'cute'
  },
  keywordDetection: {
    method: 'word',
    caseSensitive: false
  },
  mentions: {
    everyone: true,
    roles: true
  },
  advanced: {
    highlightKeywords: true,
    lurkedGuilds: false,
    managedChannels: false,
    customFocusDetection: false
  }
}
