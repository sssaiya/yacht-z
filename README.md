[![Build and Deploy](https://github.com/sssaiya/yacht-z/workflows/Build%20and%20Deploy/badge.svg?branch=master)](https://github.com/sssaiya/yacht-z/actions?query=workflow%3A%22Build+and+Deploy%22) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/2ac452595d5f44ba85536baca398893a)](https://app.codacy.com/manual/sssaiya/yacht-z?utm_source=github.com&utm_medium=referral&utm_content=sssaiya/yacht-z&utm_campaign=Badge_Grade_Dashboard)

# Yacht-z

## Commands

`npm run local`

Runs linters and validators, starts local firebase server and opens on port [5000](http://localhost:5000)

`npm run test`

Runs unit tests

`npm run lighthouse`

Runs Lighthouse report on localhost, result in lighthouse-localhouse-report.html

## Deployment

All Pushes to master on successfull checks will build website and deploy to

[Yacht-Z-App](https://yacht-z.web.app/)

And will generate an update Lighthouse report on

[Lighthouse](https://yacht-z.web.app/lighthouse-report.html)
