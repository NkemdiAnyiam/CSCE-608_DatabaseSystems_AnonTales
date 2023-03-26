class Rated {
  constructor(story_id, user_serial_no, rating) {
      if (!([1, 2, 3, 4, 5].includes(rating))) { throw new Error(`ERROR: Invalid rating ${rating} passed to Rating constructor`); }
      this.story_id = story_id;
      this.user_serial_no = user_serial_no;
      this.rating = rating;
  }

  static schemaName = 'Rated';

  static create(story_id, user_serial_no, rating) {
    return new Rated(story_id, user_serial_no, rating);
  }
}

module.exports = Rated;
