const { App, ExpressReceiver } = require('@slack/bolt');
const express = require("express");
const path = require("path");
const chatRouter = require('./routes/chatmodule');

// Create a Bolt Receiver
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// Create the Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

app.message('hello', async ({ message, say }) => {
    await say({
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `👋 Hello there <@${message.user}>`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Click Me",
                        "emoji": true
                    },
                    "action_id": "click_me_button"
                }
            }
        ]
    });
});

// Action listener function called when an interactive component with action_id of “click_me_button” is triggered
app.action('click_me_button', async ({ ack, body, client, say }) => {
    // Acknowledge action request before anything else
    await ack();
    let channelID = body.channel.id
    let userID = body.user.id
    // Respond to action with an ephemeral message
    await client.chat.postEphemeral({
    channel: channelID,
    user: userID,
    text: `<@${userID}> clicked the button! 🎉 `
  });
});

receiver.router.use(express.static("public"));

receiver.router.use('/', chatRouter);

receiver.router.use(express.static(path.join(__dirname, 'build')));

(async () => {
  await app.start(8080);
  console.log('app is running');
})();