/**
 * thank u bowser uwu
 */

const { React } = require('powercord/webpack');
const { AsyncComponent, Tooltip } = require('powercord/components');

class Badges extends React.PureComponent {
  render () {
    if (!this.props.user) {
      return null;
    }

    return <>
      {this.props.getSetting('displayFlower', true) && this.props.getSetting('cuteUsers', []).includes(this.props.user.id) &&
      <Tooltip
        text="cutie uwu 🌺"
        delay={500}
      >
        <div className="cutecord-cute-user"/>
      </Tooltip>}
    </>;
  }
}

module.exports = (props) => <AsyncComponent
  _provider={ async () => Badges }
  {...props}
/>;
