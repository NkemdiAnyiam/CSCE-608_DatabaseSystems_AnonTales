# Anon Tales
Anon Tales serves as a place where anyone can post stories completely anonymously. No one is allowed to create usernames, and the only way data is tied to each user is through their machines’ unique serial numbers. The service as a whole is more of a writing exercise for the users than anything—thousands of random, unconnected stories serve as inspiration for other writers, and user prompts further promote creativity. The idea is somewhat inspired by Reddit, where the ability to be completely anonymous is a defining feature of the site.

This project was created for an assignment in the Texas A&M University course CSCE 608: Database Systems. I chose not to launch a public website because I do not want to have to deal with heinous user behavior (innappropriate stories/reviews/prompts), but it can be downloaded and run locally. Part of the requirements included the ability to generate a large amount of data to populate the database; the process for doing so is in the instructions below.

## Installing MySQL
This project requires MySQL to be installed on your computer.
The following tutorial (starting at 8:39—"Downloading MySQL") shows how to install it and set it up: https://youtu.be/lz3HilC2bDs?t=516
Note that the .env file in the project assumes that there is no password required to access the database.

## Creating database and generating random data
1. In the /backend direction, open the .env file.
2. Change CREATE_DB to from false to true. This will cause the backend code to recreate and repopulate the database when the code is run.
3. Follow **Instructions** below.

## Instructions
0. This requires Node.js to run. If you do not have Node.js installed, please download here: https://nodejs.org/en/download
1. From the project root, run ```cd ./backend``` and run ```npm i``` to install necessary backend packages.
2. In that same directory, run ```npm run server``` to start the server (it will run on port 4000).
3. From the project root, run ```cd ./frontend``` and run ```npm i``` to install necessary frontend packages.
4. In that same directory, ```npm start``` to run the browser application.
5. Make sure BOTH the backend and frontend code is running at the same time.
