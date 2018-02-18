module.exports = function (config, request, dateFormat) {
    var _projects;
    var lastUpdate;
    var _version = "1.0.0";
 //   var self = this;

    var client = require('graphql-client')({
        url: 'https://api.github.com/graphql',
        headers: {
            Authorization: 'Bearer ' + config.githubpat
        }
    })

    function retrieveProjects(callback) {
        let variables = {};
        client.query(`{
        search(query: "is:public fork:true topic:hackwimbledon", type: REPOSITORY, first: 50) {
          repositoryCount
          pageInfo {
            endCursor
            startCursor
          }
          edges {
            node {
              ... on Repository {
                nameWithOwner
                description
                url
                name
              }
            }
          }
        }
      }`, variables, function (req, res) {
                if (res.status === 401) {
                    throw new Error('Not authorized')
                }
            })
            .then(function (body) {
                _projects={}
                for (var p of body.data.search.edges) {
                    console.log(p)
                    _projects[p.node.nameWithOwner]=p.node;
                }
                console.log(_projects)
                callback(_projects)
            })
            .catch(function (err) {
                console.log(err.message)
            });
    }

    function updateProjects(callback) {
        // Is the cache valid - lastUpdate should be set and time within our refresh period.

        var dt = new Date();
        if (lastUpdate != undefined && dt.getTime() - lastUpdate.getTime() < config.millisecondsPerRefresh) {
            callback(_projects);
            return;
        }

        // Not fresh so lets update the events...

        retrieveProjects(function (projects) {
            lastUpdate = new Date();
            callback(projects);
        });
    }

    function getProjects(callback) {
        updateProjects(function (projects) {
           callback(projects);
        });
    }

    var objToRet = {
        version: _version,
        getProjects: getProjects,
        updateProjects: updateProjects,
        projects: _projects,
        dateFormat: dateFormat
    }

    return objToRet;
}