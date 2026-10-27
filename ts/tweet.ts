class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
    }

    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if (this.text.startsWith("Just completed") ||
            this.text.startsWith("Just posted")) {
            return "completed_event";
        }
        if (this.text.startsWith("Watch my")) {
            return "live_event";
        }
        if (
            this.text.startsWith("Achieved a new") ||
            this.text.startsWith("I just set a goal")) {
            return "achievement";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        return this.writtenText.length > 0;
    }

    get writtenText(): string {
        if (this.source !== "completed_event") {
            return "";
        }
        let text = this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#Runkeeper/gi, "")
            .trim();
        const separatorIndex = text.indexOf(" - ");
        if (separatorIndex === -1) {
            return "";
        }
        let comment = text.substring(separatorIndex + 3).trim();
        if (comment === "TomTom MySports Watch") {
            return "";
        }
        return comment;
    }

    get activityType(): string {
        if (this.source !== "completed_event") {
            return "unknown";
        }
        const distanceMatch = this.text.match(
            /^Just (?:completed|posted) an? \d+(?:\.\d+)?\s*(?:km|mi)\s+(.+?)(?=\s+with\s+@?Runkeeper|\s+-\s+|https?:\/\/|$)/i
        );
        if (distanceMatch) {
            return distanceMatch[1].trim();
        }
        const durationMatch = this.text.match(/^Just posted an? (.+?) in \d+:\d+(?::\d+)?/i);
        if (durationMatch) {
            return durationMatch[1].trim();
        }
        return "unknown";
    }

    get distance(): number {
        if (this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(/^Just (?:completed|posted) an? (\d+(?:\.\d+)?)\s*(km|mi)\b/i);
        if (!match) { return 0; }
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === "km") { return value / 1.609; }
        return value;
    }

    getHTMLTableRow(rowNumber: number): string {
        const escapeHTML = (text: string): string => {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        };
        const safeText = escapeHTML(this.text);
        const tweetWithLinks = safeText.replace(/https?:\/\/[^\s]+/g,
            (url: string) => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
        return `
        <tr>
            <td>${rowNumber}</td>
            <td>${escapeHTML(this.activityType)}</td>
            <td>${tweetWithLinks}</td>
        </tr>`;
    }
}