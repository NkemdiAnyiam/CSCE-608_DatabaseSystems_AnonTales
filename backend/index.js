const express = require('express');
const bodyParser = require('body-parser');
const routesHandler = require('./routes/handler.js');
require('dotenv/config');
const pool = require('./config/db.js');
const serialNumber = require('serial-number');
const randomWords = require('random-words');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/', routesHandler);

const Users = require('./schemas/Users.js');
const Stories = require('./schemas/Stories.js');
const Reviews = require('./schemas/Reviews.js');
const Genres = require('./schemas/Genres');
const Prompts = require('./schemas/Prompts.js');
const Rated = require('./schemas/Rated.js');
const FallsUnder = require('./schemas/FallsUnder.js');
const PromptsGenre = require('./schemas/PromptsGenre.js');
const Thumbed = require('./schemas/Thumbed.js');

const {
    randomDate,
    randomInt,
    randomEntry,
    getRandomArrayValue,
    getRandomTruth,
    sqlInsert
} = require('./utils/utilFunctions');

// Run seed
function populateDB() {
    fs.readFile('../random_serials.txt', 'utf8', (err, data) => {
        if (err) {
            throw new Error(err);
        }
        const fakeSerialNumbers = data.split(/\r?\n?\s/);
    
        const users = [];
        const stories = [];
        const reviews = [];
        const genres = [
            'Fantasy',
            'Science Fiction',
            'Action / Adventure',
            'Mystery',
            'Horror',
            'Romance',
            'Biography',
            'True Crime',
            'Comedy',
            'Non-fiction',
            'Poetry',
            'Children',
            'Young Adult'
        ].map(genre_name => Genres.create(genre_name));
        const prompts = [];
    
        const rated = [];
        const thumbed = [];
        const fallsUnder = [];
        const promptsGenre = [];
    
        fakeSerialNumbers.forEach(serial => {
            // GENERATE USER
            const author = Users.create(serial);
            users.push(author);
    
            // GENERATE STORIES BY USER
            const numStories = randomInt(0, 4);
            for (let i_stories = 0; i_stories < numStories; ++i_stories) {
                // GENERATE STORY
                const story = Stories.create(uuidv4(), author.serial_no, randomWords(randomInt(1, 5)).join(' '), randomEntry(10), randomDate(new Date(2012, 0, 1)));
                stories.push(story);
    
                // GENERATE FALLS-UNDER FOR STORY
                const numFallsUnder = randomInt(0, 3);
                const usedFallsUnderGenres = [];
                for (let i_fallsUnder = 0; i_fallsUnder < numFallsUnder; ++ i_fallsUnder) {
                    // GENERATE FALLS-UNDER
                    const genre_name = getRandomArrayValue(genres).genre_name;
                    if (usedFallsUnderGenres.includes(genre_name)) { --i_fallsUnder; continue; }
                    usedFallsUnderGenres.push(genre_name);
                    fallsUnder.push(FallsUnder.create(story.story_id, genre_name));
                }
    
                // GENERATE RATINGS FOR STORY
                const numRatings = randomInt(0, 100);
                const bias = randomInt(1, 5);
                const invalidRaterSerials = [author.serial_no];
                for (let i_ratings = 0; i_ratings < numRatings; ++i_ratings) {
                    // GENERATE RATING
                    const raterSerial = getRandomArrayValue(fakeSerialNumbers);
                    if (invalidRaterSerials.includes(raterSerial)) { --i_ratings; continue; }
                    invalidRaterSerials.push(raterSerial);
                    rated.push(Rated.create(story.story_id, raterSerial, getRandomTruth(0.25) ? bias : randomInt(1, 5)));
                }
    
                // GENERATE REVIEWS FOR STORY
                const numReviews = randomInt(0, 10);
                const invalidReviewerSerials = [author.serial_no]; // array of serials that should not be used (including curr user cause can't review own story)
                for (let i_reviews = 0; i_reviews < numReviews; ++i_reviews) {
                    // GENERATE REVIEW
                    const reviewerSerial = getRandomArrayValue(fakeSerialNumbers); // select random user serial as review author
                    if (invalidReviewerSerials.includes(reviewerSerial)) { --i_reviews; continue; } // if serial was already used or matches story author's serial, skip
                    invalidReviewerSerials.push(reviewerSerial);
                    const review = Reviews.create(story.story_id, reviewerSerial, randomEntry(4), randomDate(new Date(story.publish_date)));
                    reviews.push(review);
    
                    // GENERATE THUMBS
                    const numThumbs = randomInt(0, 20);
                    const percentagePositive = Math.random();
                    const invalidThumberSerials = [reviewerSerial]; // array of serials that shouldn't be used (including curr user cause can't thumb own review)
                    for (let i_thumbs = 0; i_thumbs < numThumbs; ++i_thumbs) {
                        // GENERATE THUMB
                        const thumberSerial = getRandomArrayValue(fakeSerialNumbers);
                        if (invalidThumberSerials.includes(thumberSerial)) { --i_thumbs; continue; }
                        invalidThumberSerials.push(thumberSerial);
                        const bin_value = getRandomTruth(percentagePositive) ? 1 : 0;
                        thumbed.push(Thumbed.create(story.story_id, review.user_serial_no, thumberSerial, bin_value));
                    }
                }
            }
    
            // GENERATE PROMPTS BY USER
            const numPrompts = randomInt(0, 2);
            for (let i_prompts = 0; i_prompts < numPrompts; ++i_prompts) {
                // GENERATE PROMPT
                const prompt = Prompts.create(uuidv4(), author.serial_no, randomEntry(2), randomDate(new Date(2012, 0, 1)));
                prompts.push(prompt);
    
                // GENERATE PROMPTS-GENRE FOR PROMPT
                const numPromptsGenres = randomInt(0, 3);
                const usedPromptGenres = [];
                for (let i_promptsGenres = 0; i_promptsGenres < numPromptsGenres; ++i_promptsGenres) {
                    // GENERATE PROMPT-GENRE
                    const genre_name = getRandomArrayValue(genres).genre_name;
                    if (usedPromptGenres.includes(genre_name)) { --i_promptsGenres; continue; }
                    usedPromptGenres.push(genre_name);
                    promptsGenre.push(PromptsGenre.create(prompt.prompt_id, genre_name));
                }
            }
        });
    
        (async () => {
            console.log('***POPULATING DATABASE...***');
            await sqlInsert(pool, Users, users, 100);
            await sqlInsert(pool, Stories, stories);
            await sqlInsert(pool, Reviews, reviews);
            await sqlInsert(pool, Genres, genres, 100);
            await sqlInsert(pool, Prompts, prompts);
    
            await sqlInsert(pool, Rated, rated, 100);
            await sqlInsert(pool, FallsUnder, fallsUnder, 200);
            await sqlInsert(pool, Thumbed, thumbed, 100);
            await sqlInsert(pool, PromptsGenre, promptsGenre, 500);
            console.log('***FINISHED POPULATING DATABASE***');
        })();
    });
}
// populateDB();

/*
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'frontend/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'frontend/build', routesHandler));
    });
}
*/

const PORT = process.env.PORT || 4000; // backend routing port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
