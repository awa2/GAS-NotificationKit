namespace Workplace {
    export const API_URL = 'https://graph.facebook.com';
    export class Bot {
        private token: string;
        constructor(token: string) {
            this.token = token;
            return this;
        }

        public post(group_id: string, message: string, link?: string) {
            const payload = {
                formatting: 'MARKDOWN',
                message: message,
                link: link ? link : ''
            }
            const res = JSON.parse(UrlFetchApp.fetch(`${API_URL}/${group_id}/feed`, {
                method: 'post',
                payload: payload,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return new Post(res.id as string, message, this.token);
        }

        public chat(group_id: string, message: string) {
            const payload = {
                message_type: "MESSAGE_TAG",
                recipient: {
                    thread_key: group_id
                },
                message: {
                    text: message
                }
            }
            const res = JSON.parse(UrlFetchApp.fetch(`${API_URL}/v2.6/me/messages`, {
                method: 'post',
                payload: payload,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return res;
        }
    }

    export class Post {
        public id: string;
        public message: string;
        private token: string;
        constructor(id: string, message: string, token: string) {
            this.id = id;
            this.message = message;
            this.token = token;
            return this;
        }
        public update(message: string, link?: string) {
            const payload = {
                formatting: 'MARKDOWN',
                message: message,
                link: link ? link : ''
            }
            this.send(this.id, payload);

        }
        private send(endpoint: string, payload: Object) {
            const res = JSON.parse(UrlFetchApp.fetch(`${API_URL}/${endpoint}`, {
                method: 'post',
                payload: payload,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                muteHttpExceptions: false
            }).getContentText());
            return res;
        }
    }
}
export default Workplace;