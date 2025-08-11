export enum Permission {
  // Quyền quản lý sách
  BOOK_READ = "BOOK_READ",
  BOOK_CREATE = "BOOK_CREATE",
  BOOK_UPDATE = "BOOK_UPDATE",
  BOOK_DELETE = "BOOK_DELETE",
  
  // Quyền quản lý người dùng
  USER_READ = "USER_READ",
  USER_CREATE = "USER_CREATE",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",
  
  // Quyền mượn sách
  BORROW_READ = "BORROW_READ",
  BORROW_CREATE = "BORROW_CREATE",
  BORROW_UPDATE = "BORROW_UPDATE",
  BORROW_DELETE = "BORROW_DELETE",
  // Quyền quản lý tiền phạt
  FINE_READ = "FINE_READ",
  FINE_UPDATE = "FINE_UPDATE"
}

export enum Role {
  ROLE_USER = "ROLE_USER",
  ROLE_ADMIN = "ROLE_ADMIN"
}
