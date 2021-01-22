# 3Pixel Backend API

The api for the 3Pixel website. This is a REST api with JWT based authentication.

If you need help getting started PM **Kaffe#9547** on discord.

## Developing Locally

-   Install [NodeJS](https://nodejs.org/). This projects requires version 14 or up. Feel free to download the "Current" one.
-   Install [MongoDB](https://www.mongodb.com/). Here is a guide you might find useful: [MongoDB Guide - Getting Started](https://dev.to/drminnaar/mongodb-guide---getting-started--22nk).
-   Clone the repo
    -   `git clone https://github.com/3Pixel-Organization/website-backend.git`
-   Navigate into the project folder
    -   `cd website-backend`
-   Install the dependencies
    -   `npm install`
-   Copy the .env.example file into `.env `, these variables are secret stuff the project needs to function and should not be commited to git.
    -   `cp .env.example .env`
-   Start the MongoDB database.
-   Now you can start the 3Pixel backend in development mode.
    -   `npm run dev`

## Scripts

**npm start**  Starts the server.

**npm run dev**  Starts the server in development mode.

**npm lint**  Runs the linter to find errors.

**npm format**  Runs the formatter to make the code pretty.

**npm test**  TBD.

## Notable Dependencies

-   [Express](http://expressjs.com/)
    -   The framework that is the heart of this application. This is what accepts the [HTTP requests](https://developer.mozilla.org/en-US/docs/Web/HTTP) and send the responses.
-   [Ponaserv](https://www.npmjs.com/package/ponaserv)
    -   A framework over express used to organize the application into more manageable services.
-   [Mongoose](https://mongoosejs.com/)
    -   Mongoose is a MongoDB object modeling tool. We use it to define our data models and interact with our MongoDB data.
