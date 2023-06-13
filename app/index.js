const axios = require("axios");
const fs = require("fs");

const fetchComponentsAPI = () => {
    return axios.get("https://herocoders.atlassian.net/rest/api/3/project/SP/components");
}

const fetchIssuesAPI = () => {
    return axios.get("https://herocoders.atlassian.net/rest/api/3/search?jql=project=SP");
}

const getComponentsWithIssues = (components, issues) => {
    components = components.filter(one => !("lead" in one));

    let tempPos = {};
    for(let i=0; i<components.length; i++) {
        tempPos[components[i].id] = i;
        components[i].issues = [];
    }

    for(let i=0; i<issues.length; i++) {
        const issue = issues[i];
        issue.fields?.components?.forEach(one => {
            if(!tempPos[one.id])
                return;
            components[tempPos[one.id]].issues.push(issue);
        })
    }

    return components;
}

exports.startApp = async () => {
    let components = issues = [];

    await Promise.all([ fetchComponentsAPI(), fetchIssuesAPI() ]).then(res => {
        components = res[0].data;
        issues = res[1].data.issues;
    })

    const result = getComponentsWithIssues(components, issues);
    fs.writeFile("./output/output.json", JSON.stringify(result), err => {
        if(err) {
            console.log("Error has occurred while output!", err);
            return;
        }
        console.log("Output success!");
    });
}
