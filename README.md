# untapped-slack-app

This Node.js project leverages the Untappd API to retrieve beer checkin data about a specific venue. It will then expose that data through a REST API which will format the output using Slack block formatting for cleaner integration with Slack. 

The original goal of this project was to help co-workers identify if a lot of people are currently drinking at the office and what they're drinking by issuing a Slack slash command.

## Pre-requisites

* An [Untappd API key](https://untappd.com/api/docs)
* A [Slack workspace](https://slack.com/)
* A host for the REST API such as [Heroku](https://www.heroku.com/)
* [Node.js](https://nodejs.org/en/)

## REST API

### `GET /api/beers`

This call will check a venue to see what beers were recently checked in and list them and their ratings. This will let the end user know what people have recently drank at a specific venue.

### `GET /api/party`

This call will see how many people have checked in recently at a specific venue and let the end user know whether it's worth going to a venue.

## Deployment

Deploy the application to a service provider which can be accessible by your Slack workspace. For development purposes, Heroku is very convenient as you can use the free tier to deploy. The [Getting Started guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true) would be a good place to start for learning how to deploy an application.

## Slack application

Make sure you have permission to add applications to your Slack workspace. Create a new application and add the following slash commands:

### `/beers`

        Command: /beers
        Request URL: http://myhost/api/beers
        Short Description: List beers at my venue

### `/party`

        Command: /party
        Request URL: http://myhost/api/beers
        Short Description: Is there a party at my venue?

## Future work

* The party function doesn't differentiate check-ins by distinct users. This should be updated to hash the check-in names to get a better count of people drinking
* Make the venue id into a query parameter for the REST API which can then be set by the resulting Slack application. This would let a single backend handle multiple Slack deployments for different venues
* Temporarily cache the Untappd API call results to help with the rate limiting of calls
* Clean up Node package list to only contain modules that are used by the application
