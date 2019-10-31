const { React } = require('powercord/webpack')

module.exports = class Cute extends React.Component {
  render() {
    
    return <div style={{
      fontFamily: 'serif',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-normal)',
      fontSize: '15vh',
      alignItems: 'center'
    }}>
      <div>emma</div>
      <div>is</div>
      <div>cute</div>
      <img
        src='https://canary.discordapp.com/assets/62dc78f6f9a73954e6454da485ea8147.svg' alt=''
        style={{
          width: '35vh'
        }} />
    </div>
  }
}
