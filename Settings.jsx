const { React } = require('powercord/webpack');
const { Category, SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      advancedSettings: false,
      cuteSettings: false,
      uncuteSettings: false,

      overrides: this.props.getSetting('overrides', 'cute'),
      lurkedGuilds: this.props.getSetting('lurkedGuilds', false),
      managedChannels: this.props.getSetting('managedChannels', false),
      displayFlower: this.props.getSetting('displayFlower', false),

      blockEveryone: this.props.getSetting('blockEveryone', false),
      blockRoles: this.props.getSetting('blockRoles', false),

      invisibleIsDND: this.props.getSetting('invisibleIsDND', false),
      overrideDND: this.props.getSetting('overrideDND', false)
    };
  }

  render () {
    return <div>
      <RadioGroup
        disabled={ false }
        options={ [
          { name: 'Cutecord Enabled uwu',
            value: 'cute' },
          { name: 'Discord Default',
            value: 'default' },
          { name: 'No notifications',
            value: 'none' }
        ] }
        value={ this.state.overrides }
        note={<>
          <p>
            beep boop y'all are cute
          </p>
        </>}
        onChange={ e => {
          this.setState({ overrides: e.value });
          this.props.updateSetting('overrides', e.value);
        }}
      >
        Cutecord Status
      </RadioGroup>


      <SwitchItem
        note="Disable all @role mentions?"
        style={{ marginTop: '16px' }}
        value={this.state.blockRoles}
        onChange={() => {
          this.setState({ blockRoles: !this.state.blockRoles });
          this.props.toggleSetting('blockRoles');
        }}
      >
        @roles
      </SwitchItem>
      <SwitchItem
        note="Disable all @everyone mentions?"
        style={{ marginTop: '16px' }}
        value={this.state.blockEveryone}
        onChange={() => {
          this.setState({ blockEveryone: !this.state.blockEveryone });
          this.props.toggleSetting('blockEveryone');
        }}
      >
        @everyone
      </SwitchItem>
      <SwitchItem
        note="Makes DND act like any other status uwu"
        style={{ marginTop: '16px' }}
        value={this.state.overrideDND}
        onChange={() => {
          this.setState({ overrideDND: !this.state.overrideDND });
          this.props.toggleSetting('overrideDND');
        }}
      >
        Override DND
      </SwitchItem>
      <SwitchItem
        note="Should you get notifications when you're invisible?"
        style={{ marginTop: '16px' }}
        value={!this.state.invisibleIsDND}
        onChange={() => {
          this.setState({ invisibleIsDND: !this.state.invisibleIsDND });
          this.props.toggleSetting('invisibleIsDND');
        }}
      >
        Invisible Notifications
      </SwitchItem>

      <Category
        name='Cutes'
        description="you'll always get notifications from these owo"
        opened={ this.state.cuteSettings }
        onChange={() => this.setState({ cuteSettings: !this.state.cuteSettings })}
      >
        <TextInput
          defaultValue={ this.props.getSetting('cuteUsers', []).join(', ') }
          onChange={u => this.props.updateSetting('cuteUsers', u.split(',').map(id => id.trim()))}
          note={
            <p>
              Use IDs for these uwu
            </p>
          }
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
          defaultValue={ this.props.getSetting('cuteWords', []).join(', ') }
          onChange={u => this.props.updateSetting('cuteWords', u.split(',').map(id => id.trim()))}
        >
          Keywords
        </TextInput>
      </Category>

      <Category
        name='Meanies'
        description="say goodbye to notifications from these >:3c"
        opened={ this.state.uncuteSettings }
        onChange={() => this.setState({ uncuteSettings: !this.state.uncuteSettings })}
      >
        <TextInput
          defaultValue={ this.props.getSetting('uncuteUsers', []).join(', ') }
          onChange={u => this.props.updateSetting('uncuteUsers', u.split(',').map(id => id.trim()))}
          note={
            <p>
              Use IDs for these Owo
            </p>
          }
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
        name='Advanced'
        description="Things you probably don't need to change but they're here anyways"
        opened={ this.state.advancedSettings }
        onChange={() => this.setState({ advancedSettings: !this.state.advancedSettings })}
      >
        <SwitchItem
          note="Do you want to get notifications in guilds you're lurking?"
          style={{ marginTop: '16px' }}
          value={this.state.lurkedGuilds}
          onChange={() => {
            this.setState({ lurkedGuilds: !this.state.lurkedGuilds });
            this.props.toggleSetting('lurkedGuilds');
          }}
        >
          Lurked Guilds
        </SwitchItem>
        <SwitchItem
          note="I have no idea what a managed channel is"
          style={{ marginTop: '16px' }}
          value={this.state.managedChannels}
          onChange={() => {
            this.setState({ managedChannels: !this.state.managedChannels });
            this.props.toggleSetting('managedChannels');
          }}
        >
          Managed Channels
        </SwitchItem>
        <SwitchItem
          note="Displays a 🌺 next to cute users."
          style={{ marginTop: '16px' }}
          value={this.state.displayFlower}
          onChange={() => {
            this.setState({ displayFlower: !this.state.displayFlower });
            this.props.toggleSetting('displayFlower');
          }}
        >
          Cutecord Flower
        </SwitchItem>
      </Category>

      <div style={{
        fontFamily: 'serif',
        display: 'none',
        flexDirection: 'column',
        color: 'var(--text-normal)',
        fontSize: '15vh',
        alignItems: 'center'
      }}>
        <img
          src='https://canary.discordapp.com/assets/62dc78f6f9a73954e6454da485ea8147.svg' alt=''
          style={{
            width: '35vh'
          }} />
        <div>emma</div>
        <div>cute</div>
      </div>
    </div>;
  }
};
