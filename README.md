# Node Campaigns

This is a little application I cobbled together...

    1. to manage my growing collection of BattleTech materials.
    2. to see how fast I could learn myself Node.JS and tinker with SQL.
    3. to allow some advice from generative AI to enter my workflow.

You can see it in action at [Render](https://node-campaigns.onrender.com). It's hosted on a free account, so give it some time to spin up.

## About this repository
You're free to use this package as you see fit. You'll need to have node.js installed. Run the following commands in your project folder.

### Set up the SQLLite3 database
This reads all the project's CSV files supplied by the Terminus project. At the moment the collection is limited to BattleMechs.

``
node createdb.js
``

### Run the server
This command spins up a simple express server on your localhost. While in development, you should see some SQL debug messages in your console.

``
node server.js
``

Your server should run at *localhost:3025*.