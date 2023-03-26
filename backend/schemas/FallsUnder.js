class FallsUnder {
  constructor(story_id, genre_name) {
      this.story_id = story_id;
      this.genre_name = genre_name;
  }

  static schemaName = 'FallsUnder';

  static create(story_id, genre_name) {
    return new FallsUnder(story_id, genre_name);
  }

  static createFrom(story, genre) {
    return new FallsUnder(story.story_id, genre.genre_name);
  }
}

module.exports = FallsUnder;
