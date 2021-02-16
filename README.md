# Cutecord
Cutecord is a [Powercord](https://powercord.dev) plugin that
makes Discord a bit cuter. Cutecord reimplements Discord's notification
logic so you can control who you get notifications from and when.

## cutecord is great for these reasons
- Allow notifications from specific users to bypass DND owo
- Block other users from your notifications entirely òwó
- Don't recieve notifications when you're invisible uwu
- y'all cute

cutecord expects a comma separated list of snowflakes in it's
configuration. This isn't the most cutest way to set it up but
contributions to add better UI are welcome.

you can find cutecord wherever good things are sold or on
[GitHub](https://github.com/powercord-community/cutecord).
install as you would any other powercord plugin, with
`git clone` uwu

## How cutecord works
If you have cutecord style notifications enabled, this is how we handle them.
- First we check what override setting you have selected. These options allow
  you to quickly switch between cutecord, Discord's default notifications, and
  notifications being fully disabled as well.
- At this point, we check against any muted guilds, channels, or blocked users
  and anything that matches is dropped. We also check against any meanies here
  òwó
- After that, we check against any cuties and dispatch notificaitons
  accordingly.
- Once all the cutes are taken care of, notifications are handled as Discord
  would normally handle them.

---
## Changelog
### v3.1.0
Removed badges (they always errored anyways) and added ability to make ,essages
with cute words in them appear as if they had a mention. uwu.

### v3.0.0
The flow of logic that determines if a notification is sent has been fully
rewritten, and has been summarised in the
[how notifications work](#how-cutecord-works) section of this document.
Unfortunately, that also means that many of your settings may have been reset,
leading to this being a breaking update.

### v2.1.1
This is a smaller update - several fixes to CSS have been made, and issues
with compatibility with other plugins have been covered as well.

Some clarifications to configuration have also been made. The `Default
Discord` option has been renamed to `Pure Discord
default`. It now exactly reflects Discord's default implementation -
you won't get notifications from any cute users, it'll be just like normal.
However, a new configuration option has also been added, `Cute
notifications`. This has the same functionality that `Default
Discord` had, but it's been renamed to hopefully clear up some
confusion.

### v2.1.0
Yay! The first feature update is here òwó
- Allows you to mark roles as uncute (no more mod ping aboos uwu)
- keywords are working now!
- Cute users are now even more cute! (they now have a flower badge displayed
next to their name owo)

![Messages](https://i.imgur.com/LVf21qm.png)
![Member list](https://i.imgur.com/o6g5qsP.png)

### v2.0.0
The first update! Adds some actual features and unhecks the plugin in general
uwu.
- Adds cute users, channels, and guilds, as well as their uncute counterparts
- Add more fine grained notification control in general
- removed things about certain people being cute
