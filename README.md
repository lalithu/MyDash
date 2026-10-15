<div align="center">

# MyDash

### Less planning. More together.

Canvas coursework, your weekly schedule, and finding time with friends.

[Getting started](#get-started) · [Privacy](docs/privacy.html) · [Report a bug](https://github.com/lalithu/MyDash/issues) · [Get help](mailto:lalithuriti@gmail.com)

**Built in Charlotte. Open source. MIT licensed.**

</div>

---

## A little more room in your week

- **Plan your work.** See Canvas assignments, deadlines, personal tasks, and completion progress.
- **Bring in your schedule.** Import an `.ics` calendar, enter classes manually, or try screenshot import on a compatible Chrome device.
- **Find your people.** Connect by `@username`, share availability, and find group meeting times.
- **Choose what to share.** Full class details, busy/free blocks, or a hidden schedule.

## Get started

The Chrome Web Store release is in preparation. To try the open-source beta:

1. Download this repository as a ZIP and extract it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Choose **Load unpacked** and select the folder containing `manifest.json`.
4. Open your school's Canvas dashboard. MyDash's welcome page helps you get started.

The planner works in your signed-in Canvas session. A separate MyDash account is needed for friends and sharing. Settings and setup are available from the extension's toolbar icon.

**Supported Canvas domains:** `*.instructure.com` and `instructure.charlotte.edu`. Other custom campus domains are not included yet.

## Privacy, simply

Screenshots stay on your device. Account, friendship, and selected shared-schedule data use Supabase. Local planner data uses Chrome extension storage; some settings may use Chrome sync. Review extracted times before saving.

Read the [privacy policy](docs/privacy.html). For account deletion or privacy questions, contact **lalithuriti@gmail.com**.

## Development

This repository currently ships the compiled extension assets. The original React/build source and database migrations are not included, so there is no frontend build step. Focused regression tests use Node.js 22 or newer:

```sh
node tests/social.test.cjs
node tests/schedule.test.cjs
node tests/auth.test.cjs
```

Reload the extension in `chrome://extensions`, then reload Canvas after changes. Use fictional data in screenshots and your own accounts for testing. Never commit passwords, session tokens, service-role keys, or exported user data. The shipped Supabase publishable key identifies the public client; database authorization must be enforced on the server.

Want to run your own backend? Configure your own project in `supabase-config.js`. The current social features depend on project-specific tables and RPCs; this checkout does not yet include a reproducible backend migration. Do not point test scripts at other people's data.

## Contribute

Bug reports and small, focused improvements are welcome. Include reproduction steps and Chrome version. Please read [CONTRIBUTING.md](CONTRIBUTING.md). Report security concerns privately using [SECURITY.md](SECURITY.md).

## Credits

Created by **Lalith Uriti**. Includes work originally by **Jeffrey Cheng**, preserved under the [MIT license](LICENSE).

Independent student project. Not affiliated with Instructure or UNC Charlotte.
