extern crate colored;
use colored::*;

struct Logger {
  name: String
}

impl Logger {
    fn info(&self, logline: &str)  {
        println!("{} {} {}", &self.name.magenta(), "info".green(), logline.to_string());
    }
    fn new<Scon>(name: Scon) -> Logger where Scon: Into<String> {
        Logger { name: name.into() }
    }
}

fn main() {
    let logger = Logger::new("cli");
    logger.info("Hi");
}
