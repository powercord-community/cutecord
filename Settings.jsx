const { React } = require('powercord/webpack');
const { Category, SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      advancedSettings: false,
      cuteSettings: false,
      uncuteSettings: false,

      detectionMethod: this.props.getSetting('detectionMethod', 'word'),
      caseSensitive: this.props.getSetting('caseSensitive', false),
      overrides: this.props.getSetting('overrides', 'cute'),
      highlightKeywords: this.props.getSetting('highlightKeywords', true),
      lurkedGuilds: this.props.getSetting('lurkedGuilds', false),
      managedChannels: this.props.getSetting('managedChannels', false),
      customFocusDetection: this.props.getSetting('customFocusDetection', false),

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
        description="you'll always get notifications from these owo. separate values with commas"
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
          note="Should keywords be case sensitive?"
          style={{ marginTop: '16px' }}
          value={this.state.caseSensitive}
          onChange={() => {
            this.setState({ caseSensitive: !this.state.caseSensitive });
            this.props.toggleSetting('caseSensitive');
          }}
        >
          Match case
        </SwitchItem>
        <RadioGroup
          disabled={ false }
          options={ [
            { name: 'Word',
              value: 'word' },
            { name: 'Substring',
              value: 'substring' }
          ] }
          value={ this.state.detectionMethod }
          note={<>
            <p>
              Substring matches if any part of the word is in a message - for example `kat` would trigger if someone said `kitkat`.
            </p>
          </>}
          onChange={ e => {
            this.setState({ detectionMethod: e.value });
            this.props.updateSetting('detectionMethod', e.value);
          }}
        >
          Detection Method
        </RadioGroup>
        <SwitchItem
          note="Should messages with a cute word in appear like a mention?"
          style={{ marginTop: '16px' }}
          value={this.state.highlightKeywords}
          onChange={() => {
            this.setState({ highlightKeywords: !this.state.highlightKeywords });
            this.props.toggleSetting('highlightKeywords');
          }}
        >
          Highlight Cute Words
        </SwitchItem>
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
          note="Discord broke some window focus detection on linux so this fixes it"
          style={{ marginTop: '16px' }}
          value={this.state.customFocusDetection}
          onChange={() => {
            this.setState({ customFocusDetection: !this.state.customFocusDetection });
            this.props.toggleSetting('customFocusDetection');
          }}
        >
          Custom Focus Detection
        </SwitchItem>
      </Category>

      <div style={{ marginTop: '10rem'}}>
        <img
          src='https://canary.discordapp.com/assets/62dc78f6f9a73954e6454da485ea8147.svg'
          alt='emma cute'
          title='emma cute'
        />
      </div>
    </div>;
  }
};
