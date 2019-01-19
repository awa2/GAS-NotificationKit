namespace Slack {
    export const API_URL = 'https://slack.com/api';
    export class Bot {
        public bot_name: string;
        public token: string;
        constructor(bot_name: string, token: string) {
            this.bot_name = bot_name;
            this.token = token;
            return this;
        }
        post(attachment: Attachement, ch: string, mention?: string) {
            const payload = {
                channel: ch,
                text: '',
                link_names: 1,
                parse: 'full',
                username: this.bot_name,
                attachments: JSON.stringify([attachment])
            }

            const res: PostResponse = JSON.parse(UrlFetchApp.fetch(`${API_URL}/chat.postMessage`, {
                method: 'post',
                payload: payload,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return new Post(this.bot_name, res.channel, res.ts, res.message, this.token);
        }
        handleInvocation(invocation: Invocation) {
            return new Post(this.bot_name, invocation.channel.id, invocation.message_ts, invocation.original_message, this.token);
        }
    }

    export class Post {
        public bot_name: string;
        public channel: string;
        public ts: string;
        public message: Message;
        private token: string;

        constructor(bot_name: string, channel_id: string, ts: string, message: Message, token: string) {
            this.bot_name = bot_name;
            this.channel = channel_id;
            this.ts = ts;
            this.message = message;
            this.token = token;
            return this;
        }
        public update(attachment: Attachement) {
            const payload = {
                channel: this.channel,
                text: '',
                ts: this.ts,
                link_names: 1,
                parse: 'full',
                username: this.bot_name,
                attachments: JSON.stringify([attachment])
            }
            const res = this.send('chat.postMessage', payload);
        }
        public destroy() {
            const payload = {
                channel: this.channel,
                ts: this.ts
            }
            const res = this.send('chat.delete', payload);

        }
        public reply(attachment: Attachement) {
            const payload = {
                channel: this.channel,
                text: '',
                thread_ts: this.ts,
                link_names: 1,
                parse: 'full',
                username: this.bot_name,
                attachments: JSON.stringify([attachment])
            }
            const res = this.send('chat.postMessage', payload);
        }

        private send(endpoint: string, payload: Object): PostResponse {
            return JSON.parse(UrlFetchApp.fetch(`${API_URL}/${endpoint}`, {
                method: 'post',
                payload: payload,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
        }
    }
    export type Payload = {
        channel: string,
        text: string,
        link_names?: '1',
        parse?: 'full' | 'none',
        username: string,
        attachments: string
    }
    export type Message = {
        text?: string,
        attachments?: Attachement[],
        thread_ts?: string,
        response_type?: 'in_channel' | 'ephemeral',
        replace_original?: boolean,
        delete_original?: boolean
    }
    export type Attachement = {
        fallback?: string,             //"Required plain-text summary of the attachment.",
        callback_id?: string,          //"wopr_game",
        color: string,                 //"#2eb886",
        attachment_type?: string,      //"default",
        actions?: Action[],
        pretext?: string,              //"Optional text that appears above the attachment block",
        author_name?: string,           //"Bobby Tables",
        author_link?: string,          //"http://flickr.com/bobby/",
        author_icon?: string,          //"http://flickr.com/icons/bobby.jpg",
        title?: string,                 //"Slack API Documentation",
        title_link?: string,           //"https://api.slack.com/",
        text?: string,                 // "Optional text that appears within the attachment",
        fields?: Array<
            {
                title: string,             //"Priority",
                value: string,             //"High",
                short?: boolean,           //false
            }
        >,
        image_url?: string,            //"http://my-website.com/path/to/image.jpg",
        thumb_url?: string,            //"http://example.com/path/to/thumb.png",
        footer?: string,               //"Slack API",
        footer_icon?: string,          //"https://platform.slack-edge.com/img/default_application_icon.png",
        ts?: number                    //123456789
    }
    export type Action = {
        name: string,
        text: string,
        type: string,
        value?: string,
        confirm?: Confirmation,
        style?: string,
        options?: Option[],
        option_groups?: OptionGroup[],
        data_source?: string,
        selected_options?: Option[],
        min_query_length?: number
    }
    export type Option = {
        text: string,
        value: string,
        description?: string
    }
    export type Confirmation = {
        title: string,
        text: string,
        ok_text: string,
        dismiss_Text: string,
    }
    export type OptionGroup = {
        text: string,
        options: Option[]

    }
    export type Invocation = {
        type: string,
        actions: Action[],
        callback_id: string,
        team: { id: string, domain: string },
        channel: { id: string, name: string },
        user: { id: string, name: string },
        action_ts: string,
        message_ts: string,
        attachment_id: string,
        token: string,
        original_message: Message,
        response_url: string
    }
    export type OptionsLoad = {
        name: string,
        value: string,
        callback_id: string,
        type: string,
        team: { id: string, domain: string },
        channel: { id: string, name: string },
        user: { id: string, name: string },
        action_ts: string,
        message_ts: string,
        attachment_id: string,
        token: string,
    }
    export type PostResponse = {
        ok: boolean,
        channel: string,
        ts: string,
        message: Message,
        error?: string
    }
}

export default Slack;