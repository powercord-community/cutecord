# Changelog

## v4.0.0
Woo! A rewrite! Things have been redone from the ground up - here's a quick
view at things that have changed.

> **Note**
> This is a major update, with a complete overhaul of configuration storage.
> Configuration *should* automatically be migrated to the latest version. If you
> are running into any issues, reach out to katlyn via Discord.

### Status overrides
You're now able to specify custom notification overrides for each status. This
allows you to fine tune how you receive notifications - want to get some
notifications while you're in DND but none at all while you're invisible? You
can do that now.

![Status Override settings](https://cdn.discordapp.com/attachments/398575198573428737/996335285812080650/unknown.png)

### Better Settings
Overall, settings got a lot better too. No more will you need to copy and paste
IDs one by one, fuzzy search and minimal autocomplete is now available.

![Tag based settings inputs](https://cdn.discordapp.com/attachments/398575198573428737/996336131933220884/unknown.png)

### Improved keyword detection
Keywords now allow punctuation on either side of them when being detected.

---

## v3.4.0
Added a custom window focus detection mechanism, as Discord's seems to have
broken on some linux window managers, and is incorrectly registering Discord as
focused (and therefore does not send a notification for the current channel).
The setting to enable this can be found in cutecord's advanced settings.

## v3.3.0
Added ability to toggle between case sensitive and insensitive keyword
detection. The default has been set to case insensitive detection.

## v3.2.0
Added advanced setting to select the detection method for cute and uncute words.
This defaults to word detection, but can be set to substring as well. Substring
detection allows words like `kitkat` to trigger if `kat` is a cute word, whereas
word detection would not.

idk how cutecord went a year and a half without complaints and now people notice
this.

## v3.1.0
Removed badges (they always errored anyways) and added ability to make messages
with cute words in them appear as if they had a mention. uwu.

## v3.0.0
The flow of logic that determines if a notification is sent has been fully
rewritten, and has been summarised in the
[how notifications work](#how-cutecord-works) section of this document.
Unfortunately, that also means that many of your settings may have been reset,
leading to this being a breaking update.

---

## v2.1.1
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

## v2.1.0
Yay! The first feature update is here òwó
- Allows you to mark roles as uncute (no more mod ping aboos uwu)
- keywords are working now!
- Cute users are now even more cute! (they now have a flower badge displayed
next to their name owo)

![Messages](https://i.imgur.com/LVf21qm.png)
![Member list](https://i.imgur.com/o6g5qsP.png)

## v2.0.0
The first update! Adds some actual features and unhecks the plugin in general
uwu.
- Adds cute users, channels, and guilds, as well as their uncute counterparts
- Add more fine grained notification control in general
- removed things about certain people being cute
