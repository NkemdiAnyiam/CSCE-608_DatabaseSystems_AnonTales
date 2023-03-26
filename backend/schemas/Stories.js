class Stories {
  constructor(story_id, user_serial_no, title, text_content, publish_date) {
      this.story_id = story_id;
      this.user_serial_no = user_serial_no;
      this.title = title;
      this.text_content = text_content;
      this.publish_date = publish_date;
  }

  static schemaName = 'Stories';

  static create(story_id, user_serial_no, title, text_content, publish_date) {
    return new Stories(story_id, user_serial_no, title, text_content, publish_date);
  }
}

module.exports = Stories;
