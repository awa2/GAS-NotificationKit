import { Slack, Attachement } from '@ts-module-for-gas/gas-slack';
import { Workplace, ChatTemplate } from '@ts-module-for-gas/gas-workplace';

namespace NotificationKit {
    export type Option = {
        SlackBot?: {
            BOT_NAME: string,
            TOKEN: string,
        },
        WorkplaceBot?: {
            TOKEN: string,
        }
    }
    export class Bot {
        private option: NotificationKit.Option;
        public SlackBot?: Slack.Bot;
        public WorkplaceBot?: Workplace.Bot;
        public static Option = {}

        constructor(option: NotificationKit.Option) {
            this.option = option;
            if (option.SlackBot) {
                Slack.setToken(option.SlackBot.TOKEN);
                this.SlackBot = Slack.createBot(option.SlackBot.BOT_NAME);
            }
            if (option.WorkplaceBot) {
                Workplace.setToken(option.WorkplaceBot.TOKEN);
                this.WorkplaceBot = Workplace.createBot();
            }
            return this;
        }

        public notifyToEmail(email: { to: string, cc?: string, bcc?: string }, attachment: Attachement) {
            const emailOption = {
                to: email.to,
                cc: email.cc ? email.cc : '',
                bcc: email.bcc ? email.bcc : '',
                subject: attachment.title,
                htmlBody: this.renderHTML(attachment),
                noReply: true
            };

            console.log({ notifyToEmail: emailOption });
            MailApp.sendEmail(emailOption);
        }

        public notifyToSlack(ch: string, attachment: Attachement) {
            if (this.SlackBot) {
                return this.SlackBot.post(ch, attachment);
            }
        }

        public notifyToWorkplace(group_id: string, attachment: Attachement) {
            if (this.WorkplaceBot) {
                if (attachment.title_link) {
                    return this.WorkplaceBot.post(group_id, this.renderMarkdown(attachment), attachment.title_link);
                } else {
                    return this.WorkplaceBot.post(group_id, this.renderMarkdown(attachment));
                }
            }
        }

        public notifyToWorkplaceChat(thread_key: string, attachment: Attachement) {
            if (this.WorkplaceBot) {
                let res;
                if (attachment.pretext) {
                    res = this.WorkplaceBot.chat(thread_key, attachment.pretext);
                }

                let payload1: any = {
                    template_type: 'list',
                    top_element_style: 'large',
                    elements: [{
                        title: attachment.title ? attachment.title.slice(0, 79) : "Notification",
                        subtitle: attachment.text ? attachment.text.slice(0, 79) : '',
                    }]
                }
                if (attachment.thumb_url || attachment.image_url) {
                    payload1.elements[0].image_url = attachment.thumb_url ? attachment.thumb_url : attachment.image_url;
                }
                if (attachment.fields) {
                    // elements has max 4: 1-3
                    attachment.fields.some((field, i) => {
                        payload1.elements.push({
                            title: field.title,
                            subtitle: field.value
                        });
                        return i === 2; // stop on 3
                    });
                    res = this.WorkplaceBot.chat(thread_key, { type: 'template', payload: payload1 });

                    if (attachment.fields.length > 3) {
                        let payload2: any = {
                            template_type: 'generic',
                            elements: []
                        }
                        attachment.fields.forEach((field, i) => {
                            if (i > 2) {
                                payload2.elements.push({
                                    title: field.title,
                                    subtitle: field.value
                                })
                            }
                        })
                        res = this.WorkplaceBot.chat(thread_key, { type: 'template', payload: payload2 });
                    }
                }



                return attachment.title_link ?
                    this.WorkplaceBot.chat(thread_key, attachment.title_link) : res;
            }
        }

        public log(attachment: Attachement) {
            console.log({ log: attachment });
            Logger.log(JSON.stringify(attachment, null, 2));
        }

        private renderHTML(attachment: Attachement) {
            let html = '';

            html = attachment.pretext ? `<p>${attachment.pretext.replace('\n', '<br>\n')}</p>\n` : '';

            if (attachment.author_name) {
                html += attachment.author_link ? `<small><a href="${attachment.author_link}">${attachment.author_name}</a></small>` : `<small>${attachment.author_name}</small>`;
            }
            if (attachment.title) {
                html += attachment.title_link ? `<h2><a href="${attachment.title_link}">${attachment.title}</a></h2>` : `<h2>${attachment.title}</h2>`;
            }

            html += attachment.text ? `<p>${attachment.text.replace('\n', '<br>\n')}</p>` : '';

            if (attachment.fields) {
                html += attachment.fields.map(field => {
                    return `<p><b>${field.title}</b><br>\n${field.value}</p>`;
                }).join('\n');
            }
            html += attachment.footer ? `<small>${attachment.footer.replace('\n', '<br>\n')}</small>\n` : '';

            return html;
        }

        private renderMarkdown(attachment: Attachement) {
            let md = '';

            md = attachment.pretext ? `${attachment.pretext}` : '';
            md += '\n';
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
            if (attachment.author_name) {
                md += attachment.author_link ? `posted by [${attachment.author_name}](${attachment.author_link})\n` : `posted by [${attachment.author_name}]\n`;
            }
            return md;
        }

        private renderChatpost(attachment: Attachement) {
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