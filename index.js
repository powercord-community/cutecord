const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')
const {inject, uninject} = require("powercord/injector")
const Cute = require('./cute.jsx')

const user = '250322741406859265'

module.exports = class Cutecord extends Plugin {
  async startPlugin () {
    this.registerCommand(
      'howcute',
      [],
      'How cute is emma?',
      '{c}',
      (args) => {
        this.log('Emma is verry cute')
        return {
          send: false,
          result: `Emma is ${powercord.emma.percent}% cute.`
        }
      })
    
    const getUser = await getModule([ 'getUser' ])
    inject('cutecord-getUser', getUser, 'getUser',  (args, res) => {
        if (res && res.id === user) {
          res.discriminator = 'uwu'
        }
        return res
    })

    const getMember = await getModule([ 'getMember' ])
    inject('cutcord-getMember', getMember, 'getMember', (args, res) => {

      if (res && res.userId && res.roles && res.userId === user) {
        if (!res.roles.includes('cute role')) {
          res.roles.push('cute role')
        }
        if (!res.nick || !res.nick.startsWith('cute')) {
          res.nick = 'cute ' + res.nick || ''
        }
      }
      return res
    })

    const getGuild = await getModule([ 'getGuild' ])
    inject('cutecord-getGuild', getGuild, 'getGuild', (args, res) => {
      if (res && res.roles) {
        res.roles['cute role'] = {
          color: 9055202,
          colorString: "#8a2be2",
          hoist: true,
          id: "cute role",
          managed: false,
          mentionable: false,
          name: "cute 🌺",
          originalPosition: 1000,
          permissions: 0,
          position: 999
        }
      }
      return res
    })

    this.registerSettings('cutecord', 'Cutecord', Cute)
  }
}
