class Prompts {
  constructor(prompt_id, user_serial_no, text_content, publish_date) {
      this.prompt_id = prompt_id;
      this.user_serial_no = user_serial_no;
      this.text_content = text_content;
      this.publish_date = publish_date;
  }

  static schemaName = 'Prompts';

  static create(prompt_id, user_serial_no, text_content, publish_date) {
    return new Prompts(prompt_id, user_serial_no, text_content, publish_date);
  }
}

module.exports = Prompts;
