/**
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
*/
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