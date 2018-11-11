/**
 * Logger for Rust server
 */

extern crate colored;
use colored::*;

pub struct Logger {
  name: str,
}


pub impl Logger {
  fn info(&self, logline: str)  {
    println!("{} {} {}", &self.name, "info".green(), logline);
  }
}