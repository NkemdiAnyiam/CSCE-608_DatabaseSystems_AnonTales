class Thumbed {
  constructor(story_id, reviewer_serial_no, user_serial_no, bin_value) {
      if (!(bin_value === 0 || bin_value === 1)) { throw new Error(`ERROR: Invalid bin_value ${bin_value} passed to Thumb constructor`); }
      this.story_id = story_id;
      this.reviewer_serial_no = reviewer_serial_no;
      this.user_serial_no = user_serial_no;
      this.bin_value = bin_value;
  }

  static schemaName = 'Thumbed';

  static create(story_id, reviewer_serial_no, user_serial_no, bin_value) {
    return new Thumbed(story_id, reviewer_serial_no, user_serial_no, bin_value);
  }
}

module.exports = Thumbed;
