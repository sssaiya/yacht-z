![Build and Deploy](https://github.com/sssaiya/yacht-z/workflows/Build%20and%20Deploy/badge.svg?branch=master)

# Yacht-z

### Commands

`npm run local`

Runs linters and validators, starts local firebase server and opens on port [5000](http://localhost:5000)

`npm run test`

Runs unit tests

`npm run lighthouse`

Runs Lighthouse report on localhost, result in lighthouse-localhouse-report.html

### Deployment

All Pushes to master on successfull checks will build website and deploy to

https://yacht-z.web.app/

And will generate an update Lighthouse report on

https://yacht-z.web.app/lighthouse-report.html