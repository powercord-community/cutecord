/* eslint-disable semi */

const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const Settings = require('./components/Settings.jsx')
const manifest = require('./manifest.json')
const defaults = require('./defaults.js')

module.exports = class Cutecord extends Plugin {
  async startPlugin () {
    // Let people who already have the plugin know about the updates.
    const { version } = manifest
    if (this.settings.get('version') !== version) {
      this.migrateSettings()
      this.settings.set('version', version)
      powercord.api.notices.sendAnnouncement('cutecord-first-welcome', {
        color: 'green',
        message: `Cutecord ${version} successfully installed! Check out what's new!`,
        button: {
          text: 'owo what\'s this?',
          onClick: async () => {
            require('electron').shell.openExternal(`https://github.com/powercord-community/cutecord/blob/master/changelog.md#v${version.replace(/\./g, '')}`)
          }
        }
      })
    }

    const notifyModule = await getModule([ 'makeTextChatNotification' ])
    const notifyPatches = await this.buildShouldNotify()
    inject(
      'cutecord-shouldNotify',
      notifyModule,
      'shouldNotify',
      args => notifyPatches.shouldNotify(...args)
    )

    const { default: MessageRender } = await getModule([ 'getElementFromMessageId' ])
    inject(
      'cutecord-messageRender',
      MessageRender,
      'type',
      (args) => {
        const [ { message } ] = args
        if (message.originalMentioned === void 0) {
          message.originalMentioned = message.mentioned
        }
        if (this.settings.get('highlightKeywords', true)) {
          message.mentioned = message.mentioned || (
            this.containsKeyword(message, this.settings.get('cutes', defaults.cutes).keywords) &&
            !this.containsKeyword(message, this.settings.get('meanies', defaults.meanies).keywords)
          )
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
    uninject('cutecord-shouldNotifyBase')
    uninject('cutecord-messageRender')
    uninject('cutecord-user-context-menu')
    uninject('cutecord-guild-context-menu')

    powercord.api.settings.unregisterSettings('cutecord')
    powercord.api.settings.unregisterSettings('cutecord-testing')
  }

  /**
   * Check to see if the content of a given message contains any provided
   * keywords.
   * @param {Message} msg The message to check for keywords
   * @param {String[]} keywords Keywords to search for within the message
   * @returns {Boolean} Does the message contain a keyword?
   */
  containsKeyword (msg, keywords) {
    for (const w of keywords) {
      if (w === '') {
        continue
      }

      let { content } = msg
      const caseSensitive = this.settings.get('caseSensitive', false)
      if (!caseSensitive) {
        content = content.toLowerCase()
        keywords = keywords.map(k => k.toLowerCase())
      }

      const detectionMethod = this.settings.get('detectionMethod', 'word')
      if (detectionMethod === 'word') {
        if (content.match(`(^|[\\s/?.,'":()\\-_\\*!\`])${w}([\\s/?.,'":()\\-_\\*!\`]|$)`)) {
          return true
        }
      } else {
        if (content.includes(w)) {
          return true
        }
      }
    }

    return false
  }

  migrateSettings () {
    // Check if any configuration needs to be migrated
    const oldVersion = this.settings.get('version')
    // eslint-disable-next-line no-unused-vars
    const [ major, minor, patch ] = oldVersion.split('.').map(Number)
    if (major < 4) {
      this.log(`Out of date configuration found, migrating automatically (${oldVersion} -> v4)`)

      const migratedSettings = {
        cutes: {
          guilds: this.settings.get('cuteGuilds', []),
          channels: this.settings.get('cuteChannels', []),
          users: this.settings.get('cuteUsers', []),
          keywords: this.settings.get('cuteWords', [])
        },
        meanies: {
          guilds: this.settings.get('uncuteGuilds', []),
          channels: this.settings.get('uncuteChannels', []),
          users: this.settings.get('uncuteUsers', []),
          keywords: this.settings.get('uncuteWords', [])
        },
        statusOverrides: {
          enabled: this.settings.get('overrides', 'cute') !== 'default',
          online: this.settings.get('overrides', 'cute'),
          idle: this.settings.get('overrides', 'cute'),
          dnd: this.settings.get('overrideDND', false) ? 'cute' : 'only-cute',
          streaming: this.settings.get('overrides', 'only-cute'),
          invisible: this.settings.get('invisibleIsDND', false) ? 'none' : this.settings.get('overrides', 'cute')
        },
        keywordDetection: {
          method: this.settings.get('detectionMethod', 'word'),
          caseSensitive: this.settings.get('caseSensitive', false)
        },
        mentions: {
          everyone: !this.settings.get('blockEveryone', false),
          roles: !this.settings.get('blockEveryone', false)
        },
        advanced: {
          highlightKeywords: this.settings.get('highlightKeywords', true),
          lurkedGuilds: this.settings.get('lurkedGuilds', false),
          managedChannels: this.settings.get('managedChannels', false),
          customFocusDetection: this.settings.get('customFocusDetection', false)
        },
        oldSettings: {
          [oldVersion]: this.settings.getKeys().reduce((obj, key) => {
            obj[key] = this.settings.get(key)
            return obj
          }, {})
        }
      }

      // Clean up all previous settings
      this.settings.getKeys().forEach(this.settings.delete)

      // Store the migrated settings
      for (const key in migratedSettings) {
        this.settings.set(key, migratedSettings[key])
      }
    }
  }

  /**
   * This is like this because it's the cleanest way I could think of to use the async version of getModule
   */
  async buildShouldNotify () {
    // Allow using some properties within patched functions
    const { settings } = this
    const containsKeyword = this.containsKeyword.bind(this)

    // Fetch all required modules
    const { isLurking } = await getModule([ 'isLurking' ])
    const { isBlocked } = await getModule([ 'isBlocked' ])
    const { isMuted } = await getModule([ 'isMuted', 'hasJoined' ])
    const { getStatus } = await getModule([ 'getStatus', 'getActivities' ])
    const { UserFlags } = await getModule([ 'UserFlags' ])

    const userSettings = await getModule([ 'allowAllMessages', 'isSuppressEveryoneEnabled', 'isSuppressRolesEnabled' ])
    const boundSettings = {}

    for (const key in userSettings.__proto__) {
      boundSettings[key] = userSettings[key].bind(userSettings)
    }

    const {
      allowAllMessages,
      allowNoMessages,
      isSuppressEveryoneEnabled,
      isSuppressRolesEnabled
    } = boundSettings

    /**
     * Returns true if message shouldn't notify
     * @param {*} currentUser
     * @param {*} messageAuthor
     * @param {*} channel
     * @param {Boolean} r Unknown use
     * @param {*} o Unknown use
     * @returns
     */
    function shouldNotifyBase (currentUser, messageAuthor, channel, r, o) {
      // Set variable defaults
      r = r ?? false
      o = o ?? false

      if (messageAuthor.hasFlag(UserFlags.SPAMMER)) {
        return false
      }

      const { managedChannels: allowManaged } = settings.get('advanced', defaults.advanced)
      if (channel.isManaged() && !allowManaged) {
        return false
      }

      // If Lurking and different user and not blocked and DND and (not muted and ALL MESSAGES)
      const guildId = channel.getGuildId()
      const { lurkedGuilds } = settings.get('advanced', defaults.advanced)
      if (guildId !== null && isLurking(guildId) && !lurkedGuilds) {
        return false
      }

      if (messageAuthor.id === currentUser.id) {
        return false
      }

      if (isBlocked(messageAuthor.id)) {
        return false
      }

      // This is where Discord's status check would normally be, but we check later on to account for better
      // customization.
      // if (!r && getStatus() === StatusTypes.DND) {
      //   return false
      // }

      if (!o && allowNoMessages(channel)) {
        return false
      }

      return true
    }

    const { getChannel } = await getModule([ 'getChannel', 'getBasicChannel' ])
    const { MessageTypes } = await getModule([ 'MessageTypes', 'UploadTypes' ])
    const { getCurrentUser, getUser } = await getModule([ 'getCurrentUser', 'getUser' ])
    const { getChannelId } = await getModule([ 'getChannelId', 'getVoiceChannelId' ])
    const { getGuildId } = await getModule([ 'getGuildId', 'getLastSelectedGuildId' ])
    const { getCurrentSidebarChannelId } = await getModule([ 'getCurrentSidebarChannelId' ])
    const { THREAD_CHANNEL_TYPES, GUILD_VOCAL_CHANNEL_TYPES } = await getModule([ 'THREAD_CHANNEL_TYPES', 'GUILD_VOCAL_CHANNEL_TYPES' ])
    const { computeThreadNotificationSetting } = await getModule([ 'computeThreadNotificationSetting' ])
    const { ThreadMemberFlags } = await getModule([ 'ThreadMemberFlags' ])
    const { isRawMessageMentioned } = await getModule([ 'isRawMessageMentioned' ])
    const { getChannelId: getVoiceChannelId } = await getModule([ 'getChannelId', 'getAveragePing' ])

    /**
`    * Determines if a notification should be sent for the provided message. This logic is largely copied from Discord's
     * own internal handling.
     * @param {*} message Message object
     * @param {String} channelId channel that the message is sent in
     * @param {Boolean} lostFocus If the window has lost focus or not
     * @param {*} r Unknown use
     * @returns {Boolean}
     */
    function shouldNotify (message, channelId, lostFocus, r) {
      // Set variable defaults
      lostFocus = lostFocus ?? true
      r = r ?? false

      let channel = getChannel(channelId)
      if (message.type === MessageTypes.THREAD_STARTER_MESSAGES) {
        channel = getChannel(channel?.parent_id)
      }

      const currentUser = getCurrentUser()
      const messageAuthor = getUser(message.author.id)

      // If the channel, current user, or message author aren't found then don't notify
      if (channel === null || currentUser === null || messageAuthor === null) {
        return false
      }

      // Check if the channel is muted, user is blocked, or message is from the current user.
      if (!shouldNotifyBase(currentUser, messageAuthor, channel, r)) {
        return false
      }

      // Get the channel the user is currently looking at, if it's the same as the channel the message is from don't
      // notify.
      const { customFocusDetection } = settings.get('advanced', defaults.advanced)
      const currentChannelId = getChannelId(getGuildId())
      const isCurrentChannel = currentChannelId === channel.id || getCurrentSidebarChannelId(currentChannelId)
      if (customFocusDetection) {
        if (document.hasFocus() && isCurrentChannel) {
          return false
        }
      } else if (!lostFocus && isCurrentChannel) {
        return false
      }

      const currentStatus = getStatus()
      const currentOverride = settings.get('statusOverrides', defaults.statusOverrides)[currentStatus]

      if (currentOverride === 'none') {
        return false
      } else if (currentOverride !== 'default') {
        const meanies = settings.get('meanies', defaults.meanies)
        if (meanies.guilds.includes(message.guild_id)) {
          return false
        }
        if (meanies.channels.includes(channel.id)) {
          return false
        }
        if (meanies.users.includes(messageAuthor.id)) {
          return false
        }
        if (containsKeyword(message, meanies.keywords)) {
          return false
        }

        const cutes = settings.get('cutes', defaults.cutes)
        if (cutes.guilds.includes(message.guild_id)) {
          return true
        }
        if (cutes.channels.includes(channel.id)) {
          return true
        }
        if (cutes.users.includes(messageAuthor.id)) {
          return true
        }
        if (containsKeyword(message, cutes.keywords)) {
          console.log('contains keyword')
          return true
        }
      }

      if (currentOverride === 'only-cute') {
        return false
      }

      // Compute thread notification settings
      if (THREAD_CHANNEL_TYPES.has(channel.type)) {
        if (isMuted(channel.id)) {
          return false
        }

        const notificationSettings = computeThreadNotificationSetting(channel)
        return notificationSettings !== ThreadMemberFlags.NO_MESSAGES && (
          notificationSettings === ThreadMemberFlags.ALL_MESSAGES ||
          isRawMessageMentioned({
            rawMessage: message,
            userId: currentUser.id,
            suppressEveryone: false,
            suppressRoles: false
          })
        )
      }

      const b = !GUILD_VOCAL_CHANNEL_TYPES.has(channel.type) || getVoiceChannelId() === channel.id
      if (allowAllMessages(channel) && b) {
        return true
      }

      const suppressEveryone = isSuppressEveryoneEnabled(channel.getGuildId())
      const suppressRoles = isSuppressRolesEnabled(channel.getGuildId())
      const mentions = settings.get('mentions', defaults.mentions)

      return isRawMessageMentioned({
        rawMessage: message,
        userId: currentUser.id,
        suppressEveryone: mentions.everyone ? suppressEveryone : true,
        suppressRoles: mentions.roles ? suppressRoles : true
      })
    }

    return {
      shouldNotifyBase,
      shouldNotify,
      getStatus
    }
  }
}
