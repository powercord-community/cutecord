const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { Category, SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings');
const TextInputWithTags = require('./TextInputWithTags.jsx')

const overrideOptions = [
  {
    name: 'Cutecord Enabled',
    value: 'cute'
  },
  {
    name: 'Discord Default',
    value: 'default'
  },
  {
    name: 'No notifications',
    value: 'none'
  }
]

const statusTypes = ['online', 'idle', 'dnd', 'streaming', 'invisible']


module.exports = class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
        enabled: true || false,
        online: "cute",
        idle: "default",
        dnd: "none",
        offline: "cute"
      },
      keywordDetection: {
        method: "word" || "substring",
        caseSensitive: true || false
      },
      mentions: {
        everyone: true || false,
        roles: true || false
        // Refer to BetterReplies if they want to mess with reply mentions
      },
      advanced: {
        highlightKeywords: true || false,
        lurkedGuilds: true || false,
        managedChannels: true || false,
        customFocusDetection: true || false
      },

      // Category state, is not saved
      categories: {
        statusOverrides: false,
        cutes: false,
        meanies: false
      }
    }
  }

  mapUserIds(vals) {
    // Yes, this is evil, but at the moment I can't think of how else to get
    // this here. Could probably pass it as a prop or something but oh well.
    const { getUser } = getModule(['initialize', 'getCurrentUser'], false)
    return vals.map(id => {
      const user = getUser(id)
      if (user === undefined) {
        return id
      }
      return `${user.username}#${user.discriminator}`
    })
  }

  mapGuildIds(vals) {
    const { getGuild } = getModule(['getGuild', 'getGuilds'], false)
    return vals.map(id => {
      const guild = getGuild(id)
      if (guild === undefined) {
        return id
      }
      return guild.name
    })
  }

  mapChannelIds(vals) {
    const { getChannel } = getModule(['getChannel', 'hasChannel'], false)
    const { getGuild } = getModule(['getGuild', 'getGuilds'], false)
    return vals.map(id => {
      const channel = getChannel(id)
      if (channel === undefined) {
        return id
      }
      const guild = getGuild(channel.guild_id)
      return `${guild.name} #${channel.name}`
    })
  }

  /**
   * Generate a function that merges and saves the given object after when it is
   * called with a value.
   * @param {String} object 
   * @param {String} key
   */
  generateMergeHandler(object, key) {
    return e => {
      this.state[object][key] = e.value
      this.setState({ [object]: this.state[object] })
      // this.props.updateSetting(object, this.state[object])
    }
  }

  /**
   * Generate a function that handles the state of categories being opened and
   * closed.
   * @param {String} key the name of the category
   * @returns 
   */
  generateCategoryHandler(key) {
    const mergeHandler = this.generateMergeHandler('categories', key)
    return () => {
      mergeHandler({ value: !this.state.categories[key] })
    }
  }

  generateTagAddHandler(object, key) {
    const mergeHandler = this.generateMergeHandler(object, key)
    return tag => {
      if (!this.state[object][key].includes(tag)) {
        mergeHandler({ value: [...this.state[object][key], tag] })
      }
    }
  }

  generateTagRemoveHandler(object, key) {
    const mergeHandler = this.generateMergeHandler(object, key)
    return tag => {
      this.state[object][key].splice(tag, 1)
      mergeHandler({ value: this.state[object][key] })
    }
  }

  generateUserTagHandler(object, key) {
    const tagHandler = this.generateTagAddHandler(object, key)
    return async tag => {
      const { findByTag, getUser, getUsers } = await getModule(['initialize', 'getCurrentUser'])
      // First, check if this is an ID - if it is, we're done
      // Note, this only checks users that are current cached
      let user = getUser(tag)
      if (user === undefined) {
        if (tag.includes('#')) {
          const [username, discriminator] = tag.split('#')
          user = findByTag(username, discriminator)
        } else {
          // Attempt a last filter. If there is one match, assume it's right
          const fuzzyMatches = []
          const exactMatches = []
          const users = getUsers()
          for (const id in users) {
            if (users[id].username === tag) {
              exactMatches.push(users[id])
            }
            if (users[id].username.includes(tag)) {
              fuzzyMatches.push(users[id])
            }
          }
          if (exactMatches.length === 1) {
            user = exactMatches[0]
          } else if (fuzzyMatches === 1) {
            user = fuzzyMatches[0]
          }
        }
      }
      // If the user is still undefined, send a notification about it
      if (user === undefined) {
        powercord.api.notices.sendToast(`cutecord-user-not-found-${tag}`, {
          header: "User not found",
          timeout: 5000,
          content: `A match for \`${tag}\` was not found in your client's cache. There may have been too many matches, or none. Consider using an ID.`,
          type: 'error',
          buttons: [{
            text: 'Dismiss',
            look: 'ghost',
            size: 'small',
            onClick: () => powercord.api.notices.closeToast(`cutecord-user-not-found-${tag}`)
          }]
        })
        return
      }
      tagHandler(user.id)
    }
  }

  generateGuildTagHandler(object, key) {
    const tagHandler = this.generateTagAddHandler(object, key)
    return async tag => {
      const { getGuild, getGuilds } = await getModule(['getGuild', 'getGuilds'])
      // Check if it's a guild ID
      let guild = getGuild(tag)
      if (guild === undefined) {
        const exactMatches = []
        const fuzzyMatches = []
        const guilds = getGuilds()
        for (const id in guilds) {
          if (guilds[id].name === tag) {
            exactMatches.push(guilds[id])
          }
          if (guilds[id].name.includes(tag)) {
            fuzzyMatches.push(guilds[id])
          }
        }
        if (exactMatches.length === 1) {
          guild = exactMatches[0]
        } else if (fuzzyMatches.length === 1) {
          guild = fuzzyMatches[0]
        }
      }
      if (guild === undefined) {
        powercord.api.notices.sendToast(`cutecord-guild-not-found-${tag}`, {
          header: "Guild not found",
          timeout: 5000,
          content: `A match for \`${tag}\` was not found in your client's cache. There may have been too many matches, or none. Consider using an ID.`,
          type: 'error',
          buttons: [{
            text: 'Dismiss',
            look: 'ghost',
            size: 'small',
            onClick: () => powercord.api.notices.closeToast(`cutecord-guild-not-found-${tag}`)
          }]
        })
        return
      }
      tagHandler(guild.id)
    }
  }

  generateChannelTagHandler(object, key) {
    const tagHandler = this.generateTagAddHandler(object, key)
    return async tag => {
      const { getChannel } = await getModule(['getChannel', 'hasChannel'])
      const { getAllGuilds } = await getModule(['getChannels', 'getAllGuilds'])

      let channel = getChannel(tag)
      if (channel === undefined) {
        const cachedGuilds = getAllGuilds()
        const viewableChannels = []
        for (const id in cachedGuilds) {
          if (cachedGuilds[id] !== undefined) {
            viewableChannels.push(...cachedGuilds[id].SELECTABLE.map(c => c.channel))
          }
        }

        const exactMatches = []
        const fuzzyMatches = []
        for (const c of viewableChannels) {
          if (c.name === tag) {
            exactMatches.push(c)
          }
          if (c.name.includes(tag)) {
            fuzzyMatches.push(c)
          }
        }

        if (exactMatches.length === 1) {
          channel = exactMatches[0]
        } else if (fuzzyMatches.length === 1) {
          channel = fuzzyMatches[0]
        }
      }

      if (channel === undefined) {
        powercord.api.notices.sendToast(`cutecord-channel-not-found-${tag}`, {
          header: "Channel not found",
          timeout: 5000,
          content: `A match for \`${tag}\` was not found in your client's cache. There may have been too many matches, or none. Consider using an ID.`,
          type: 'error',
          buttons: [{
            text: 'Dismiss',
            look: 'ghost',
            size: 'small',
            onClick: () => powercord.api.notices.closeToast(`cutecord-channel-not-found-${tag}`)
          }]
        })
        return
      }
      tagHandler(channel.id)
    }
  }

  render() {
    return <div>
      <RadioGroup
        disabled={false}
        options={[
          {
            name: 'Enabled',
            value: true
          },
          {
            name: 'Disabled',
            value: false
          }
        ]}
        value={this.state.statusOverrides.enabled}
        note={<>
          <p>
            Use this to quickly enable or disable Cutecord notifications for all
            statuses.
          </p>
        </>}
        onChange={this.generateMergeHandler('statusOverrides', 'enabled')}
      >
        Cutecord Status
      </RadioGroup>

      <Category
        name='Status Overrides'
        description='Set notification settings for Online, Idle, DND, and Invisible individually.'
        opened={this.state.categories.statusOverrides}
        onChange={this.generateCategoryHandler('statusOverrides')}
      >
        {statusTypes.map(status => (
          <RadioGroup
            disabled={false}
            options={overrideOptions}
            value={this.state.statusOverrides[status]}
            onChange={this.generateMergeHandler('statusOverrides', status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </RadioGroup>
        ))}
      </Category>
      {['cutes', 'meanies'].map(type => (
        <Category
          name={type.charAt(0).toUpperCase() + type.slice(1)}
          description={`Configure ${type.slice(0, -1)} keywords, users, guilds, and channels. You will ${type === 'cutes' ? 'always' : 'never'} recieve notifications for ${type}.`}
          opened={this.state.categories[type]}
          onChange={this.generateCategoryHandler(type)}
        >
          <TextInputWithTags
            title='Keywords'
            tags={this.state[type].keywords}
            onAddTag={this.generateTagAddHandler(type, 'keywords')}
            onRemoveTag={this.generateTagRemoveHandler(type, 'keywords')}
          ></TextInputWithTags>
          <TextInputWithTags
            title='Users'
            tags={this.mapUserIds(this.state[type].users)}
            onAddTag={this.generateUserTagHandler(type, 'users')}
            onRemoveTag={this.generateTagRemoveHandler(type, 'users')}
          ></TextInputWithTags>
          <TextInputWithTags
            title='Guilds'
            tags={this.mapGuildIds(this.state[type].guilds)}
            onAddTag={this.generateGuildTagHandler(type, 'guilds')}
            onRemoveTag={this.generateTagRemoveHandler(type, 'guilds')}
          ></TextInputWithTags>
          <TextInputWithTags
            title='Channels'
            tags={this.mapChannelIds(this.state[type].channels)}
            onAddTag={this.generateChannelTagHandler(type, 'channels')}
            onRemoveTag={this.generateTagRemoveHandler(type, 'channels')}
          ></TextInputWithTags>
        </Category>
      ))}
    </div>
  }
}
