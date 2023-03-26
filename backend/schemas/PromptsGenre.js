class PromptsGenre {
  constructor(prompt_id, genre_name) {
      this.prompt_id = prompt_id;
      this.genre_name = genre_name;
  }

  static schemaName = 'PromptsGenre';

  static create(prompt_id, genre_name) {
    return new PromptsGenre(prompt_id, genre_name);
  }
}

module.exports = PromptsGenre;
