module.exports = {
  // your community or team name to display on join page.
  community: process.env.COMMUNITY_NAME || 'Test HackWimbledon',
  // your slack team url (ex: socketio.slack.com)
  slackUrl: process.env.SLACK_URL || '',
  // access token of slack
  // You can generate it in https://api.slack.com/web#auth
  //
  // You can test your token via curl:
  //   curl -X POST 'https://YOUR-SLACK-TEAM.slack.com/api/users.admin.invite' \
  //   --data 'email=EMAIL&token=TOKEN&set_active=true' \
  //   --compressed
  slacktoken: process.env.SLACK_TOKEN || '',
  meetupapikey: process.env.MEETUP_APIKEY || '4a1af4d230805b783f65176572e64',
  meetupgroup: process.env.MEETUP_GROUP || 'hackwimbledon',
  listenport: process.env.HW_PORT || 3000,
  millisecondsPerRefresh: process.env.REFRESH_EVENTS_MILLISECONDS || 3600000,
	newslocation: process.env.NEWS_LOCATION || 'news.json'
};
