/* eslint-disable semi */

const { Plugin } = require('powercord/entities')
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const Settings = require('./Settings.jsx')
const Flower = require('./FlowerBadge.jsx')
const { resolve } = require('path')

/*
 * Get all the modules we need (there's a lot)
 * TODO: I should really swap over to promises but oh well
 */
const shouldNotify = getModule([ 'makeTextChatNotification' ], false)
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
    const ver = 'v3.0.0'
    if (this.settings.get('version') !== ver) {
      this.settings.set('version', ver)
      powercord.api.notices.sendToast('cutecord-first-welcome', {
        header: 'New Cutecord installed! uwu',
        content: `Cutecord ${ver} successfully installed! Check out what's new!`,
        buttons: [{
          text: 'owo what\'s this?',
          color: 'green',
          onClick: async () => {
            require('electron').shell.openExternal(`https://cute.gordhoard.org#${ver.replace(/\./g, '-')}`)
          }
        }]
      })
    }

    inject('cutecord-shouldNotify', shouldNotify, 'shouldNotify',
      ([ msg, channel, n ]) => this.shouldNotify(msg, channel, n))

    powercord.api.settings.registerSettings('cutecord', {
      category: this.entityID,
      label: 'Cutecord',
      render: Settings
    })

    this.classes = await getModule([ 'profileBadgeStaff' ])
    this.ConnectedBadges = this.settings.connectStore(Flower)
    this._injectMembers()
    this._injectMessages()
    this._injectDMs()

    this.loadStylesheet(resolve(__dirname, 'style.css'))
  }

  pluginWillUnload () {
    uninject('cutecord-shouldNotify')
    uninject('cutecord-members')
    uninject('cutecord-messages')
    uninject('cutecord-dm')

    powercord.api.settings.unregisterSettings('cutecord')
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

    // Don't notify if we're already looking at the channel
    const guildID = getGuildId(channel.id)
    if (n !== void 0) {
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

      const uncuteWords = this.settings.get('uncuteWords', [])
      for (const w of uncuteWords) {
        if (w === '') {
          continue
        }
        if (msg.content.includes(w)) {
          return false
        }
      }

      const cuteWords = this.settings.get('cuteWords', [])
      for (const w of cuteWords) {
        if (w === '') {
          continue
        }
        if (msg.content.includes(w)) {
          return true
        }
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

    const guildID = channel.getGuildId()
    if (guildID && isLurking(guildID)) {
      // Are we lurking the guild? Apparently we don't want notifications for that.
      return false
    }

    if (notificationSettings.allowNoMessages(channel)) {
      // No.
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

  /*
   * Thank you bowser for your amazing badges everywhere plugin I would have
   * never been able to figure this out.
   */
  async _injectMembers () {
    const _this = this
    const MemberListItem = await getModuleByDisplayName('MemberListItem')
    inject('cutecord-members', MemberListItem.prototype, 'renderDecorators', function (args, res) {
      res.props.children.unshift(
        React.createElement('div', { className: `cutecord-badges ${_this.classes.topSectionNormal}` },
          React.createElement(_this.ConnectedBadges, { user: this.props.user })
        )
      )
      return res
    })
  }

  async _injectDMs () {
    const _this = this
    const PrivateChannel = await getModuleByDisplayName('PrivateChannel')
    inject('cutecord-dm', PrivateChannel.prototype, 'render', function (args, res) {
      if (!_this.settings.get('dms', true)) {
        return res
      }
      if (res.props.name.props) {
        res.props.name.props.children.splice(1, 0,
          React.createElement('div', { className: `cutecord-badges ${_this.classes.topSectionNormal}` }, [
            React.createElement(_this.ConnectedBadges, { user: this.props.user })
          ])
        )
      } else {
        res.props.name = React.createElement('div', { className: `cutecord-badges ${_this.classes.topSectionNormal}` }, [
          React.createElement('span', null, res.props.name),
          React.createElement(_this.ConnectedBadges, { user: this.props.user })
        ])
      }
      return res
    })
  }

  async _injectMessages () {
    const _this = this
    const MessageHeader = await getModule([ 'MessageTimestamp' ])
    inject('cutecord-messages', MessageHeader, 'default', (args, res) => {
      const header = res.props.children[1]
      header.props.children.splice(2, 0, React.createElement('div', { className: `cutecord-badges ${_this.classes.topSectionNormal}` },
        React.createElement(this.ConnectedBadges, { user: args[0].message.author })
      ))
      return res
    })
  }
}
