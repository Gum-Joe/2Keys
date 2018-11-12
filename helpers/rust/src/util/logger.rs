/**
 * Logger for Rust server
 */

extern crate colored;
use self::colored::*;

pub struct Logger {
  name: String
}

impl Logger {
  /**
   * Color: Green
   * Level: Info
   */
  pub fn info(&self, logline: &str)  {
    println!("{} {} {}", &self.name.magenta(), "info".green(), logline.to_string());
  }

  /**
   * Color: Yellow
   * Level: Warning
   */
  pub fn warn(&self, logline: &str)  {
    println!("{} {} {}", &self.name.magenta(), "warn".yellow(), logline.to_string());
  }

  /**
   * Color: Cyan
   * Level: Debug/verbose
   */
  pub fn debug(&self, logline: &str)  {
    println!("{} {} {}", &self.name.magenta(), "debug".cyan(), logline.to_string());
  }

  /**
   * Color: Red
   * Level: Error
   */
  pub fn err(&self, logline: &str)  {
    println!("{} {} {}", &self.name.magenta(), "err".red(), logline.to_string());
  }

  // Creates a new logger
  pub fn new<Scon>(name: Scon) -> Logger where Scon: Into<String> {
    Logger { name: name.into() }
  }
}