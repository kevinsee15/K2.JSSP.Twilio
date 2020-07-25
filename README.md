# K2 Nexus Javascript Broker for Twilio

A JSSP based Twilio connector for K2 Nexus.

# Features

  - Developed using the new K2 Javascript Service Provider (JSSP) connector.
  - Interact with Twilio's Programmable SMS REST API through K2 SmartObjects.
  - Send SMS from K2 SmartForms and K2 Workflows.

## Getting Started

This template requires [Node.js](https://nodejs.org/) v12.14.1+ to run.

Install the dependencies and devDependencies:

```bash
npm install
```

See the documentation for [@k2oss/k2-broker-core](https://www.npmjs.com/package/@k2oss/k2-broker-core)
for more information about how to use the broker SDK package.

## Building your bundled JS
When you're ready to build your broker, run the following command

```bash
npm run build
```

You will find the results in the [dist/index.js](./dist/index.js).

## Creating a service type
Once you have a bundled .js file, upload it to your repository (anonymously
accessible) and register the service type using the system SmartObject located
at System > Management > SmartObjects > SmartObjects > JavaScript Service
Provider and run the Create From URL method.

## Configuring the Twilio Javascript Broker

1. Create a service instance with the service type you just created.
2. Set the "Authentication Mode" to "Static" and provide your Twilio Account ID as the "User Name", and your Twilio Auth Key as the "Password".
3. Set the "Authorization Header Format" to "Basic {0}:{1}".
4. Set the "Encode Authorization Header" to "true".
5. Provide your "Account ID" and "Default From". If the "Default From" is left empty, you must indicate a value for the SmartObject property "From".

### License

MIT, found in the [LICENSE](./LICENSE) file.

[www.k2.com](https://www.k2.com)
