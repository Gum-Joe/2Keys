mod util;

fn main() {
    let logger = util::logger::Logger::new("cli");
    logger.info("2Keys Helper server.");
}
