/**
 * thank u bowser uwu
 */

const { React } = require('powercord/webpack');
const { AsyncComponent, Tooltip } = require('powercord/components');

class Badges extends React.PureComponent {
  async componentDidMount () {
    if (!this.props.user) {
      return;
    }
  }

  render () {
    if (!this.props.user) {
      return null;
    }

    return <>
      {this.props.getSetting('displayFlower', true) && this.props.getSetting('cuteUsers', []).includes(this.props.user.id) &&
      <Tooltip
        text="fucker son of a bitch mcdonalds eating ugly ass"
        delay={500}
      >
        <div className="cutecord-cute-user"/>
      </Tooltip>}
    </>;
  }
}

module.exports = (props) => <AsyncComponent
  _provider={async () => {
    return Badges;
  }}
  {...props}
/>;
