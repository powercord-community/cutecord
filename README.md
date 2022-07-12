# cutecord
cutecord is a [Powercord](https://powercord.dev) plugin that makes Discord a bit
cuter. cutecord reimplements Discord's notification logic so you can control who
you get notifications from and when.

## cutecord is great for these reasons
- Allow notifications from specific users to bypass DND
- Block other users from your notifications entirely
- Don't receive notifications when you're invisible (and settings for other
statuses).
- y'all cute

cutecord allows you to specify names of users, channels, and guides in
configuration, as well as accepting snowflakes for more advanced users. It still
isn't the most cutest way to accept values but it does get the job done.

You can find cutecord wherever good things are sold or on
[GitHub](https://github.com/powercord-community/cutecord). Install as you would
any other powercord plugin using `git clone`.

## How cutecord works
If you have cutecord style notifications enabled, this is how we handle them.
- First we check what override setting you have selected. These options allow
  you to quickly switch between cutecord, Discord's default notifications, and
  notifications being fully disabled as well.
- At this point, we check against any muted guilds, channels, or blocked users
  and anything that matches is dropped. We also check against any meanies here.
- After that, we check against any cuties and dispatch notifications
  accordingly.
- Once all the cutes are taken care of, notifications are handled as Discord
  would normally handle them.

---
## Changelog
See [changelog.md](./changelog.md).
