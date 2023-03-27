const express = require('express');
const router = express.Router();
const pool =  require('../config/db.js');
const serialNumber = require('serial-number');
const { v4: uuidv4 } = require('uuid');

const Stories = require('../schemas/Stories.js');
const FallsUnder = require('../schemas/FallsUnder.js');
const Genres = require('../schemas/Genres.js');
const Thumbed = require('../schemas/Thumbed.js');

const {
    currentDate,
    minifySqlQuery,
    sqlInsertStatement,
    sqlUpdateStatement,
    sqlDeleteStatement,
} = require('../utils/utilFunctions.js');

router.post('/addUser', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;
    
            const qry = minifySqlQuery(`
                INSERT INTO Users(serial_no) VALUES ('${user_serial_no}');
            `);
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                // console.log(result);
            });
            
            res.end();
        });
    });
});

router.get('/stories', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;
    
            try {
                const qry = minifySqlQuery(`
                    SELECT Stories.story_id, Stories.user_serial_no, title, genre_names, text_content, AVG(rating) avg_rating, COUNT(rating) num_ratings, publish_date
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
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                });
            } catch (err) {
                console.log(err);
                res.end();
            }
        });
    });
});

router.get('/story', async (req, res) => {
    const {story_id} = req.query;
    serialNumber((err, user_serial_no) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;
    
            try {
                const qry = minifySqlQuery(`
                    SELECT Stories.story_id, Stories.user_serial_no, title, genre_names, text_content, AVG(rating) avg_rating, COUNT(rating) num_ratings, publish_date
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
                    if (err) throw err;
                    // console.log(result);
                    res.send(JSON.stringify(result));
                });
            } catch (err) {
                console.error('--------ERROR IN /story: ');
                throw err;
            }
        });
    });
});

router.get('/genres', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;
    
            try {
                const qry = minifySqlQuery(`
                    SELECT genre_name FROM Genres ORDER BY genre_name;
                `);
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                });
            } catch (err) {
                console.log(err);
                res.end();
            }
        });
    });
});

router.get('/reviews', async (req, res) => {
    const {story_id} = req.query;
    serialNumber((err, user_serial_no) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;
    
            try {
                const qry = minifySqlQuery(`
                    SELECT user_serial_no, text_content, publish_date, num_thumbs_up, num_thumbs_down, my_thumb_value
                    FROM (
                        SELECT user_serial_no, text_content, publish_date
                        FROM Reviews
                        WHERE story_id = '${story_id}'
                    ) AS StoryReviews JOIN (
                        SELECT
                            reviewer_serial_no,
                            SUM(CASE bin_value WHEN 1 THEN 1 ELSE 0 END) num_thumbs_up,
                            SUM(CASE bin_value WHEN 0 THEN 1 ELSE 0 END) num_thumbs_down,
                            SUM(CASE
                                WHEN user_serial_no = 'PF41JZTN' THEN (
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
                    res.send(JSON.stringify(result));
                });
            } catch (err) {
                console.error('--------ERROR IN /reviews: ');
                throw err;
            }
        });
    });
});

router.get('/prompts', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        pool.getConnection( (err, conn) => {
            if (err) throw err;
    
            try {
                const qry = minifySqlQuery(`
                    SELECT Prompts.prompt_id, Prompts.user_serial_no, GROUP_CONCAT(genre_name) AS genre_names, text_content, publish_date
                    FROM Prompts LEFT JOIN PromptsGenre ON (Prompts.prompt_id = PromptsGenre.prompt_id)
                    GROUP BY prompt_id
                    ORDER BY publish_date DESC
                `);
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                });
            } catch (err) {
                console.log(err);
                res.end();
            }
        });
    });
});

router.post('/addStory', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        try {
            const {storyFields, genresArray} = req.body;
            const story = Stories.create(uuidv4(), user_serial_no, storyFields.title, storyFields.text_content, currentDate());
            const fallsUnder = genresArray.map(genreFields => {
                return FallsUnder.createFrom(story, Genres.create(genreFields.genre_name))
            });
    
            pool.getConnection( (err, conn) => {
                if (err) throw err;

                conn.beginTransaction((err) => {
                    if (err) {
                        conn.release();
                        throw err;
                    }

                    conn.query(`${sqlInsertStatement(Stories, story)}`, (err, result) => {
                        if (err) { conn.rollback(() => conn.release()); throw err; }
                    });

                    if (fallsUnder.length > 0)
                    conn.query(`${sqlInsertStatement(FallsUnder, fallsUnder)}`, (err, result) => {
                        if (err) { conn.rollback(() => conn.release()); throw err; }
                    });

                    conn.commit((err) => {
                        if (err) { conn.rollback(() => conn.release()); throw err; }
                        console.log('Story added!');
                    });
                });
        
                // res.redirect('/stories');
                res.end();
            });
        }
        catch(err) {
            console.error('--------ERROR IN /addStory: ');
            throw err;
        }
    });
});

router.post('/addThumb', async (req, res) => {
    serialNumber((err, user_serial_no) => {
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
                    if (err) throw err;
                    console.log(result);
                });

                // conn.beginTransaction((err) => {
                //     if (err) {
                //         conn.release();
                //         throw err;
                //     }

                //     conn.query(`${sqlDeleteStatement(Thumbed, `story_id = '${story_id}' AND reviewer_serial_no = '${reviewer_serial_no}' AND user_serial_no = '${user_serial_no}'`)}`, (err, result) => {
                //         if (err) { conn.rollback(() => conn.release()); throw err; }
                //     });

                //     conn.query(`${sqlInsertStatement(Thumbed, thumbed)}`, (err, result) => {
                //         if (err) { conn.rollback(() => conn.release()); throw err; }
                //     });

                //     conn.commit((err) => {
                //         if (err) { conn.rollback(() => conn.release()); throw err; }
                //     });
                // });
        
                // res.redirect('/stories');
                res.end();
            });
        }
        catch(err) {
            console.error('--------ERROR IN /addStory: ');
            throw err;
        }
    });
});

router.put('/updateThumb', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        try {
            const {
                reviewer_serial_no, 
                story_id,
                bin_value,
            } = req.body;
    
            pool.getConnection( (err, conn) => {
                if (err) throw err;

                const qry = sqlUpdateStatement(
                    Thumbed,
                    `bin_value = ${bin_value}`,
                    `(story_id, reviewer_serial_no, user_serial_no) = ('${story_id}', '${reviewer_serial_no}', '${user_serial_no}')`
                );
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) throw err;
                    console.log(result);
                });

                res.end();
            });
        }
        catch(err) {
            console.error('--------ERROR IN /updateThumb: ');
            throw err;
        }
    });
});

router.delete('/deleteThumb', async (req, res) => {
    serialNumber((err, user_serial_no) => {
        try {
            const {
                story_id,
                reviewer_serial_no,
            } = req.body;
    
            pool.getConnection( (err, conn) => {
                if (err) throw err;

                const qry = sqlDeleteStatement(Thumbed, `(story_id, reviewer_serial_no, user_serial_no) = ('${story_id}','${reviewer_serial_no}', '${user_serial_no}')`);
                conn.query(qry, (err, result) => {
                    conn.release();
                    if (err) throw err;
                    console.log(result);
                });
        
                // res.redirect('/stories');
                res.end();
            });
        }
        catch(err) {
            console.error('--------ERROR IN /deleteThumb: ');
            throw err;
        }
    });
});

module.exports = router;
