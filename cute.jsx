const { React } = require('powercord/webpack')
const { Card, Button } = require('powercord/components')
const { Category, SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings')

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      advancedSettings: false,
      cuteSettings: false,
      uncuteSettings: false,

      overrides: this.props.getSetting('overrides', 'default'),
      lurkedGuilds: this.props.getSetting('lurkedGuilds', false),
      managedChannels: this.props.getSetting('managedChannels', false),
      displayFlower: this.props.getSetting('displayFlower', false),

      blockEveryone: this.props.getSetting('blockEveryone', false),
      blockRoles: this.props.getSetting('blockRoles', false),

      invisibleIsDND: this.props.getSetting('invisibleIsDND', false)
    }
  }

  render () {
    return <div>
      <RadioGroup
      disabled={ false }
        options={ [
          { name: 'Pure Discord default - lame', value: 'default' },
          { name: 'Ugly notifications - good', value: 'cute' },
          { name: 'Override DND with all notifications - who cares', value: 'dnd' },
          { name: 'No notifications - no one is talking to you anyway??', value: 'none' }
        ] }
        value={ this.state.overrides }
        note='These settings do not apply to ugly and "ghosting these fuckers" users'
        onChange={ e => {
          this.setState({ overrides: e.value })
          this.props.updateSetting('overrides', e.value)
        }}
      >
        Notification Overrides
      </RadioGroup>


      <SwitchItem
        note="Disable all @everyone mentions? No one is talking to you specifically anyway"
        style={{ marginTop: '16px' }}
        value={this.state.blockEveryone}
        onChange={() => {
          this.setState({ blockEveryone: !this.state.blockEveryone })
          this.props.toggleSetting('blockEveryone')
        }}
      >
        @everyone
      </SwitchItem>
      <SwitchItem
        note="Disable all @role mentions? God forbid someone try to contact you."
        style={{ marginTop: '16px' }}
        value={this.state.blockRoles}
        onChange={() => {
          this.setState({ blockRoles: !this.state.blockRoles })
          this.props.toggleSetting('blockRoles')
        }}
      >
        @roles
      </SwitchItem>
      <SwitchItem
        note="Should you get notifications when you're invisible? Why you hiding you fuck???"
        style={{ marginTop: '16px' }}
        value={!this.state.invisibleIsDND}
        onChange={() => {
          this.setState({ invisibleIsDND: !this.state.invisibleIsDND })
          this.props.toggleSetting('invisibleIsDND')
        }}
      >
        Invisible Notifications
      </SwitchItem>

      <Category
        name='Uglies'
        description="you'll always get notifications from these ugly fuckers"
        opened={ this.state.cuteSettings }
        onChange={() => this.setState({ cuteSettings: !this.state.cuteSettings })}
      >
        <TextInput
          defaultValue={ this.props.getSetting('cuteUsers', []).join(', ') }
          onChange={u => this.props.updateSetting('cuteUsers', u.split(',').map(id => id.trim()))}
        >
          Users
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('cuteGuilds', []).join(', ') }
          onChange={u => this.props.updateSetting('cuteGuilds', u.split(',').map(id => id.trim()))}
        >
          Guilds
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('cuteChannels', []).join(', ') }
          onChange={u => this.props.updateSetting('cuteChannels', u.split(',').map(id => id.trim()))}
        >
          Channels
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('cuteWords', ['my fries', 'boats and hoes']).join(', ') }
          onChange={u => this.props.updateSetting('cuteWords', u.split(',').map(id => id.trim()))}
        >
          Keywords
        </TextInput>
      </Category>

      <Category
        name='"ghosting these fuckers"'
        description="say goodbye to notifications from these fucks god damn bitches"
        opened={ this.state.uncuteSettings }
        onChange={() => this.setState({ uncuteSettings: !this.state.uncuteSettings })}
      >
        <TextInput
          defaultValue={ this.props.getSetting('uncuteUsers', []).join(', ') }
          onChange={u => this.props.updateSetting('uncuteUsers', u.split(',').map(id => id.trim()))}
        >
          Users
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('uncuteGuilds', []).join(', ') }
          onChange={u => this.props.updateSetting('uncuteGuilds', u.split(',').map(id => id.trim()))}
        >
          Guilds
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('uncuteChannels', []).join(', ') }
          onChange={u => this.props.updateSetting('uncuteChannels', u.split(',').map(id => id.trim()))}
        >
          Channels
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('uncuteRoles', []).join(', ') }
          onChange={u => this.props.updateSetting('uncuteRoles', u.split(',').map(id => id.trim()))}
        >
          Roles
        </TextInput>
        <TextInput
          defaultValue={ this.props.getSetting('uncuteWords', []).join(', ') }
          onChange={u => this.props.updateSetting('uncuteWords', u.split(',').map(id => id.trim()))}
        >
          Keywords
        </TextInput>
      </Category>

      <Category
          name='Advanced, not for dumb fucks'
          description="Things you probably don't need to change but they're here anyways, who cares"
          opened={ this.state.advancedSettings }
          onChange={() => this.setState({ advancedSettings: !this.state.advancedSettings })}
      >
        <SwitchItem
          note="Do you want to get notifications in guilds you're lurking? Who the fuck lurks you fucking sick fricker"
          style={{ marginTop: '16px' }}
          value={this.state.lurkedGuilds}
          onChange={() => {
            this.setState({ lurkedGuilds: !this.state.lurkedGuilds })
            this.props.toggleSetting('lurkedGuilds')
          }}
        >
          Lurked Guilds
        </SwitchItem>
        <SwitchItem
          note="I have no idea what a managed channel is -- or what a full bag of mcdonalds fries are"
          style={{ marginTop: '16px' }}
          value={this.state.managedChannels}
          onChange={() => {
            this.setState({ managedChannels: !this.state.managedChannels })
            this.props.toggleSetting('managedChannels')
          }}
        >
          Managed Channels
        </SwitchItem>
        <SwitchItem
          note="Displays a sun emoji next to ugly users UWU IRONICALLY???"
          style={{ marginTop: '16px' }}
          value={this.state.displayFlower}
          onChange={() => {
            this.setState({ displayFlower: !this.state.displayFlower })
            this.props.toggleSetting('displayFlower')
          }}
        >
          Cutecord Flower
        </SwitchItem>
      </Category>
      
      <div style={{
        fontFamily: 'serif',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text-normal)',
        fontSize: '15vh',
        alignItems: 'center'
      }}>
        <img
          src='https://dsc.cloud/KableKompany/icons8-sun.svg' alt=''
          style={{
            width: '35vh'
          }} />
        <div>my GOD DAMN</div>
        <div>FRIES ARE</div>
        <div>MISSING</div>
      </div>
    </div>
  }
}
