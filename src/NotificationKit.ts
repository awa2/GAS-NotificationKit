import Slack from './Slack';
import Workplace from './Workplace';

namespace NotificationKit {
    export type Option = {
        SlackBot?: {
            BOT_NAME: string,
            TOKEN: string,
        },
        WorkplaceBot: {
            TOKEN: string,
        }
        Email?: {
            to: string,
            cc?: string,
            bcc?: string
        }
    }
    export class Bot {
        private option: NotificationKit.Option;
        public SlackBot?: Slack.Bot;
        public WorkplaceBot?: Workplace.Bot;
        public static Option = {}

        constructor(option: NotificationKit.Option) {
            this.option = option;
            if(option.SlackBot){
                this.SlackBot = new Slack.Bot(option.SlackBot.BOT_NAME, option.SlackBot.TOKEN);
            }
            if(option.WorkplaceBot){
                this.WorkplaceBot = new Workplace.Bot(option.WorkplaceBot.TOKEN);
            }
            return this;
        }

        public notifyToEmail(attachment: Slack.Attachement, _to?: string, _cc?: string, _bcc?: string) {
            if (this.option.Email) {
                const emailOption = {
                    to: _to ? _to : this.option.Email.to,
                    cc: _cc ? _cc : this.option.Email.cc,
                    bcc: _bcc ? _bcc : this.option.Email.bcc,
                    subject: attachment.title,
                    htmlBody: this.renderHTML(attachment),
                    noReply: true
                };

                console.log({ notifyToEmail: emailOption });
                MailApp.sendEmail(emailOption);
            }
        }

        public notifyToSlack(ch: string,attachment: Slack.Attachement) {
            if (this.SlackBot) {
                return this.SlackBot.post(attachment, ch);
            }
        }

        public notifyToWorkplace(group_id: string, attachment: Slack.Attachement) {
            if (this.WorkplaceBot) {
                return this.WorkplaceBot.post(group_id, this.renderMarkdown(attachment));
            }
        }

        public notifyToWorkplaceChat(thread_key: string, attachment: Slack.Attachement) {
            if(this.WorkplaceBot){
                return this.WorkplaceBot.chat(thread_key, this.renderChatpost(attachment));
            }
        }

        public log(attachment: Slack.Attachement) {
            console.log({ log: attachment });
            Logger.log(JSON.stringify(attachment, null, 2));
        }

        private renderHTML(attachment: Slack.Attachement) {
            let html = '';

            html = attachment.pretext ? `<p>${attachment.pretext.replace('\n', '<br>\n')}</p>\n` : '';
            if (attachment.author_name) {
                html += attachment.author_link ? `<small><a href="${attachment.author_link}">${attachment.author_name}</a></small>` : `<small><${attachment.author_name}</small>`;
            }
            html += `<h2>${attachment.title}</h2>`;
            html += attachment.text ? `<p>${attachment.text.replace('\n', '<br>\n')}</p>` : '';
            if (attachment.fields) {
                html += attachment.fields.map(field => {
                    return `<p><b>${field.title}</b><br>\n${field.value}</p>`;
                }).join('\n');
            }
            html += attachment.footer ? `<small>${attachment.footer.replace('\n', '<br>\n')}</small>\n` : '';

            return html;
        }

        private renderMarkdown(attachment: Slack.Attachement) {
            let md = '';

            md = attachment.pretext ? `${attachment.pretext}` : '';
            md += '\n';
            if (attachment.author_name) {
                md += attachment.author_link ? `[${attachment.author_name}](${attachment.author_link})\n` : `(${attachment.author_name})\n`;
            }
            md += `# **${attachment.title}** \n`;
            md += attachment.text ? `${attachment.text.replace('\n', '  \n')}` : '';
            md += '\n';
            if (attachment.fields) {
                md += attachment.fields.map(field => {
                    return `**${field.title}**  \n${field.value}\n`;
                }).join('');
            }
            md += '\n';
            md += attachment.footer ? `----\n${attachment.footer.replace('\n', '  \n')}\n` : '';
            return md;
        }

        private renderChatpost(attachment: Slack.Attachement) {
            let chatpost = '';

            chatpost += attachment.pretext ? `${attachment.pretext}` : '';
            chatpost += `# *${attachment.title}* \n${attachment.text}\n`;
            if (attachment.fields) {
                chatpost += attachment.fields.map(field => {
                    return `# *${field.title}*\n${field.value}\n`;
                }).join('');
            }
            chatpost += '\n';
            chatpost += attachment.footer ? `----\n${attachment.footer}` : ''
            return chatpost;
        }
    }
}

export default NotificationKit