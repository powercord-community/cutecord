const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')
const {inject, uninject} = require("powercord/injector")
const Cute = require('./cute.jsx')

const user = '215067938452013056'

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
        if (!res.roles.includes('9999999999999999')) {
          res.roles.push('9999999999999999')
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
        res.roles['9999999999999999'] = {
          color: 9055202,
          colorString: "#8a2be2",
          hoist: true,
          id: '9999999999999999',
          managed: false,
          mentionable: false,
          name: "cute 🌺",
          originalPosition: 1000,
          permissions: 0,
          position: 1000
        }
      }
      return res
    })

    this.registerSettings('cutecord', 'Cutecord', Cute)
  }
}
