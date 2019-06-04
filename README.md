# Welcome to Guess the Number!

Here is a piece of instructions to quickly get started!

### Install packages 

To make things easier, only one package is being used, namely the http-server. This packages makes it easy to launch a local server to view the website. Go to the project directory and use the following command:

```
npm install
```

### Run the server

Once the package is installed, simply run the follwoing command to start a server and navigate to the given local IP address.

```
npm run server
```

### Chrome test

Since browsers are becoming more secure, we need to disable some browser securites in order to test on the local environment. Use the following command to start up Chrome with disabled security. (Use with caution and only for development purposes!)

For OSX

```
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

For other systems with chrome, visit [this handy website!](https://alfilatov.com/posts/run-chrome-without-cors/)

Run, test and enjoy!

#### Small note
The number checker is not returning a proper 400 when there is a param problem. It aLways returns a 200, unless that is intended.

