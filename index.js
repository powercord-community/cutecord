/* eslint-disable semi */

const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const Settings = require('./Settings.jsx')
const manifest = require('./manifest.json')

/*
 * Get all the modules we need (there's a lot)
 * TODO: I should really swap over to promises but oh well
 */
const { getChannel } = getModule([ 'getChannel' ], false)
const { getCurrentUser } = getModule([ 'getCurrentUser' ], false)
const { getUser } = getModule([ 'getUser', 'getUsers' ], false)
const { getStatus } = getModule([ 'getStatus', 'getPresence' ], false)
const { isLurking } = getModule([ 'isLurking' ], false)
const { isBlocked } = getModule([ 'getRelationships' ], false)
const { getGuildId } = getModule([ 'getGuildId' ], false)
const { getChannelId } = getModule([ 'getChannelId', 'getLastSelectedChannelId' ], false)
const { StatusTypes } = getModule([ 'StatusTypes' ], false)
const notificationSettings = getModule([ 'isGuildOrCategoryOrChannelMuted' ], false)
const { isRawMessageMentioned } = getModule([ 'isRawMessageMentioned' ], false)

for (const key in notificationSettings) {
  if (typeof key === 'function') {
    notificationSettings[key].bind(notificationSettings)
  }
}

module.exports = class Cutecord extends Plugin {
  async startPlugin () {
    // Let people who already have the plugin know about the updates.
    const { version } = manifest
    if (this.settings.get('version') !== version) {
      this.settings.set('version', version)
      powercord.api.notices.sendAnnouncement('cutecord-first-welcome', {
        color: 'green',
        message: `Cutecord ${version} successfully installed! Check out what's new!`,
        button: {
          text: 'owo what\'s this?',
          onClick: async () => {
            require('electron').shell.openExternal(`https://github.com/powercord-community/cutecord/#v${version.replace(/\./g, '')}`)
          }
        }
      })
    }

    const shouldNotify = await getModule([ 'makeTextChatNotification' ])
    inject(
      'cutecord-shouldNotify',
      shouldNotify,
      'shouldNotify',
      ([ msg, channel, n ]) => this.shouldNotify(msg, channel, n)
    )

    const { default: MessageRender } = await getModule([ 'getElementFromMessageId' ])
    inject(
      'cutecord-messagerender',
      MessageRender,
      'type',
      (args) => {
        const [ { message } ] = args
        if (!message.originalMentioned) {
          message.originalMentioned = message.mentioned
        }
        if (this.settings.get('highlightKeywords', true)) {
          message.mentioned = message.mentioned || this.containsKeyword(message, this.settings.get('cuteWords', []))
        } else {
          message.mentioned = message.originalMentioned
        }
        return args
      },
      true
    )

    powercord.api.settings.registerSettings('cutecord', {
      category: this.entityID,
      label: 'Cutecord',
      render: Settings
    })
  }

  pluginWillUnload () {
    uninject('cutecord-shouldNotify')
    uninject('cutecord-messagerender')

    powercord.api.settings.unregisterSettings('cutecord')
  }

  containsKeyword (msg, keywords) {
    for (let word of keywords) {
      if (word === '') {
        continue
      }

      let { content } = msg
      const caseSensitive = this.settings.get('caseSensitive', false)

      if (!caseSensitive) {
        content = content.toLowerCase()
        word = word.toLowerCase() // can't modify an object while looping through it, so instead modify current index of object
      }

      const detectionMethod = this.settings.get('detectionMethod', 'word')
      if (detectionMethod === 'word') {
        if (content.match(`(\\s|^)${word}(\\s|$)`)) {
          return true
        }
      } else {
        if (content.includes(word)) {
          return true
        }
      }
    }

    return false
  }

  /*
   * If something looks weird here, it's because I tried to follow discord's implementation as much as I could.
   * Returns false if the notifications should be sent, and true if otherwise
   */
  shouldNotify (msg, channelID, n) {
    const currentUser = getCurrentUser()
    const msgAuthor = getUser(msg.author.id)
    const channel = getChannel(channelID)

    if (channel === null || currentUser === null || msgAuthor === null) {
      return false
    }
    if (!this.messageIsValid(currentUser, msgAuthor, channel)) {
      return false
    }

    // Don't notify if we're already looking at the channel, unless we want to
    const guildID = getGuildId(channel.id)
    const overwriteChatFocus = this.settings.get('overwriteChatFocus', false)

    if (channel.id === getChannelId(guildID) && !overwriteChatFocus) {
      return false
    }

    const override = this.settings.get('overrides', 'cute')

    if (override === 'cute') {
      const uncuteRoles = this.settings.get('uncuteRoles', [])
      for (const r in uncuteRoles) {
        if (msg.content.includes(`<@&${uncuteRoles[r]}>`)) {
          return false
        }
      }

      const containesUncuteWord = this.containsKeyword(msg, this.settings.get('uncuteWords', []))
      if (containesUncuteWord) {
        return false
      }

      const containsCuteWord = this.containsKeyword(msg, this.settings.get('cuteWords', []))
      if (containsCuteWord) {
        return true
      }
    }

    if (notificationSettings.allowAllMessages(channel)) {
      return true
    }

    const suppressEveryone = notificationSettings.isSuppressEveryoneEnabled(channel.getGuildId()) ||
      this.settings.get('blockEveryone', false)
    const suppressRoles = notificationSettings.isSuppressRolesEnabled(channel.getGuildId()) ||
      this.settings.get('blockRoles')
    return isRawMessageMentioned(msg, currentUser.id, suppressEveryone, suppressRoles)
  }


  /*
   * This is the longest boolean conditional ever, expanded
   * Most of this is still discord's, just made mode readable
   */
  messageIsValid (currentUser, msgAuthor, channel) {
    if (channel.isManaged()) {
      return false
    }

    if (isBlocked(msgAuthor.id)) {
      // Go away korbs
      return false
    }

    if (msgAuthor.id === currentUser.id) {
      // No, you can't ping yourself. Sorry.
      return false
    }

    const override = this.settings.get('overrides', 'cute')
    if (override === 'cute') {
      // If they're not cute, don't even try
      if (this.settings.get('uncuteUsers', []).includes(msgAuthor.id)) {
        return false
      }

      if (this.settings.get('uncuteChannels', []).includes(channel.id)) {
        return false
      }

      if (this.settings.get('uncuteGuilds', []).includes(channel.guild_id)) {
        return false
      }
    }

    const showLurk = this.settings.get('lurkedGuilds')
    const guildID = channel.getGuildId()
    if (guildID && isLurking(guildID) && !showLurk) {
      // Are we lurking the guild? Apparently we don't want notifications for that. Unless we do want them
      return false
    }

    const overwriteMuteSupression = this.settings.get('overwriteMuteSupression')
    if (notificationSettings.allowNoMessages(channel) && !overwriteMuteSupression) {
      // No. Unless we want them... I really do, don't judge me.
      return false
    }

    let status = getStatus()

    if (this.settings.get('overrideDND', false) && status === StatusTypes.DND) {
      status = StatusTypes.ONLINE
    }

    if (this.settings.get('invisibleIsDND', false) && status === StatusTypes.INVISIBLE) {
      status = StatusTypes.DND
    }

    // If they want pure default notifications, we check here
    if (override === 'default') {
      return status !== StatusTypes.DND
    }

    if (override === 'none') {
      return false
    }

    // Here's the magic part :zoomeyes:
    if (this.settings.get('cuteUsers', []).includes(msgAuthor.id)) {
      return true
    }

    if (this.settings.get('cuteChannels', []).includes(channel.id)) {
      return true
    }

    if (this.settings.get('cuteGuilds', []).includes(guildID)) {
      return true
    }

    if (override === 'cute') {
      return status !== StatusTypes.DND
    }

    // Just in case I guess
    return false
  }
}
