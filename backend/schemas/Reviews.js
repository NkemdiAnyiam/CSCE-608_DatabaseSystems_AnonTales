class Reviews {
  constructor(story_id, user_serial_no, text_content, publish_date) {
      this.story_id = story_id;
      this.user_serial_no = user_serial_no;
      this.text_content = text_content;
      this.publish_date = publish_date;
  }

  static schemaName = 'Reviews';

  static create(story_id, user_serial_no, text_content, publish_date) {
    return new Reviews(story_id, user_serial_no, text_content, publish_date);
  }
}

module.exports = Reviews;
