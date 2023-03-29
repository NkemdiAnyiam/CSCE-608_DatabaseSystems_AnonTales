const express = require('express');
const router = express.Router();
const pool =  require('../config/db.js');
const serialNumber = require('serial-number');
const { v4: uuidv4 } = require('uuid');

const Users = require('../schemas/Users.js');
const Stories = require('../schemas/Stories.js');
const Reviews = require('../schemas/Reviews.js');
const Prompts = require('../schemas/Prompts.js');
const Genres = require('../schemas/Genres.js');
const FallsUnder = require('../schemas/FallsUnder.js');
const PromptsGenre = require('../schemas/PromptsGenre.js');
const Rated = require('../schemas/Rated.js');
const Thumbed = require('../schemas/Thumbed.js');

const {
    currentDate,
    minifySqlQuery,
    nullDefault,
    sqlInsertStatement,
    sqlUpdateStatement,
    sqlDeleteStatement,
} = require('../utils/utilFunctions.js');

const getSerialNumber = () => {
    return new Promise((resolve, reject) => {
        serialNumber((err, serial) => {
            if (err) reject(err);
            resolve(serial);
        })
    })
}

router.get('/serialNo', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    res.send(JSON.stringify({serial_no: user_serial_no}));
});

router.post('/addUser', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                INSERT INTO Users(serial_no) VALUES ('${user_serial_no}');
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) {reject(err); return;}
                // console.log(result);
                console.log('New user addeed');
                resolve(result);
            });
        });
    })
    .then((result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.delete('/deleteUser', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = sqlDeleteStatement(Users, `serial_no = '${user_serial_no}'`);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err){reject(err); return;};
                console.log('User deleted');
                resolve(result);
            });
    
            // res.redirect('/stories');
            res.end();
        });
    })
    .then((result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.get('/userExists', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT serial_no
                FROM Users
                WHERE serial_no = '${user_serial_no}'
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) {reject(err); return;}
                resolve(result.length > 0);
            });
        });
    })
    .then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
})

router.get('/stories', async (req, res) => {
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT Stories.story_id, Stories.user_serial_no, title, genre_names, text_content, IFNULL(AVG(rating), 0) avg_rating, COUNT(rating) num_ratings, publish_date
                FROM (
                    SELECT Stories.story_id, GROUP_CONCAT(genre_name) AS genre_names
                    FROM Stories LEFT JOIN FallsUnder ON (Stories.story_id = FallsUnder.story_id)
                    GROUP BY story_id
                    ORDER BY title
                ) AS result NATURAL JOIN Stories LEFT JOIN Rated ON Stories.story_id = Rated.story_id
                GROUP BY story_id;
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) {reject(err); return;}
                resolve(result);
            });
        });
    })
    .then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

const getStory = async story_id => {
    const user_serial_no = await getSerialNumber();
    return new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT Stories.story_id, Stories.user_serial_no, title, genre_names, text_content, AVG(rating) avg_rating, COUNT(rating) num_ratings, publish_date,
                    SUM(CASE
                    WHEN Rated.user_serial_no = '${user_serial_no}' THEN rating
                    ELSE NULL
                    END
                    ) AS my_rating
                FROM (
                    SELECT Story.story_id, GROUP_CONCAT(genre_name) AS genre_names
                    FROM
                        (
                            SELECT story_id
                            FROM Stories
                            WHERE story_id = '${story_id}'
                        ) AS Story LEFT JOIN FallsUnder ON (Story.story_id = FallsUnder.story_id)
                    GROUP BY story_id
                ) AS Result NATURAL JOIN Stories LEFT JOIN Rated ON Stories.story_id = Rated.story_id
                GROUP BY story_id;
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) {reject(err); return;}
                resolve(result);
            });
        });
    })
}

router.get('/story', async (req, res) => {
    const {story_id} = req.query;
    getStory(story_id)
    .then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        console.error('--------ERROR IN get /story: ', err);
        res.status(500).end();
    });    
});

router.post('/addStory', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        try {
            const {storyFields, genresArray} = req.body;
            const story = Stories.create(uuidv4(), user_serial_no, storyFields.title, storyFields.text_content.replace("'", "''"), currentDate());
            const fallsUnder = genresArray.map(genreFields => {
                return FallsUnder.createFrom(story, Genres.create(genreFields.genre_name))
            });

            pool.getConnection( (err, conn) => {
                if (err) throw err;
                let failState = false;

                conn.beginTransaction((err) => {
                    if (err) {
                        conn.release();
                        throw err;
                    }

                    conn.query(`${sqlInsertStatement(Stories, story)}`, (err, result) => {
                        if (err) { conn.rollback(() => conn.release()); reject(err); failState = true; }
                    });

                    if (fallsUnder.length > 0)
                    conn.query(`${sqlInsertStatement(FallsUnder, fallsUnder)}`, (err, result) => {
                        if (failState) return;
                        if (err) { conn.rollback(() => conn.release()); reject(err); failState = true; }
                    });

                    conn.commit((err)=> {
                        if (failState) return;
                        if (err) { conn.rollback(() => conn.release()); reject(err); return; }
                        console.log('Story added');
                        resolve();
                    });
                });
            });
        }
        catch(err) {
            console.error('--------ERROR IN /addStory: ');
            throw err;
        }
    })
    .then((result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});


router.get('/genres', async (req, res) => {
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT genre_name FROM Genres ORDER BY genre_name;
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) {reject(err); return;}
                resolve(result);
            });
        });
    })
    .then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });    
});

router.get('/reviews', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    const {story_id} = req.query;
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT user_serial_no, text_content, publish_date, ${nullDefault('num_thumbs_up',0)}, ${nullDefault('num_thumbs_down',0)}, my_thumb_value
                FROM (
                    SELECT user_serial_no, text_content, publish_date
                    FROM Reviews
                    WHERE story_id = '${story_id}'
                ) AS StoryReviews LEFT JOIN (
                    SELECT
                        reviewer_serial_no,
                        SUM(CASE bin_value WHEN 1 THEN 1 ELSE 0 END) num_thumbs_up,
                        SUM(CASE bin_value WHEN 0 THEN 1 ELSE 0 END) num_thumbs_down,
                        SUM(CASE
                            WHEN user_serial_no = '${user_serial_no}' THEN (
                                CASE
                                WHEN bin_value = 1 THEN 1
                                ELSE 0
                                END
                            )
                            ELSE NULL
                            END
                        ) AS my_thumb_value
                    FROM Thumbed
                    WHERE story_id = '${story_id}'
                    GROUP BY reviewer_serial_no
                ) AS StoryReviewsThumbs ON (StoryReviews.user_serial_no = StoryReviewsThumbs.reviewer_serial_no)
                ORDER BY publish_date DESC;
            `);
            conn.query(qry, (err, result) => {
                // console.log(result);
                conn.release();
                if (err) throw err;
                resolve(result);
            });
        });
    })
    .then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        console.error('--------ERROR IN /reviews: ', err);
        res.status(500).end();
    });    
});

const getReview = async (story_id, user_serial_no) => {
    return new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT user_serial_no, text_content, publish_date, ${nullDefault('num_thumbs_up',0)}, ${nullDefault('num_thumbs_down',0)}, my_thumb_value
                FROM (
                    SELECT user_serial_no, text_content, publish_date
                    FROM Reviews
                    WHERE (story_id, user_serial_no) = ('${story_id}', '${user_serial_no}')
                ) AS StoryReviews LEFT JOIN (
                    SELECT
                        reviewer_serial_no,
                        SUM(CASE bin_value WHEN 1 THEN 1 ELSE 0 END) num_thumbs_up,
                        SUM(CASE bin_value WHEN 0 THEN 1 ELSE 0 END) num_thumbs_down,
                        SUM(CASE
                            WHEN user_serial_no = '${user_serial_no}' THEN (
                                CASE
                                WHEN bin_value = 1 THEN 1
                                ELSE 0
                                END
                            )
                            ELSE NULL
                            END
                        ) AS my_thumb_value
                    FROM Thumbed
                    WHERE story_id = '${story_id}'
                    GROUP BY reviewer_serial_no
                ) AS StoryReviewsThumbs ON (StoryReviews.user_serial_no = StoryReviewsThumbs.reviewer_serial_no)
            `);
            conn.query(qry, (err, result) => {
                // console.log(result);
                conn.release();
                if (err) throw err;
                resolve(result);
            });
        });
    })
}

router.post('/addReview', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {   
        try {
            const {reviewFields} = req.body;
            const review = Reviews.create(reviewFields.story_id, user_serial_no, reviewFields.text_content.replace("'", "''"), currentDate());

            pool.getConnection( (err, conn) => {
                if (err) throw err;

                const qry = sqlInsertStatement(Reviews, review);
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) {reject(err); return;}
                    console.log('New review added');
                    resolve(review);
                });
            });
        }
        catch(err) {
            reject(err);
        }
    })
    .then(async (result) => {
        const newReview = (await getReview(result.story_id, user_serial_no))[0];
        res.send(JSON.stringify(newReview));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.delete('/deleteReview', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    const {
        story_id,
    } = req.body.reviewFields;

    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = sqlDeleteStatement(Reviews, `(story_id, user_serial_no) = ('${story_id}', '${user_serial_no}')`);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err){reject(err); return;};
                console.log('Review deleted');
                resolve(result);
            });
        });
    })
    .then(async (result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.get('/prompts', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = minifySqlQuery(`
                SELECT Prompts.prompt_id, Prompts.user_serial_no, GROUP_CONCAT(genre_name) AS genre_names, text_content, publish_date
                FROM Prompts LEFT JOIN PromptsGenre ON (Prompts.prompt_id = PromptsGenre.prompt_id)
                GROUP BY prompt_id
                ORDER BY publish_date DESC
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) {reject(err); return;}
                resolve(result);
            });
        });
    })
    .then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });    
});

router.post('/addPrompt', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        try {
            const {promptFields, genresArray} = req.body;
            const prompt = Prompts.create(uuidv4(), user_serial_no, promptFields.text_content, currentDate());
            const promptsGenre = genresArray.map(genreFields => {
                return PromptsGenre.createFrom(prompt, Genres.create(genreFields.genre_name));
            });

            pool.getConnection( (err, conn) => {
                if (err) throw err;
                let failState = false;

                conn.beginTransaction((err) => {
                    if (err) {
                        conn.release();
                        throw err;
                    }

                    conn.query(`${sqlInsertStatement(Prompts, prompt)}`, (err, result) => {
                        if (err) { conn.rollback(() => conn.release()); reject(err); failState = true; }
                    });

                    if (promptsGenre.length > 0)
                    conn.query(`${sqlInsertStatement(PromptsGenre, promptsGenre)}`, (err, result) => {
                        if (failState) return;
                        if (err) { conn.rollback(() => conn.release()); reject(err); failState = true; }
                    });

                    conn.commit((err)=> {
                        if (failState) return;
                        if (err) { conn.rollback(() => conn.release()); reject(err); return; }
                        console.log('Prompt added');
                        resolve();
                    });
                });
            });
        }
        catch(err) {
            console.error('--------ERROR IN /addPrompt: ');
            throw err;
        }
    })
    .then((result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.post('/addRating', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
        try {
            const {
                story_id,
                rating
            } = req.body.ratingFields;
            const rated = Rated.create(story_id, user_serial_no, rating);
    
                pool.getConnection( (err, conn) => {
                    if (err) throw err;
        
                    const qry = sqlInsertStatement(Rated, rated);
                    conn.query(qry, (err, result) => {
                        conn.release();
                        if (err) {reject(err); return;}
                        console.log(`Rating ${rating} added`);
                        resolve(result);
                    });
                });
        }
        catch(err) {
            console.error('--------ERROR IN /addRating: ');
            throw err;
        }
    })
    .then(async (result) => {
        const updatedStory = (await getStory(req.body.ratingFields.story_id))[0];
        const ratingData = {};
        ratingData.avg_rating = updatedStory.avg_rating;
        ratingData.num_ratings = updatedStory.num_ratings;
        ratingData.my_rating = updatedStory.my_rating;
        res.send(JSON.stringify(ratingData));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.put('/updateRating', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    try {
        const {
            story_id,
            rating
        } = req.body.ratingFields;

        new Promise((resolve, reject) => {
            pool.getConnection( (err, conn) => {
                if (err) throw err;

                const qry = sqlUpdateStatement(
                    Rated,
                    `rating = ${rating}`,
                    `(story_id, user_serial_no) = ('${story_id}', '${user_serial_no}')`
                );
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) {reject(err); return;};
                    console.log('Rating updated');
                    resolve(result);
                });
            });
        })
        .then(async (result) => {
            const updatedStory = (await getStory(req.body.ratingFields.story_id))[0];
            const ratingData = {};
            ratingData.avg_rating = updatedStory.avg_rating;
            ratingData.num_ratings = updatedStory.num_ratings;
            ratingData.my_rating = updatedStory.my_rating;
            res.send(JSON.stringify(ratingData));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    }
    catch(err) {
        console.error('--------ERROR IN /updateRating: ');
        throw err;
    }
});

router.delete('/deleteRating', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    const {
        story_id,
    } = req.body.ratingFields;

    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = sqlDeleteStatement(Rated, `(story_id, user_serial_no) = ('${story_id}', '${user_serial_no}')`);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err){reject(err); return;};
                console.log('Rating deleted');
                resolve(result);
            });
        });
    })
    .then(async (result) => {
        const updatedStory = (await getStory(req.body.ratingFields.story_id))[0];
        const ratingData = {};
        ratingData.avg_rating = updatedStory.avg_rating;
        ratingData.num_ratings = updatedStory.num_ratings;
        ratingData.my_rating = updatedStory.my_rating;
        res.send(JSON.stringify(ratingData));
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.post('/addThumb', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    new Promise((resolve, reject) => {
    try {
        const {
            reviewer_serial_no, 
            story_id,
            bin_value,
        } = req.body;
        const thumbed = Thumbed.create(story_id, reviewer_serial_no, user_serial_no, bin_value);

            pool.getConnection( (err, conn) => {
                if (err) throw err;
    
                const qry = sqlInsertStatement(Thumbed, thumbed);
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) {reject(err); return;}
                    console.log(`Thumb ${bin_value === 1 ? 'up' : 'down'} added`);
                    resolve(result);
                });
            });
    }
    catch(err) {
        console.error('--------ERROR IN /addThumb: ');
        throw err;
    }
    })
    .then((result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

router.put('/updateThumb', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    try {
        const {
            reviewer_serial_no, 
            story_id,
            bin_value,
        } = req.body;

        new Promise((resolve, reject) => {
            pool.getConnection( (err, conn) => {
                if (err) throw err;

                const qry = sqlUpdateStatement(
                    Thumbed,
                    `bin_value = ${bin_value}`,
                    `(story_id, reviewer_serial_no, user_serial_no) = ('${story_id}', '${reviewer_serial_no}', '${user_serial_no}')`
                );
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) {reject(err); return;};
                    console.log('Thumb updated');
                    resolve(result);
                });
            });
        })
        .then((result) => {
            res.end();
        })
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    }
    catch(err) {
        console.error('--------ERROR IN /updateThumb: ');
        throw err;
    }
});

router.delete('/deleteThumb', async (req, res) => {
    const user_serial_no = await getSerialNumber();
    const {
        story_id,
        reviewer_serial_no,
    } = req.body;

    new Promise((resolve, reject) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;

            const qry = sqlDeleteStatement(Thumbed, `(story_id, reviewer_serial_no, user_serial_no) = ('${story_id}','${reviewer_serial_no}', '${user_serial_no}')`);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err){reject(err); return;};
                console.log('Thumb deleted');
                resolve(result);
            });
        });
    })
    .then((result) => {
        res.end();
    })
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

module.exports = router;
