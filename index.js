/* eslint-disable semi */

const { Plugin } = require('powercord/entities')
const { getModule, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const { findInReactTree, getOwnerInstance } = require('powercord/util')
const Settings = require('./Settings.jsx')
const manifest = require('./manifest.json')

/*
 * Get all the modules we need (there's a lot)
 * TODO: I should really swap over to promises but oh well
 */
const { getChannel } = getModule(['getChannel', 'hasChannel'], false)
const { getCurrentUser } = getModule(['getCurrentUser'], false)
const { getUser } = getModule(['getUser', 'getUsers'], false)
const { getStatus } = getModule(['getStatus', 'isMobileOnline'], false)
const { isLurking } = getModule(['isLurking'], false)
const { isBlocked } = getModule(['getRelationships'], false)
const { getGuildId } = getModule(['getGuildId'], false)
const { getChannelId } = getModule(['getChannelId', 'getLastSelectedChannelId'], false)
const { StatusTypes } = getModule(['StatusTypes'], false)
const notificationSettings = getModule(['isGuildOrCategoryOrChannelMuted'], false)
const { isRawMessageMentioned } = getModule(['isRawMessageMentioned'], false)

for (const key in notificationSettings) {
  if (typeof key === 'function') {
    notificationSettings[key].bind(notificationSettings)
  }
}

module.exports = class Cutecord extends Plugin {
  async startPlugin() {
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

    const shouldNotify = await getModule(['makeTextChatNotification'])
    inject(
      'cutecord-shouldNotify',
      shouldNotify,
      'shouldNotify',
      ([msg, channel, n]) => this.shouldNotify(msg, channel, n)
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
            this.containsKeyword(message, this.settings.get('cuteWords', [])) &&
            !this.containsKeyword(message, this.settings.get('uncuteWords', []))
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
  }

  pluginWillUnload() {
    uninject('cutecord-shouldNotify')
    uninject('cutecord-messagerender')
    uninject('cutecord-user-context-menu')
    uninject('cutecord-guild-context-menu')

    powercord.api.settings.unregisterSettings('cutecord')
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
        if (content.match(`(\\s|^)${w}(\\s|$)`)) {
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

  /*
   * If something looks weird here, it's because I tried to follow discord's implementation as much as I could.
   * Returns false if the notifications should be sent, and true if otherwise
   */
  shouldNotify(msg, channelID, n) {
    const currentUser = getCurrentUser()
    const msgAuthor = getUser(msg.author.id)
    const channel = getChannel(channelID)

    if (channel === null || currentUser === null || msgAuthor === null) {
      return false
    }
    if (!this.messageIsValid(currentUser, msgAuthor, channel)) {
      return false
    }

    // Don't notify if we're already looking at the channel
    const guildID = getGuildId(channel.id)
    if (this.settings.get('customFocusDetection', false) ? document.hasFocus() : n !== void 0) {
      if (channel.id === getChannelId(guildID)) {
        return false
      }
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
    return isRawMessageMentioned({
      rawMessage: msg,
      userId: currentUser.id,
      suppressEveryone,
      suppressRoles
    })
  }


  /*
   * This is the longest boolean conditional ever, expanded
   * Most of this is still discord's, just made mode readable
   */
  messageIsValid(currentUser, msgAuthor, channel) {
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

    const guildID = channel.getGuildId()
    if (guildID && isLurking(guildID)) {
      // Are we lurking the guild? Apparently we don't want notifications for that.
      return false
    }

    if (notificationSettings.allowNoMessages(channel)) {
      // No.
      return false
    }

    let status = getStatus(currentUser.id)

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
