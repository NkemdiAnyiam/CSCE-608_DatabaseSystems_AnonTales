class Users {
  constructor(serial_no) {
      this.serial_no = serial_no;
  }

  static schemaName = 'Users';

  static create(serial_no) {
    return new Users(serial_no);
  }
}

module.exports = Users;
