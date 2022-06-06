/* eslint-disable semi */

const { Plugin } = require('powercord/entities')
const { getModule, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const { findInReactTree, getOwnerInstance } = require('powercord/util')
const Settings = require('./Settings.jsx')
const NewSettings = require('./components/Settings.jsx')
const manifest = require('./manifest.json')
const defaults = require('./defaults.js')

/*
 * Get all the modules we need (there's a lot)
 * TODO: I should really swap over to promises but oh well
 */
const { getCurrentUser } = getModule(['getCurrentUser'], false)

module.exports = class Cutecord extends Plugin {
  async startPlugin() {
    // Let people who already have the plugin know about the updates.
    const { version } = manifest
    if (this.settings.get('version') !== version) {
      // Check if any configuration needs to be migrated
      const oldVersion = this.settings.get('version')
      const [major, minor, patch] = oldVersion.split('.').map(Number)
      if (major < 4) {
        this.log(`Out of date configuration found, migrating automatically (${oldVersion} -> ${version})`)
        
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
            roles: !this.settings.get('blockEveryone', false),
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

    const patches = await this.buildShouldNotify()
    inject(
      'cutecord-shouldNotify',
      await getModule(['makeTextChatNotification']),
      'shouldNotify',
      ([msg, channel, n]) => patches.shouldNotify(msg, channel, n)
    )

    const { default: MessageRender } = await getModule(['getElementFromMessageId'])
    inject(
      'cutecord-messagerender',
      MessageRender,
      'type',
      (args) => {
        const [{ message }] = args
        if (message.originalMentioned === undefined) {
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

    const Menu = await getModule(['MenuItem'])
    inject(
      'cutecord-user-context-menu',
      Menu,
      'default',
      (args) => {
        const [{ navId, children }] = args
        if (navId !== 'user-context') {
          return args
        }

        if (findInReactTree(children, child => child.props?.id === 'cutecord-add-cute-user')) {
          return args
        }

        let user

        if (document.querySelector('#user-context')) {
          const instance = getOwnerInstance(document.querySelector('#user-context'))
          user = (instance?._reactInternals || instance?._reactInternalFiber)?.return?.memoizedProps?.user
        }

        if (!user || user.id === getCurrentUser().id) {
          return args
        }

        const addCuteItem = React.createElement(Menu.MenuItem, {
          id: 'cutecord-add-cute-user',
          label: `${this.settings.get('cuteUsers', []).includes(user.id) ? 'Remove' : 'Add'} Cute`,
          action: () => {
            const cutes = this.settings.get('cuteUsers', [])

            if (cutes.includes(user.id)) {
              cutes.splice(cutes.indexOf(user.id), 1)
            } else {
              cutes.push(user.id)
            }

            this.settings.set('cuteUsers', cutes)
          }
        })

        const addMeanieItem = React.createElement(Menu.MenuItem, {
          id: 'cutecord-add-meanie-user',
          label: `${this.settings.get('uncuteUsers', []).includes(user.id) ? 'Remove' : 'Add'} Meanie`,
          action: () => {
            const uncutes = this.settings.get('uncuteUsers', [])

            if (uncutes.includes(user.id)) {
              uncutes.splice(uncutes.indexOf(user.id), 1)
            } else {
              uncutes.push(user.id)
            }

            this.settings.set('uncuteUsers', uncutes)
          }
        })

        const blockItem = findInReactTree(children, child => child.props?.id === 'block')
        const group = children.find(child => child.props?.children?.includes?.(blockItem))

        if (!group) {
          return args
        }

        group.props.children.push(addCuteItem, addMeanieItem)

        return args
      },
      true
    )
    Menu.default.displayName = 'Menu'

    /*
    const GuildContextMenu = getModule((m) => m.default && m.default.displayName === 'GuildContextMenu', false)
    inject(
      'cutecord-guild-context-menu',
      GuildContextMenu,
      'default',
      (args, res) => {
        const [ { guild } ] = args
        const { props: { children } } = res

        if (findInReactTree(children, child => child.props?.id === 'cutecord-add-cute-guild')) {
          return args
        }

        const addCuteItem = React.createElement(Menu.MenuItem, {
          id: 'cutecord-add-cute-guild',
          label: `${this.settings.get('cuteGuilds', []).includes(guild.id) ? 'Remove' : 'Add'} Cute`,
          action: () => {
            const cutes = this.settings.get('cuteGuilds', [])

            if (cutes.includes(guild.id)) {
              cutes.splice(cutes.indexOf(guild.id), 1)
            } else {
              cutes.push(guild.id)
            }

            this.settings.set('cuteGuilds', cutes)
          }
        })

        const addMeanieItem = React.createElement(Menu.MenuItem, {
          id: 'cutecord-add-meanie-guild',
          label: `${this.settings.get('uncuteGuilds', []).includes(guild.id) ? 'Remove' : 'Add'} Meanie`,
          action: () => {
            const uncutes = this.settings.get('uncuteGuilds', [])

            if (uncutes.includes(guild.id)) {
              uncutes.splice(uncutes.indexOf(guild.id), 1)
            } else {
              uncutes.push(guild.id)
            }

            this.settings.set('uncuteGuilds', uncutes)
          }
        })

        const muteItem = findInReactTree(children, child => child.props?.id === 'mute-guild')
        const group = children.find(child => Array.isArray(child.props?.children) ? child.props?.children.includes(muteItem) : child.props?.children === muteItem)

        if (!group) {
          return res
        }

        if (!Array.isArray(group.props.children)) {
          group.props.children = [ group.props.children ]
        }

        group.props.children.push(addCuteItem, addMeanieItem)

        return res
      }
    )
    GuildContextMenu.default.displayName = 'GuildContextMenu'
    */

    powercord.api.settings.registerSettings('cutecord', {
      category: this.entityID,
      label: 'Cutecord',
      render: Settings
    })

    powercord.api.settings.registerSettings('cutecord-testing', {
      category: this.entityID,
      label: 'Cutecord Beta',
      render: NewSettings
    })
  }

  pluginWillUnload() {
    uninject('cutecord-shouldNotify')
    uninject('cutecord-messagerender')
    uninject('cutecord-user-context-menu')
    uninject('cutecord-guild-context-menu')

    powercord.api.settings.unregisterSettings('cutecord')
    powercord.api.settings.unregisterSettings('cutecord-testing')
  }

  containsKeyword(msg, keywords) {
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

  /**
   * This is like this because it's the cleanest way I could think of to use the async version of getModule
   */
  async buildShouldNotify () {
    // Fetch all required modules
    const { isLurking } = await getModule(['isLurking'])
    const { isBlocked } = await getModule(['isBlocked'])
    const { getStatus } = await getModule(['getStatus', 'getActivities'])
    const { StatusTypes } = await getModule(['StatusTypes'])
    const { UserFlags } = await getModule(['UserFlags'])

    const userSettings = await getModule(['allowAllMessages', 'isSuppressEveryoneEnabled', 'isSuppressRolesEnabled'])
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
      r ??= false
      o ??= false

      if (messageAuthor.hasFlag(UserFlags.SPAMMER)) {
        return false
      }

      if (channel.isManaged()) {
        return false
      }

      // If Lurking and different user and not blocked and DND and (not muted and ALL MESSAGES)
      var guildId = channel.getGuildId()
      if (guildId !== null || isLurking(guildId)) {
        return false
      }

      if (messageAuthor.id === currentUser.id) {
        return false
      }

      if (isBlocked(messageAuthor.id)) {
        return false
      }

      if (!r && getStatus() === StatusTypes.DND) {
        return false
      }

      if (!o && allowNoMessages(channel)) {
        return false
      }

      return true
    }

    const { getChannel } = await getModule(['getChannel', 'getBasicChannel'])
    const { MessageTypes } = await getModule(['MessageTypes', 'UploadTypes'])
    const { getCurrentUser, getUser } = await getModule(['getCurrentUser', 'getUser'])
    const { getChannelId } = await getModule(['getChannelId', 'getVoiceChannelId'])
    const { getGuildId } = await getModule(['getGuildId', 'getLastSelectedGuildId'])
    const { getCurrentSidebarChannelId } = await getModule(['getCurrentSidebarChannelId'])
    const { THREAD_CHANNEL_TYPES, GUILD_VOCAL_CHANNEL_TYPES } = await getModule(['THREAD_CHANNEL_TYPES', 'GUILD_VOCAL_CHANNEL_TYPES'])
    const { computeThreadNotificationSetting } = await getModule(['computeThreadNotificationSetting'])
    const { ThreadMemberFlags } = await getModule(['ThreadMemberFlags'])
    const { isRawMessageMentioned } = await getModule(['isRawMessageMentioned'])
    const { getChannelId: getVoiceChannelId } = await getModule(['getChannelId', 'getAveragePing'])

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
      lostFocus ??= true
      r ??= false

      let channel = getChannel(channelId)
      if (message.type === MessageTypes.THREAD_STARTER_MESSAGES) {
        channel = getChannel(channel?.parent_id)
      }

      const currentUser = getCurrentUser()
      const messageAuthor = getUser(message.author.id)

      // If the channel, current user, or message author aren't found then don't notify
      if (null == channel || null == currentUser || null == messageAuthor) {
        return false
      }

      // Check if the channel is muted, user is blocked, or message is from the current user.
      if (!shouldNotifyBase(currentUser, messageAuthor, channel, r)) {
        return false
      }

      if (!lostFocus) {
        // Get the channel the user is currently looking at, if it's the same as the channel the message is from don't
        // notify.
        const currentChannelId = getChannelId(getGuildId())
        if (currentChannelId === channel.id) {
          return false
        }
        if (getCurrentSidebarChannelId(currentChannelId)) {
          return false
        }
      }

      // Compute thread notification settings
      if (THREAD_CHANNEL_TYPES.has(channel.type)) {
        if (isMuted(channel.id)) {
          return false
        }

        // TODO: Check uncutes here

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

      return isRawMessageMentioned({
        rawMessage: message,
        userId: currentUser.id,
        suppressEveryone,
        suppressRoles
      })
    }

    return { shouldNotifyBase, shouldNotify }
  }
}
