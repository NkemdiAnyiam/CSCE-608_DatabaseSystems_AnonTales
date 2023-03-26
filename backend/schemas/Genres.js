class Genres {
  constructor(genre_name) {
      this.genre_name = genre_name;
  }

  static schemaName = 'Genres';

  static create(genre_name) {
    return new Genres(genre_name);
  }
}

module.exports = Genres;
