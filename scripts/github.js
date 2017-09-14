const GitHubApi = require("github")

const github = new GitHubApi({
  Promise: require("bluebird")
})

const regex = /https:\/\/github.com\/(.*)\/(.*)\/pull\/(\d*)/i

const getPRInfo = function({owner, repo, number}) {
    github.authenticate({
        type: 'token',
        token: process.env.GH_TOKEN
    })
    
    return github.pullRequests.get({
        owner: owner,
        repo: repo,
        number: number
    })
}

const formatGHInfo = function(info) {
    return {
        attachments: [
            {
                "author_name": info.user.login,
                title: info.title,
                text: info.body,
                fields: [
                    {
                        title: "State",
                        value: info.body,
                        short: true
                    },
                    {
                        title: "Base",
                        value: info.base.ref,
                        short: true
                    }
                ]
            }
        ]
    }
}

const sendMessage = async function(msg) {
    const [, owner, repo, number] = msg.match
    try {
        const {data} = await getPRInfo({owner, repo, number})
        const formattedInfo = formatGHInfo(data)
        msg.send(formattedInfo)
    } catch(err) {
        console.log(err)
    }
}

module.exports = function(robot) {
    robot.hear(regex, sendMessage)
}