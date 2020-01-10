# GAS-NotificationKit
Provide easy notification to Slack, Workplace(Facebook) and Workplace Chat
## Install
### Set up Google Apps Script Development Environment
```bash
$ npm i -g typescript
$ npm i -g @google/clasp
$ npm i -g tslint
```
and
```
$ clasp create <YOUR_GAS_PJ_NAME>
$ clasp pull
$ npm i -S @types/google-apps-script
$ tsc --init
$ tslint --init
```

### Install a module
```
$ npm install @ts-module-for-gas/gas-notification-kit
```

## Using
```TypeScript
import NotificationKit from '@ts-module-for-gas/gas-notification-kit';

const option = {
    SlackBot: {
        BOT_NAME: <YOUR_BOT_NAME>,
        TOKEN: <YOUR_SLACK_TOKEN>
    },
    WorkplaceBot: {
        TOKEN: <YOUR_WORKPLACE_TOKEN>
    }
}
const Bot = new NotificationKit.Bot(option);

Bot.notifyToEmail({
    title : 'Approval Request',
    text : 'Your approval is requested'
})
```

### Attachment format
Compatible with Slack attachment format  
#### Example
```json
{
    "attachments": [
        {
            "fallback": "Required plain-text summary of the attachment.",
            "color": "#2eb886",
            "pretext": "Optional text that appears above the attachment block",
            "author_name": "Bobby Tables",
            "author_link": "http://flickr.com/bobby/",
            "author_icon": "http://flickr.com/icons/bobby.jpg",
            "title": "Slack API Documentation",
            "title_link": "https://api.slack.com/",
            "text": "Optional text that appears within the attachment",
            "fields": [
                {
                    "title": "Priority",
                    "value": "High",
                    "short": false
                }
            ],
            "image_url": "http://my-website.com/path/to/image.jpg",
            "thumb_url": "http://example.com/path/to/thumb.png",
            "footer": "Slack API",
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "ts": 123456789
        }
    ]
}
```

### Email Notification
An `attachment` is converted to HTML body:
```
Subject: ${attachment.title}
```

```html
/* HTML Body */
<html>
<p>${attachment.pretext}</p>
<small><a href="${attachment.author_link}">${attachment.author_name}</a></small>
<h2><a href="${attachment.title_link}">${attachment.title}</a></h2>
<p>${attachment.text}</p>
<p><b>${field.title}</b><br>
${field.value}</p>
  :
  :
<small>${attachment.footer}</small>
</html>
```
if `xxx_link` is emtpy, `<a>` tag is not generated.

