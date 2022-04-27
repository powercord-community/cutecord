const { getModule, React } = require('powercord/webpack');
const { Category, SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings');

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

const statusTypes = Object.keys(getModule(['StatusTypes'], false).StatusTypes).map(k => k.toLowerCase())


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
        enabled: true||false,
        online: "cute",
        idle: "default",
        dnd: "none",
        offline: "cute"
      },
      keywordDetection: {
        method: "word"||"substring",
        caseSensitive: true||false
      },
      mentions: {
        everyone: true||false,
        roles: true||false
        // Refer to BetterReplies if they want to mess with reply mentions
      },
      advanced: {
        highlightKeywords: true||false,
        lurkedGuilds: true||false,
        managedChannels: true||false,
        customFocusDetection: true||false
      },

      // Category state, is not saved
      categoryStatusOverrides: false
    }
  }

  generateMergeHandler(object, key) {
    return e => {
      this.state[object][key] = e.value
      this.setState({ [object]: this.state[object] })
      // this.props.updateSetting(object, this.state[object])
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
        opened={this.state.categoryStatusOverrides}
        onChange={() => this.setState({ categoryStatusOverrides: !this.state.categoryStatusOverrides })}
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
    </div>
  }
}
